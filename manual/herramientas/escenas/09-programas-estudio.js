const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// PDF ficticio (brochure o itinerario de ejemplo), generado en la carpeta temporal.
async function pdfFicticio(browser, nombre, titulo, texto) {
  const file = path.join(os.tmpdir(), nombre + '.pdf');
  const pg = await browser.newPage();
  await pg.setContent(`<body style="font-family:Arial;padding:60px"><h1 style="color:#0b3d6e">${titulo}</h1><p>${texto}</p><p style="color:#888">Documento FICTICIO generado para el manual de uso.</p></body>`);
  await pg.pdf({ path: file, format: 'A4' }); await pg.close();
  return file;
}
const ok = async p => { const b = p.locator('.modal-bg [data-r="1"]'); if (await b.count()) { await b.last().click(); await espera(p, 600); } };
const ID = 'eli', SLUG = 'electronica-industrial';

// 09 · Programas de estudio
escena('09-programas', async ({ adm, pub, browser }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/programas');
  const fila = p.locator(`main tbody tr[data-id="${ID}"]`);
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo programa/ })],
    [2, p.locator('main thead th', { hasText: 'Docentes' })],
    [3, p.locator('main thead th', { hasText: 'Egresados' })],
    [4, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '09-01-listado');

  // Datos generales
  await alto(p, 1250);
  await ir(p, '#/admin/programas/' + ID, 1500);
  const campo = n => p.locator(`[data-f="${n}"]`);
  await marcar(p, [
    [1, campo('nombre')], [2, campo('codigo')], [3, campo('slug')], [4, campo('resumen')], [5, campo('imagen')],
    [6, campo('duracion')], [7, p.locator('[data-cf] > div').last().locator('.panel').first()],
  ]);
  await foto(p, '09-02-datos-generales');

  // Perfil de egreso y campo laboral
  await subirA(p, campo('perfil'), 110);
  await marcar(p, [[1, campo('perfil')], [2, campo('campoItems')]]);
  await foto(p, '09-03-perfil-campo');

  // Malla curricular: agrega dos unidades didácticas al primer módulo (si aún no tiene)
  if (!(await p.locator('[data-mu^="0|"][data-mu$="|nombre"]').count())) {
    await p.locator('[data-uadd="0"]').click(); await espera(p, 400);
    await p.locator('[data-uadd="0"]').click(); await espera(p, 400);
    const n = p.locator('[data-mu^="0|"][data-mu$="|nombre"]');
    await n.nth(0).fill('Electrónica analógica'); await n.nth(1).fill('Instrumentos de medición electrónica');
    await p.locator('[data-mu="0|1|semestre"]').fill('2');
    await p.locator('[data-mm="0|efsrt"]').fill('Prácticas en talleres de mantenimiento electrónico');
  }
  const malla = campo('modulos');
  await subirA(p, malla, 90);
  await marcar(p, [
    [1, p.locator('[data-mm="0|codigo"]')], [2, p.locator('[data-mm="0|nombre"]')], [3, p.locator('[data-mm="0|efsrt"]')],
    [4, malla.locator('.subtbl').first()], [5, p.locator('[data-uadd="0"]')], [6, p.locator('[data-madd]')],
  ]);
  await foto(p, '09-04-malla');

  // Documentos, coordinación y convenios
  await p.locator('[data-ff="brochure"]').setInputFiles(await pdfFicticio(browser, 'manual-09-brochure', 'Brochure – Electrónica Industrial', 'Perfil, competencias, campo laboral y beneficios del programa.'));
  await espera(p, 1500); await ok(p); await espera(p, 1500);
  await p.locator('[data-ff="malla"]').setInputFiles(await pdfFicticio(browser, 'manual-09-itinerario', 'Itinerario formativo – Electrónica Industrial', 'Módulos profesionales, unidades didácticas, créditos y horas.'));
  await espera(p, 800); await ok(p); await espera(p, 2000);
  await p.fill('#f_coordinadorMsg', 'Te invitamos a formarte en electrónica industrial con prácticas reales en nuestros talleres y en empresas de la región.');
  await p.fill('#f_convenios', 'Agroindustrial Valle de Ica S.A.C. (ficticia)\nTaller Electrónico Los Andes E.I.R.L. (ficticia)');
  await subirA(p, campo('malla'), 90);
  await marcar(p, [[1, campo('malla')], [2, campo('brochure')], [3, campo('coordinadorId')], [4, campo('coordinadorMsg')], [5, campo('convenios')]]);
  await foto(p, '09-05-documentos-coordinacion');

  // Validación: campos obligatorios para publicar
  const horario = await p.inputValue('#f_horario');
  await p.fill('#f_horario', '');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1000);
  await subirA(p, campo('duracion'), 140);
  await marcar(p, [[1, campo('horario')]]);
  await foto(p, '09-06-obligatorio-publicar');
  await p.fill('#f_horario', horario || 'Lunes a viernes, 18:00 a 22:30');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2200);

  // Historial de documentos reemplazados
  await alto(p, 1000);
  await ir(p, '#/admin/programas/' + ID, 1500);
  await arriba(p);
  await marcar(p, [[1, p.locator('.meta-list')]]);
  await foto(p, '09-07-documentos-reemplazados');

  // Portal: página del programa
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/programas/' + SLUG, 3000);
  await marcar(q, [[1, q.locator('.prog-hero h1')], [2, q.locator('.prog-facts')], [3, q.locator('aside .side-box').first()]]);
  await foto(q, '09-08-web-programa');
  const fold = q.locator('[data-program-section="malla-curricular"]');
  await fold.locator('summary').first().click(); await espera(q, 500);
  await fold.locator('details.mod summary').first().click(); await espera(q, 500);
  await subirA(q, fold, 90);
  await marcar(q, [[1, fold.locator('summary').first()], [2, fold.locator('details.mod').first()]]);
  await foto(q, '09-09-web-malla');
  const dl = q.locator('.dl-card').first().locator('xpath=..');
  await subirA(q, dl, 90);
  await marcar(q, [[1, dl], [2, q.locator('h2', { hasText: 'Coordinación del programa' }).locator('xpath=..')]]);
  await foto(q, '09-10-web-documentos-coordinacion');
});
