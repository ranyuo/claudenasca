const { espera, ir, marcar, foto, alto, subirA, arriba, captcha } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 04 · Noticias
escena('04-noticias', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/noticias');
  await marcar(p, [
    [1, p.getByRole('button', { name: /Nueva noticia/ }).or(p.getByText('Nueva noticia'))],
    [2, p.locator('[role=tablist]').first()],
    [3, p.locator('main form, main .filters, main .card').first()],
    [4, p.getByText(/Ver papelera/)],
    [5, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '04-01-listado');

  // Formulario vacío
  await p.getByText('Nueva noticia').first().click(); await espera(p, 1300);
  await alto(p, 1520); await arriba(p);
  const lbl = t => p.locator('label, .lbl', { hasText: t }).first();
  await marcar(p, [
    [1, p.locator('main input').first()],
    [2, p.locator('main textarea').first()],
    [3, p.locator('[contenteditable=true]').first()],
    [4, lbl('Imagen principal').locator('xpath=..')],
    [5, p.locator('main aside, main .side, main .col-side').first().or(p.getByText('Estado y publicación').locator('xpath=../..'))],
  ]);
  await foto(p, '04-02-formulario');

  // Formulario completado
  await p.locator('main input').first().fill('Taller de primeros auxilios para la comunidad');
  await p.locator('main textarea').first().fill('El programa de Enfermería Técnica organiza un taller gratuito de primeros auxilios abierto a la comunidad.');
  await p.locator('[contenteditable=true]').first().click();
  await p.keyboard.type('El taller se realizará el sábado 14 de noviembre de 2026 en el laboratorio de Enfermería Técnica. Los participantes recibirán una constancia de asistencia.');
  const selects = p.locator('main select');
  const nSel = await selects.count();
  for (let i = 0; i < nSel; i++) {
    const opts = await selects.nth(i).locator('option').allInnerTexts();
    if (opts.includes('Académico')) await selects.nth(i).selectOption({ label: 'Académico' });
    if (opts.some(o => /imagen completa/i.test(o))) await selects.nth(i).selectOption({ index: 1 });
  }
  await arriba(p);
  const estadoSel = p.locator('main select').filter({ has: p.locator('option', { hasText: 'Publicada' }) }).first();
  await marcar(p, [
    [1, estadoSel],
    [2, p.locator('main select').filter({ has: p.locator('option', { hasText: 'Académico' }) }).first()],
    [3, p.locator('main input[type=datetime-local]').first()],
    [4, p.getByText('Noticia destacada')],
    [5, p.getByRole('button', { name: /Vista previa/ })],
    [6, p.getByRole('button', { name: /Guardar cambios/ })],
  ]);
  await foto(p, '04-03-formulario-completo');

  // Vista previa
  await p.getByRole('button', { name: /Vista previa/ }).click(); await espera(p, 1500);
  await alto(p, 850);
  await foto(p, '04-04-vista-previa');
  await p.keyboard.press('Escape'); await espera(p, 400);
  const cerrar = p.locator('[data-close]'); if (await cerrar.count()) await cerrar.first().click().catch(() => {});
  await espera(p, 500);

  // Guardar como borrador
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  await alto(p, 850); await arriba(p);
  const fila = p.locator('main tbody tr', { hasText: 'Taller de primeros auxilios' });
  await marcar(p, [[1, fila.locator('td').nth(4)]]);
  await foto(p, '04-05-guardado-borrador');

  // Publicar: editar y cambiar estado
  await fila.locator('button, a').nth(1).click(); await espera(p, 1300);
  await alto(p, 1520); await arriba(p);
  await p.locator('main select').filter({ has: p.locator('option', { hasText: 'Publicada' }) }).first().selectOption('Publicada');
  await marcar(p, [[1, p.locator('main select').filter({ has: p.locator('option', { hasText: 'Publicada' }) }).first()], [2, p.getByRole('button', { name: /Guardar cambios/ })], [3, p.getByText('Historial').locator('xpath=../..')]]);
  await foto(p, '04-06-publicar');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, p.locator('main tbody tr', { hasText: 'Taller de primeros auxilios' }).locator('td').nth(4)]]);
  await foto(p, '04-07-publicada');

  // Resultado en la web pública
  await alto(pub, 850);
  await ir(pub, '#/noticias', 2200);
  const tarjeta = pub.locator('article.ncard', { hasText: 'Taller de primeros auxilios' }).first();
  await subirA(pub, pub.getByText('Todas', { exact: true }).first(), 110);
  await marcar(pub, [[1, pub.getByText('Todas', { exact: true }).first().locator('xpath=..')], [2, tarjeta]]);
  await foto(pub, '04-08-web-listado');
  await tarjeta.locator('h3 a').click(); await espera(pub, 2000);
  await foto(pub, '04-09-web-detalle');

  // Papelera
  await ir(p, '#/admin/noticias');
  const fila2 = p.locator('main tbody tr', { hasText: 'Feria de proyectos' });
  p.once('dialog', d => d.accept());
  await fila2.locator('button').last().click(); await espera(p, 900);
  const conf = p.getByRole('button', { name: 'Eliminar', exact: true }).last();
  await marcar(p, [[1, p.locator('.modal, [role=dialog], .ov').last()]]);
  await foto(p, '04-10-eliminar');
  await conf.click(); await espera(p, 1500);
  await p.getByText(/Ver papelera/).first().click(); await espera(p, 1300);
  await marcar(p, [[1, p.locator('main tbody tr').first().locator('td').last()]]);
  await foto(p, '04-11-papelera');

  // Categorías
  await ir(p, '#/admin/catnoticias');
  await marcar(p, [[1, p.locator('main tbody').first()]]);
  await foto(p, '04-12-categorias');
});

