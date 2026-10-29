const { browser, login } = require('./lib.cjs');
(async()=>{const b=await browser();const ctx=await b.newContext();const p=await ctx.newPage();
await p.addInitScript(()=>{let _db;Object.defineProperty(window,'DB',{configurable:true,get(){return _db},set(v){_db=v;if(v&&typeof v==='object'){let vis=v.visitas;Object.defineProperty(v,'visitas',{configurable:true,enumerable:true,get(){return vis},set(x){if(Array.isArray(x))console.log('VISITAS->ARRAY '+new Error().stack.split('\n').slice(1,4).join(' / '));vis=x}});}}})});
p.on('console',m=>{if(m.text().includes('VISITAS'))console.log(m.text().slice(0,600))});
await p.goto(require('./lib.cjs').BASE+'/#/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>JSON.stringify(DB&&DB.visitas)));await b.close();})();
