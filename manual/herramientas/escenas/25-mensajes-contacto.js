const { espera, ir, marcar, foto, alto, subirA, arriba, captcha } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 25 · Mensajes de contacto
escena('25-mensajes', async ({ adm, ctx }) => {
  const p = adm;
  const REM = 'Carmen Rosa Huarcaya Pecho';
  // Formulario público «Contáctanos» (contexto nuevo: sesión y verificación anti-spam propias)
  const q = await (await ctx()).newPage();
  await alto(q, 960);
  await ir(q, '#/contacto', 2500);
  const f = q.locator('form[data-contact]');
  await q.fill('#cf-n', REM); await q.fill('#cf-d', '42751836');
  await q.fill('#cf-e', 'carmen.huarcaya@correo-demo.pe'); await q.fill('#cf-t', '956 432 187');
  await q.selectOption('#cf-a', 'Consulta sobre proceso de admisión');
  const prog = await q.locator('#cf-p option', { hasText: 'Producción Agropecuaria' }).first().getAttribute('value');
  await q.selectOption('#cf-p', prog);
  await q.fill('#cf-m', 'Buenos días. Quisiera conocer las fechas del examen de admisión 2027-I y saber si el programa de Producción Agropecuaria tiene vacantes por exoneración para primeros puestos.');
  await q.locator('#cf-m').focus(); await espera(q, 1500);
  await f.locator('input[name=captcha]').fill(await captcha(f));
  await f.locator('input[name=acepto]').check({ force: true });
  await subirA(q, q.locator('h1', { hasText: 'Contáctanos' }), 70);
  const fld = sel => q.locator(sel).locator('xpath=ancestor::div[contains(@class,"field")][1]');
  await marcar(q, [[1, q.locator('.info-cards').first()], [2, fld('#cf-n')], [3, fld('#cf-a')], [4, fld('#cf-p')], [5, fld('#cf-m')],
    [6, f.locator('.captcha')], [7, f.locator('input[name=acepto]').locator('xpath=..')], [8, q.getByRole('button', { name: /Enviar mensaje/ })]]);
  await foto(q, '25-01-web-contacto');
  await q.getByRole('button', { name: /Enviar mensaje/ }).click(); await espera(q, 2500);
  await marcar(q, [[1, q.getByText(/Tu mensaje fue registrado correctamente/)]]);
  await alto(q, 700);
  await foto(q, '25-02-web-enviado');
  await q.context().close();

  // Bandeja interna
  await alto(p, 850);
  await ir(p, '#/admin/mensajes', 1800);
  const fila = p.locator('main tbody tr', { hasText: REM }).first();
  await marcar(p, [[1, p.locator('a.tbtn[aria-label*="pendi"]').first()], [2, p.locator('form[data-lf]')], [3, p.locator('[data-trash]')],
    [4, fila], [5, fila.locator('[data-act=open]')]]);
  await foto(p, '25-03-bandeja');

  // Detalle: al abrirlo pasa a «Leído»
  await fila.locator('[data-act=open]').click(); await espera(p, 1800);
  await alto(p, 900); await arriba(p);
  const panel = t => p.locator('.panel', { has: p.locator('h2', { hasText: t }) }).first();
  await p.fill('#mr', 'Estimada Carmen: el examen de admisión 2027-I será el domingo 14 de marzo. La exoneración para primeros puestos tiene 2 vacantes por programa; el detalle está en la página de Admisión del portal. Atentamente, Unidad de Bienestar y Empleabilidad.');
  await marcar(p, [[1, panel('Mensaje').locator('dl')], [2, '#mr'], [3, '[data-reply]'], [4, '[data-mailto]'], [5, panel('Estado')], [6, panel('Historial')]]);
  await foto(p, '25-04-detalle');
  await p.locator('[data-reply]').click(); await espera(p, 2000);
  await arriba(p);
  await marcar(p, [[1, panel('Estado')], [2, panel('Historial')]]);
  await foto(p, '25-05-atendido');

  // Papelera: se envía y se restaura el mismo mensaje
  await ir(p, '#/admin/mensajes', 1500);
  p.once('dialog', d => d.accept());
  await p.locator('main tbody tr', { hasText: REM }).first().locator('[data-act=del]').click(); await espera(p, 800);
  const ok = p.getByRole('button', { name: /^Eliminar$/ }); if (await ok.count()) { await ok.last().click(); await espera(p, 1500); }
  await p.locator('[data-trash]').click(); await espera(p, 1200);
  const fp = p.locator('main tbody tr', { hasText: REM }).first();
  await marcar(p, [[1, p.locator('main .panel h2').last()], [2, fp.locator('[data-act=restore]')]]);
  await foto(p, '25-06-papelera');
  await fp.locator('[data-act=restore]').click(); await espera(p, 1500);
  const vb = p.locator('[data-trash]'); if (/Volver/.test(await vb.innerText())) { await vb.click(); await espera(p, 800); }
});
