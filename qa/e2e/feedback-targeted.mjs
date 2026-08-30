import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const target=process.env.TARGET_URL||'https://blind-karaoke-663424522262.us-west1.run.app';
const out='qa-artifacts-feedback';
await fs.mkdir(out,{recursive:true});
const suffix=Date.now().toString().slice(-7);
const city=`Göttingen Feedback ${suffix}`;
const report={target,city,checks:{},console:[],networkFailures:[],states:{},error:null};

function diag(p,label){
  p.on('console',m=>{if(m.type()==='error')report.console.push({page:label,text:m.text()})});
  p.on('requestfailed',r=>report.networkFailures.push({page:label,url:r.url(),error:r.failure()?.errorText||'unknown'}));
}
async function click(page,names){
  for(const name of names){
    const exact=page.getByRole('button',{name,exact:true});
    if(await exact.isVisible().catch(()=>false) && await exact.isEnabled().catch(()=>false)){await exact.click();return name;}
    const re=page.getByRole('button',{name:new RegExp(name,'i')});
    if(await re.first().isVisible().catch(()=>false) && await re.first().isEnabled().catch(()=>false)){await re.first().click();return name;}
  }
  return null;
}
async function body(page,name){
  const s=await page.locator('body').innerText().catch(()=>'');
  report.states[name]={url:page.url(),body:s};
  return s;
}
async function snap(page,name){await page.screenshot({path:out+'/'+name,fullPage:true});}
async function waitFor(page,regexes,timeout=12000){
  const end=Date.now()+timeout;
  while(Date.now()<end){
    const s=await page.locator('body').innerText().catch(()=>'');
    if(regexes.some(r=>r.test(s))) return s;
    await page.waitForTimeout(350);
  }
  return page.locator('body').innerText().catch(()=>'');
}
async function profile(page,{nick,age,gender,pref,min,max}){
  await click(page,['Blind Karaoke starten']);
  await page.waitForTimeout(400);
  const tx=page.locator('input[type="text"]:visible');
  await tx.nth(0).fill(nick); await tx.nth(1).fill(city);
  const sel=page.locator('select:visible');
  await sel.nth(0).selectOption({label:`${age} Jahre`});
  await sel.nth(1).selectOption({label:gender});
  await sel.nth(2).selectOption({label:'25 km (Default)'});
  await click(page,['Wochenende']);
  const times=page.locator('input[type="time"]:visible');
  if(await times.count()>=2){await times.nth(0).fill('18:00');await times.nth(1).fill('23:00');}
  await click(page,['Café / Bar']);
  const prefBtn=page.getByRole('button',{name:pref,exact:true});
  if(await prefBtn.count()) await prefBtn.nth((await prefBtn.count())-1).click();
  const nums=page.locator('input[type="number"]:visible');
  if(await nums.count()>=2){await nums.nth(0).fill(String(min));await nums.nth(1).fill(String(max));}
  await click(page,['Pop']);
  const songs=['Shallow','Perfect','Dancing Queen'];
  for(let i=0;i<3;i++){
    const inp=page.getByPlaceholder(`Lieblingssong #${i+1}`);
    if(await inp.isVisible().catch(()=>false)) await inp.fill(songs[i]);
  }
}

const browser=await chromium.launch({headless:true});
const ca=await browser.newContext({viewport:{width:390,height:844}});
const cb=await browser.newContext({viewport:{width:390,height:844}});
const A=await ca.newPage(),B=await cb.newPage();diag(A,'A');diag(B,'B');

