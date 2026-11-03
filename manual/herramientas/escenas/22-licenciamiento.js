const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

async function pdf(browser, nombre, titulo, lineas) {
  const pg = await browser.newPage();
  await pg.setContent(`<html><body style="font-family:Arial;padding:40px"><h2>IESTP “Ica”</h2><h3>${titulo}</h3>${lineas.map(l => `<p>${l}</p>`).join('')}<p style="color:#888">Documento ficticio de demostración.</p></body></html>`);
  const buffer = await pg.pdf({ format: 'A4' });
  await pg.close();
  return { name: nombre, mimeType: 'application/pdf', buffer };
}
async function filaNueva(p, campo, valores) {
  await p.locator(`[data-radd="${campo}"]`).click(); await espera(p, 500);
  const fila = p.locator(`[data-rows="${campo}"] tbody tr`).last();
  for (const [col, v] of Object.entries(valores)) await fila.locator(`[data-rc="${col}"]`).fill(v);
}

// 22 · Licenciamiento
escena('22-licenciamiento', async ({ adm, pub, browser }) => {
  const p = adm;
  await alto(p, 1100);
  await ir(p, '#/admin/licenciamiento');
  const campo = n => p.locator(`[data-f="${n}"]`);
  const guardar = p.getByRole('button', { name: /Guardar cambios/ });
  await marcar(p, [
    [1, campo('estado')], [2, campo('etapa')], [3, campo('descripcion')], [4, campo('resolucion')],
    [5, campo('fechaResolucion')], [6, campo('vigenciaHasta')], [7, campo('hitos')], [8, campo('documentos')], [9, guardar],
  ]);
  await foto(p, '22-01-formulario');

  // Licenciado sin resolución: aviso
  await p.selectOption('[name=estado]', 'Licenciado');
  await p.fill('[name=resolucion]', '');
  await guardar.click(); await espera(p, 800);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, campo('estado')], [2, campo('resolucion')]]);
  await foto(p, '22-02-error-resolucion');

  // Registrar la etapa, los hitos y los documentos
  await alto(p, 1250);
  await p.selectOption('[name=estado]', 'En proceso');
  await p.fill('[name=etapa]', 'Verificación presencial de las condiciones básicas de calidad');
  await p.fill('[name=descripcion]', 'El instituto presentó su solicitud de licenciamiento ante el MINEDU y se encuentra en la etapa de verificación presencial. Esta página se actualiza en cada avance del proceso.');
  await filaNueva(p, 'hitos', { fecha: '2026-03-16', texto: 'Presentación de la solicitud de licenciamiento ante el MINEDU' });
  await filaNueva(p, 'hitos', { fecha: '2026-07-08', texto: 'Revisión documentaria favorable' });
  await filaNueva(p, 'hitos', { fecha: '2026-10-21', texto: 'Programación de la verificación presencial' });
  await p.locator('[data-radd=documentos]').click(); await espera(p, 500);
  const doc = p.locator('[data-rows=documentos] tbody tr').last();
  await doc.locator('[data-rc=nombre]').fill('Solicitud de licenciamiento institucional');
  await doc.locator('input[data-rf]').setInputFiles(await pdf(browser, 'Solicitud-Licenciamiento-2026.pdf', 'Solicitud de licenciamiento institucional', ['Expediente presentado el 16 de marzo de 2026.']));
  await espera(p, 2000);
  await subirA(p, campo('estado'), 100);
  await marcar(p, [[1, campo('estado')], [2, campo('etapa')], [3, campo('hitos').locator('tbody')], [4, p.locator('[data-radd=hitos]')], [5, doc], [6, guardar]]);
  await foto(p, '22-03-hitos-documentos');
  await guardar.click(); await espera(p, 900);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, p.locator('.toast').last()]]);
  await foto(p, '22-04-guardado', { clip: { x: 250, y: 0, width: 1116, height: 300 } });
  await espera(p, 1500);

  // Portal público
  const q = pub;
  await alto(q, 1000);
  await ir(q, '#/transparencia/licenciamiento', 2500);
  await subirA(q, q.locator('h1').first(), 150);
  await marcar(q, [
    [1, q.locator('main .card.cb').first()],
    [2, q.locator('h1').first().locator('xpath=following-sibling::p[1]')],
    [3, q.locator('.timeline')],
    [4, q.locator('a[data-ld]').first().locator('xpath=ancestor::ul[1]')],
    [5, q.getByText(/Información actualizada al/)],
    [6, q.locator('nav.side-box')],
  ]);
  await foto(q, '22-05-web-licenciamiento');
});
