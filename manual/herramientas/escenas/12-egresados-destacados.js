const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Retrato ilustrado ficticio (no es una persona real), generado en la carpeta temporal.
async function retrato(browser, nombre, fondo, ropa, cabello) {
  const file = path.join(os.tmpdir(), nombre + '.jpg');
  const pg = await browser.newPage({ viewport: { width: 480, height: 480 } });
  await pg.setContent(`<body style="margin:0"><svg width="480" height="480" xmlns="http://www.w3.org/2000/svg">
    <rect width="480" height="480" fill="${fondo}"/><circle cx="240" cy="200" r="100" fill="#c49470"/>
    <path d="M135 190 Q140 80 240 85 Q340 80 345 190 Q325 125 240 122 Q155 125 135 190Z" fill="${cabello}"/>
    <path d="M60 480 Q70 320 240 305 Q410 320 420 480Z" fill="${ropa}"/></svg></body>`);
  await pg.screenshot({ path: file, type: 'jpeg', quality: 85 }); await pg.close();
  return file;
}
const PROG = 'cont', SLUG = 'contabilidad';
const EGRESADOS = [
  { n: 'Rocío Yanet Huamaní Ccahua', a: 2024, t: 'Gracias a las prácticas en estudios contables de Ica conseguí mi primer empleo como asistente contable antes de terminar el sexto semestre.', c: ['#f6e7d8', '#7a2e4a', '#2a1d14'] },
  { n: 'Jhon Edison Quispe Lévano', a: 2023, t: 'La formación en tributación y el uso de software contable me permitieron abrir mi propio estudio de asesoría para pequeñas empresas.', c: ['#dfeaf5', '#25466e', '#151515'] },
  { n: 'Karina Milagros Tipacti Uchuya', a: 2022, t: 'Hoy trabajo en el área de costos de una agroexportadora del valle. Los docentes siempre nos motivaron a seguir aprendiendo.', c: ['#e6f2e2', '#3d6b3a', '#3a2516'] },
];

// 12 · Egresados destacados
escena('12-egresados', async ({ adm, pub, browser }) => {
  const p = adm;
  await alto(p, 1100);
  for (const [i, e] of EGRESADOS.entries()) {
    await ir(p, '#/admin/egresados');
    await p.fill('#lf-q', e.n.split(' ')[0] + ' ' + e.n.split(' ')[1]); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 700);
    if (await p.locator('main tbody tr', { hasText: e.n }).count()) continue;
    await ir(p, '#/admin/egresados/nuevo');
    await p.selectOption('#f_programaId', PROG);
    await p.fill('#f_anio', String(e.a));
    await p.fill('#f_nombres', e.n);
    await p.selectOption('#f_estado', 'Publicado');
    if (i === 0) {
      // Publicar sin testimonio: el sistema lo impide
      await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1000);
      await arriba(p);
      await marcar(p, [[1, p.locator('[data-f="testimonio"]')], [2, '#f_estado']]);
      await foto(p, '12-03-error-testimonio');
    }
    await p.fill('#f_testimonio', e.t);
    await p.locator('[data-imgf="foto"]').setInputFiles(await retrato(browser, 'manual-12-egresado-' + i, ...e.c));
    await espera(p, 2500);
    if (i === 0) {
      await arriba(p);
      await marcar(p, [[1, '#f_programaId'], [2, '#f_anio'], [3, '#f_nombres'], [4, p.locator('[data-f="testimonio"]')], [5, p.locator('[data-f="foto"]')], [6, '#f_estado']]);
      await foto(p, '12-02-formulario');
    }
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  }

  // Listado
  await alto(p, 850);
  await ir(p, '#/admin/egresados');
  await p.selectOption('#lf-programaId', PROG); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 800);
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo egresado/ })],
    [2, p.locator('form[data-lf]')],
    [3, p.locator('main tbody tr', { hasText: EGRESADOS[0].n }).locator('td').nth(4)],
    [4, p.locator('main tbody tr', { hasText: EGRESADOS[0].n }).locator('td').last()],
  ]);
  await foto(p, '12-01-listado');
  await p.getByRole('button', { name: 'Limpiar' }).click(); await espera(p, 500);

  // Portal: página del programa
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/programas/' + SLUG, 3000);
  const sec = q.locator('section.block', { has: q.locator('h2', { hasText: 'Nuestros egresados' }) });
  await subirA(q, sec, 90);
  await marcar(q, [[1, sec.locator('h2')], [2, sec.locator('figure', { hasText: EGRESADOS[0].n }).first()]]);
  await foto(q, '12-04-web-programa');

  // Portal: página de inicio
  await ir(q, '#/', 3000);
  const h = q.locator('h2', { hasText: 'Lo que dicen nuestros egresados' });
  if (await h.count()) {
    const bloque = h.locator('xpath=ancestor::section[1]');
    await subirA(q, bloque, 80);
    await marcar(q, [[1, bloque.locator('.sec-h')], [2, bloque.locator('figure.testi').first()]]);
    await foto(q, '12-05-web-inicio');
  }
});
