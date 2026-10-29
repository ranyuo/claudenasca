const L=require('./lib.cjs');const ids=require('../../evidencias/qa30/fase-b-ids-noticias.json');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);const del=ids.noticias[4];
await p.evaluate(()=>{location.hash='/admin/noticias'});await p.waitForTimeout(1200);
await p.fill('[data-lf] [name=q]',del.txt);await p.locator('[data-lf]').evaluate(f=>f.requestSubmit());await p.waitForTimeout(900);
await p.locator(`tr[data-id="${del.id}"] [data-act=del]`).click();await p.waitForTimeout(700);
console.log('modal buttons:',await p.$$eval('button:visible',b=>b.map(x=>x.innerText.trim()).filter(Boolean).slice(-6)));
await p.locator('button:visible').filter({hasText:/^\s*Eliminar\s*$/}).last().click();await p.waitForTimeout(1500);
console.log(await p.evaluate(async id=>{const d=await (await fetch(portalURL('/api/portal'))).json();const r=d.data.noticias.find(x=>x.id===id);return r?(r.deleted?'papelera':'activo'):'eliminado'},del.id));
await b.close();})();
