const fs = require('fs');
const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, subirA, arriba, captcha } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// PDF mínimo de prueba (documento principal del trámite)
function pdfDemo(nombre) {
  const f = path.join(os.tmpdir(), nombre);
  fs.writeFileSync(f, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
  return f;
}

// 27 · Mesa de partes virtual
escena('27-mesa-partes', async ({ adm, ctx }) => {
  const p = adm;
  const DNI = '46219873';
  // Portal: contexto nuevo (sesión y verificación anti-spam propias)
  const q = await (await ctx()).newPage();
  await alto(q, 900);
  await ir(q, '#/servicios/mesa-de-partes', 2500);
  await subirA(q, q.locator('.pz-horario').first(), 130);
  await marcar(q, [[1, q.locator('.pz-horario').first()], [2, q.locator('.pz-mt [data-tab="n"]')], [3, q.locator('.pz-mt [data-tab="c"]')], [4, q.locator('.pz-mt [data-tab="i"]')]]);
  await foto(q, '27-01-web-mesa');

  const f = q.locator('form[data-mpv]');
  const fld = sel => q.locator(sel).locator('xpath=ancestor::div[contains(@class,"field")][1]');
  await q.selectOption('#mv-tp', 'Persona natural'); await q.selectOption('#mv-td', 'DNI');
  await q.fill('#mv-nd', DNI); await q.fill('#mv-no', 'Renzo Alonso'); await q.fill('#mv-ap', 'Cahua Quispe');
  await q.fill('#mv-e', 'renzo.cahua@correo-demo.pe'); await q.fill('#mv-t', '987 321 654'); await q.fill('#mv-dir', 'Calle Lima 245, Parcona, Ica');
  await subirA(q, q.locator('.pz-sec-h').first(), 90);
  await marcar(q, [[1, fld('#mv-tp')], [2, fld('#mv-td')], [3, fld('#mv-nd')], [4, fld('#mv-e')], [5, fld('#mv-t')]]);
  await foto(q, '27-02-web-remitente');

  await q.selectOption('#mv-tt', 'Solicitud');
  await q.selectOption('#mv-ar', { label: 'Secretaría Académica' }); await espera(q, 300);
  await q.fill('#mv-ref', 'Solicitud s/n');
  await q.fill('#mv-as', 'Solicito constancia de vacante para traslado externo al programa de Contabilidad, semestre 2027-I.');
  await q.fill('#mv-fo', '3');
  await q.setInputFiles('#mv-x', pdfDemo('Solicitud_traslado_externo.pdf')); await espera(q, 500);
  await subirA(q, q.locator('.pz-sec-h').nth(1), 90);
  await marcar(q, [[1, fld('#mv-tt')], [2, fld('#mv-ar')], [3, fld('#mv-as')], [4, fld('#mv-fo')], [5, fld('#mv-x')]]);
  await foto(q, '27-03-web-documento');

  await f.locator('input[name=declaro]').check({ force: true }); await f.locator('input[name=acepto]').check({ force: true });
  await q.locator('#mv-as').focus(); await espera(q, 1500);
  await f.locator('input[name=captcha]').fill(await captcha(f));
  await alto(q, 640);
  await subirA(q, q.locator('.pz-sec-h').nth(3), 90);
  await marcar(q, [[1, f.locator('input[name=declaro]').locator('xpath=..')], [2, f.locator('input[name=acepto]').locator('xpath=..')], [3, f.locator('.captcha')],
    [4, q.getByRole('button', { name: /Registrar y obtener cargo/ })]]);
  await foto(q, '27-04-web-envio');
  await q.getByRole('button', { name: /Registrar y obtener cargo/ }).click();
  await q.getByText('Documento registrado').first().waitFor({ timeout: 20000 }); await espera(q, 1200);
  const dlg = q.locator('.modal, [role=dialog]').last();
  const numero = ((await dlg.innerText()).match(/MPV-[A-Z0-9-]+-\d{4}-\d{6}/) || [])[0];
  if (!numero) throw new Error('No se obtuvo el número de expediente');
  await alto(q, 950);
  await marcar(q, [[1, dlg.locator('.pz-codes')], [2, dlg.locator('dl.kv')], [3, dlg.locator('[data-seg]')], [4, dlg.getByRole('button', { name: /cargo/i }).last()]]);
  await foto(q, '27-05-web-cargo');
  await q.keyboard.press('Escape').catch(() => {});

  // Bandeja interna
  await alto(p, 1080);
  await ir(p, '#/admin/expedientes', 1800);
  const fila = p.locator('main tbody tr', { hasText: numero }).first();
  await marcar(p, [[1, p.locator('main [role=tablist], main .tabs').first()], [2, p.locator('main .kpis').first()], [3, p.locator('main .pz-horario').first()],
    [4, p.locator('form[data-lf]')], [5, p.locator('[data-xcsv]')], [6, fila.locator('td').first()]]);
  await foto(p, '27-06-bandeja');

  // Detalle
  await fila.locator('[data-act=open]').click(); await espera(p, 1800);
  await alto(p, 1250); await arriba(p);
  const panel = t => p.locator('.panel', { has: p.locator('h2', { hasText: t }) }).first();
  await marcar(p, [[1, panel('Datos del expediente').locator('dl')], [2, panel('Datos del expediente').locator('.pz-files')], [3, panel('Historial y seguimiento')],
    [4, panel('Derivar a un área')], [5, panel('Actualizar estado')], [6, panel('Plazo')], [7, p.locator('[data-cargo]')]]);
  await foto(p, '27-07-detalle');

  // Derivar
  await alto(p, 900); await arriba(p);
  await p.selectOption('#xa', { label: 'Secretaría Académica' });
  await p.fill('#xan', 'Para su atención: verificar vacantes de traslado externo en Contabilidad 2027-I.');
  await marcar(p, [[1, '#xa'], [2, '#xan'], [3, '#xam'], [4, '[data-xa]']]);
  await foto(p, '27-08-derivar');
  await p.locator('[data-xa]').click(); await espera(p, 2000);

  // Observar
  await arriba(p);
  await p.selectOption('#xs', 'Observado');
  await p.fill('#xn', 'Adjunte el certificado de estudios de la institución de origen. Preséntelo por Mesa de Partes indicando este número de expediente.');
  await marcar(p, [[1, '#xs'], [2, '#xn'], [3, '[data-xs]']]);
  await foto(p, '27-09-estado');
  await p.locator('[data-xs]').click(); await espera(p, 2000);

  // Atender con respuesta
  await p.selectOption('#xs', 'Atendido');
  await p.fill('#xn', 'Se verificó la documentación completa. Existe 1 vacante de traslado externo en Contabilidad para 2027-I; la constancia puede recogerse en Secretaría Académica.');
  await p.locator('[data-xs]').click(); await espera(p, 2000);
  await alto(p, 1250);
  const his = panel('Historial y seguimiento');
  await subirA(p, his, 80);
  await marcar(p, [[1, his]]);
  await foto(p, '27-10-historial');

  // Consulta ciudadana
  await alto(q, 1150);
  await ir(q, '#/servicios/mesa-de-partes', 2500);
  await q.locator('.pz-mt [data-tab="c"]').click(); await espera(q, 600);
  await q.fill('#mq-n', numero); await q.fill('#mq-d', DNI);
  await q.locator('form[data-mpvq] button').click(); await q.locator('.pz-track').waitFor({ timeout: 15000 }); await espera(q, 800);
  await subirA(q, q.locator('form[data-mpvq]'), 80);
  await marcar(q, [[1, q.locator('#mq-n')], [2, q.locator('#mq-d')], [3, q.locator('.pz-track-h')], [4, q.locator('.pz-track dl.kv')], [5, q.locator('.pz-tl')]]);
  await foto(q, '27-11-web-consulta');
  await q.context().close();

  // Áreas receptoras y configuración
  await alto(p, 850);
  await ir(p, '#/admin/expedientes/areas', 1500);
  await marcar(p, [[1, p.locator('main table').first()], [2, p.getByRole('link', { name: /Editar áreas/ })]]);
  await foto(p, '27-12-areas');
  await alto(p, 1250);
  await ir(p, '#/admin/expedientes/config', 1500);
  const cf = sel => p.locator(sel).locator('xpath=ancestor::div[contains(@class,"field")][1]');
  await marcar(p, [[1, cf('#mc-d')], [2, cf('#mc-m')], [3, p.locator('form[data-mpvcfg] .field.full').first()], [4, cf('#mc-t')], [5, cf('#mc-p')], [6, cf('#mc-h')],
    [7, p.getByRole('button', { name: 'Guardar configuración' })]]);
  await foto(p, '27-13-config');
});
