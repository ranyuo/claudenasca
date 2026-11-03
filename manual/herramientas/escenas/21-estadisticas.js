const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

const ANIO = '2026';
// postulantes, ingresantes, matriculados, egresados, titulados, becas, créditos educativos (cifras ficticias)
const DATOS = {
  'Contabilidad': [92, 40, 118, 24, 15, 3, 1],
  'Enfermería Técnica': [148, 40, 121, 30, 22, 2, 2],
  'Guía Oficial de Turismo': [31, 28, 70, 12, 8, 1, 0],
  'Producción Agropecuaria': [47, 38, 96, 18, 11, 1, 0],
  'Arquitectura de Plataformas': [66, 40, 112, 21, 14, 2, 1],
  'Electricidad Industrial': [45, 40, 101, 19, 12, 0, 0],
  'Electrónica Industrial': [33, 30, 84, 15, 9, 0, 1],
  'Mecatrónica Automotriz': [88, 40, 117, 26, 17, 1, 0],
};

// 21 · Estadísticas
escena('21-estadisticas', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/estadisticas');
  await marcar(p, [
    [1, p.locator('[data-ny]')],
    [2, p.getByRole('link', { name: /Ver en el portal/ })],
    [3, p.locator('main .chips')],
    [4, p.locator('form[data-stf] thead')],
    [5, p.locator('form[data-stf] tbody tr').first().locator('input').first()],
    [6, p.locator('form[data-stf] button').last()],
  ]);
  await foto(p, '21-01-estadisticas');

  // Agregar el año
  if (!(await p.locator('main .chips a', { hasText: ANIO }).count())) {
    await p.locator('[data-ny]').click(); await espera(p, 600);
    await p.fill('#pb-v', ANIO);
    await marcar(p, [[1, '#pb-v'], [2, p.locator('.modal [data-r="1"]').last()]]);
    await foto(p, '21-02-agregar-anio');
    await p.locator('.modal [data-r="1"]').last().click(); await espera(p, 2000);
  } else {
    await ir(p, '#/admin/estadisticas?anio=' + ANIO);
  }

  // Registrar los indicadores
  await alto(p, 900);
  await ir(p, '#/admin/estadisticas?anio=' + ANIO);
  const filas = p.locator('form[data-stf] tbody tr');
  for (const [prog, valores] of Object.entries(DATOS)) {
    const inputs = filas.filter({ hasText: prog }).first().locator('input');
    for (let i = 0; i < valores.length; i++) await inputs.nth(i).fill(String(valores[i]));
  }
  const celdaMal = filas.filter({ hasText: 'Guía Oficial de Turismo' }).first().locator('input').nth(3);
  await celdaMal.fill('-12');
  await p.locator('form[data-stf] button').last().click(); await espera(p, 700);
  await marcar(p, [[1, p.locator('main .chips a[aria-current=true]')], [2, celdaMal], [3, p.locator('.toast').last()]]);
  await foto(p, '21-03-error');
  await celdaMal.fill(String(DATOS['Guía Oficial de Turismo'][3]));
  await celdaMal.evaluate(e => e.style.borderColor = '');
  await p.locator('form[data-stf] button').last().click(); await espera(p, 900);
  await marcar(p, [[1, p.locator('form[data-stf] tbody')], [2, p.locator('form[data-stf] button').last()], [3, p.locator('.toast').last()]]);
  await foto(p, '21-04-guardado');
  await espera(p, 1500);

  // Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/transparencia/estadisticas', 2500);
  await subirA(q, q.locator('h1').first(), 150);
  await marcar(q, [[1, q.locator('p.lead').first()], [2, q.locator('figure.chart-card').first()], [3, q.locator('figure.chart-card').nth(2)], [4, q.locator('nav.side-box')]]);
  await foto(q, '21-05-web-graficos');
  await subirA(q, q.locator('h2', { hasText: 'Detalle por programa' }), 130);
  await marcar(q, [[1, q.locator('.chips[role=group]')], [2, q.locator('table.tbl tbody tr').filter({ hasText: 'Guía Oficial' }).first()], [3, q.locator('table.tbl tbody tr').last()], [4, q.locator('[data-csv]')]]);
  await foto(q, '21-06-web-tabla');
});
