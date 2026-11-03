const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Ilustración ficticia de la fachada de un local, generada en la carpeta temporal.
async function fachada(browser, nombre) {
  const file = path.join(os.tmpdir(), nombre + '.jpg');
  const pg = await browser.newPage({ viewport: { width: 1200, height: 675 } });
  await pg.setContent(`<body style="margin:0"><svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="675" fill="#bfe3f7"/><rect y="470" width="1200" height="205" fill="#c8a76a"/>
    <rect x="180" y="210" width="840" height="270" fill="#f4efe6" stroke="#8a7a5c" stroke-width="6"/>
    <rect x="180" y="170" width="840" height="50" fill="#2f6b3a"/>
    <text x="600" y="205" font-family="Arial" font-size="30" font-weight="bold" fill="#fff" text-anchor="middle">CENTRO DE PRODUCCIÓN AGROPECUARIA</text>
    ${[240, 380, 720, 860].map(x => `<rect x="${x}" y="260" width="100" height="80" fill="#7fb2d9"/>`).join('')}
    <rect x="540" y="330" width="120" height="150" fill="#6b4a2b"/>
    <circle cx="90" cy="420" r="70" fill="#3f8f3f"/><rect x="82" y="420" width="16" height="70" fill="#6b4a2b"/>
    <circle cx="1110" cy="410" r="80" fill="#3f8f3f"/><rect x="1102" y="410" width="16" height="80" fill="#6b4a2b"/>
    <text x="600" y="640" font-family="Arial" font-size="22" fill="#5a4a2a" text-anchor="middle">Imagen ilustrativa ficticia</text></svg></body>`);
  await pg.screenshot({ path: file, type: 'jpeg', quality: 85 }); await pg.close();
  return file;
}
const LOCAL = 'Local anexo – Centro de Producción Agropecuaria';

// 08 · Campus y locales
escena('08-campus-locales', async ({ adm, pub, browser }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/locales');
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo local/ })],
    [2, p.getByRole('link', { name: /Editar página Campus e Informes/ })],
    [3, p.getByRole('link', { name: /Mensajes de contacto/ })],
    [4, p.locator('main tbody tr').first().locator('td').nth(2)],
    [5, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '08-01-listado');

  // Formulario: un local nuevo
  await p.getByRole('link', { name: /Nuevo local/ }).click(); await espera(p, 1300);
  await alto(p, 1450); await arriba(p);
  await p.fill('#f_nombre', LOCAL);
  await p.fill('#f_telefono', '(056) 000-111');
  await p.fill('#f_direccion', 'Carretera a Los Molinos km 3, Ica');
  await p.fill('#f_correo', 'produccion@ica.aplicacion.io');
  await p.fill('#f_horario', 'Lunes a viernes, 07:30 a 15:30');
  await p.locator('[data-imgf="foto"]').setInputFiles(await fachada(browser, 'manual-08-local'));
  await espera(p, 2500);
  // Coordenadas con el signo equivocado: el sistema las rechaza
  await p.fill('#f_lat', '14.0636'); await p.fill('#f_lng', '-75.7290');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1000);
  await arriba(p);
  await marcar(p, [[1, p.locator('[data-f="lat"]')], [2, p.locator('[data-f="lng"]')]]);
  await foto(p, '08-03-error-coordenadas');

  await p.fill('#f_lat', '-14.0636');
  await p.locator('[data-mapr]').click(); await espera(p, 2500);
  await p.selectOption('#f_estado', 'Publicado');
  await p.fill('#f_orden', '2');
  await arriba(p);
  await marcar(p, [
    [1, p.locator('[data-f="nombre"]')],
    [2, p.locator('[data-f="direccion"]')],
    [3, p.locator('[data-f="lat"]')],
    [4, p.locator('[data-mapr]')],
    [5, p.locator('[data-f="foto"]')],
    [6, '#f_estado'],
    [7, '#f_orden'],
  ]);
  await foto(p, '08-02-formulario');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);

  await alto(p, 850); await arriba(p);
  const fila = p.locator('main tbody tr', { hasText: 'Centro de Producción Agropecuaria' }).first();
  await marcar(p, [[1, fila.locator('td').nth(1)], [2, fila.locator('td').nth(2)], [3, fila.locator('td').nth(3)]]);
  await foto(p, '08-04-guardado');

  // Portal: Campus e Informes
  const q = pub;
  await alto(q, 950);
  await ir(q, '#/nosotros/campus-e-informes', 3000);
  await subirA(q, q.locator('.info-cards'), 100);
  await marcar(q, [[1, q.locator('.info-cards')], [2, q.locator('iframe.map')], [3, q.getByRole('link', { name: /Cómo llegar/ })]]);
  await foto(q, '08-05-web-campus');
  const locs = q.locator('h2', { hasText: /^Locales$/ });
  await subirA(q, locs, 100);
  await marcar(q, [[1, locs], [2, q.locator('article.card', { hasText: 'Centro de Producción Agropecuaria' }).first()]]);
  await foto(q, '08-06-web-locales');
});
