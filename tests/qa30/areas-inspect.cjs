const L=require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
for(const h of ['/admin/expedientes/areas','/admin/expedientes/config','/admin/reclamos/config']){await p.evaluate(x=>{location.hash=x},h);await p.waitForTimeout(2000);
console.log('==',h,'\n',(await p.locator('main').innerText()).replace(/\s+/g,' ').slice(0,500),'\n BTN:',(await p.$$eval('main button',bs=>bs.map(b=>(b.innerText||b.title||'').trim().slice(0,25)+'{'+[...b.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(' ')+'}'))).slice(0,25).join(' · '));}
await b.close();})();
