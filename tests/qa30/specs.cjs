const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
const s=await p.evaluate(()=>Object.entries(SPECS).map(([k,s])=>{let f;try{f=(typeof s.fields==='function'?s.fields({}):s.fields)}catch(e){f=[]}return k+' coll='+s.coll+' states='+(s.states||[]).join('/')+' n='+(DB[s.coll]||[]).length+' fields='+f.map(x=>x.n+':'+x.t+(x.req?'*':'')+(x.unique?'!':'')).join(',')}));
console.log(s.join('\n'));
console.log('ACAD keys', await p.evaluate(()=>Object.keys(DB.academico).map(k=>k+':'+(Array.isArray(DB.academico[k])?DB.academico[k].length:typeof DB.academico[k])).join(' ')));
await b.close();})();
