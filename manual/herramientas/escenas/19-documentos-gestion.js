const os = require('os');
const path = require('path');
const { BASE, espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Cuenta ficticia con rol Transparencia para mostrar el flujo de aprobación.
const T_USER = 'carmen.rojas', T_PASS = 'Transparencia#2026';

async function pdfFicticio(browser, archivo, titulo, texto) {
  const g = await browser.newPage();
  await g.setContent(`<div style="font-family:Arial;padding:40px"><p style="color:#666">IESTP “Ica” · Documento de demostración (ficticio)</p><h1>${titulo}</h1><p>${texto}</p></div>`);
  const ruta = path.join(os.tmpdir(), archivo);
  await g.pdf({ path: ruta, format: 'A4' }); await g.close();
  return ruta;
}
async function cuentaTransparencia(adm) {
  await adm.goto(BASE + '/accounts.php'); await espera(adm, 600);
  const f = adm.locator('form', { has: adm.locator('select[name=role]') });
  await f.locator('input[name=name]').fill('Carmen Rojas Paredes'); await f.locator('input[name=username]').fill(T_USER);
  await f.locator('input[name=email]').fill('carmen.rojas@ica.aplicacion.io'); await f.locator('select[name=role]').selectOption('transparencia');
  await f.locator('input[name=password]').fill(T_PASS); await f.locator('input[name=password_confirmation]').fill(T_PASS);
  await f.getByRole('button', { name: 'Crear cuenta' }).click(); await espera(adm, 900); // si ya existe, el aviso de error se ignora
}
async function entrarComo(ctx, usuario, clave) {
  const p = await (await ctx()).newPage();
  p.on('pageerror', e => console.warn('  ! error JS:', e.message));
  await ir(p, '#/admin', 1500);
  await p.fill('#lg-u', usuario); await p.fill('#lg-p', clave); await p.press('#lg-p', 'Enter');
  await p.getByText('Salir').first().waitFor({ timeout: 15000 }); await espera(p, 1500);
  return p;
}
const aceptar = async p => { const b = p.locator('.modal-bg .modal-f button').last(); if (await b.count()) { await b.click(); await espera(p, 1500); } };
async function guardar(p) { await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2200); }
async function buscar(p, texto) { await p.fill('#lf-q', texto); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 900); }

