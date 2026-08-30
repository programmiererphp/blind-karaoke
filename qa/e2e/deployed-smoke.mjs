import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const target = process.env.TARGET_URL || 'https://blind-karaoke-663424522262.us-west1.run.app';
const outDir = 'qa-artifacts';
await fs.mkdir(outDir, { recursive: true });

const report = {
  target,
  startedAt: new Date().toISOString(),
  checks: {},
  pages: {},
  console: [],
  networkFailures: [],
  findings: [],
};

function attachDiagnostics(page, label) {
  page.on('console', msg => {
    if (['warning','error'].includes(msg.type())) report.console.push({ page: label, type: msg.type(), text: msg.text() });
  });
  page.on('requestfailed', req => report.networkFailures.push({ page: label, url: req.url(), error: req.failure()?.errorText || 'unknown' }));
}

async function screenshot(page, name, fullPage=true) {
  await page.screenshot({ path: path.join(outDir, name), fullPage });
}

async function summarize(page, name) {
  const body = await page.locator('body').innerText().catch(()=> '');
  const controls = await page.locator('button, input, select, textarea, a').evaluateAll(els => els.slice(0,120).map((e, i) => ({
    i,
    tag: e.tagName,
    type: e.getAttribute('type'),
    text: (e.innerText || e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.getAttribute('name') || '').trim().slice(0,180),
    name: e.getAttribute('name'),
    placeholder: e.getAttribute('placeholder'),
    aria: e.getAttribute('aria-label'),
    href: e.getAttribute('href'),
    disabled: !!e.disabled
  }))).catch(()=>[]);
  report.pages[name] = { url: page.url(), title: await page.title(), body: body.slice(0,12000), controls };
  return { body, controls };
}

async function clickByText(page, texts) {
  for (const t of texts) {
    const locs = [
      page.getByRole('button', { name: t, exact: false }),
      page.getByRole('link', { name: t, exact: false }),
      page.getByText(t, { exact: false })
    ];
    for (const loc of locs) {
      if (await loc.first().isVisible().catch(()=>false)) {
        await loc.first().click();
        return t;
      }
    }
  }
  return null;
}

async function fillFirst(page, selectors, value) {
  for (const s of selectors) {
    let loc;
    if (s.kind === 'label') loc = page.getByLabel(s.value, { exact: false });
    else if (s.kind === 'placeholder') loc = page.getByPlaceholder(s.value, { exact: false });
    else if (s.kind === 'name') loc = page.locator(`[name="${s.value}"]`);
    if (loc && await loc.first().isVisible().catch(()=>false)) {
      const el = loc.first();
      const tag = await el.evaluate(node => node.tagName).catch(()=> '');
      if (tag === 'SELECT') {
        await el.selectOption({ value: String(value) }).catch(async () => {
          await el.selectOption({ label: String(value) });
        });
      } else {
        await el.fill(String(value));
      }
      return true;
    }
  }
  return false;
}

async function chooseVisibleText(page, texts) {
  for (const t of texts) {
    const loc = page.getByText(t, { exact: true });
    if (await loc.first().isVisible().catch(()=>false)) {
      await loc.first().click();
      return t;
    }
  }
  return null;
}

const browser = await chromium.launch({ headless: true });
const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 } });
const pageA = await ctxA.newPage();
attachDiagnostics(pageA, 'A');

