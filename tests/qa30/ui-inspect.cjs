const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
for(const h of ['/admin/noticias','/admin/noticias/'+(await p.evaluate(()=>DB.noticias[0].id)),'/admin/reclamos/'+(await p.evaluate(()=>DB.reclamos[0].id)),'/admin/mensajes','/admin/expedientes/'+(await p.evaluate(()=>DB.expedientes[0].id)),'/admin/ix-alumnos','/admin/ix-bolsa','/admin/ix-config','/admin/ix-horarios','/admin/ix-certificados','/admin/ix-titulos','/admin/aprobaciones']){
await p.evaluate(x=>{location.hash=x},h);await p.waitForTimeout(1500);
const btns=await p.$$eval('main button, main a.btn, main [data-act], main select',bs=>[...new Set(bs.map(b=>(b.tagName==='SELECT'?'SELECT:'+(b.name||b.id):(b.innerText||b.title||b.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,30))+(b.dataset.act?'['+b.dataset.act+']':'')))].filter(Boolean).slice(0,45));
console.log('==',h.slice(0,40),'\n ',btns.join(' · '));}
await b.close();})();
