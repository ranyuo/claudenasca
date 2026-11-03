const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Fecha local de Lima desplazada `d` días, en formato de <input type=datetime-local>.
const fecha = (d, hora) => new Date(Date.now() - 5 * 3600e3 + d * 864e5).toISOString().slice(0, 10) + 'T' + hora;
const EV1 = 'Feria de Proyectos Tecnológicos 2026';
const EV2 = 'Ceremonia de imposición de insignias 2026-II';
const EV3 = 'Taller de primeros auxilios (borrador)';

async function nuevoEvento(p, titulo, f, lugar, desc, estado) {
  await ir(p, '#/admin/eventos/nuevo', 1300);
  await p.fill('[name=titulo]', titulo); await p.fill('[name=fecha]', f); await p.fill('[name=lugar]', lugar);
  if (desc) await p.fill('[name=descripcion]', desc);
  await p.selectOption('#f_estado', estado);
}

// 05 · Eventos
escena('05-eventos', async ({ adm, pub }) => {
  const p = adm;
  const campo = sel => p.locator(sel).first().locator('xpath=ancestor::div[contains(@class,"field")][1]');
  await alto(p, 850);

  // Formulario con un error de publicación (falta la descripción)
  await nuevoEvento(p, EV1, fecha(12, '09:00'), 'Patio central y laboratorios del Pabellón A', '', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1000);
  await marcar(p, [[1, campo('[name=descripcion]')]]);
  await foto(p, '05-03-falta-descripcion');

  await nuevoEvento(p, EV1, fecha(12, '09:00'), 'Patio central y laboratorios del Pabellón A', 'Exposición de los proyectos de innovación de los ocho programas de estudio. Ingreso libre para estudiantes de colegios y público en general.', 'Publicado');
  await marcar(p, [[1, campo('[name=titulo]')], [2, campo('[name=fecha]')], [3, campo('[name=lugar]')], [4, campo('[name=descripcion]')], [5, '#f_estado'], [6, p.getByRole('button', { name: /Vista previa/ })], [7, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '05-02-formulario');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);

  await nuevoEvento(p, EV2, fecha(-20, '17:00'), 'Auditorio institucional', 'Ceremonia de imposición de insignias a los ingresantes del periodo académico 2026-II.', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  await nuevoEvento(p, EV3, fecha(30, '15:00'), 'Laboratorio de Enfermería Técnica', 'Taller gratuito para la comunidad.', 'Borrador');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);

  // Listado
  await ir(p, '#/admin/eventos', 1500);
  const fila = t => p.locator('main tbody tr', { hasText: t });
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo evento/ })],
    [2, p.locator('[data-lf]')],
    [3, fila(EV1).locator('td').nth(0)],
    [4, fila(EV3).locator('td').nth(3)],
    [5, fila(EV1).locator('td').last()],
    [6, p.getByText(/Ver papelera/)],
  ]);
  await foto(p, '05-01-listado');

  // Vista previa
  await fila(EV3).locator('[data-act=preview]').click(); await espera(p, 1500);
  await marcar(p, [[1, p.locator('.preview-bar')]]);
  await foto(p, '05-04-vista-previa');
  await p.locator('[data-close]').first().click().catch(() => {}); await espera(p, 500);

  // Eliminar y papelera
  await ir(p, '#/admin/eventos', 1300);
  await fila(EV3).locator('[data-act=del]').click(); await espera(p, 700);
  await marcar(p, [[1, p.locator('.modal').last()]]);
  await foto(p, '05-05-eliminar');
  await p.locator('.modal').last().getByRole('button', { name: 'Eliminar', exact: true }).click(); await espera(p, 1500);
  await p.getByText(/Ver papelera/).first().click(); await espera(p, 1200);
  await marcar(p, [[1, fila(EV3).locator('[data-act=restore]')]]);
  await foto(p, '05-06-papelera');

  // Agenda pública
  await alto(pub, 850);
  await ir(pub, '#/eventos', 2200);
  const h = t => pub.locator('h2', { hasText: t }).first();
  await subirA(pub, pub.locator('article h1, main h1').first(), 110);
  await marcar(pub, [[1, h('Próximos eventos')], [2, pub.locator('article.event', { hasText: EV1 })], [3, h('Eventos realizados')], [4, pub.locator('article.event', { hasText: EV2 })]]);
  await foto(pub, '05-07-web-agenda');

  // Bloque de la portada
  await ir(pub, '#/', 2500);
  const sec = pub.locator('section.sec', { has: pub.locator('h2', { hasText: 'Próximos eventos' }) });
  await subirA(pub, sec, 90);
  await marcar(pub, [[1, sec.locator('article.event', { hasText: EV1 })], [2, sec.getByRole('link', { name: /Ver agenda completa/ })]]);
  await foto(pub, '05-08-web-portada');
});