let response;
try {
  response = await pageA.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await pageA.waitForTimeout(2500);
  report.checks.httpStatus = response?.status() || null;
  report.checks.pageIdentity = pageA.url().startsWith(target);
  const initial = await summarize(pageA, 'A-home');
  report.checks.notBlank = initial.body.trim().length > 80;
  report.checks.frameworkOverlay = !/Unhandled Runtime Error|Vite Error|Application error|Internal Server Error/i.test(initial.body);
  await screenshot(pageA, '01-home-mobile.png');

  const clicked = await clickByText(pageA, ['Blind Karaoke starten', 'Blind Karaoke', 'Match starten']);
  report.checks.primaryCTA = !!clicked;
  if (clicked) {
    await pageA.waitForTimeout(1000);
    await summarize(pageA, 'A-preferences');
    await screenshot(pageA, '02-preferences-mobile.png');

    const nick = await fillFirst(pageA, [
      {kind:'label',value:'Nickname'}, {kind:'label',value:'Name'}, {kind:'placeholder',value:'Nickname'}, {kind:'placeholder',value:'Name'}
    ], 'MinaQA');
    report.checks.nicknameField = nick;

    const age = await fillFirst(pageA, [
      {kind:'label',value:'Alter'}, {kind:'placeholder',value:'Alter'}
    ], '22');
    report.checks.ageField = age;

    await chooseVisibleText(pageA, ['Frau']);
    await fillFirst(pageA, [
      {kind:'label',value:'Stadt'}, {kind:'label',value:'Ort'}, {kind:'placeholder',value:'Göttingen'}, {kind:'placeholder',value:'Stadt'}
    ], 'Göttingen');
    await chooseVisibleText(pageA, ['Wochenende', 'Heute', 'Morgen']);
    await chooseVisibleText(pageA, ['Mann']);
    await chooseVisibleText(pageA, ['Pop']);
    await chooseVisibleText(pageA, ['Balladen']);

    // Fill a few remaining visible free-text inputs without overwriting nickname/city.
    const empties = pageA.locator('input[type="text"]:visible');
    const count = await empties.count();
    const vals = ['Shallow','Perfect','Dancing Queen'];
    let vi = 0;
    for (let i=0; i<count && vi<vals.length; i++) {
      const el = empties.nth(i);
      const v = await el.inputValue().catch(()=> '');
      const ph = (await el.getAttribute('placeholder').catch(()=>'')) || '';
      if (!v && /song|lied|titel/i.test(ph)) {
        await el.fill(vals[vi++]);
      }
    }

    await summarize(pageA, 'A-preferences-filled');
    await screenshot(pageA, '03-preferences-filled.png');
    const submit = await clickByText(pageA, ['Match suchen', 'Match finden', 'Match finden lassen', 'Weiter']);
    report.checks.matchSubmit = !!submit;
    if (submit) {
      await pageA.waitForTimeout(2500);
      await summarize(pageA, 'A-after-search');
      await screenshot(pageA, '04-after-search.png');
    }
  }

  // Friends mode on independent context from home.
  const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pageB = await ctxB.newPage();
  attachDiagnostics(pageB, 'B');
  await pageB.goto(target, { waitUntil:'domcontentloaded', timeout:45000 });
  await pageB.waitForTimeout(1800);
  await summarize(pageB, 'B-home');
  const friendClicked = await clickByText(pageB, ['Mit Freunden singen', 'Mit Freunden Karaoke', 'Karaoke mit Freunden']);
  report.checks.friendsModeCTA = !!friendClicked;
  if (friendClicked) {
    await pageB.waitForTimeout(1000);
    await summarize(pageB, 'B-friends-mode');
    await screenshot(pageB, '05-friends-mode.png');
  }
  await ctxB.close();

  // Desktop visual check.
  const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageD = await ctxD.newPage();
  attachDiagnostics(pageD, 'desktop');
  await pageD.goto(target, { waitUntil:'domcontentloaded', timeout:45000 });
  await pageD.waitForTimeout(1500);
  await summarize(pageD, 'desktop-home');
  await screenshot(pageD, '06-home-desktop.png', false);
  report.checks.desktopNoHorizontalOverflow = await pageD.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
  await ctxD.close();

  report.checks.mobileNoHorizontalOverflow = await pageA.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
} catch (e) {
  report.findings.push({ severity:'blocker', message:String(e?.stack || e) });
}

report.checks.consoleHealth = report.console.filter(x=>x.type==='error').length === 0;
report.finishedAt = new Date().toISOString();
await fs.writeFile(path.join(outDir,'report.json'), JSON.stringify(report,null,2));
await fs.writeFile(path.join(outDir,'report.txt'), [
  `Target: ${target}`,
  ...Object.entries(report.checks).map(([k,v])=>`${k}: ${v}`),
  `consoleErrors: ${report.console.filter(x=>x.type==='error').length}`,
  `networkFailures: ${report.networkFailures.length}`,
  '',
  'PAGE SUMMARIES',
  ...Object.entries(report.pages).flatMap(([name,p])=>[`--- ${name} ---`,`URL: ${p.url}`, p.body.slice(0,5000), 'CONTROLS:', ...p.controls.map(c=>JSON.stringify(c))])
].join('\n'));
console.log(JSON.stringify(report, null, 2));
await ctxA.close();
await browser.close();
