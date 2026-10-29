const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
console.log(JSON.stringify(await p.evaluate(()=>DB.expedientes.filter(r=>JSON.stringify(r).includes('QA30')).map(r=>({id:r.id.slice(0,8),numero:r.numero||r.codigo,cargo:r.cargoCod,verif:r.codVerif||r.verificacion,doc:r.numDoc,estado:r.estado,arch:(r.archivos||[]).length})))));
await b.close();})();
