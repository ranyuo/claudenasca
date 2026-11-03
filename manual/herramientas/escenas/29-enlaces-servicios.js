const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

const hoy = () => new Date().toISOString().slice(0, 10);
async function guardar(p) { await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000); }
async function editarEnlace(p, id, datos) {
  await ir(p, '#/admin/enlaces/' + id);
  if (!(await p.locator('#f_url').count())) return false;
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === 'grupo') await p.selectOption('#f_grupo', valor); else await p.fill('#f_' + campo, valor);
  }
  return true;
}

// 29 · Enlaces y servicios externos
escena('29-enlaces', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 1000);

  // Editar la URL de un servicio existente (Biblioteca Virtual)
  if (await editarEnlace(p, 'biblioteca', { url: 'https://biblioteca.ica.aplicacion.io/', verificado: hoy() })) {
    await arriba(p);
    await marcar(p, [[1, p.locator('[data-f=nombre]')], [2, p.locator('[data-f=grupo]')], [3, p.locator('[data-f=url]')], [4, p.locator('[data-f=color]')],
      [5, p.locator('[data-f=verificado]')], [6, '#f_estado'], [7, p.getByRole('button', { name: /Guardar cambios/ })]]);
    await foto(p, '29-02-editar');
    await guardar(p);
  }
  // Las demás direcciones de la institución de demostración
  if (await editarEnlace(p, 'aula', { url: 'https://aula.ica.aplicacion.io/', verificado: hoy() })) await guardar(p);
  if (await editarEnlace(p, 'bolsa', { url: 'https://empleos.ica.aplicacion.io/' })) await guardar(p);
  if (await editarEnlace(p, 'web', { nombre: 'Web institucional', url: 'https://www.ica.aplicacion.io/' })) await guardar(p);
  if (await editarEnlace(p, 'minedu', { grupo: 'minedu' })) await guardar(p);

  // Nuevo enlace
  await ir(p, '#/admin/enlaces/nuevo');
  await p.fill('#f_nombre', 'PRONABEC – Becas y créditos educativos');
  await p.selectOption('#f_grupo', 'minedu');
  await p.fill('#f_url', 'https://www.gob.pe/pronabec');
  await p.fill('#f_color', '#c8102e');
  await p.fill('#f_verificado', hoy());
  await marcar(p, [[1, p.locator('[data-f=grupo]')], [2, p.locator('[data-f=url]')], [3, '#f_estado']]);
  await foto(p, '29-03-nuevo');
  await guardar(p);

  // Listado
  await alto(p, 850);
  await ir(p, '#/admin/enlaces');
  const fila = p.locator('main tbody tr', { hasText: 'Biblioteca Virtual' });
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo enlace/ })], [2, 'form[data-lf]'], [3, fila.locator('td').nth(1)], [4, fila.locator('td').nth(3)],
    [5, fila.locator('td').nth(4)], [6, fila.locator('.row-acts')]]);
  await foto(p, '29-01-listado');

  // Portal: menú Servicios y franja superior
  const q = pub;
  await alto(q, 850);
  await ir(q, '#/servicios/complementarios', 2500);
  await q.locator('button.top', { hasText: 'Servicios' }).click(); await espera(q, 700);
  await marcar(q, [[1, q.locator('.topbar .tb-links a', { hasText: /Biblioteca virtual/i })], [2, q.locator('ul.sub a', { hasText: 'Biblioteca Virtual' })], [3, q.locator('ul.sub a', { hasText: 'Aula Virtual' })]]);
  await foto(q, '29-04-web-menu');
  await q.keyboard.press('Escape');

  // Portal: bloque «Enlaces institucionales» de la portada
  await ir(q, '#/', 2500);
  const bloque = q.locator('.minedu-links').first();
  await subirA(q, bloque, 260);
  await marcar(q, [[1, bloque.locator('a', { hasText: 'PRONABEC' })], [2, bloque.locator('a', { hasText: 'Ministerio de Educación' })]]);
  await foto(q, '29-05-web-portada');
});
