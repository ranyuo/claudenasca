const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
console.log(JSON.stringify(await p.evaluate(()=>({rec:DB.reclamos.filter(r=>JSON.stringify(r).includes('QA30')).map(r=>({id:r.id,keys:Object.keys(r).join(','),codigo:r.codigo||r.numero||r.code,doc:r.numDoc,estado:r.estado,adj:r.adjunto||r.adjuntos})),msg:DB.mensajes.filter(r=>JSON.stringify(r).includes('QA30')).map(r=>({n:r.nombres,m:r.mensaje}))})),null,0).slice(0,3000));
await p.goto(L.BASE+'/#/servicios/libro-de-reclamaciones');await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>{const f=document.querySelector('form[data-lrq2]');let el=f;const chain=[];while(el&&el!==document.body){if(getComputedStyle(el).display==='none'||el.hidden)chain.push(el.tagName+'.'+el.className+'#'+el.id);el=el.parentElement}return chain.join(' < ')+' || tabs: '+[...document.querySelectorAll('main button,main [role=tab]')].map(b=>b.innerText.trim()).filter(Boolean).slice(0,12).join(' | ')}));
await b.close();})();
