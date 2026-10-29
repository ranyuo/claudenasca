const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const ctx=await b.newContext();const p=await ctx.newPage();
p.on('request',r=>{if(r.url().includes('api')&&r.method()!=='GET')console.log(r.method(),decodeURIComponent(r.url()).replace(L.BASE,''),(r.postData()||'').slice(0,300))});
p.on('response',async r=>{if(r.url().includes('api%2Fportal')&&r.request().method()==='PUT'){const t=await r.text();const j=JSON.parse(t);console.log('PUT resp',r.status(),'normalized.visitas=',JSON.stringify(j.normalized?.visitas))}});
await p.goto(L.BASE+'/#/admin',{waitUntil:'domcontentloaded'});await p.fill('#lg-u','nasca');await p.fill('#lg-p',process.env.QA30_PASS);await p.click('form button[type=submit]');
await p.waitForTimeout(9000);console.log('final',await p.evaluate(()=>JSON.stringify(DB.visitas)));await b.close();})();
