import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const target=process.env.TARGET_URL||'https://blind-karaoke-663424522262.us-west1.run.app';
const out='qa-artifacts-d1';
await fs.mkdir(out,{recursive:true});
const stamp=Date.now();
const city='Göttingen';
const report={target,city,startedAt:new Date().toISOString(),checks:{},states:{},console:[],networkFailures:[],findings:[]};

function diag(page,label){
  page.on('console',m=>{ if(['warning','error'].includes(m.type())) report.console.push({page:label,type:m.type(),text:m.text()}); });
  page.on('requestfailed',r=>report.networkFailures.push({page:label,url:r.url(),error:r.failure()?.errorText||'unknown'}));
}
async function snap(page,name){await page.screenshot({path:path.join(out,name),fullPage:true});}
async function state(page,name){
  const body=await page.locator('body').innerText().catch(()=>'');
  const controls=await page.locator('button,input,select,textarea,a').evaluateAll(els=>els.slice(0,150).map((e,i)=>({
    i,tag:e.tagName,type:e.getAttribute('type'),text:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').trim().slice(0,150),
    placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),value:'value' in e?e.value:null,disabled:!!e.disabled
  }))).catch(()=>[]);
  report.states[name]={url:page.url(),title:await page.title(),body:body.slice(0,14000),controls};
  return body;
}
async function clickBtn(page,text){
  const b=page.getByRole('button',{name:text,exact:true});
  if(await b.isVisible().catch(()=>false)){await b.click();return true;}
  const b2=page.getByRole('button',{name:new RegExp(text,'i')});
  if(await b2.first().isVisible().catch(()=>false)){await b2.first().click();return true;}
  return false;
}
async function openPrefs(page){ await clickBtn(page,'Blind Karaoke starten'); await page.waitForTimeout(500); }
async function fillProfile(page,{nick,age,gender,prefGender,min,max,styles,songs}){
  await openPrefs(page);
  const texts=page.locator('input[type="text"]:visible');
  await texts.nth(0).fill(nick);
  await texts.nth(1).fill(city);
  const selects=page.locator('select:visible');
  await selects.nth(0).selectOption({label:`${age} Jahre`});
  await selects.nth(1).selectOption({label:gender});
  await selects.nth(2).selectOption({label:'25 km (Default)'});
  await clickBtn(page,'Wochenende');
  const times=page.locator('input[type="time"]:visible');
  if(await times.count()>=2){await times.nth(0).fill('18:00');await times.nth(1).fill('23:00');}
  await clickBtn(page,'Café / Bar');
  // partner buttons: scope to section after text if possible
  const prefSection=page.locator('text=DEIN PERFEKTES DUO').locator('..').locator('..');
  const prefBtn=prefSection.getByRole('button',{name:prefGender,exact:true});
  if(await prefBtn.isVisible().catch(()=>false)) await prefBtn.click();
  else {
    const all=page.getByRole('button',{name:prefGender,exact:true});
    const n=await all.count();
    if(n) await all.nth(n-1).click();
  }
  const nums=page.locator('input[type="number"]:visible');
  if(await nums.count()>=2){await nums.nth(0).fill(String(min));await nums.nth(1).fill(String(max));}
  for(const st of styles){await clickBtn(page,st);}
  for(let i=0;i<songs.length;i++){
    const inp=page.getByPlaceholder(`Lieblingssong #${i+1}`);
    if(await inp.isVisible().catch(()=>false)) await inp.fill(songs[i]);
  }
  await state(page,`${nick}-filled`);
  await snap(page,`${nick}-01-filled.png`);
  const ok=await clickBtn(page,'Match suchen');
  if(!ok) throw new Error('Match suchen button not found');
  await page.waitForTimeout(2200);
  return await state(page,`${nick}-after-search`);
}
async function waitForAny(page,patterns,timeout=9000){
  const end=Date.now()+timeout;
  while(Date.now()<end){
    const body=await page.locator('body').innerText().catch(()=>'');
    if(patterns.some(p=>p.test(body))) return body;
    await page.waitForTimeout(500);
  }
  return await page.locator('body').innerText().catch(()=>'');
}

const browser=await chromium.launch({headless:true});
const ctxA=await browser.newContext({viewport:{width:390,height:844}});
const ctxB=await browser.newContext({viewport:{width:390,height:844}});
const A=await ctxA.newPage(),B=await ctxB.newPage(); diag(A,'A');diag(B,'B');