try{
  await Promise.all([A.goto(target,{waitUntil:'domcontentloaded'}),B.goto(target,{waitUntil:'domcontentloaded'})]);
  await Promise.all([A.waitForTimeout(2200),B.waitForTimeout(2200)]);
  const nameA=`MinaFB${suffix}`,nameB=`AlexFB${suffix}`;

  await profile(A,{nick:nameA,age:22,gender:'Frau',pref:'Mann',min:25,max:40});
  await click(A,['Match suchen']);
  await waitFor(A,[/Kein Duo gefunden/i,/DUO GEFUNDEN/i],8000);

  await profile(B,{nick:nameB,age:32,gender:'Mann',pref:'Frau',min:20,max:30});
  await click(B,['Match suchen']);
  const [pa,pb]=await Promise.all([waitFor(A,[/DUO GEFUNDEN/i],12000),waitFor(B,[/DUO GEFUNDEN/i],12000)]);
  report.checks.proposalBoth=/DUO GEFUNDEN/i.test(pa)&&/DUO GEFUNDEN/i.test(pb);

  report.checks.acceptA=!!(await click(A,['Ich bin dabei']));
  await A.waitForTimeout(1200);
  report.checks.oneSidedWait=/Warten auf das Karaoke-Duo/i.test(await A.locator('body').innerText());
  report.checks.acceptB=!!(await click(B,['Ich bin dabei']));

  // New build may auto-enter the room; older build shows an intermediate CTA.
  await Promise.all([A.waitForTimeout(1800),B.waitForTimeout(1800)]);
  for(const p of [A,B]){
    if(await p.getByRole('button',{name:/Zum Karaoke Room/i}).isVisible().catch(()=>false)) await p.getByRole('button',{name:/Zum Karaoke Room/i}).click();
  }
  const [ra,rb]=await Promise.all([waitFor(A,[/AKTIVE SESSION/i],10000),waitFor(B,[/AKTIVE SESSION/i],10000)]);
  report.checks.roomBoth=/AKTIVE SESSION/i.test(ra)&&/AKTIVE SESSION/i.test(rb);

  await click(A,['Abend beenden']); await click(B,['Abend beenden']);
  await Promise.all([A.waitForTimeout(1200),B.waitForTimeout(1200)]);
  const fa=await body(A,'feedback-A-before');
  const fb=await body(B,'feedback-B-before');
  report.checks.feedbackAHasPartner=fa.includes(nameB)&&!fa.includes('Feedback über '+nameA);
  report.checks.feedbackBHasPartner=fb.includes(nameA)&&!fb.includes('Feedback über '+nameB);
  await snap(A,'01-feedback-A.png');await snap(B,'02-feedback-B.png');

  report.checks.positiveA=!!(await click(A,['Wieder zusammen singen']));
  await A.waitForTimeout(1800);
  const aAfter=await body(A,'after-positive-A');
  const bBefore=await body(B,'B-before-positive');
  report.checks.aWriteLooksSuccessful=!/Fehler|permission|Berechtigung/i.test(aAfter);
  report.checks.oneSidedPrivate=!new RegExp(nameA+'.*(möchte|will|positiv)|Antwort.*von.*'+nameA,'i').test(bBefore);
  await snap(A,'03-after-positive-A.png');

  report.checks.positiveB=!!(await click(B,['Wieder zusammen singen']));
  await Promise.all([A.waitForTimeout(3500),B.waitForTimeout(3500)]);
  const aMut=await body(A,'after-mutual-A');
  const bMut=await body(B,'after-mutual-B');
  await snap(A,'04-after-mutual-A.png');await snap(B,'05-after-mutual-B.png');

  // Direct success message if present.
  const directFriend=/Karaoke-Freund|Karaoke-Freunde|jetzt Freunde/i.test(aMut)&&/Karaoke-Freund|Karaoke-Freunde|jetzt Freunde/i.test(bMut);

  // Also inspect Friends tab, because the UI may navigate away instead of showing a success banner.
  await click(A,['Freunde']); await click(B,['Freunde']);
  await Promise.all([A.waitForTimeout(2200),B.waitForTimeout(2200)]);
  const aFriends=await body(A,'friends-A');
  const bFriends=await body(B,'friends-B');
  await snap(A,'06-friends-A.png');await snap(B,'07-friends-B.png');

  report.checks.friendListedA=aFriends.includes(nameB);
  report.checks.friendListedB=bFriends.includes(nameA);
  report.checks.mutualFriendCreated=directFriend||(report.checks.friendListedA&&report.checks.friendListedB);
  report.checks.feedbackConsoleClean=report.console.length===0;

}catch(e){report.error=String(e?.stack||e)}

await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
console.log('=== FEEDBACK TARGETED QA ===');
for(const [k,v] of Object.entries(report.checks)) console.log(k+': '+v);
console.log('console:',JSON.stringify(report.console));
console.log('error:',report.error||'');
await ca.close();await cb.close();await browser.close();
