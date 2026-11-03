const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

async function pdfFicticio(browser, archivo, titulo, texto) {
  const g = await browser.newPage();
  await g.setContent(`<div style="font-family:Arial;padding:40px"><p style="color:#666">IESTP “Ica” · Documento de demostración (ficticio)</p><h1>${titulo}</h1><p>${texto}</p></div>`);
  const ruta = path.join(os.tmpdir(), archivo);
  await g.pdf({ path: ruta, format: 'A4' }); await g.close();
  return ruta;
}
const aceptar = async p => { const b = p.locator('.modal-bg .modal-f button').last(); if (await b.count()) { await b.click(); await espera(p, 1200); } };
async function buscar(p, texto) { await p.fill('#lf-q', texto); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 900); }

// 20 · TUPA
escena('20-tupa', async ({ adm, pub, browser }) => {
  const p = adm;
  p.on('dialog', d => d.accept());
  const pdfRes = await pdfFicticio(browser, 'rd-aprobacion-tupa.pdf', 'Resolución Directoral que aprueba el TUPA', 'Documento de demostración.');
  const pdfTupa = await pdfFicticio(browser, 'tupa-vigente.pdf', 'Texto Único de Procedimientos Administrativos', 'Documento de demostración.');

  // Listado
  await alto(p, 850);
  await ir(p, '#/admin/tupa');
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo concepto/ })], [2, p.locator('[data-csv]')], [3, p.locator('[role=tablist]').first()],
    [4, 'form[data-lf]'], [5, p.locator('main thead th', { hasText: '% UIT' })], [6, p.locator('main tbody tr').first().locator('.row-acts')]]);
  await foto(p, '20-01-listado');

  // Nuevo concepto
  await ir(p, '#/admin/tupa/nuevo');
  await alto(p, 1000); await arriba(p);
  await p.fill('#f_codigo', '41');
  await p.selectOption('#f_categoria', 'Trámites académicos');
  await p.fill('#f_monto', '25');
  await p.fill('#f_denominacion', 'CONSTANCIA DE PRÁCTICAS PRE PROFESIONALES');
  await p.fill('#f_requisitos', 'Solicitud (FUT) dirigida a la Dirección General.\nInforme de prácticas aprobado por el docente supervisor.\nComprobante de pago.');
  await p.selectOption('#f_estado', 'Publicado');
  await marcar(p, [[1, p.locator('[data-f=anio]')], [2, p.locator('[data-f=codigo]')], [3, p.locator('[data-f=categoria]')], [4, p.locator('[data-f=monto]')],
    [5, p.locator('[data-f=denominacion]')], [6, p.locator('[data-f=cuenta]')], [7, p.locator('[data-f=requisitos]')], [8, '#f_estado']]);
  await foto(p, '20-02-formulario');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await alto(p, 850);
  await buscar(p, 'prácticas');
  const fila = p.locator('main tbody tr', { hasText: 'CONSTANCIA DE PRÁCTICAS' });
  await marcar(p, [[1, fila.locator('td').nth(4)], [2, fila.locator('td').nth(5)], [3, fila.locator('td').nth(6)]]);
  await foto(p, '20-03-concepto-guardado');

  // UIT y documentos (se cargan los PDF y al final se retiran para dejar la instalación como estaba)
  await ir(p, '#/admin/tupacfg');
  await p.locator('[data-ff=resolucion]').setInputFiles(pdfRes); await espera(p, 2500);
  await p.locator('[data-ff=tupa]').setInputFiles(pdfTupa); await espera(p, 2500);
  await marcar(p, [[1, p.locator('[data-f=anio]')], [2, p.locator('[data-f=resolucion]')], [3, p.locator('[data-f=tupa]')],
    [4, p.locator('[data-rows=uitTabla]')], [5, p.locator('[data-radd]')], [6, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '20-04-uit-documentos');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/transparencia/tupa', 2500);
  await subirA(q, q.locator('main h1').first(), 110);
  await marcar(q, [[1, q.locator('main p.lead').first()], [2, q.locator('[data-td]').first().locator('xpath=..')], [3, 'form[data-tf]'], [4, q.locator('#tres thead')]]);
  await foto(q, '20-05-web-tupa');
  await q.fill('#tf-s', 'constancia'); await espera(q, 900);
  await subirA(q, q.locator('form[data-tf]'), 110);
  await marcar(q, [[1, '#tf-s'], [2, q.locator('#tres tbody tr', { hasText: 'PRÁCTICAS' })]]);
  await foto(q, '20-06-web-busqueda');

  // Se retiran los PDF de demostración
  await ir(p, '#/admin/tupacfg');
  for (const n of ['resolucion', 'tupa']) { const x = p.locator(`[data-fx=${n}]`); if (await x.count()) { await x.click(); await espera(p, 500); await aceptar(p); } }
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1500);
});
