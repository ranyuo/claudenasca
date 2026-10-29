const { browser, login } = require('./lib.cjs');
(async()=>{const b=await browser();const {p}=await login(b,'nasca',process.env.QA30_PASS);
console.log(JSON.stringify(await p.evaluate(()=>({boot:PORTAL_BOOTSTRAP.data.visitas,db:DB.visitas,now:new Date().toISOString()}))));
const r=await p.evaluate(async()=>{const x=await fetch(portalURL('/api/portal'));const d=await x.json();return d.data?.visitas;});console.log('api',JSON.stringify(r));await b.close();})();
