const { espera, ir, marcar, foto, alto, subirA, arriba, captcha } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 00 · Acceso y entorno de trabajo
escena('00-acceso', async ({ pub }) => {
  const p = pub;
  await alto(p, 850);
  await ir(p, '#/admin', 1500);
  await marcar(p, [[1, '#lg-u'], [2, '#lg-p'], [3, p.locator('form button[type=submit]')]]);
  await foto(p, '00-01-inicio-sesion');
});

escena('00-entorno', async ({ adm }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/dashboard', 2000);
  await marcar(p, [
    [1, 'aside, nav.side, .sidebar'],
    [2, p.getByText('Apariencia', { exact: true }).first()],
    [3, p.getByText('Ver sitio web', { exact: false }).first()],
    [4, p.getByText('Salir', { exact: true }).first()],
    [5, p.locator('main h1, main h2').first()],
  ]);
  await foto(p, '00-02-panel-inicio');
});

