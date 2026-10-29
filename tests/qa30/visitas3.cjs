const L = require('./lib.cjs');
(async()=>{const b=await L.browser();const ctx=await b.newContext();
await ctx.addInitScript(()=>{let _db;Object.defineProperty(window,'DB',{configurable:true,get(){return _db},set(v){_db=v;if(v&&typeof v==='object'){let vis=v.visitas;Object.defineProperty(v,'visitas',{configurable:true,enumerable:true,get(){return vis},set(x){console.log('VISITAS set '+JSON.stringify(x).slice(0,60)+' '+new Error().stack.split('\n').slice(2,5).join(' / '));vis=x}});}}})});
const p=await ctx.newPage();p.on('console',m=>{if(m.text().includes('VISITAS'))console.log(m.text().slice(0,500))});
await p.goto(L.BASE+'/#/admin',{waitUntil:'domcontentloaded'});await p.fill('#lg-u','nasca');await p.fill('#lg-p',process.env.QA30_PASS);await p.click('form button[type=submit]');
await p.waitForTimeout(9000);console.log('final',await p.evaluate(()=>JSON.stringify(DB.visitas)));await b.close();})();
