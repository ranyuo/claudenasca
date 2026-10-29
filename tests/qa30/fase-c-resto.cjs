// Fase C (resto): detalle de cuentas visibles por perfil, cuenta inactiva y bloqueo por intentos fallidos.
const L = require('./lib.cjs'); const PASS = process.env.QA30_USER_PASS;
(async () => {
  const b = await L.browser();
  for (const r of ['secretaria', 'coordinador', 'atencion', 'empresa']) {
    const { p, ctx } = await L.login(b, 'qa30_' + r, PASS);
    const d = await p.evaluate(async () => (await (await fetch(portalURL('/api/portal'))).json()).data);
    const users = (d.usuarios || []).map(u => `${u.usuario}(${u.rol})`); const keys = [...new Set((d.usuarios || []).flatMap(u => Object.keys(u)))];
    const stu = (d.academico?.estudiantes || []).map(e => `${e.nom || e.nombres}:${e.dni}`); const post = (d.academico?.postulaciones || []).map(x => JSON.stringify(x).slice(0, 120));
    const admins = (d.usuarios || []).filter(u => u.rol === 'admin').length;
    L.rec('C', `${r}: cuentas visibles (detalle)`, admins && r !== 'admin' ? 'FALLA' : 'REVISAR', `${users.join(', ')} · campos: ${keys.join(',')}` + (r === 'empresa' ? ` · alumnos: ${stu.join(', ')} · postulaciones: ${post.join(' | ')}` : ''));
    await ctx.close();
  }
  const { p: ad } = await L.login(b, 'nasca', process.env.QA30_PASS); ad.on('dialog', d => d.accept());
  const setEstado = async (u, est) => { const id = await ad.evaluate(u => DB.usuarios.find(x => x.usuario === u)?.id, u); await ad.evaluate(id => { location.hash = '/admin/usuarios/' + id; }, id); await ad.waitForTimeout(1300); await ad.selectOption('[data-cf] [name=estado]', est); await ad.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await ad.waitForTimeout(2000); };
  // estado de qa30_imagen tras prueba de cambio de rol
  L.rec('C', 'qa30_imagen restaurado a su rol original', (await ad.evaluate(() => DB.usuarios.find(x => x.usuario === 'qa30_imagen')?.rol)) === 'imagen' ? 'OK' : 'REVISAR');
  await setEstado('qa30_egresado', 'Inactivo');
  try { const s = await L.login(b, 'qa30_egresado', PASS); L.rec('C', 'Cuenta inactiva no puede ingresar', 'FALLA', 'ingresó'); await s.ctx.close(); } catch (e) { L.rec('C', 'Cuenta inactiva no puede ingresar', 'OK', e.message.slice(0, 140)); }
  await setEstado('qa30_egresado', 'Activo');
  try { const s = await L.login(b, 'qa30_egresado', PASS); L.rec('C', 'Cuenta reactivada vuelve a ingresar', 'OK'); await s.ctx.close(); } catch (e) { L.rec('C', 'Cuenta reactivada vuelve a ingresar', 'FALLA', e.message); }
  const msgs = []; for (let i = 0; i < 6; i++) { try { const s = await L.login(b, 'qa30_directivo', 'ClaveIncorrecta-' + i); await s.ctx.close(); msgs.push('ENTRÓ'); } catch (e) { msgs.push(e.message.replace('Login falló: ', '').slice(0, 90)); } }
  L.rec('C', 'Contraseña incorrecta rechazada (6 intentos)', msgs.includes('ENTRÓ') ? 'FALLA' : 'OK', [...new Set(msgs)].join(' / '));
  let blocked = ''; try { const s = await L.login(b, 'qa30_directivo', PASS); await s.ctx.close(); } catch (e) { blocked = e.message; }
  L.rec('C', 'Bloqueo temporal tras 6 intentos fallidos', blocked ? 'OK' : 'REVISAR', blocked || 'con la contraseña correcta ingresó de inmediato tras 6 fallos');
  const lock = await ad.evaluate(async () => { const d = await (await fetch(portalURL('/api/portal'))).json(); const u = d.data.usuarios.find(x => x.usuario === 'qa30_directivo'); return { bloqueadoHasta: u.bloqueadoHasta, intentos: u.intentos }; });
  L.rec('C', 'Admin ve el bloqueo de la cuenta', lock.bloqueadoHasta ? 'OK' : 'REVISAR', JSON.stringify(lock));
  L.save('fase-c-resto'); await b.close();
})().catch(e => { console.error(e); L.save('fase-c-resto'); process.exit(1); });
