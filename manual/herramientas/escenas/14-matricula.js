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

// 14 · Matrícula
escena('14-matricula', async ({ adm, pub, browser }) => {
  const p = adm;
  const PER = '2027-I';
  await alto(p, 850);
  await ir(p, '#/admin/matricula');
  const base = p.locator('main tbody tr').filter({ hasNotText: PER }).first();
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo periodo de matrícula/ })],
    [2, base.locator('td').nth(3)],
    [3, base.locator('td').nth(4)],
    [4, base.locator('td').nth(5)],
    [5, base.locator('[data-act=copy]')],
    [6, base.locator('[data-act=edit]')],
  ]);
  await foto(p, '14-01-listado');

  // Crear el nuevo periodo copiando la estructura del anterior
  await base.locator('[data-act=copy]').click(); await espera(p, 600);
  await p.fill('#pb-v', PER);
  await marcar(p, [[1, '#pb-v'], [2, p.locator('.modal [data-r="1"]').last()]]);
  await foto(p, '14-02-copiar');
  await p.locator('.modal [data-r="1"]').last().click(); await espera(p, 2200);

  // Datos generales
  await alto(p, 1150); await arriba(p);
  const campo = n => p.locator(`[data-f="${n}"]`);
  await p.fill('[name=titulo]', 'Matrícula Regular 2027-I');
  await p.fill('[name=inicioClases]', '2027-03-29');
  const ed = campo('descripcion').locator('[contenteditable=true]');
  await ed.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete');
  await p.keyboard.type('La matrícula regular del periodo 2027-I se realiza en Secretaría Académica, de lunes a viernes de 08:00 a 14:00. Revisa los requisitos según tu condición y el cronograma por programa de estudio.');
  await arriba(p);
  await marcar(p, [
    [1, campo('periodo')], [2, campo('titulo')], [3, campo('inicioClases')], [4, campo('descripcion')],
    [5, p.locator('label[for=f_estado]').locator('xpath=..')], [6, p.locator('[data-f=vigente]')],
  ]);
  await foto(p, '14-03-formulario');

  // Requisitos por sección, documento de tasas y cronograma
  const sec = t => campo('items').locator('.panel', { hasText: t });
  const item = async (s, t, texto) => {
    await campo('items').locator(`[data-iadd="${s}"]`).click(); await espera(p, 400);
    await sec(t).locator('textarea[data-it]').last().fill(texto);
  };
  await item('costos', 'Costos de matrícula', 'Pago por derecho de matrícula según el TUPA vigente, en el Banco de la Nación.');
  await item('costos', 'Costos de matrícula', 'Carné de estudiante (opcional).');
  await item('ingresantes', 'Matrícula de ingresantes', 'Constancia de ingreso emitida por la Comisión de Admisión.');
  await item('ingresantes', 'Matrícula de ingresantes', 'Copia simple del DNI y una fotografía tamaño carné.');
  await item('ratificacion', 'Ratificación de matrícula', 'No tener deudas pendientes con la institución.');
  await item('ratificacion', 'Ratificación de matrícula', 'Ficha de ratificación firmada por el estudiante.');
  await sec('Costos de matrícula').locator('[data-ipub]').last().click(); await espera(p, 400);
  await campo('docTasas').locator('[data-ff=docTasas]').setInputFiles(await pdf(browser, 'Tasas-Matricula-2027-I.pdf', 'Tasas y costos de matrícula 2027-I', ['Matrícula regular: S/ 150.00', 'Carné de estudiante: S/ 15.00']));
  await espera(p, 1800);
  await filaNueva(p, 'cronograma', { actividad: 'Matrícula de ingresantes', fecha: 'del 15/03/2027 al 19/03/2027' });
  await filaNueva(p, 'cronograma', { actividad: 'Ratificación de matrícula (semestres II, IV y VI)', fecha: 'del 15/03/2027 al 26/03/2027' });
  await filaNueva(p, 'cronograma', { actividad: 'Inicio de clases', fecha: '29/03/2027' });
  await alto(p, 1150);
  await subirA(p, campo('items'), 100);
  await marcar(p, [
    [1, sec('Costos de matrícula')],
    [2, sec('Matrícula de ingresantes').locator('[data-iadd]')],
    [3, sec('Costos de matrícula').locator('[data-ipub]').last()],
    [4, sec('Ratificación de matrícula').locator('[data-it]').first().locator('xpath=..').locator('[data-idel]')],
    [5, campo('docTasas')],
    [6, campo('cronograma')],
  ]);
  await foto(p, '14-04-requisitos');

  // Publicar sin un dato obligatorio: aviso
  await arriba(p);
  await p.fill('[name=inicioClases]', '');
  await p.selectOption('#f_estado', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 900);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, campo('inicioClases')], [2, '#f_estado']]);
  await foto(p, '14-05-error-publicar');

  // Publicar como vigente
  await p.fill('[name=inicioClases]', '2027-03-29');
  await p.selectOption('#f_estado', 'Publicado');
  await p.locator('[data-f=vigente] input').check();
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await ir(p, '#/admin/matricula');
  const nueva = p.locator('main tbody tr', { hasText: PER });
  await marcar(p, [[1, nueva.locator('td').nth(3)], [2, nueva.locator('td').nth(4)], [3, nueva.locator('td').nth(5)], [4, p.locator('main tbody tr').filter({ hasNotText: PER }).first().locator('td').nth(5)]]);
  await foto(p, '14-06-listado-vigente');

  // Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/matricula', 2500);
  await subirA(q, q.locator('h1').first(), 230);
  await marcar(q, [
    [1, q.locator('h1').first()],
    [2, q.locator('main time, time').first().locator('xpath=..')],
    [3, q.locator('.prose').first()],
    [4, q.locator('section.card', { hasText: 'Costos de matrícula' })],
    [5, q.locator('[data-tasas]')],
  ]);
  await foto(q, '14-07-web-matricula');
  await subirA(q, q.locator('section.card', { hasText: 'Costos de matrícula' }), 130);
  await marcar(q, [
    [1, q.locator('section.card', { hasText: 'Matrícula de ingresantes' })],
    [2, q.locator('section.card', { hasText: 'Ratificación de matrícula' })],
    [3, q.locator('h2', { hasText: /Cronograma del periodo/ })],
    [4, q.locator('h2', { hasText: /Cronograma del periodo/ }).locator('xpath=following-sibling::div[1]')],
  ]);
  await foto(q, '14-08-web-requisitos');
});
