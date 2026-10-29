// Fase C: un usuario por perfil, menú esperado, acceso directo por URL y por API, escrituras permitidas,
// intento de escalamiento, cambio de rol, cuenta inactiva y protección del administrador principal.
const L = require('./lib.cjs'); const fs = require('node:fs');
const PASS = process.env.QA30_USER_PASS; const ROLES = ['imagen', 'secretaria', 'coordinador', 'transparencia', 'atencion', 'directivo', 'docente', 'estudiante', 'egresado', 'empresa', 'admin'];
const uname = r => r === 'admin' ? 'qa30_admin2' : 'qa30_' + r;
async function api(p, method, route, body) { return p.evaluate(async ({ method, route, body }) => { const r = await fetch(portalURL(route), { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': PORTAL_BOOTSTRAP.csrf }, body: body ? JSON.stringify(body) : undefined }); let j = {}; try { j = await r.json(); } catch {} return { status: r.status, message: j.message, j }; }, { method, route, body }); }
(async () => {
  const b = await L.browser(); const { p: ad } = await L.login(b, 'nasca', process.env.QA30_PASS); ad.on('dialog', d => d.accept());
  const roleDefs = await ad.evaluate(() => Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, { label: v.label, mods: v.mods, publish: !!v.publish, viewDni: !!v.viewDni }])));
  const vin = await ad.evaluate(() => { const o = IX.vinOpts(); const pick = (pre, n = 0) => (o.filter(x => x[0].startsWith(pre) && /QA30/.test(x[1]))[n] || o.filter(x => x[0].startsWith(pre))[n] || [])[0]; return { docente: pick('doc:'), estudiante: pick('est:', 0), egresado: pick('est:', 1), empresa: pick('emp:') }; });
  const prog = await ad.evaluate(() => DB.programas.find(p => !p.deleted && p.estado === 'Publicado')?.id);
  L.rec('C', 'Vínculos disponibles', 'OK', JSON.stringify({ ...vin, programa: prog }));
  // 1. Crear usuarios desde Usuarios y roles
  for (const r of ROLES) {
    const exists = await ad.evaluate(u => DB.usuarios.some(x => x.usuario === u), uname(r)); if (exists) { L.rec('C', `Crear usuario ${uname(r)}`, 'OK', 'ya existía'); continue; }
    await ad.evaluate(() => { location.hash = '/admin/usuarios/nuevo'; }); await ad.waitForTimeout(800);
    await ad.evaluate(({ r, u, pass, vin, prog }) => { ADM.work = { id: uid(), usuario: u, nombre: 'QA30 ' + ROLES[r].label, rol: r, estado: 'Activo', correo: u + '@portal.invalid', pass1: pass, pass2: pass, has_password: false, programaId: r === 'coordinador' ? prog : '', vin: vin[r] || '' }; ADM.workKey = 'usuarios'; ADM.workNew = true; route(); }, { r, u: uname(r), pass: PASS, vin, prog });
    await ad.waitForTimeout(400); await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(2000);
    const err = await ad.locator('[data-cf]').count() ? (await ad.locator('.errmsg, .toast, .fe').allInnerTexts()).join(' | ').replace(/\s+/g, ' ') : '';
    const ok = await ad.evaluate(async u => (await (await fetch(portalURL('/api/portal'))).json()).data.usuarios.some(x => x.usuario === u), uname(r));
    L.rec('C', `Crear usuario ${uname(r)} (${roleDefs[r].label})`, ok ? 'OK' : 'FALLA', err.slice(0, 200));
  }
  // Validación de contraseña corta
  await ad.evaluate(() => { location.hash = '/admin/usuarios/nuevo'; }); await ad.waitForTimeout(700);
  await ad.evaluate(() => { ADM.work = { id: uid(), usuario: 'qa30_corta', nombre: 'QA30 corta', rol: 'imagen', estado: 'Activo', pass1: 'corta123', pass2: 'corta123', has_password: false }; ADM.workKey = 'usuarios'; ADM.workNew = true; route(); });
  await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(1200);
  L.rec('C', 'Contraseña de menos de 12 caracteres rechazada', await ad.locator('[data-cf]').count() ? 'OK' : 'FALLA');
  const aNoticia = await ad.evaluate(() => DB.noticias.find(n => /QA30-02/.test(n.titulo)));
  // 2. Pruebas por perfil
  const sessions = {};
  for (const r of ROLES) {
    const def = roleDefs[r]; let s;
    try { s = await L.login(b, uname(r), PASS); } catch (e) { L.rec('C', `${r}: ingreso`, 'FALLA', e.message); continue; }
    const { p } = s; sessions[r] = s; p.on('dialog', d => d.accept());
    const who = await p.evaluate(() => PORTAL_BOOTSTRAP.user && { rol: PORTAL_BOOTSTRAP.user.rol, u: PORTAL_BOOTSTRAP.user.usuario });
    L.rec('C', `${r}: ingreso`, who?.rol === r ? 'OK' : 'FALLA', JSON.stringify(who));
    await L.shot(p, `C-${r}-panel`);
    // Menú
    const menu = await p.$$eval('aside a[href^="#/admin/"], nav a[href^="#/admin/"], .sb a[href^="#/admin/"]', a => [...new Set(a.map(x => x.getAttribute('href').replace('#/admin/', '').split(/[/?]/)[0]))]);
    const expected = def.mods; const extra = menu.filter(m => !expected.includes(m) && !['dashboard', 'perfil', 'slides', 'respaldo'].includes(m)); const missing = expected.filter(m => !menu.includes(m) && m !== 'dashboard');
    L.rec('C', `${r}: menú según permisos`, extra.length ? 'FALLA' : missing.length ? 'REVISAR' : 'OK', `menú: ${menu.join(', ')}` + (extra.length ? ` · NO PERMITIDOS: ${extra.join(', ')}` : '') + (missing.length ? ` · faltan: ${missing.join(', ')}` : ''));
    // Acceso directo por URL a módulos ajenos
    if (r !== 'admin') for (const m of ['usuarios', 'config', 'auditoria', r === 'imagen' ? 'reclamos' : 'noticias']) {
      if (expected.includes(m)) continue;
      await p.evaluate(h => { location.hash = h; }, '/admin/' + m); await p.waitForTimeout(1200);
      const t = (await p.locator('main').innerText().catch(() => '')).slice(0, 400); const h = await p.evaluate(() => location.hash);
      const denied = /permiso|acceso|autoriz|no disponible|restringid/i.test(t) || !h.startsWith('#/admin/' + m);
      const leaks = await p.locator('main table tbody tr').count();
      L.rec('C', `${r}: URL directa #/admin/${m}`, denied && leaks < 2 ? 'OK' : 'FALLA', denied ? 'denegado/redirigido' : `muestra contenido (${leaks} filas): ${t.replace(/\s+/g, ' ').slice(0, 100)}`);
    }
    // Datos que entrega el servidor a este perfil
    const data = await p.evaluate(async () => (await (await fetch(portalURL('/api/portal'))).json()).data);
    const a = data.academico || {}; const s2 = JSON.stringify(data);
    const dnis = (s2.match(/"dni":"\d{8}"/g) || []).length;
    const scope = { usuarios: (data.usuarios || []).length, reclamos: (data.reclamos || []).length, expedientes: (data.expedientes || []).length, mensajes: (data.mensajes || []).length, estudiantes: (a.estudiantes || []).length, postulaciones: (a.postulaciones || []).length, certs: (a.certs || []).length, dniVisibles: dnis };
    const bad = [];
    if (r !== 'admin' && scope.usuarios > 1) bad.push('recibe lista de usuarios');
    if (!['atencion', 'directivo', 'admin'].includes(r) && scope.reclamos) bad.push('recibe reclamos');
    if (!['atencion', 'directivo', 'admin'].includes(r) && scope.expedientes) bad.push('recibe expedientes');
    if (!['atencion', 'admin'].includes(r) && scope.mensajes) bad.push('recibe mensajes');
    if (['estudiante', 'egresado'].includes(r) && scope.estudiantes > 1) bad.push('ve otros alumnos');
    if (['docente', 'empresa', 'imagen', 'transparencia'].includes(r) && scope.estudiantes > 0) bad.push('ve alumnos');
    if (!def.viewDni && !['estudiante', 'egresado'].includes(r) && dnis > 0) bad.push(`${dnis} DNI completos`);
    L.rec('C', `${r}: datos entregados por el servidor`, bad.length ? 'FALLA' : 'OK', JSON.stringify(scope) + (bad.length ? ' · ' + bad.join(', ') : ''));
    // Escritura por API en módulo ajeno (noticia QA30-02); la cuenta admin debe poder.
    if (aNoticia) { const cur = data.noticias?.find(n => n.id === aNoticia.id) || aNoticia; const after = { ...cur, titulo: cur.titulo + ' [hack ' + r + ']' };
      const res = await api(p, 'PUT', '/api/portal', { patch: [{ path: ['noticias'], kind: 'rows', changes: [{ key: 'id:' + cur.id, before: cur, after }] }], revision: (await p.evaluate(async () => (await (await fetch(portalURL('/api/portal'))).json()).revision)), accounts: [] });
      const allowed = def.mods.includes('noticias');
      L.rec('C', `${r}: API — modificar noticia (${allowed ? 'permitido' : 'no permitido'})`, (res.status < 300) === allowed ? 'OK' : 'FALLA', `HTTP ${res.status} ${res.message || ''}`);
      if (res.status < 300) { const back = await api(ad, 'GET', '/api/portal'); const now = back.j.data.noticias.find(n => n.id === cur.id); const rev = back.j.revision; await api(ad, 'PUT', '/api/portal', { patch: [{ path: ['noticias'], kind: 'rows', changes: [{ key: 'id:' + cur.id, before: now, after: { ...now, titulo: aNoticia.titulo } }] }], revision: rev, accounts: [] }); }
    }
    // Escalamiento: crear un administrador
    if (r !== 'admin') { const rev = (await api(p, 'GET', '/api/portal')).j.revision;
      const res = await api(p, 'PUT', '/api/portal', { patch: [], revision: rev, accounts: [{ action: 'create', account: { username: 'qa30_escala_' + r, name: 'QA30 escalamiento', email: 'qa30.escala@portal.invalid', role: 'admin', estado: 'Activo', password: PASS } }] });
      L.rec('C', `${r}: intento de crear cuenta administradora`, res.status >= 400 ? 'OK' : 'FALLA', `HTTP ${res.status} ${res.message || ''}`); }
  }
  // 3. Cambio de rol con sesión abierta
  if (sessions.imagen) { const id = await ad.evaluate(() => { const u = DB.usuarios.find(x => x.usuario === 'qa30_imagen'); return u?.id; });
    await ad.evaluate(id => { location.hash = '/admin/usuarios/' + id; }, id); await ad.waitForTimeout(1200);
    await ad.selectOption('[data-cf] [name=rol]', 'transparencia'); await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(2000);
    const res = await api(sessions.imagen.p, 'GET', '/api/portal');
    L.rec('C', 'Cambio de rol cierra la sesión abierta del usuario', !res.j.user ? 'OK' : 'FALLA', `tras el cambio, la sesión anterior ve user=${JSON.stringify(res.j.user?.rol || null)}`);
    try { const s = await L.login(b, 'qa30_imagen', PASS); const rol = await s.p.evaluate(() => PORTAL_BOOTSTRAP.user.rol); const menu = await s.p.$$eval('aside a[href^="#/admin/"]', a => a.map(x => x.getAttribute('href')));
      L.rec('C', 'Nuevo ingreso muestra el menú del nuevo rol', rol === 'transparencia' && menu.some(h => h.includes('documentos')) && !menu.some(h => h.includes('noticias')) ? 'OK' : 'FALLA', rol); await s.ctx.close(); } catch (e) { L.rec('C', 'Nuevo ingreso tras cambio de rol', 'FALLA', e.message); }
    await ad.evaluate(id => { location.hash = '/admin/usuarios/' + id; }, id); await ad.waitForTimeout(1200); await ad.selectOption('[data-cf] [name=rol]', 'imagen'); await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(1500); }
  // 4. Segundo administrador no puede desactivar ni degradar a la cuenta principal
  if (sessions.admin) { const ap = sessions.admin.p; const data = (await api(ap, 'GET', '/api/portal')).j; const main = data.data.usuarios.find(u => u.usuario === 'nasca');
    const fields = { username: main.usuario, name: main.nombre, email: main.correo || '', role: main.rol, estado: main.estado, vin: main.vin || '', dni: main.dni || '', personaId: main.personaId || '', programaId: main.programaId || '', area: main.area || '', cargo: main.cargo || '' };
    const res = await api(ap, 'PUT', '/api/portal', { patch: [], revision: data.revision, accounts: [{ action: 'update', id: main.server_id, account: { ...fields, estado: 'Inactivo' }, expected: fields }] });
    L.rec('C', 'Admin secundario no puede desactivar la cuenta "nasca"', res.status >= 400 ? 'OK' : 'FALLA', `HTTP ${res.status} ${res.message || ''}`);
    if (res.status < 300) { const d2 = (await api(ad, 'GET', '/api/portal')).j; await api(ad, 'PUT', '/api/portal', { patch: [], revision: d2.revision, accounts: [{ action: 'update', id: main.server_id, account: fields, expected: { ...fields, estado: 'Inactivo' } }] }); } }
  // 5. Cuenta inactiva y contraseña incorrecta
  { const id = await ad.evaluate(() => DB.usuarios.find(x => x.usuario === 'qa30_egresado')?.id);
    await ad.evaluate(() => { location.reload(); }); await ad.waitForTimeout(4000);
    await ad.evaluate(id => { location.hash = '/admin/usuarios/' + id; }, id); await ad.waitForTimeout(1200);
    await ad.selectOption('[data-cf] [name=estado]', 'Inactivo').catch(() => {}); await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(1500);
    try { const s = await L.login(b, 'qa30_egresado', PASS); L.rec('C', 'Cuenta inactiva no puede ingresar', 'FALLA', 'ingresó'); await s.ctx.close(); } catch (e) { L.rec('C', 'Cuenta inactiva no puede ingresar', 'OK', e.message.slice(0, 120)); }
    await ad.evaluate(id => { location.hash = '/admin/usuarios/' + id; }, id); await ad.waitForTimeout(1200); await ad.selectOption('[data-cf] [name=estado]', 'Activo').catch(() => {}); await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(1500); }
  { let msgs = []; for (let i = 0; i < 6; i++) { try { const s = await L.login(b, 'qa30_directivo', 'ClaveIncorrecta-' + i); await s.ctx.close(); msgs.push('ENTRÓ'); } catch (e) { msgs.push(e.message.replace('Login falló: ', '').slice(0, 70)); } }
    L.rec('C', 'Contraseña incorrecta rechazada', msgs.every(m => m !== 'ENTRÓ') ? 'OK' : 'FALLA', [...new Set(msgs)].join(' / '));
    let blocked = false; try { const s = await L.login(b, 'qa30_directivo', PASS); await s.ctx.close(); } catch (e) { blocked = true; }
    L.rec('C', 'Bloqueo temporal tras 6 intentos fallidos', blocked ? 'OK' : 'REVISAR', blocked ? 'la contraseña correcta queda bloqueada temporalmente' : 'tras 6 intentos fallidos aún se puede ingresar'); }
  L.save('fase-c-perfiles'); await b.close();
})().catch(e => { console.error(e); L.save('fase-c-perfiles'); process.exit(1); });
