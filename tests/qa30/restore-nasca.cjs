const L=require('./lib.cjs');
(async()=>{const b=await L.browser();const {p}=await L.login(b,'qa30_admin2',process.env.QA30_USER_PASS);
const id=await p.evaluate(()=>DB.usuarios.find(u=>u.usuario==='nasca').id);
await p.evaluate(id=>{location.hash='/admin/usuarios/'+id},id);await p.waitForTimeout(1500);
await p.selectOption('[data-cf] [name=estado]','Activo');await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await p.waitForTimeout(2500);
console.log('mensajes:',(await p.locator('.errmsg,.toast').allInnerTexts()).join('|'));
const st=await p.evaluate(async()=>{const d=await (await fetch(portalURL('/api/portal'))).json();return d.data.usuarios.find(u=>u.usuario==='nasca')});console.log('nasca ahora:',st.estado,st.rol);
await b.close();
const b2=await L.browser();try{await L.login(b2,'nasca',process.env.QA30_PASS);console.log('nasca puede entrar: SI')}catch(e){console.log('nasca puede entrar: NO',e.message)}await b2.close();})();
