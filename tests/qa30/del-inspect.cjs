const L=require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'nasca',process.env.QA30_PASS);
for(const k of ['programas','becastipos','enlaces','paginas','matricula','becasper','admision']){
 const info=await p.evaluate(k=>{const s=SPECS[k];const r=DB[s.coll].filter(x=>/QA30-05/.test(JSON.stringify(x).slice(0,400)));return {n:r.length,id:r[0]?.id,del:r[0]?.deleted,t:r[0]&&(r[0].titulo||r[0].nombre||r[0].periodo||r[0].anio),canDel:!!s.canDelete,before:!!s.beforeDelete,bd:r[0]&&s.beforeDelete?s.beforeDelete(r[0]):null,cd:r[0]&&s.canDelete?s.canDelete(r[0]):null}},k);
 await p.evaluate(k=>{location.hash='/admin/'+k},k);await p.waitForTimeout(1300);
 const hasQ=await p.locator('[data-lf] [name=q]').count();
 if(hasQ){await p.fill('[data-lf] [name=q]',String(info.t||'QA30'));await p.locator('[data-lf]').evaluate(f=>f.requestSubmit());await p.waitForTimeout(900);}
 const row=p.locator(`tr[data-id="${info.id}"]`);const rc=await row.count();
 const acts=rc?await row.locator('[data-act]').evaluateAll(a=>a.map(x=>x.dataset.act)):[];
 console.log(k,JSON.stringify(info),'filtro:',hasQ,'fila:',rc,'acciones:',acts.join(','),'filas visibles:',await p.locator('main tbody tr').count());}
await b.close();})();