// 19 · Documentos de gestión
escena('19-documentos', async ({ adm, pub, browser, ctx }) => {
  const p = adm;
  const pdfRi1 = await pdfFicticio(browser, 'reglamento-institucional-v1.pdf', 'Reglamento Institucional 2024 - 2026', 'Versión 1.0. Texto de demostración.');
  const pdfRi2 = await pdfFicticio(browser, 'reglamento-institucional-v2.pdf', 'Reglamento Institucional 2026 - 2028', 'Versión 2.0. Texto de demostración.');
  const pdfPat = await pdfFicticio(browser, 'plan-anual-de-trabajo-2026.pdf', 'Plan Anual de Trabajo 2026', 'Metas y actividades del año 2026. Texto de demostración.');

  // A. El administrador registra un documento y lo publica directamente
  await alto(p, 1000);
  await ir(p, '#/admin/documentos/nuevo');
  await p.fill('#f_nombre', 'Reglamento Institucional');
  await p.selectOption('#f_tipoId', { label: 'Reglamento' });
  await p.fill('#f_vigencia', '2024 - 2026'); await p.fill('#f_version', '1.0'); await p.fill('#f_orden', '1');
  await p.fill('#f_descripcion', 'Establece la organización, las funciones y las normas de convivencia de la comunidad educativa.');
  await p.locator('[data-ff=archivo]').setInputFiles(pdfRi1); await espera(p, 2500);
  await p.selectOption('#f_estado', 'Publicado');
  await arriba(p);
  await marcar(p, [[1, '#f_nombre'], [2, '#f_tipoId'], [3, p.locator('[data-f=vigencia]')], [4, p.locator('[data-f=version]')],
    [5, '#f_refModulo'], [6, p.locator('[data-file=archivo]')], [7, '#f_estado'], [8, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '19-02-formulario');
  await guardar(p);

  // B. La responsable de Transparencia registra el PAT y lo envía a aprobación
  await cuentaTransparencia(p);
  const t = await entrarComo(ctx, T_USER, T_PASS);
  t.on('dialog', d => d.accept());
  await alto(t, 1000);
  await ir(t, '#/admin/documentos/nuevo');
  await t.fill('#f_nombre', 'Plan Anual de Trabajo 2026');
  await t.selectOption('#f_tipoId', { label: 'Plan' });
  await t.fill('#f_vigencia', '2026'); await t.fill('#f_version', '1.0'); await t.fill('#f_orden', '2');
  await t.locator('[data-ff=archivo]').setInputFiles(pdfPat); await espera(t, 2500);
  await t.selectOption('#f_estado', 'Publicado');
  await arriba(t);
  await marcar(t, [[1, t.locator('[data-file=archivo]')], [2, '#f_estado'], [3, t.locator('[data-f=estado] .hint, .field:has(#f_estado) .hint').first()], [4, t.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(t, '19-03-enviar-aprobacion');
  await guardar(t);
  await alto(t, 850);
  await buscar(t, 'Plan Anual de Trabajo 2026');
  await marcar(t, [[1, t.locator('.toast').first()], [2, t.locator('main tbody tr', { hasText: 'Plan Anual de Trabajo 2026' }).locator('td').nth(4)]]);
  await foto(t, '19-04-en-revision');

  // C. Nueva versión del Reglamento Institucional
  await ir(t, '#/admin/documentos');
  await buscar(t, 'Reglamento Institucional');
  await t.locator('main tbody tr', { hasText: 'Reglamento Institucional' }).first().getByRole('button', { name: 'Nueva versión' }).click(); await espera(t, 1800);
  await alto(t, 1000); await arriba(t);
  await t.fill('#f_vigencia', '2026 - 2028');
  await t.fill('#f_descripcion', 'Actualización aprobada para el periodo 2026 - 2028. Incorpora el procedimiento de atención del Libro de Reclamaciones.');
  await t.locator('[data-ff=archivo]').setInputFiles(pdfRi2); await espera(t, 2500);
  await marcar(t, [[1, t.locator('[data-f=vigencia]')], [2, t.locator('[data-f=version]')], [3, t.locator('[data-file=archivo]')], [4, '#f_estado']]);
  await foto(t, '19-08-nueva-version');
  await t.selectOption('#f_estado', 'Publicado');
  await guardar(t);

  // D. El administrador revisa las aprobaciones pendientes
  await alto(p, 850);
  await ir(p, '#/admin/aprobaciones', 1500);
  const filaPat = p.locator('main tbody tr', { hasText: 'Plan Anual de Trabajo 2026' });
  await marcar(p, [[1, p.locator('.adm-side a[href="#/admin/aprobaciones"]')], [2, filaPat.locator('td').nth(1)],
    [3, filaPat.getByRole('button', { name: 'Vista previa' })], [4, filaPat.getByRole('button', { name: 'Aprobar y publicar' })], [5, filaPat.getByRole('button', { name: 'Devolver' })]]);
  await foto(p, '19-05-aprobaciones');
  // Devolver el PAT con una observación
  await filaPat.getByRole('button', { name: 'Devolver' }).click(); await espera(p, 800);
  await p.locator('.modal-bg textarea').fill('Falta la descripción del documento. Indica la resolución directoral que aprueba el PAT 2026.');
  await marcar(p, [[1, '.modal-bg textarea'], [2, p.locator('.modal-bg .modal-f button').last()]]);
  await foto(p, '19-06-devolver');
  await aceptar(p);
  // Aprobar la nueva versión del Reglamento
  const filaRi = p.locator('main tbody tr', { hasText: 'Reglamento Institucional' });
  await filaRi.getByRole('button', { name: 'Aprobar y publicar' }).click(); await espera(p, 800);
  await aceptar(p);

  // E. Transparencia corrige el PAT observado y lo reenvía
  await ir(t, '#/admin/documentos');
  await buscar(t, 'Plan Anual de Trabajo 2026');
  await t.locator('main tbody tr', { hasText: 'Plan Anual de Trabajo 2026' }).getByRole('button', { name: 'Editar' }).click(); await espera(t, 1500);
  await alto(t, 1000); await arriba(t);
  await t.fill('#f_descripcion', 'Aprobado con R.D. N.º 045-2026-IESTP-ICA/DG. Contiene las metas y actividades institucionales del año 2026.');
  await t.selectOption('#f_estado', 'Publicado');
  await marcar(t, [[1, t.locator('.notice.err').first()], [2, '#f_descripcion'], [3, '#f_estado']]);
  await foto(t, '19-07-observacion');
  await guardar(t);
  await t.context().close();
  await ir(p, '#/admin/aprobaciones', 1500);
  await p.locator('main tbody tr', { hasText: 'Plan Anual de Trabajo 2026' }).getByRole('button', { name: 'Aprobar y publicar' }).click(); await espera(p, 800);
  await aceptar(p);

  // F. Listado, historial de versiones y categorías
  await alto(p, 850);
  await ir(p, '#/admin/documentos');
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo documento/ })], [2, p.locator('[role=tablist]').first()], [3, 'form[data-lf]'],
    [4, p.locator('main tbody tr', { hasText: 'Reglamento Institucional' }).first().locator('td').nth(4)],
    [5, p.locator('main tbody tr').first().locator('.row-acts')]]);
  await foto(p, '19-01-listado');
  await buscar(p, 'Reglamento Institucional');
  await p.locator('main tbody tr', { hasText: '2.0' }).getByRole('button', { name: 'Historial de versiones' }).click(); await espera(p, 1000);
  await marcar(p, [[1, p.locator('.modal tbody tr').first()], [2, p.locator('.modal tbody tr').nth(1)]]);
  await foto(p, '19-09-historial-versiones');
  await p.keyboard.press('Escape'); await espera(p, 400);
  await ir(p, '#/admin/tiposdoc');
  await marcar(p, [[1, p.getByRole('link', { name: /Nueva categoría/ })], [2, p.locator('main tbody')]]);
  await foto(p, '19-10-categorias');

  // G. Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/transparencia/documentos-gestion', 2500);
  await subirA(q, q.locator('form[data-df]'), 110);
  await marcar(q, [[1, 'form[data-df]'], [2, q.locator('#dres tbody tr', { hasText: 'Reglamento Institucional' }).first()],
    [3, q.locator('#dres tbody tr', { hasText: 'Reglamento Institucional' }).first().locator('td').last()], [4, q.locator('nav.side-box').first()]]);
  await foto(q, '19-11-web-vigentes');
  await q.selectOption('#df-e', 'Histórico'); await q.fill('#df-s', 'Reglamento Institucional');
  await q.locator('form[data-df]').getByRole('button', { name: 'Buscar' }).click(); await espera(q, 900);
  await subirA(q, q.locator('form[data-df]'), 110);
  await marcar(q, [[1, '#df-e'], [2, q.locator('#dres tbody tr').first()]]);
  await foto(q, '19-12-web-historicos');
});
