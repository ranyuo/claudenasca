const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const p=await (await b.newContext()).newPage();
for(const h of ['/contacto','/servicios/libro-de-reclamaciones','/servicios/mesa-de-partes']){
await p.goto(L.BASE+'/#'+h,{waitUntil:'domcontentloaded'});await p.waitForTimeout(3500);
const f=await p.$$eval('main form',fs=>fs.map(f=>({attrs:[...f.attributes].map(a=>a.name+'='+a.value).join(' '),fields:[...f.elements].map(e=>`${e.tagName}:${e.type}:${e.name||e.id}${e.required?'*':''}${e.tagName==='SELECT'?'['+[...e.options].map(o=>o.value).slice(0,8).join('|')+']':''}`).join(', ')})));
console.log('==',h,JSON.stringify(f,null,1).slice(0,2500));
const cap=await p.$$eval('main [id^=cap], main .captcha, main label',l=>l.map(x=>x.innerText.trim()).filter(t=>/captcha|verific|suma|cuánto|resultado|código/i.test(t)).slice(0,5));console.log('captcha labels',cap);}
await b.close();})();