try{
  const ra=await A.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  const rb=await B.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  await Promise.all([A.waitForTimeout(1500),B.waitForTimeout(1500)]);
  report.checks.http200=ra?.status()===200&&rb?.status()===200;
  report.checks.title=(await A.title())==='Blind Karaoke';
  await state(A,'home-A');
  await snap(A,'00-home.png');

  const bodyA=await fillProfile(A,{nick:'MinaQA',age:22,gender:'Frau',prefGender:'Mann',min:25,max:40,styles:['Pop','Balladen'],songs:['Shallow','Perfect','Dancing Queen']});
  report.checks.profileAStoredState=!/Please fill out this field/i.test(bodyA);
  await snap(A,'01-A-after-search.png');

  const bodyB=await fillProfile(B,{nick:'AlexQA',age:32,gender:'Mann',prefGender:'Frau',min:20,max:30,styles:['Pop','80er / 90er'],songs:['Shallow','Take on Me','Dancing Queen']});
  report.checks.profileBStoredState=!/Please fill out this field/i.test(bodyB);
  await snap(B,'02-B-after-search.png');

  const matchPatterns=[/Match gefunden/i,/jemanden für dich gefunden/i,/Ich bin dabei/i,/wartet.*Bestätigung/i,/Karaoke-Duo/i];
  const [ma,mb]=await Promise.all([waitForAny(A,matchPatterns,10000),waitForAny(B,matchPatterns,10000)]);
  await state(A,'A-match-wait'); await state(B,'B-match-wait');
  await snap(A,'03-A-match.png'); await snap(B,'04-B-match.png');
  report.checks.matchVisibleA=matchPatterns.some(p=>p.test(ma));
  report.checks.matchVisibleB=matchPatterns.some(p=>p.test(mb));

  const acceptA=await clickBtn(A,'Ich bin dabei');
  if(acceptA) await A.waitForTimeout(1200);
  const aAfterOne=await state(A,'A-one-sided-accept');
  await snap(A,'05-A-one-sided.png');
  report.checks.acceptA=acceptA;
  report.checks.oneSidedStillWaiting=/wart|Bestätigung|Match/i.test(aAfterOne);

  const acceptB=await clickBtn(B,'Ich bin dabei');
  report.checks.acceptB=acceptB;
  if(acceptB) await B.waitForTimeout(1200);

  const roomPatterns=[/Karaoke Room/i,/Jetzt dran/i,/Song Queue/i,/Duett Roulette/i,/Karaoke starten/i];
  const [ca,cb]=await Promise.all([waitForAny(A,roomPatterns,10000),waitForAny(B,roomPatterns,10000)]);
  await state(A,'A-after-both-accept'); await state(B,'B-after-both-accept');
  await snap(A,'06-A-confirmed-or-room.png'); await snap(B,'07-B-confirmed-or-room.png');
  report.checks.roomOrConfirmedA=roomPatterns.some(p=>p.test(ca));
  report.checks.roomOrConfirmedB=roomPatterns.some(p=>p.test(cb));

  // If room is not auto-opened, try nav.
  if(!report.checks.roomOrConfirmedA){await clickBtn(A,'Room');await A.waitForTimeout(700);}
  if(!report.checks.roomOrConfirmedB){await clickBtn(B,'Room');await B.waitForTimeout(700);}
  const roomA=await state(A,'A-room-nav'); const roomB=await state(B,'B-room-nav');
  await snap(A,'08-A-room-nav.png'); await snap(B,'09-B-room-nav.png');
  report.checks.roomVisibleA=roomPatterns.some(p=>p.test(roomA));
  report.checks.roomVisibleB=roomPatterns.some(p=>p.test(roomB));

  // Inspect room actions and try Duett Roulette.
  const duetA=await clickBtn(A,'Zufälliges Duett finden') || await clickBtn(A,'Duett finden');
  report.checks.duetButton=duetA;
  if(duetA){await A.waitForTimeout(700);await state(A,'A-after-duet');await snap(A,'10-A-after-duet.png');}

  // Friends mode in fresh context: assert visible state change.
  const ctxF=await browser.newContext({viewport:{width:390,height:844}});
  const F=await ctxF.newPage();diag(F,'F');await F.goto(target,{waitUntil:'domcontentloaded',timeout:45000});await F.waitForTimeout(700);
  const before=await F.locator('body').innerText();
  const friendsClick=await clickBtn(F,'Mit Freunden singen');
  await F.waitForTimeout(1000);
  const after=await F.locator('body').innerText();
  await state(F,'friends-after-click');await snap(F,'11-friends-click.png');
  report.checks.friendsModeCTA=friendsClick;
  report.checks.friendsModeChangesUI=after!==before;
  report.checks.friendsModeShowsInvite=/invite|einlad|code|room|beitreten|link/i.test(after) && after!==before;
  await ctxF.close();

  // Legal buttons + navigation basic.
  const ctxL=await browser.newContext({viewport:{width:390,height:844}});
  const L=await ctxL.newPage();diag(L,'L');await L.goto(target,{waitUntil:'domcontentloaded',timeout:45000});await L.waitForTimeout(500);
  const imp=await clickBtn(L,'Impressum');await L.waitForTimeout(300);const impText=await L.locator('body').innerText();report.checks.impressumOpens=imp && /Impressum/i.test(impText) && impText!== (report.states['home-A']?.body||'');
  await L.goto(target,{waitUntil:'domcontentloaded'});await L.waitForTimeout(300);const dat=await clickBtn(L,'Datenschutz');await L.waitForTimeout(300);const datText=await L.locator('body').innerText();report.checks.datenschutzOpens=dat && /Datenschutz/i.test(datText) && datText!== (report.states['home-A']?.body||'');
  await ctxL.close();

  // Accessibility discoverability: form should have programmatic labels.
  await A.goto(target,{waitUntil:'domcontentloaded'});await A.waitForTimeout(400);await openPrefs(A);
  const nicknameLabel=await A.getByLabel(/Nickname/i).count().catch(()=>0);
  const ageLabel=await A.getByLabel(/^Alter$/i).count().catch(()=>0);
  report.checks.formProgrammaticLabels=nicknameLabel>0 && ageLabel>0;

  report.checks.mobileNoOverflow=await A.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2);
} catch(e){
  report.findings.push({severity:'blocker',message:String(e?.stack||e)});
}

report.checks.consoleHealth=report.console.filter(x=>x.type==='error').length===0;
report.finishedAt=new Date().toISOString();
await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
await fs.writeFile(path.join(out,'summary.txt'),[
  ...Object.entries(report.checks).map(([k,v])=>`${k}: ${v}`),
  '',
  ...Object.entries(report.states).map(([k,v])=>`--- ${k} ---\n${v.body.slice(0,6000)}\n`)
].join('\n'));
console.log('=== D1 QA CHECKS ===');
for(const [k,v] of Object.entries(report.checks)) console.log(`${k}: ${v}`);
console.log('=== FINDINGS ===');
console.log(JSON.stringify(report.findings));
await Promise.all([ctxA.close(),ctxB.close()]);
await browser.close();
