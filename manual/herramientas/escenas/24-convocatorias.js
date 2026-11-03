const os = require('os');
const path = require('path');
const { BASE, espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Cuenta ficticia con rol Transparencia (la misma del capítulo 19; se crea si no existe).
const T_USER = 'carmen.rojas', T_PASS = 'Transparencia#2026';
const TITULO = 'Convocatoria CAS N.º 003-2026: Técnico en soporte informático';

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
async function etapa(p, i, nombre, fecha) {
  await p.locator('[data-rows=etapas] [data-radd]').click(); await espera(p, 500);
  await p.locator(`[data-rows=etapas] [data-ri="${i}"][data-rc=nombre]`).fill(nombre);
  await p.locator(`[data-rows=etapas] [data-ri="${i}"][data-rc=fecha]`).fill(fecha);
}
async function aprobar(p, texto) {
  await ir(p, '#/admin/aprobaciones', 1500);
  await p.locator('main tbody tr', { hasText: texto }).getByRole('button', { name: 'Aprobar y publicar' }).click(); await espera(p, 800);
  await aceptar(p);
}

// 24 · Convocatorias
escena('24-convocatorias', async ({ adm, pub, browser, ctx }) => {
  const p = adm;
  const pdfBases = await pdfFicticio(browser, 'bases-cas-003-2026.pdf', 'Bases de la Convocatoria CAS N.º 003-2026', 'Técnico en soporte informático. Documento de demostración.');
  const pdfCurr = await pdfFicticio(browser, 'resultados-evaluacion-curricular.pdf', 'Resultados de la evaluación curricular', 'CAS N.º 003-2026. Documento de demostración.');

  // A. La responsable de Transparencia registra la convocatoria
  await cuentaTransparencia(p);
  const t = await entrarComo(ctx, T_USER, T_PASS);
  t.on('dialog', d => d.accept());
  await ir(t, '#/admin/convocatorias/nuevo');
  await t.fill('#f_titulo', TITULO);
  await t.selectOption('#f_tipo', 'Contratación administrativa (CAS)');
  await t.fill('#f_fecha', '2026-11-02');
  await t.selectOption('#f_situacion', 'En curso');
  await t.fill('#f_descripcion', 'Se convoca a una (01) plaza de Técnico en soporte informático para la Unidad Administrativa, bajo el régimen CAS. Remuneración mensual: S/ 2 200.00.');
  await t.locator('[data-ff=bases]').setInputFiles(pdfBases); await espera(t, 2500);
  await etapa(t, 0, 'Publicación de la convocatoria', '2026-11-02');
  await etapa(t, 1, 'Presentación de expedientes (Mesa de Partes Virtual)', '2026-11-09');
  await etapa(t, 2, 'Resultados de la evaluación curricular', '2026-11-12');
  await etapa(t, 3, 'Entrevista personal', '2026-11-16');
  await etapa(t, 4, 'Resultados finales', '2026-11-18');
  await t.selectOption('#f_estado', 'Publicado');
  await alto(t, 1350); await arriba(t);
  await marcar(t, [[1, t.locator('[data-f=tipo]')], [2, t.locator('[data-f=situacion]')], [3, t.locator('[data-f=bases]')], [4, '[data-rows=etapas]'],
    [5, t.locator('[data-rows=etapas] [data-radd]')], [6, '#f_estado'], [7, t.locator('.field:has(#f_estado) .hint').first()]]);
  await foto(t, '24-02-formulario');
  await guardar(t);

  // B. El administrador aprueba y publica
  await alto(p, 850);
  await ir(p, '#/admin/aprobaciones', 1500);
  const fila = p.locator('main tbody tr', { hasText: TITULO });
  await marcar(p, [[1, fila.locator('td').first()], [2, fila.getByRole('button', { name: 'Vista previa' })], [3, fila.getByRole('button', { name: 'Aprobar y publicar' })]]);
  await foto(p, '24-03-aprobaciones');
  await fila.getByRole('button', { name: 'Aprobar y publicar' }).click(); await espera(p, 800);
  await marcar(p, [[1, p.locator('.modal-bg .modal').last()]]);
  await foto(p, '24-04-confirmar');
  await aceptar(p);

  // C. Resultado en el portal
  const q = pub;
  await alto(q, 1000);
  await ir(q, '#/transparencia/convocatorias', 2500);
  const tarjeta = q.locator('article', { hasText: TITULO }).first();
  await subirA(q, tarjeta, 110);
  await marcar(q, [[1, tarjeta.locator('.badge').first()], [2, tarjeta.locator('.badge').nth(1)], [3, tarjeta.getByRole('button', { name: 'Ver bases' })], [4, tarjeta.locator('table')]]);
  const b1 = await tarjeta.boundingBox();
  await foto(q, '24-05-web-convocatoria', { clip: { x: 0, y: 0, width: 1366, height: Math.min(1000, Math.round(b1.y + b1.height + 24)) } });

  // D. Transparencia publica el resultado de una etapa: vuelve a aprobación
  await ir(t, '#/admin/convocatorias');
  await buscar(t, 'CAS N.º 003-2026');
  await t.locator('main tbody tr', { hasText: TITULO }).getByRole('button', { name: 'Editar' }).click(); await espera(t, 1500);
  await t.locator('[data-rows=etapas] [data-rf="2|doc"]').setInputFiles(pdfCurr); await espera(t, 2500);
  await alto(t, 1350);
  await subirA(t, t.locator('[data-rows=etapas]'), 300);
  await marcar(t, [[1, t.locator('[data-rows=etapas] tbody tr').nth(2)], [2, '#f_estado']]);
  await foto(t, '24-06-resultado-etapa');
  await guardar(t);
  await alto(t, 850);
  await buscar(t, 'CAS N.º 003-2026');
  await marcar(t, [[1, t.locator('.toast').first()], [2, t.locator('main tbody tr', { hasText: TITULO }).locator('td').nth(4)]]);
  await foto(t, '24-07-reenvio');
  await t.context().close();
  await aprobar(p, TITULO);

  // E. Listado en la intranet y portal con el resultado publicado
  await ir(p, '#/admin/convocatorias');
  await p.selectOption('#lf-situacion', 'En curso'); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 900);
  const f2 = p.locator('main tbody tr', { hasText: TITULO });
  await marcar(p, [[1, p.getByRole('link', { name: /Nueva convocatoria/ })], [2, 'form[data-lf]'], [3, f2.locator('td').nth(2)], [4, f2.locator('td').nth(3)], [5, f2.locator('td').nth(4)], [6, f2.locator('.row-acts')]]);
  await foto(p, '24-01-listado');
  await ir(q, '#/transparencia/convocatorias', 2500);
  const t2 = q.locator('article', { hasText: TITULO }).first();
  await subirA(q, t2.locator('table'), 160);
  await marcar(q, [[1, t2.locator('tbody tr').nth(2).getByRole('button', { name: 'Ver resultado' })]]);
  const b2 = await t2.boundingBox();
  await foto(q, '24-08-web-resultado', { clip: { x: 0, y: 0, width: 1366, height: Math.min(1000, Math.round(b2.y + b2.height + 24)) } });
});
