const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

const NOMBRE = 'Centro de idiomas';

// 30 · Servicios complementarios
escena('30-servicios', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/servicios');
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo servicio/ })], [2, 'form[data-lf]'], [3, p.locator('main thead th', { hasText: 'Orden' })],
    [4, p.locator('main tbody tr').first().locator('td').nth(4)], [5, p.locator('main tbody tr').first().locator('.row-acts')]]);
  await foto(p, '30-01-listado');
  // Siguiente número de orden libre
  const ordenes = (await p.locator('main tbody tr td:first-child').allInnerTexts()).map(Number).filter(n => !isNaN(n));
  const orden = String(Math.max(6, ...ordenes) + 1);

  // Nuevo servicio
  await ir(p, '#/admin/servicios/nuevo');
  await alto(p, 1000); await arriba(p);
  await p.fill('#f_nombre', NOMBRE);
  await p.selectOption('#f_icono', 'book');
  await p.fill('#f_descripcion', 'Cursos de inglés básico e intermedio para estudiantes y egresados, con certificación institucional. Apoya el requisito de idioma para la titulación.');
  await p.fill('#f_ubicacion', 'Pabellón B, segundo piso, aula B-204');
  await p.fill('#f_horario', 'Lunes a viernes de 16:00 a 20:00; sábados de 08:00 a 12:00');
  await p.fill('#f_responsable', 'Coordinación del Centro de idiomas');
  await p.fill('#f_costo', 'S/ 100.00 por ciclo (según TUPA)');
  await p.fill('#f_orden', '1');
  await p.selectOption('#f_estado', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1200);
  await arriba(p);
  await marcar(p, [[1, p.locator('[data-f=nombre]')], [2, p.locator('[data-f=icono]')], [3, p.locator('[data-f=descripcion]')], [4, p.locator('[data-f=ubicacion]')],
    [5, p.locator('[data-f=horario]')], [6, p.locator('[data-f=responsable]')], [7, p.locator('[data-f=costo]')], [8, p.locator('[data-f=orden]')], [9, '#f_estado']]);
  await foto(p, '30-02-formulario');
  await p.fill('#f_orden', orden);
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // Editar un servicio existente: responsable de la Mesa de Partes presencial (dato de demostración)
  await ir(p, '#/admin/servicios');
  const filaMp = p.locator('main tbody tr', { hasText: 'Mesa de Partes presencial' });
  if (await filaMp.count()) {
    await filaMp.getByRole('button', { name: 'Editar' }).click(); await espera(p, 1300);
    await p.fill('#f_responsable', 'Unidad de Trámite Documentario');
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  }

  // Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/servicios/complementarios', 2500);
  const tarjeta = q.locator('article', { hasText: NOMBRE }).first();
  await subirA(q, tarjeta, 110);
  await marcar(q, [[1, tarjeta], [2, q.locator('h2', { hasText: 'Plataformas en línea' })]]);
  await foto(q, '30-03-web-servicios');
});
