const L=require('./lib.cjs');
(async()=>{const b=await L.browser();
try{const {p}=await L.login(b,'nasca',process.env.QA30_PASS);console.log('nasca OK',await p.evaluate(()=>JSON.stringify(DB.usuarios.filter(u=>['nasca','qa30_admin2'].includes(u.usuario)).map(u=>({u:u.usuario,rol:u.rol,estado:u.estado})))));}
catch(e){console.log('nasca NO PUEDE ENTRAR:',e.message);
 const {p}=await L.login(b,'qa30_admin2',process.env.QA30_USER_PASS);console.log('admin2 OK',await p.evaluate(()=>JSON.stringify(DB.usuarios.filter(u=>u.usuario==='nasca').map(u=>({u:u.usuario,rol:u.rol,estado:u.estado})))));}
await b.close();})();
