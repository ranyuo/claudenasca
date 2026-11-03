const { BASE, espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 34 · Usuarios y roles
// Crea cuentas ficticias del personal (una por rol institucional), prueba el primer ingreso, el bloqueo,
// el restablecimiento de contraseña y la desactivación. No toca la cuenta admin.ica ni guarda cambios en los roles.
const CUENTAS = [
  { usuario: 'rmendoza.imagen', nombre: 'Rosa Mendoza Paredes', rol: 'imagen', correo: 'rmendoza.imagen@ica.aplicacion.io', clave: 'Ica-Imagen-2026!' },
  { usuario: 'jtorres.secretaria', nombre: 'Julio Torres Vega', rol: 'secretaria', correo: 'jtorres.secretaria@ica.aplicacion.io', clave: 'Ica-Secretaria-26!' },
  { usuario: 'lquispe.coordinador', nombre: 'Lucía Quispe Ramos', rol: 'coordinador', correo: 'lquispe.coordinador@ica.aplicacion.io', clave: 'Ica-Coordina-26!', programa: 'Contabilidad' },
  { usuario: 'avargas.transparencia', nombre: 'Ana Vargas León', rol: 'transparencia', correo: 'avargas.transparencia@ica.aplicacion.io', clave: 'Ica-Transpa-2026!' },
  { usuario: 'mflores.atencion', nombre: 'Miguel Flores Díaz', rol: 'atencion', correo: 'mflores.atencion@ica.aplicacion.io', clave: 'Ica-Atencion-26!', area: 'Secretaría Académica' },
  { usuario: 'dhuaman.directivo', nombre: 'Diego Huamán Cruz', rol: 'directivo', correo: 'dhuaman.directivo@ica.aplicacion.io', clave: 'Ica-Directivo-26!' },
];
const NUEVA = 'Ica-Imagen-Nueva-2026!';

async function llenar(p, c) {
  await p.fill('#f_usuario', c.usuario);
  await p.fill('#f_nombre', c.nombre);
  await p.selectOption('#f_rol', c.rol);
  if (c.programa) await p.selectOption('#f_programaId', { label: c.programa });
  await p.fill('#f_pass1', c.clave); await p.fill('#f_pass2', c.clave);
  await p.fill('#f_correo', c.correo);
  if (c.area) await p.selectOption('#f_area', { label: c.area });
}
async function guardar(p) {
  await p.getByRole('button', { name: /Guardar cambios/ }).first().click(); await espera(p, 2000);
}
const fila = (p, u) => p.locator('main tbody tr', { hasText: u });
async function ingresar(q, usuario, clave) {
  await ir(q, '#/admin', 1500);
  await q.fill('#lg-u', usuario); await q.fill('#lg-p', clave); await q.press('#lg-p', 'Enter'); await espera(q, 2500);
}

escena('34-usuarios', async ({ adm, ctx }) => {
  const p = adm;
  // 1. Listado
  await alto(p, 850);
  await ir(p, '#/admin/usuarios');
  await marcar(p, [[1, p.getByRole('link', { name: /Editar roles y permisos/ })], [2, p.getByText('Nuevo usuario').first()], [3, p.locator('main form.filters, main .filters').first()],
    [4, p.locator('main thead th', { hasText: /Seguridad/i })], [5, p.locator('main thead th', { hasText: /^Estado$/i })], [6, p.locator('main tbody tr').first().locator('td').last()]]);
  await foto(p, '34-01-listado');

  // 2. Matriz de permisos (al pie del listado)
  await alto(p, 1250);
  await subirA(p, p.locator('#perm-h').locator('xpath=ancestor::div[contains(@class,"panel")][1]'), 80);
  await marcar(p, [[1, p.getByRole('link', { name: /Editar permisos por rol/ })], [2, p.locator('#perm-h')]]);
  await foto(p, '34-02-matriz');

  // 3. Formulario: cuenta de Imagen institucional
  await alto(p, 950);
  await ir(p, '#/admin/usuarios/nuevo');
  await llenar(p, CUENTAS[0]);
  const fld = id => p.locator('#' + id).locator('xpath=ancestor::div[contains(@class,"field")][1]');
  await marcar(p, [[1, fld('f_usuario')], [2, fld('f_rol')], [3, fld('f_programaId')], [4, fld('f_vin')], [5, fld('f_pass1')], [6, fld('f_correo')], [7, fld('f_area')], [8, fld('f_estado')]]);
  await foto(p, '34-03-formulario');

  // 4. Error de vínculo: una cuenta de estudiante sin alumno vinculado
  await p.selectOption('#f_rol', 'estudiante');
  await guardar(p);
  await subirA(p, p.locator('#f_vin'), 250);
  await marcar(p, [[1, fld('f_rol')], [2, fld('f_vin')]]);
  await foto(p, '34-04-error-vinculo');

  // 5. Crear las cuentas del personal (una por rol institucional)
  for (const c of CUENTAS) {
    await ir(p, '#/admin/usuarios');
    if (await fila(p, c.usuario).count()) continue;
    await ir(p, '#/admin/usuarios/nuevo');
    await llenar(p, c);
    await guardar(p);
  }
  await ir(p, '#/admin/usuarios');
  await p.locator('main select').filter({ has: p.locator('option', { hasText: /^50$/ }) }).first().selectOption('50').catch(() => {});
  await espera(p, 800);
  await alto(p, 950);
  await marcar(p, [[1, fila(p, 'rmendoza.imagen')], [2, fila(p, 'lquispe.coordinador').locator('td').nth(2)]]);
  await foto(p, '34-05-cuentas-creadas');

  // 6. Primer ingreso: la cuenta debe cambiar la contraseña asignada
  const c2 = await ctx(); const q = await c2.newPage();
  await alto(q, 850);
  await ingresar(q, CUENTAS[0].usuario, CUENTAS[0].clave);
  await q.waitForURL(/accounts\.php/, { timeout: 10000 });
  await espera(q, 800);
  const secc = t => q.locator('section', { has: q.locator('h2', { hasText: t }) });
  await q.fill('input[name=current_password]', CUENTAS[0].clave);
  await q.fill('section:has(h2:has-text("Cambiar mi contraseña")) input[name=password]', NUEVA);
  await q.fill('section:has(h2:has-text("Cambiar mi contraseña")) input[name=password_confirmation]', NUEVA);
  await marcar(q, [[1, q.locator('.notice').first()], [2, secc('Cambiar mi contraseña')], [3, q.getByRole('button', { name: 'Cambiar contraseña' })]]);
  await foto(q, '34-06-primer-ingreso');
  await q.getByRole('button', { name: 'Cambiar contraseña' }).click(); await espera(q, 1500);
  await marcar(q, [[1, q.locator('.notice').first()], [2, q.getByRole('link', { name: /Ir a la intranet/ })]]);
  await foto(q, '34-07-clave-cambiada', { clip: { x: 0, y: 0, width: 1366, height: 330 } });

  // 7. Lo que ve la cuenta de Imagen institucional
  await ir(q, '#/admin/dashboard', 2000);
  await marcar(q, [[1, q.locator('aside, nav.adm-side, .adm-side').first()], [2, q.getByText('Imagen institucional').first()]]);
  await foto(q, '34-08-menu-rol');
  await ir(q, '#/admin/usuarios', 1500);
  await marcar(q, [[1, q.locator('main h1, .adm-main h1').first().locator('xpath=ancestor::div[1]')]]);
  await foto(q, '34-09-acceso-denegado', { clip: { x: 0, y: 0, width: 1366, height: 360 } });
  await c2.close();

  // 8. Roles y permisos (roles.php): se muestra sin guardar
  await alto(p, 950);
  await p.goto(BASE + '/roles.php?role=imagen'); await espera(p, 1000);
  await marcar(p, [[1, p.locator('nav').first()], [2, p.locator('input[name=label]').locator('xpath=..')], [3, p.locator('fieldset')], [4, p.getByRole('button', { name: 'Guardar permisos' })],
    [5, p.getByRole('button', { name: 'Restaurar permisos originales' })]]);
  await foto(p, '34-10-roles-permisos');

  // 9. Bloqueo por intentos fallidos
  const c3 = await ctx(); const r = await c3.newPage();
  await alto(r, 850);
  const objetivo = CUENTAS[4];
  for (let i = 0; i < 5; i++) {
    if (i === 0) await ir(r, '#/admin', 1500);
    await r.fill('#lg-u', objetivo.usuario); await r.fill('#lg-p', 'ClaveEquivocada' + i); await r.press('#lg-p', 'Enter'); await espera(r, 1200);
  }
  await r.fill('#lg-u', objetivo.usuario); await r.fill('#lg-p', objetivo.clave); await r.press('#lg-p', 'Enter'); await espera(r, 1500);
  await marcar(r, [[1, '#lg-e'], [2, r.locator('.pz-lg-warn')]]);
  await foto(r, '34-11-cuenta-bloqueada');
  await c3.close();

  await alto(p, 850);
  await ir(p, '#/admin/usuarios');
  await p.locator('main select').filter({ has: p.locator('option', { hasText: /^50$/ }) }).first().selectOption('50').catch(() => {});
  await espera(p, 800);
  const fb = fila(p, objetivo.usuario);
  await marcar(p, [[1, fb.locator('.badge', { hasText: 'Bloqueado' })], [2, fb.locator('[data-act=unlock]')]]);
  await foto(p, '34-12-desbloquear');
  await fb.locator('[data-act=unlock]').click(); await espera(p, 1800);

  // 10. Restablecer la contraseña de una cuenta
  await ir(p, '#/admin/usuarios');
  await p.locator('main select').filter({ has: p.locator('option', { hasText: /^50$/ }) }).first().selectOption('50').catch(() => {});
  await espera(p, 600);
  await fila(p, 'avargas.transparencia').locator('[data-act=edit]').click(); await espera(p, 1300);
  await alto(p, 950); await arriba(p);
  await p.fill('#f_pass1', 'Ica-Temporal-2026!'); await p.fill('#f_pass2', 'Ica-Temporal-2026!');
  await marcar(p, [[1, fld('f_usuario')], [2, fld('f_pass1')], [3, fld('f_pass2')], [4, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '34-13-restablecer-clave');
  await guardar(p);

  // 11. Desactivar una cuenta
  await ir(p, '#/admin/usuarios');
  await p.locator('main select').filter({ has: p.locator('option', { hasText: /^50$/ }) }).first().selectOption('50').catch(() => {});
  await espera(p, 600);
  await fila(p, 'dhuaman.directivo').locator('[data-act=edit]').click(); await espera(p, 1300);
  await arriba(p);
  await p.selectOption('#f_estado', 'Inactivo');
  await marcar(p, [[1, fld('f_estado')], [2, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '34-14-desactivar', { clip: { x: 0, y: 0, width: 1366, height: 520 } });
  await guardar(p);
  await alto(p, 850);
  await ir(p, '#/admin/usuarios');
  await p.selectOption('main select[name=estado], #flt-estado', 'Inactivo').catch(async () => {
    await p.locator('main select').filter({ has: p.locator('option', { hasText: 'Inactivo' }) }).first().selectOption('Inactivo');
  });
  await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 1000);
  await marcar(p, [[1, fila(p, 'dhuaman.directivo')]]);
  await foto(p, '34-15-inactivos', { clip: { x: 0, y: 0, width: 1366, height: 560 } });
});
