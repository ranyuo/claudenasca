const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Imagen ficticia generada en el navegador (PNG).
async function imagen(browser, titulo, sub, c1, c2, w = 1600, h = 900) {
  const pg = await browser.newPage({ viewport: { width: w, height: h } });
  await pg.setContent(`<body style="margin:0"><div style="width:${w}px;height:${h}px;background:linear-gradient(135deg,${c1},${c2});display:flex;flex-direction:column;justify-content:center;padding:0 120px;box-sizing:border-box;font-family:Arial,sans-serif;color:#fff">
    <div style="font-size:${Math.round(h / 9)}px;font-weight:700;line-height:1.1">${titulo}</div><div style="font-size:${Math.round(h / 22)}px;margin-top:24px;opacity:.9">${sub}</div></div></body>`);
  const buf = await pg.screenshot({ type: 'png' }); await pg.close(); return buf;
}

const PAG = { titulo: 'Tutoría y Consejería', slug: 'tutoria-y-consejeria' };

// 02 · Páginas institucionales
escena('02-paginas', async ({ adm, pub, browser }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/paginas', 1500);
  await marcar(p, [
    [1, p.locator('[role=tablist]').first()],
    [2, p.locator('main tbody tr').first().locator('td').nth(1)],
    [3, p.locator('main tbody tr').first().locator('td').nth(2)],
    [4, p.locator('main tbody tr').first().locator('td').nth(4)],
    [5, p.locator('main tbody tr').first().locator('td').last()],
    [6, p.getByRole('link', { name: /Nueva página/ })],
  ]);
  await foto(p, '02-01-listado');

  // Nueva página
  await p.getByRole('link', { name: /Nueva página/ }).click(); await espera(p, 1300);
  await alto(p, 1400); await arriba(p);
  await p.fill('#f_titulo', PAG.titulo);
  const ed = p.locator('[contenteditable=true]').first();
  await ed.click();
  await p.keyboard.type('El Servicio de Tutoría y Consejería acompaña a los estudiantes durante su formación profesional técnica.');
  await p.keyboard.press('Enter');
  await p.keyboard.type('Brinda orientación académica, vocacional y personal, de lunes a viernes de 8:00 a. m. a 1:00 p. m., en el Pabellón B, segundo piso.');
  await p.locator('input[data-imgf="imagen"]').setInputFiles({ name: 'tutoria.png', mimeType: 'image/png', buffer: await imagen(browser, 'Tutoría y Consejería', 'Acompañamiento al estudiante · IESTP “Ica”', '#0b5d7a', '#2a9d8f', 1600, 480) });
  await espera(p, 2500);
  await p.fill('#f_mensaje', 'Solicita tu cita en la oficina de Bienestar y Empleabilidad o escribe a tutoria@ica.aplicacion.io.');
  await p.selectOption('#f_estado', 'Publicada');
  await p.fill('#f_slug', PAG.slug);
  await arriba(p);
  const campo = sel => p.locator(sel).locator('xpath=ancestor::div[contains(@class,"field")][1]');
  await marcar(p, [
    [1, campo('#f_titulo')],
    [2, p.locator('.rte, [contenteditable=true]').first().locator('xpath=ancestor::div[contains(@class,"field")][1]')],
    [3, p.locator('[data-img="imagen"]')],
    [4, campo('#f_mensaje')],
    [5, '#f_estado'],
    [6, '#f_slug'],
    [7, p.getByRole('button', { name: /Vista previa/ })],
    [8, p.getByRole('button', { name: /Guardar cambios/ })],
  ]);
  await foto(p, '02-02-formulario');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  await alto(p, 850); await arriba(p);
  const fila = p.locator('main tbody tr', { hasText: PAG.titulo });
  await marcar(p, [[1, fila.locator('td').nth(1)], [2, fila.locator('td').nth(4)]]);
  await foto(p, '02-03-creada');

  // Resultado en el portal
  await alto(pub, 1250);
  await ir(pub, '#/paginas/' + PAG.slug, 2200);
  await subirA(pub, pub.locator('article h1').first(), 130);
  await marcar(pub, [[1, pub.locator('article h1').first()], [2, pub.locator('article figure').first()], [3, pub.locator('article > p').first()], [4, pub.locator('article .notice').first()]]);
  await foto(pub, '02-04-web-pagina');
  await alto(pub, 850); await arriba(pub);
  await pub.locator('nav a, nav button, header a, header button', { hasText: 'Otras Páginas' }).first().hover(); await espera(pub, 700);
  await marcar(pub, [[1, pub.locator('nav a, nav button, header a, header button', { hasText: 'Otras Páginas' }).first()], [2, pub.locator('a[href="#/paginas/' + PAG.slug + '"]').first()]]);
  await foto(pub, '02-05-web-menu');

  // Segunda edición: genera una versión anterior
  await ir(p, '#/admin/paginas', 1500);
  await p.locator('main tbody tr', { hasText: PAG.titulo }).locator('[data-act=edit]').click(); await espera(p, 1500);
  await p.locator('[contenteditable=true]').first().click(); await p.keyboard.press('Control+End');
  await p.keyboard.press('Enter'); await p.keyboard.type('Desde el semestre 2026-II también se atiende los sábados de 9:00 a. m. a 12:00 m.');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await p.locator('main tbody tr', { hasText: PAG.titulo }).locator('[data-act=edit]').click(); await espera(p, 1500);
  await alto(p, 950); await arriba(p);
  const hist = p.locator('.panel', { has: p.locator('h2', { hasText: 'Historial' }) }).last();
  await marcar(p, [[1, hist], [2, p.locator('[data-restv]').first()]]);
  await foto(p, '02-06-versiones');
  await p.locator('[data-restv]').first().click(); await espera(p, 700);
  await marcar(p, [[1, p.locator('.modal').last()]]);
  await foto(p, '02-07-restaurar-version');
  await p.locator('.modal').last().getByRole('button', { name: 'Cargar versión' }).click(); await espera(p, 1200);
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // Reconocimientos
  await alto(p, 850);
  await ir(p, '#/admin/reconocimientos/nuevo', 1500);
  await p.fill('[name=anio]', '2025');
  await p.fill('[name=resolucion]', 'R.D. N.° 045-2025-IESTP-ICA');
  await p.fill('[name=titulo]', 'Primer puesto en la Feria Regional de Innovación Tecnológica de Ica');
  await p.fill('[name=descripcion]', 'Estudiantes del programa de Electrónica Industrial obtuvieron el primer puesto con un sistema de riego automatizado para pequeños agricultores.');
  await p.selectOption('#f_estado', 'Publicado');
  await alto(p, 1150); await arriba(p);
  await marcar(p, [[1, campo('[name=anio]')], [2, campo('[name=resolucion]')], [3, campo('[name=titulo]')], [4, campo('[name=descripcion]')], [5, p.locator('[data-img="foto"]')], [6, '#f_estado']]);
  await foto(p, '02-08-reconocimiento');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, p.locator('[role=tablist]').first()], [2, p.locator('main tbody tr', { hasText: 'Feria Regional de Innovación' })]]);
  await foto(p, '02-09-reconocimientos');
  await ir(pub, '#/nosotros/reconocimientos', 2200);
  const hito = pub.getByText('Feria Regional de Innovación', { exact: false }).first();
  await subirA(pub, hito, 300);
  await marcar(pub, [[1, hito.locator('xpath=ancestor::*[self::article or self::li or contains(@class,"it") or contains(@class,"card")][1]')]]);
  await foto(pub, '02-10-web-reconocimientos');
});
