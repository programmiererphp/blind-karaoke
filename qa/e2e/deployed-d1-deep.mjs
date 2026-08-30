import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const target=process.env.TARGET_URL||'https://blind-karaoke-663424522262.us-west1.run.app';
const out='qa-artifacts-deep';
await fs.mkdir(out,{recursive:true});
const suffix=Date.now().toString().slice(-7);
const city=`Göttingen QA ${suffix}`;
const report={target,city,startedAt:new Date().toISOString(),checks:{},states:{},console:[],networkFailures:[],notes:[]};

function diag(page,label){
  page.on('console',m=>{ if(['warning','error'].includes(m.type())) report.console.push({page:label,type:m.type(),text:m.text()}); });
  page.on('requestfailed',r=>report.networkFailures.push({page:label,url:r.url(),error:r.failure()?.errorText||'unknown'}));
}
async function snap(page,name){await page.screenshot({path:path.join(out,name),fullPage:true});}
async function state(page,name){
  const body=await page.locator('body').innerText().catch(()=>'');
  const controls=await page.locator('button,input,select,textarea,a').evaluateAll(els=>els.slice(0,180).map((e,i)=>({
    i,tag:e.tagName,type:e.getAttribute('type'),
    text:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').trim().slice(0,160),
    placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),
    value:'value' in e?e.value:null,href:e.getAttribute('href'),disabled:!!e.disabled
  }))).catch(()=>[]);
  report.states[name]={url:page.url(),title:await page.title(),body:body.slice(0,14000),controls};
  return body;
}
async function click(page,names){
  for(const name of names){
    const b=page.getByRole('button',{name,exact:true});
    if(await b.isVisible().catch(()=>false) && await b.isEnabled().catch(()=>false)){await b.click();return name;}
    const br=page.getByRole('button',{name:new RegExp(name,'i')});
    if(await br.first().isVisible().catch(()=>false) && await br.first().isEnabled().catch(()=>false)){await br.first().click();return name;}
    const l=page.getByRole('link',{name:new RegExp(name,'i')});
    if(await l.first().isVisible().catch(()=>false)){await l.first().click();return name;}
  }
  return null;
}
async function waitBody(page,patterns,timeout=12000){
  const end=Date.now()+timeout;
  while(Date.now()<end){
    const body=await page.locator('body').innerText().catch(()=>'');
    if(patterns.some(p=>p.test(body))) return body;
    await page.waitForTimeout(400);
  }
  return page.locator('body').innerText().catch(()=>'');
}
async function fillProfile(page,{nick,age,gender,pref,min,max,styles,songs}){
  await click(page,['Blind Karaoke starten']);
  await page.waitForTimeout(400);
  const tx=page.locator('input[type="text"]:visible');
  await tx.nth(0).fill(nick);
  await tx.nth(1).fill(city);
  const sel=page.locator('select:visible');
  await sel.nth(0).selectOption({label:`${age} Jahre`});
  await sel.nth(1).selectOption({label:gender});
  await sel.nth(2).selectOption({label:'25 km (Default)'});
  await click(page,['Wochenende']);
  const times=page.locator('input[type="time"]:visible');
  if(await times.count()>=2){await times.nth(0).fill('18:00');await times.nth(1).fill('23:00');}
  await click(page,['Café / Bar']);
  const same=page.getByRole('button',{name:pref,exact:true});
  const n=await same.count(); if(n) await same.nth(n-1).click();
  const nums=page.locator('input[type="number"]:visible');
  if(await nums.count()>=2){await nums.nth(0).fill(String(min));await nums.nth(1).fill(String(max));}
  for(const s of styles) await click(page,[s]);
  for(let i=0;i<songs.length;i++){
    const input=page.getByPlaceholder(`Lieblingssong #${i+1}`);
    if(await input.isVisible().catch(()=>false)) await input.fill(songs[i]);
  }
}
async function findInvite(page){
  const body=await page.locator('body').innerText();
  const m=body.match(/https?:\/\/[^\s]+\/room\/[A-Z0-9]+/i);
  return m?.[0]||null;
}

