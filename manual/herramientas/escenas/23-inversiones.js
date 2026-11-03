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
// Imagen ficticia (ilustración simple de un laboratorio) generada en el navegador.
async function imagenFicticia(browser, archivo) {
  const g = await browser.newPage({ viewport: { width: 960, height: 600 } });
  await g.setContent(`<body style="margin:0"><div style="width:960px;height:600px;background:linear-gradient(160deg,#dbeafe,#93c5fd);position:relative;font-family:Arial">
    ${[0, 1, 2, 3].map(i => `<div style="position:absolute;left:${70 + i * 215}px;top:250px;width:170px;height:110px;background:#1e293b;border:8px solid #475569;border-radius:6px"></div><div style="position:absolute;left:${60 + i * 215}px;top:380px;width:200px;height:24px;background:#92400e;border-radius:4px"></div>`).join('')}
    <div style="position:absolute;left:0;right:0;top:470px;height:130px;background:#cbd5e1"></div>
    </div></body>`);
  const ruta = path.join(os.tmpdir(), archivo);
  await g.screenshot({ path: ruta, type: 'jpeg', quality: 85 }); await g.close();
  return ruta;
}
async function guardar(p) { await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2200); }

// 23 · Inversiones y recursos económicos
escena('23-inversiones', async ({ adm, pub, browser }) => {
  const p = adm;
  p.on('dialog', d => d.accept());
  const foto1 = await imagenFicticia(browser, 'laboratorio-computo.jpg');
  const pdfActa = await pdfFicticio(browser, 'acta-conformidad-laboratorio.pdf', 'Acta de conformidad', 'Equipamiento del laboratorio de cómputo. Documento de demostración.');
  const pdfDon = await pdfFicticio(browser, 'acta-donacion-simuladores.pdf', 'Acta de recepción de donación', 'Simuladores para Enfermería Técnica. Documento de demostración.');

  // Listado antes de registrar
  await alto(p, 850);
  await ir(p, '#/admin/inversiones');
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo registro/ })], [2, p.locator('[data-csv]')], [3, 'form[data-lf]'], [4, p.locator('main .panel').last()]]);
  await foto(p, '23-01-listado');

  // Primer registro: inversión con imagen y documento
  await ir(p, '#/admin/inversiones/nuevo');
  await alto(p, 1450); await arriba(p);
  await p.fill('#f_titulo', 'Equipamiento del laboratorio de cómputo');
  await p.selectOption('#f_tipo', 'Inversión');
  await p.fill('#f_fuente', 'Recursos Directamente Recaudados (RDR)');
  await p.fill('#f_monto', '85400.50');
  await p.fill('#f_fecha', '2026-09-15');
  await p.fill('#f_estadoAvance', 'En ejecución (60 %)');
  await p.fill('#f_descripcion', 'Adquisición de 30 computadoras, un servidor y mobiliario para el laboratorio del programa de Arquitectura de Plataformas y Servicios de TI.');
  await p.locator('[data-imgf=imagen]').setInputFiles(foto1); await espera(p, 2500);
  await p.locator('[data-ff=documento]').setInputFiles(pdfActa); await espera(p, 2500);
  await p.selectOption('#f_estado', 'Publicado');
  await arriba(p);
  await marcar(p, [[1, p.locator('[data-f=titulo]')], [2, p.locator('[data-f=tipo]')], [3, p.locator('[data-f=fuente]')], [4, p.locator('[data-f=monto]')],
    [5, p.locator('[data-f=fecha]')], [6, p.locator('[data-f=estadoAvance]')], [7, p.locator('[data-f=descripcion]')], [8, p.locator('[data-f=imagen]')],
    [9, p.locator('[data-f=documento]')], [10, '#f_estado']]);
  await foto(p, '23-02-formulario');
  await guardar(p);

  // Segundo registro: donación, primero sin descripción para ver la validación
  await ir(p, '#/admin/inversiones/nuevo');
  await alto(p, 1100); await arriba(p);
  await p.fill('#f_titulo', 'Donación de simuladores para Enfermería Técnica');
  await p.selectOption('#f_tipo', 'Donación');
  await p.fill('#f_fuente', 'Asociación de Egresados del IESTP “Ica”');
  await p.fill('#f_monto', '12500');
  await p.fill('#f_fecha', '2026-06-10');
  await p.locator('[data-ff=documento]').setInputFiles(pdfDon); await espera(p, 2500);
  await p.selectOption('#f_estado', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1200);
  await arriba(p);
  await marcar(p, [[1, p.locator('[data-f=estadoAvance]')], [2, p.locator('[data-f=descripcion]')], [3, '#f_estado']]);
  await foto(p, '23-03-validacion');
  await p.fill('#f_estadoAvance', 'Recibido e inventariado');
  await p.fill('#f_descripcion', 'Dos simuladores de paciente adulto y un brazo de práctica para inyectables, entregados en donación para el laboratorio de Enfermería Técnica.');
  await guardar(p);

  // Listado con los registros
  await alto(p, 850);
  await ir(p, '#/admin/inversiones');
  const fila = p.locator('main tbody tr', { hasText: 'Equipamiento del laboratorio' });
  await marcar(p, [[1, fila.locator('td').nth(3)], [2, fila.locator('td').nth(4)], [3, fila.locator('td').nth(5)], [4, fila.locator('.row-acts')]]);
  await foto(p, '23-04-registros');

  // Portal público
  const q = pub;
  await alto(q, 1000);
  await ir(q, '#/transparencia/inversiones', 2500);
  await subirA(q, q.locator('main .chips').first(), 110);
  const tarjeta = q.locator('article.ncard', { hasText: 'Equipamiento del laboratorio' }).first();
  await marcar(q, [[1, q.locator('main .chips').first()], [2, q.locator('main p[role=status]').first()], [3, tarjeta],
    [4, tarjeta.getByRole('button', { name: /Ver documento sustentatorio/ })]]);
  await foto(q, '23-05-web-inversiones');
  await q.locator('main .chips button', { hasText: 'Donación' }).click(); await espera(q, 1800);
  await subirA(q, q.locator('main .chips').first(), 110);
  await marcar(q, [[1, q.locator('main .chips button', { hasText: 'Donación' })], [2, q.locator('main p[role=status]').first()]]);
  await foto(q, '23-06-web-filtro');
});
