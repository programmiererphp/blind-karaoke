import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const target=process.env.TARGET_URL||'https://blind-karaoke-663424522262.us-west1.run.app';
const out='qa-artifacts-friends';
await fs.mkdir(out,{recursive:true});
const report={target,checks:{},console:[],creatorBody:'',joinBody:'',afterJoinBody:''};
const browser=await chromium.launch({headless:true});
const c1=await browser.newContext({viewport:{width:390,height:844}});
const c2=await browser.newContext({viewport:{width:390,height:844}});
const A=await c1.newPage(),B=await c2.newPage();
for(const [p,label] of [[A,'creator'],[B,'joiner']]) p.on('console',m=>{if(m.type()==='error')report.console.push({page:label,text:m.text()})});
try{
  await A.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  await A.waitForTimeout(3000);
  const btn=A.getByRole('button',{name:'Mit Freunden singen',exact:true});
  report.checks.creatorCTA=await btn.isVisible().catch(()=>false);
  if(report.checks.creatorCTA) await btn.click();
  await A.waitForTimeout(1800);
  report.creatorBody=await A.locator('body').innerText();
  await A.screenshot({path:out+'/creator.png',fullPage:true});
  const m=report.creatorBody.match(/https?:\/\/[^\s]+\/room\/[A-Z0-9]+/i);
  const invite=m?.[0]||null;
  report.checks.inviteCreated=!!invite;
  report.invite=invite;
  if(invite){
    await B.goto(invite,{waitUntil:'domcontentloaded',timeout:45000});
    await B.waitForTimeout(3000);
    report.joinBody=await B.locator('body').innerText();
    const input=B.getByPlaceholder('z.B. DuettPartner');
    report.checks.joinInput=await input.isVisible().catch(()=>false);
    if(report.checks.joinInput) await input.fill('FriendsJoinQA');
    await B.screenshot({path:out+'/join-filled.png',fullPage:true});
    const join=B.getByRole('button',{name:'Room beitreten',exact:true});
    report.checks.joinButton=await join.isVisible().catch(()=>false) && await join.isEnabled().catch(()=>false);
    if(report.checks.joinButton) await join.click();
    await B.waitForTimeout(2500);
    await A.waitForTimeout(2500);
    report.afterJoinBody=await B.locator('body').innerText();
    report.creatorAfterJoin=await A.locator('body').innerText();
    report.checks.joinerEntersRoom=/AKTIVE SESSION/i.test(report.afterJoinBody);
    report.checks.creatorSeesJoiner=/FriendsJoinQA/i.test(report.creatorAfterJoin);
    report.checks.sameRoom=report.checks.joinerEntersRoom&&report.checks.creatorSeesJoiner;
    await B.screenshot({path:out+'/joiner-after.png',fullPage:true});
    await A.screenshot({path:out+'/creator-after.png',fullPage:true});
  }
}catch(e){report.error=String(e?.stack||e)}
report.checks.consoleHealth=report.console.length===0;
await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
console.log('=== FRIENDS JOIN QA ===');
for(const [k,v] of Object.entries(report.checks)) console.log(k+': '+v);
console.log('console:',JSON.stringify(report.console));
console.log('error:',report.error||'');
await c1.close();await c2.close();await browser.close();