const browser=await chromium.launch({headless:true});
const Actx=await browser.newContext({viewport:{width:390,height:844}});
const Bctx=await browser.newContext({viewport:{width:390,height:844}});
const A=await Actx.newPage(),B=await Bctx.newPage();diag(A,'A');diag(B,'B');

try{
  await Promise.all([
    A.goto(target,{waitUntil:'domcontentloaded',timeout:45000}),
    B.goto(target,{waitUntil:'domcontentloaded',timeout:45000})
  ]);
  await Promise.all([A.waitForTimeout(900),B.waitForTimeout(900)]);

  await fillProfile(A,{nick:`MinaDeep${suffix}`,age:22,gender:'Frau',pref:'Mann',min:25,max:40,styles:['Pop','Balladen'],songs:['Shallow','Perfect','Dancing Queen']});
  await click(A,['Match suchen']);
  const noMatch=await waitBody(A,[/Kein Duo gefunden/i,/DUO GEFUNDEN/i],8000);
  report.checks.firstUserGetsNoMatch=/Kein Duo gefunden/i.test(noMatch);
  await state(A,'A-no-match');await snap(A,'01-A-no-match.png');

  await fillProfile(B,{nick:`AlexDeep${suffix}`,age:32,gender:'Mann',pref:'Frau',min:20,max:30,styles:['Pop','80er / 90er'],songs:['Shallow','Take on Me','Dancing Queen']});
  await click(B,['Match suchen']);
  const [am,bm]=await Promise.all([
    waitBody(A,[/DUO GEFUNDEN/i],12000),
    waitBody(B,[/DUO GEFUNDEN/i],12000)
  ]);
  report.checks.matchProposalBoth=/DUO GEFUNDEN/i.test(am)&&/DUO GEFUNDEN/i.test(bm);
  await state(A,'A-proposal');await state(B,'B-proposal');
  await snap(A,'02-A-proposal.png');await snap(B,'03-B-proposal.png');

  report.checks.acceptA=!!(await click(A,['Ich bin dabei']));
  await A.waitForTimeout(2200);
  const one=await state(A,'A-waiting');
  report.checks.oneSidedWait=/Warten auf das Karaoke-Duo/i.test(one);
  report.checks.acceptB=!!(await click(B,['Ich bin dabei']));

  const confirmed=[/Duett-Partner gefunden/i,/Zum Karaoke Room/i];
  const [ac,bc]=await Promise.all([waitBody(A,confirmed,12000),waitBody(B,confirmed,12000)]);
  report.checks.confirmedBoth=confirmed.some(p=>p.test(ac))&&confirmed.some(p=>p.test(bc));
  await snap(A,'04-A-confirmed.png');await snap(B,'05-B-confirmed.png');

  const goA=await click(A,['Zum Karaoke Room']);
  const goB=await click(B,['Zum Karaoke Room']);
  report.checks.roomCTA_A=!!goA;report.checks.roomCTA_B=!!goB;
  await Promise.all([A.waitForTimeout(900),B.waitForTimeout(900)]);
  const roomA=await state(A,'A-real-room'),roomB=await state(B,'B-real-room');
  await snap(A,'06-A-real-room.png');await snap(B,'07-B-real-room.png');
  report.checks.realRoomBoth=/AKTIVE SESSION|SONG-WARTESCHLANGE|Song hinzufügen/i.test(roomA)&&/AKTIVE SESSION|SONG-WARTESCHLANGE|Song hinzufügen/i.test(roomB);

  // Duet discovery before opening any modal.
  const duet=await click(A,['Zufälliges Duett','Zufälliges Duett finden','Duett Roulette','Duett finden']);
  report.checks.duetActionPresent=!!duet;
  if(duet){
    await A.waitForTimeout(700);
    const duetBody=await state(A,'A-duet');
    report.checks.duetProducesSuggestion=/Challenge|Duett|Shallow|Song|Empfehl/i.test(duetBody);
    await snap(A,'11-A-duet.png');
    // Close any resulting modal/card if there is an explicit close button.
    const close=A.getByRole('button',{name:/Schließen|Close|Abbrechen/i});
    if(await close.first().isVisible().catch(()=>false)) await close.first().click();
  } else {
    report.notes.push('No visible duet action in real matched room.');
  }

  // Song queue.
  const openPicker=await click(A,['Song hinzufügen']);
  report.checks.songPickerOpens=!!openPicker;
  await A.waitForTimeout(500);
  await state(A,'A-song-picker');await snap(A,'08-A-song-picker.png');

  let selected=false;
  const choose=A.getByRole('button',{name:'Wählen',exact:true});
  if(await choose.first().isVisible().catch(()=>false)){
    await choose.first().click();
    selected=true;
  }
  if(!selected){
    const title=A.getByPlaceholder('Songtitel *');
    if(await title.first().isVisible().catch(()=>false)){
      await title.first().fill('Shallow');
      const artist=A.getByPlaceholder(/Interpret \/ Artist/i);
      if(await artist.first().isVisible().catch(()=>false)) await artist.first().fill('Lady Gaga & Bradley Cooper');
      selected=true;
    }
  }
  await A.waitForTimeout(700);
  // Some catalog buttons add directly; custom input needs the enabled submit button.
  const add=A.getByRole('button',{name:'Hinzufügen',exact:true});
  if(await add.isVisible().catch(()=>false) && await add.isEnabled().catch(()=>false)) await add.click();
  await A.waitForTimeout(1200);
  const afterAdd=await state(A,'A-after-add');
  const seenB=await waitBody(B,[/Shallow/i],7000);
  report.checks.queueAddVisibleA=/Shallow/i.test(afterAdd);
  report.checks.queueRealtimeToB=/Shallow/i.test(seenB);
  await snap(A,'09-A-queue.png');await snap(B,'10-B-queue-sync.png');

  // Duet result already tested above; continue with karaoke target.
  const duetAfterQueue=duet;
  // Karaoke external link check.
  let popupUrl=null;
  const karaokeBtn=A.getByRole('button',{name:/Karaoke starten/i});
  if(await karaokeBtn.first().isVisible().catch(()=>false)){
    const popupPromise=A.waitForEvent('popup',{timeout:3000}).catch(()=>null);
    await karaokeBtn.first().click();
    const popup=await popupPromise;
    if(popup){await popup.waitForLoadState('domcontentloaded').catch(()=>{});popupUrl=popup.url();await popup.close().catch(()=>{});}
  }
  report.checks.karaokeExternalTarget=!!popupUrl && /^https?:/.test(popupUrl);
  report.states.karaokePopupUrl=popupUrl;

  // Reload persistence in room.
  await Promise.all([A.reload({waitUntil:'domcontentloaded'}),B.reload({waitUntil:'domcontentloaded'})]);
  await Promise.all([A.waitForTimeout(700),B.waitForTimeout(700)]);
  const ar=await state(A,'A-after-reload'),br=await state(B,'B-after-reload');
  report.checks.roomPersistsReload=/AKTIVE SESSION|Duett-Partner gefunden/i.test(ar)&&/AKTIVE SESSION|Duett-Partner gefunden/i.test(br);

  // End/feedback discovery.
  if(/AKTIVE SESSION/i.test(ar)) await click(A,['Abend beenden','Karaoke-Abend beenden']);
  if(/AKTIVE SESSION/i.test(br)) await click(B,['Abend beenden','Karaoke-Abend beenden']);
  await Promise.all([A.waitForTimeout(500),B.waitForTimeout(500)]);
  const fa=await state(A,'A-feedback'),fb=await state(B,'B-feedback');
  report.checks.feedbackScreenBoth=/wieder|singen|Abend/i.test(fa)&&/wieder|singen|Abend/i.test(fb);
  await snap(A,'12-A-feedback.png');await snap(B,'13-B-feedback.png');

  const posA=await click(A,['Wieder zusammen singen','Ja, gerne wieder','Wieder singen']);
  await A.waitForTimeout(500);
  const bBefore=await B.locator('body').innerText();
  report.checks.positiveAButton=!!posA;
  report.checks.oneSidedPositiveNotLeaked=!/Mina.*möchte|will.*wieder|positiv/i.test(bBefore);

  const posB=await click(B,['Wieder zusammen singen','Ja, gerne wieder','Wieder singen']);
  report.checks.positiveBButton=!!posB;
  if(posB){
    const frA=await waitBody(A,[/Karaoke-Freund/i,/Freunde/i],7000);
    const frB=await waitBody(B,[/Karaoke-Freund/i,/Freunde/i],7000);
    report.checks.mutualPositiveFriend=/Karaoke-Freund/i.test(frA)&&/Karaoke-Freund/i.test(frB);
  }

  // Fresh Friends room + join.
  const Fctx=await browser.newContext({viewport:{width:390,height:844}});
  const Jctx=await browser.newContext({viewport:{width:390,height:844}});
  const F=await Fctx.newPage(),J=await Jctx.newPage();diag(F,'F');diag(J,'J');
  await F.goto(target,{waitUntil:'domcontentloaded'});await F.waitForTimeout(500);
  await click(F,['Mit Freunden singen']);await F.waitForTimeout(700);
  const fbody=await state(F,'F-created');const invite=await findInvite(F);report.states.friendInvite=invite;
  report.checks.friendRoomCreated=/AKTIVE SESSION/i.test(fbody)&&!!invite;
  await snap(F,'14-F-friend-created.png');
  if(invite){
    await J.goto(invite,{waitUntil:'domcontentloaded'});await J.waitForTimeout(700);
    const joinBody=await state(J,'J-join-page');await snap(J,'15-J-join-page.png');
    const nick=J.getByPlaceholder(/Name|Nickname/i);
    if(await nick.first().isVisible().catch(()=>false)) await nick.first().fill(`Joiner${suffix}`);
    else {
      const tx=J.locator('input[type="text"]:visible');if(await tx.count()) await tx.first().fill(`Joiner${suffix}`);
    }
    const joined=await click(J,['Room beitreten','Beitreten','Mitsingen']);
    report.checks.friendJoinAction=!!joined;
    await J.waitForTimeout(900);await F.waitForTimeout(900);
    const fj=await state(J,'J-after-join'),ff=await state(F,'F-after-join');
    report.checks.friendJoinSameRoom=/AKTIVE SESSION/i.test(fj)&&/Joiner|Sänger/i.test(ff);
    await snap(J,'16-J-joined.png');await snap(F,'17-F-sees-joiner.png');
  }
  await Fctx.close();await Jctx.close();

  // Fresh accessibility regression check.
  const Xctx=await browser.newContext({viewport:{width:390,height:844}});
  const X=await Xctx.newPage();await X.goto(target,{waitUntil:'domcontentloaded'});await X.waitForTimeout(400);await click(X,['Blind Karaoke starten']);await X.waitForTimeout(300);
  const nl=await X.getByLabel(/Nickname/i).count().catch(()=>0);
  const al=await X.getByLabel(/^Alter$/i).count().catch(()=>0);
  report.checks.programmaticLabelsFresh=nl>0&&al>0;
  await Xctx.close();

} catch(e){
  report.notes.push(String(e?.stack||e));
}

report.checks.consoleHealth=report.console.filter(x=>x.type==='error').length===0;
report.finishedAt=new Date().toISOString();
await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
await fs.writeFile(path.join(out,'summary.txt'),[
  ...Object.entries(report.checks).map(([k,v])=>`${k}: ${v}`),
  '',
  'NOTES',...report.notes,
  '',
  ...Object.entries(report.states).map(([k,v])=>`--- ${k} ---\n${typeof v==='object'&&v.body?v.body.slice(0,6500):JSON.stringify(v)}\n`)
].join('\n'));
console.log('=== D1 DEEP CHECKS ===');
for(const [k,v] of Object.entries(report.checks)) console.log(`${k}: ${v}`);
console.log('=== D1 DEEP NOTES ===');console.log(JSON.stringify(report.notes));
await Actx.close();await Bctx.close();await browser.close();
