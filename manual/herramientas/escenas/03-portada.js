const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Imagen ficticia generada en el navegador (PNG).
async function imagen(browser, titulo, sub, c1, c2, w = 1600, h = 600) {
  const pg = await browser.newPage({ viewport: { width: w, height: h } });
  await pg.setContent(`<body style="margin:0"><div style="width:${w}px;height:${h}px;background:radial-gradient(circle at 80% 30%,${c2},${c1} 70%);display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:0 110px;box-sizing:border-box;font-family:Arial,sans-serif;color:#fff;text-align:right">
    <div style="font-size:${Math.round(h / 7)}px;font-weight:700;line-height:1.1;opacity:.95">${titulo}</div><div style="font-size:${Math.round(h / 18)}px;margin-top:20px;opacity:.85">${sub}</div></div></body>`);
  const buf = await pg.screenshot({ type: 'png' }); await pg.close(); return buf;
}
const hoy = (d = 0) => new Date(Date.now() - 5 * 3600e3 + d * 864e5).toISOString().slice(0, 10);
const SLIDE = 'Inscripciones abiertas: Admisión 2027';

// 03 · Portada
escena('03-portada', async ({ adm, browser, ctx }) => {
  const p = adm;
  const campo = sel => p.locator(sel).first().locator('xpath=ancestor::div[contains(@class,"field")][1]');

  // Carrusel: listado
  await alto(p, 850);
  await ir(p, '#/admin/slides', 1500);
  const f1 = p.locator('main tbody tr').first();
  await marcar(p, [
    [1, p.locator('[role=tablist]').first()],
    [2, p.getByRole('link', { name: /Nueva diapositiva/ })],
    [3, f1.locator('td').nth(0)],
    [4, f1.locator('td').nth(2)],
    [5, f1.locator('td').nth(4)],
    [6, f1.locator('td').last()],
  ]);
  await foto(p, '03-01-carrusel');

  // Nueva diapositiva (primero con un orden repetido)
  await p.getByRole('link', { name: /Nueva diapositiva/ }).click(); await espera(p, 1300);
  await alto(p, 1150); await arriba(p);
  await p.fill('[name=titulo]', SLIDE);
  await p.fill('[name=texto]', 'Ocho programas de estudio con título a nombre de la Nación. Inscríbete en línea hasta el 15 de febrero.');
  await p.fill('[name=boton]', 'Postula aquí');
  await p.fill('[name=enlace]', '#/admision');
  await p.locator('input[data-imgf="imagen"]').setInputFiles({ name: 'admision-2027.png', mimeType: 'image/png', buffer: await imagen(browser, '', 'IESTP “Ica”', '#0a2a5e', '#1c7ed6') });
  await espera(p, 2500);
  await p.fill('[name=orden]', '1');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1200);
  await arriba(p);
  await marcar(p, [[1, campo('[name=titulo]')], [2, campo('[name=texto]')], [3, campo('[name=boton]')], [4, campo('[name=enlace]')], [5, p.locator('[data-img="imagen"]')], [6, campo('[name=orden]')], [7, '#f_estado']]);
  await foto(p, '03-02-diapositiva');

  // Corregir el orden y publicar
  const usados = (await p.evaluate(() => (DB.slides || []).filter(s => !s.deleted && !['Inactivo', 'Despublicado'].includes(s.estado)).map(s => +s.orden || 0)));
  const orden = Math.max(0, ...usados) + 1;
  await p.fill('[name=orden]', String(orden));
  await p.selectOption('#f_estado', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, p.locator('main tbody tr', { hasText: SLIDE })]]);
  await foto(p, '03-03-diapositiva-publicada');

  // Carrusel en el portal
  const q = await (await ctx()).newPage();
  await alto(q, 850);
  await ir(q, '#/', 2500);
  await q.locator('.modal [data-close], .modal .close, .modal button[aria-label*="errar"]').first().click({ timeout: 1500 }).catch(() => {});
  const dots = q.locator('.hero-dots button');
  await dots.last().click(); await espera(q, 900);
  await marcar(q, [[1, q.locator('.slide.on .cap h2')], [2, q.locator('.slide.on .cap a.btn')], [3, q.locator('.hero-dots')], [4, q.locator('.hero-arrow.r')], [5, q.locator('.home-announcement')]]);
  await foto(q, '03-04-web-carrusel');

  // Bloques, accesos y cifras
  await alto(p, 1000);
  await ir(p, '#/admin/portada', 1500);
  const bloq = p.locator('[data-custom="bloques"]');
  await marcar(p, [[1, bloq], [2, p.locator('[data-bon]').nth(1).locator('xpath=..')], [3, p.locator('[data-bup]').nth(1)], [4, p.locator('[data-bdn]').nth(1)]]);
  await foto(p, '03-05-bloques');

  const acc = p.locator('[data-rows="accesos"]');
  await subirA(p, acc, 130);
  // Fila incompleta para mostrar el aviso de visibilidad (no se guarda)
  await acc.locator('[data-radd]').click(); await espera(p, 800);
  await acc.locator('tbody tr, .row, [data-ri]').last().evaluate(() => {});
  const ultimos = acc.locator('input[data-rc="titulo"]');
  await ultimos.last().fill('Admisión 2027'); await espera(p, 500);
  await subirA(p, acc, 130);
  await marcar(p, [[1, acc], [2, acc.locator('input[data-rc="enlace"]').last()], [3, p.locator('[data-custom="estadoAccesos"]')], [4, p.locator('[data-rows="cifras"]')]]);
  await foto(p, '03-06-accesos-cifras');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1200);
  await marcar(p, [[1, p.locator('.errmsg, .toast').first()]]);
  await foto(p, '03-07-acceso-incompleto');
  await ir(p, '#/admin/portada', 1500); // descarta la fila incompleta

  await subirA(p, p.locator('[data-rows="beneficios"]'), 160);
  await marcar(p, [[1, p.locator('[data-rows="beneficios"]')], [2, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '03-08-beneficios');

  // Accesos y cifras en el portal
  await alto(q, 1300);
  await ir(q, '#/', 2500);
  await q.locator('section.stats').scrollIntoViewIfNeeded(); await subirA(q, q.locator('section.quick'), 90);
  await marcar(q, [[1, q.locator('section.quick')], [2, q.locator('section.stats')]]);
  await foto(q, '03-09-web-accesos-cifras');

  // Ventana emergente
  await alto(p, 1150);
  await ir(p, '#/admin/popup', 1500);
  const antes = await p.evaluate(() => JSON.parse(JSON.stringify(DB.config.popup)));
  await p.locator('[name=activo]').check();
  await p.fill('[name=titulo]', 'Admisión 2027: inscripciones abiertas');
  await p.fill('[name=texto]', 'Postula a cualquiera de nuestros ocho programas de estudio. Examen de admisión: domingo 1 de marzo de 2027.');
  await p.fill('[name=boton]', 'Ver requisitos');
  await p.fill('[name=enlace]', '#/admision');
  await p.fill('[name=inicio]', hoy(0));
  await p.fill('[name=fin]', hoy(20));
  await p.locator('input[data-imgf="imagen"]').setInputFiles({ name: 'comunicado.png', mimeType: 'image/png', buffer: await imagen(browser, 'Admisión 2027', 'Inscripciones abiertas', '#5a1a7a', '#d6336c', 1200, 750) });
  await espera(p, 1000);
  const reemp = p.locator('.modal').getByRole('button', { name: 'Reemplazar' });
  if (await reemp.count()) await reemp.first().click();
  await espera(p, 2500);
  await arriba(p);
  await marcar(p, [[1, p.locator('[name=activo]').locator('xpath=ancestor::label[1]')], [2, campo('[name=titulo]')], [3, campo('[name=texto]')], [4, campo('[name=boton]')], [5, campo('[name=enlace]')], [6, campo('[name=inicio]')], [7, campo('[name=fin]')], [8, p.locator('[data-img="imagen"]')], [9, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '03-10-ventana-emergente');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // Ventana emergente en el portal (nueva sesión del navegador)
  const r = await (await ctx()).newPage();
  await alto(r, 850);
  await ir(r, '#/', 2500);
  await marcar(r, [[1, r.locator('.modal').last()], [2, r.locator('.modal [data-go]').last()]]);
  await foto(r, '03-11-web-ventana');
  await r.context().close(); await q.context().close();

  // Se desactiva el comunicado para no afectar las demás capturas
  await ir(p, '#/admin/popup', 1500);
  await p.evaluate(a => { DB.config.popup = a; }, antes);
  await p.evaluate(() => saveDB()); await espera(p, 1500);
  await ir(p, '#/admin/popup', 1200);
  if (await p.locator('[name=activo]').isChecked()) { await p.locator('[name=activo]').uncheck(); await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1500); }
});
