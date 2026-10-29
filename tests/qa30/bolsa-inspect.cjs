const L=require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
for(const h of ['/admin/ix-bolsa','/admin/ix-bolsa/gestion']){await p.evaluate(x=>{location.hash=x},h);await p.waitForTimeout(2000);
console.log('==',h,await p.evaluate(()=>location.hash),'\n',(await p.$$eval('main button, main a.btn, main [data-tab]',bs=>bs.map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,30)+'{'+[...b.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(' ')+'}'))).slice(0,40).join(' · '));}
await p.goto(L.BASE+'/auditoria.php?q=qa30_');await p.waitForTimeout(1500);console.log('audit qa30_:',((await p.locator('main').innerText()).match(/\d+ registros[^.]*/)||[''])[0]);
await p.goto(L.BASE+'/auditoria.php?desde=2026-10-29&hasta=2026-10-29');await p.waitForTimeout(1500);const t=await p.locator('main').innerText();console.log('audit hoy:',(t.match(/\d+ registros[^.]*/)||[''])[0]);console.log(t.split('\n').filter(l=>/QA30|qa30/.test(l)).slice(0,5).join('\n').slice(0,600));
await b.close();})();
