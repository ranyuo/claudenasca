const { espera, ir, marcar, foto, alto, subirA, arriba, captcha } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 26 · Libro de reclamaciones
escena('26-reclamos', async ({ adm, pub }) => {
  const p = adm;
  // Configuración del responsable y plazos
  await alto(p, 1100);
  await ir(p, '#/admin/reclamos/config');
  const inp = t => p.getByLabel(t, { exact: false }).first();
  const campo = t => p.locator('label', { hasText: t }).first().locator('xpath=..');
  await inp('Responsable institucional').fill('Rosa Mendoza Soto');
  await inp('Cargo').fill('Jefa de la Unidad de Bienestar y Empleabilidad');
  await inp('Correo institucional').fill('reclamaciones@ica.aplicacion.io');
  await inp('Área que recibe').selectOption({ label: 'Mesa de Partes' }).catch(() => {});
  await marcar(p, [[1, campo('Responsable institucional')], [2, campo('Área que recibe')], [3, campo('reclamos (días')], [4, campo('Alertar')],
    [5, p.getByRole('button', { name: /^Guardar$/ })]]);
  await foto(p, '26-01-responsable-plazos');
  await p.getByRole('button', { name: /^Guardar$/ }).click(); await espera(p, 1500);

  // Formulario público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/servicios/libro-de-reclamaciones', 2500);
  await subirA(q, q.getByText('Registrar reclamo o queja', { exact: true }).first(), 420);
  await marcar(q, [[1, q.getByText('Registrar reclamo o queja', { exact: true }).first()], [2, q.getByText('Consultar estado', { exact: true }).first()], [3, q.getByText('Información', { exact: true }).first()]]);
  await foto(q, '26-02-web-libro');
  await q.selectOption('#l2-td', 'DNI'); await q.fill('#l2-nd', '45678912'); await q.fill('#l2-no', 'Ana'); await q.fill('#l2-ap', 'Quispe Ramos');
  await q.fill('#l2-e', 'ana.quispe@correo-demo.pe'); await q.fill('#l2-t', '987654321'); await q.selectOption('#l2-c', 'Estudiante');
  await q.selectOption('#l2-p', { index: 5 });
  await q.locator('label.rec').first().click(); await q.fill('#l2-f', '2026-10-28'); await q.selectOption('#l2-ar', 'SA');
  await q.fill('#l2-d', 'Solicité mi constancia de estudios el 20 de octubre y a la fecha no se me ha entregado ni informado el motivo de la demora.');
  await q.fill('#l2-pe', 'Solicito la entrega de la constancia de estudios y que se me informe el estado del trámite.');
  await alto(q, 1700);
  await q.locator('#l2-td').scrollIntoViewIfNeeded(); await q.evaluate(() => window.scrollBy(0, -140)); await espera(q, 500);
  await marcar(q, [[1, q.locator('h3', { hasText: 'Datos del usuario' })], [2, q.locator('h3', { hasText: 'Datos del reclamo' })], [3, q.locator('label.rec').first().locator('xpath=..')], [4, '#l2-d'], [5, '#l2-pe']]);
  await foto(q, '26-03-web-formulario');
  const form = q.locator('form', { has: q.locator('#l2-nd') });
  await form.locator('input[name=declaro]').check({ force: true }); await form.locator('input[name=acepto]').check({ force: true });
  await form.locator('input[name=captcha]').fill(await captcha(form));
  await alto(q, 900);
  await subirA(q, q.locator('#l2-x'), 140);
  await marcar(q, [[1, '#l2-x'], [2, form.locator('input[name=declaro]').locator('xpath=..')], [3, form.locator('.captcha')], [4, q.getByRole('button', { name: /Enviar reclamo/ })]]);
  await foto(q, '26-04-web-envio');
  await q.getByRole('button', { name: /Enviar reclamo/ }).click(); await espera(q, 3000);
  const codigo = (await q.locator('text=/RCL-\\d{4}-\\d{5}/').first().innerText()).match(/RCL-\d{4}-\d{5}/)[0];
  await marcar(q, [[1, q.locator('text=/RCL-\\d{4}-\\d{5}/').first()], [2, q.getByText(/Código de verificación:/).last()], [3, q.locator('[role=dialog], .modal, .ov').last().getByText(/días hábiles \(hasta/).first()], [4, q.getByRole('button', { name: /Descargar constancia/ })]]);
  await foto(q, '26-05-web-codigo');
  const verif = ((await q.locator('body').innerText()).match(/Código de verificación:\s*([0-9A-F]{8,})/) || [])[1] || '';
  await q.getByRole('button', { name: 'Aceptar' }).click().catch(() => {});

  // Bandeja interna
  await alto(p, 850);
  await ir(p, '#/admin/reclamos', 1500);
  await marcar(p, [[1, p.locator('[role=tablist]').first()], [2, p.locator('main .kpi, main .stat, main .card').first().locator('xpath=..')], [3, p.locator('main tbody tr', { hasText: codigo })], [4, p.getByText('Acciones rápidas').locator('xpath=../..')]]);
  await foto(p, '26-06-resumen');
  await ir(p, '#/admin/reclamos/bandeja', 1500);
  await marcar(p, [[1, p.locator('main select').first().locator('xpath=ancestor::form[1] | ancestor::div[contains(@class,"card")][1]').first()], [2, p.getByRole('button', { name: /Reporte CSV/ })], [3, p.locator('main tbody tr', { hasText: codigo })]]);
  await foto(p, '26-07-bandeja');

  // Detalle
  await p.locator('main tbody tr', { hasText: codigo }).locator('button, a').first().click(); await espera(p, 1500);
  await alto(p, 1500); await arriba(p);
  const sec = t => p.locator('h2', { hasText: t }).first().locator('xpath=ancestor::div[contains(@class,"panel")][1]');
  await marcar(p, [[1, sec('Registro original')], [2, sec('Respuesta institucional')], [3, sec('Plazo y derivación')], [4, sec('Gestión')], [5, p.getByRole('button', { name: /Hoja de reclamación/ })]]);
  await foto(p, '26-08-detalle');

  // Derivar
  const der = sec('Plazo y derivación');
  await p.selectOption('#lr-ar', { label: 'Secretaría Académica' });
  await p.fill('#lr-arn', 'Verificar el estado de la constancia de estudios y emitirla a la brevedad.');
  await der.scrollIntoViewIfNeeded();
  await marcar(p, [[1, '#lr-ar'], [2, '#lr-arn'], [3, p.getByRole('button', { name: /Derivar y notificar/ })]]);
  await foto(p, '26-09-derivar');
  await p.getByRole('button', { name: /Derivar y notificar/ }).click(); await espera(p, 1800);
  const ok = p.getByRole('button', { name: /^(Aceptar|Confirmar|Sí)/ }); if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1500); }

  // Cambiar estado a En atención
  const ges = sec('Gestión');
  await p.selectOption('#lr-st', 'En atención');
  await p.fill('#lr-sn', 'Secretaría Académica confirma que la constancia está en proceso de firma.');
  await ges.scrollIntoViewIfNeeded();
  await marcar(p, [[1, '#lr-st'], [2, '#lr-sn'], [3, p.getByRole('button', { name: /Actualizar estado/ })], [4, p.getByRole('button', { name: /Anular registro/ })]]);
  await foto(p, '26-10-estado');
  await p.getByRole('button', { name: /Actualizar estado/ }).click(); await espera(p, 1800);
  if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1200); }

  // Respuesta y atención
  const res = sec('Respuesta institucional');
  await p.fill('#lr-resp', 'Estimada Ana: su constancia de estudios ya fue emitida y puede recogerla en Secretaría Académica de lunes a viernes, de 08:00 a 14:00. Lamentamos la demora.');
  await res.scrollIntoViewIfNeeded();
  await marcar(p, [[1, '#lr-resp'], [2, p.getByRole('button', { name: /Guardar respuesta y marcar atendido/ })]]);
  await foto(p, '26-11-respuesta');
  await p.getByRole('button', { name: /Guardar respuesta y marcar atendido/ }).click(); await espera(p, 1800);
  if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1500); }
  const his = sec('Historial de estados');
  await his.scrollIntoViewIfNeeded(); await espera(p, 400);
  await marcar(p, [[1, his], [2, sec('Notificaciones')]]);
  await foto(p, '26-12-historial');

  // Consulta ciudadana
  await alto(q, 900);
  await ir(q, '#/servicios/libro-de-reclamaciones', 2500);
  await q.getByText('Consultar estado', { exact: true }).first().click(); await espera(q, 800);
  const cons = q.locator('form[data-lrq2]');
  await q.fill('#lq2-c', codigo); await q.fill('#lq2-d', '45678912');
  await cons.scrollIntoViewIfNeeded();
  await marcar(q, [[1, cons]]);
  await foto(q, '26-13-web-consulta');
  await cons.getByRole('button', { name: /Consultar/ }).click(); await espera(q, 2200);
  await subirA(q, q.locator('#lq2-c'), 140);
  await foto(q, '26-14-web-respuesta');

  await alto(p, 850);
  await ir(p, '#/admin/reclamos/notificaciones', 1500);
  await foto(p, '26-15-correo-pendiente');
});

