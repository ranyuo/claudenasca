const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Retrato ilustrado ficticio (no es una persona real), generado en la carpeta temporal.
async function retrato(browser, nombre, fondo, ropa) {
  const file = path.join(os.tmpdir(), nombre + '.jpg');
  const pg = await browser.newPage({ viewport: { width: 480, height: 560 } });
  await pg.setContent(`<body style="margin:0"><svg width="480" height="560" xmlns="http://www.w3.org/2000/svg">
    <rect width="480" height="560" fill="${fondo}"/><circle cx="240" cy="215" r="105" fill="#c99b77"/>
    <path d="M135 200 Q140 85 240 90 Q340 85 345 200 Q330 140 240 135 Q150 140 135 200Z" fill="#2b2118"/>
    <path d="M60 560 Q70 360 240 345 Q410 360 420 560Z" fill="${ropa}"/><path d="M200 350 L240 420 L280 350Z" fill="#fff"/></svg></body>`);
  await pg.screenshot({ path: file, type: 'jpeg', quality: 85 }); await pg.close();
  return file;
}
const ok = async p => { const b = p.locator('.modal-bg [data-r="1"]'); if (await b.count()) { await b.last().click(); await espera(p, 500); } };
const cerrarModal = async p => { await p.keyboard.press('Escape'); await espera(p, 400); };
const NOMBRE = 'Milagros Elena', APELLIDOS = 'Yupanqui Ccahuana';

// 06 · Plana docente y plana jerárquica
escena('06-plana-docente', async ({ adm, pub, browser }) => {
  const p = adm;

  // Prepara dos unidades didácticas en Enfermería Técnica (si aún no existen) para poder asignarlas.
  await alto(p, 900);
  await ir(p, '#/admin/programas/enf', 1500);
  if (!(await p.locator('[data-mu$="|nombre"]').count())) {
    await p.locator('[data-uadd="0"]').click(); await espera(p, 400);
    await p.locator('[data-uadd="0"]').click(); await espera(p, 400);
    const uds = p.locator('[data-mu^="0|"][data-mu$="|nombre"]');
    await uds.nth(0).fill('Fundamentos de enfermería'); await uds.nth(1).fill('Primeros auxilios y soporte vital básico');
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  }

  // Listado
  await alto(p, 850);
  await ir(p, '#/admin/docentes');
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo docente/ })],
    [2, p.locator('[data-csv]')],
    [3, p.locator('form[data-lf]')],
    [4, p.locator('[data-trash]')],
    [5, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '06-01-docentes-listado');

  // Formulario vacío
  await p.getByRole('link', { name: /Nuevo docente/ }).click(); await espera(p, 1300);
  await alto(p, 1500); await arriba(p);
  const campo = n => p.locator(`[data-f="${n}"]`);
  await marcar(p, [
    [1, campo('foto')],
    [2, campo('nombres')],
    [3, campo('especialidad')],
    [4, campo('progud')],
    [5, campo('academica')],
    [6, p.locator('[data-cf] > div').last().locator('.panel').first()],
  ]);
  await foto(p, '06-02-docente-formulario');

  // Formulario completado
  await p.locator('[data-imgf="foto"]').setInputFiles(await retrato(browser, 'manual-06-docente', '#dfe9f5', '#1f6f8b'));
  await espera(p, 2500);
  await p.fill('#f_titulo', 'Lic.');
  await p.fill('#f_nombres', NOMBRE); await p.fill('#f_apellidos', APELLIDOS);
  await p.fill('#f_correo', 'myupanqui@ica.aplicacion.io');
  await p.fill('#f_especialidad', 'Licenciada en Enfermería');
  await p.selectOption('#f_condicion', 'Contratado');
  await p.locator('[data-pp="enf"]').check(); await espera(p, 800);
  const udc = p.locator('[data-ud^="enf|"]');
  for (let i = 0; i < Math.min(2, await udc.count()); i++) await udc.nth(i).check();
  await p.locator('[data-rows="academica"] [data-radd]').click(); await espera(p, 600);
  const fila = p.locator('[data-rows="academica"] tbody tr').first();
  await fila.locator('select').selectOption('Título profesional');
  await fila.locator('[data-rc="titulo"]').fill('Licenciada en Enfermería');
  await fila.locator('[data-rc="institucion"]').fill('Universidad Nacional San Luis Gonzaga');
  await fila.locator('[data-rc="anio"]').fill('2012');
  await p.selectOption('#f_estado', 'Publicado');
  await alto(p, 1560); await arriba(p);
  await marcar(p, [
    [5, campo('foto')],
    [1, campo('progud')],
    [2, campo('academica')],
    [3, '#f_estado'],
    [4, p.getByRole('button', { name: /Guardar cambios/ })],
  ]);
  await foto(p, '06-03-docente-completo');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // Resultado en el listado
  await alto(p, 850);
  await ir(p, '#/admin/docentes');
  await p.fill('#lf-q', 'Yupanqui'); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 900);
  const fd = p.locator('main tbody tr', { hasText: APELLIDOS }).first();
  await marcar(p, [[1, fd.locator('td').nth(4)], [2, fd.locator('td').nth(6)], [3, fd.locator('td').nth(7)]]);
  await foto(p, '06-04-docente-guardado');
  await p.getByRole('button', { name: 'Limpiar' }).click(); await espera(p, 600);

  // Portal: Plana docente
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/nosotros/plana-docente?p=enf', 2500);
  await subirA(q, q.locator('.pz-ptabs'), 90);
  await marcar(q, [[1, q.locator('.pz-ptabs')], [2, q.locator('.cat-tabs')], [3, q.locator('form[data-ps]')]]);
  await foto(q, '06-05-web-plana-docente');
  const h2 = q.locator('.content h2').filter({ has: q.locator('.badge') }).first();
  await subirA(q, h2, 90);
  const t1 = q.locator('.pz-tcard').first();
  await marcar(q, [[1, h2.locator('.badge')], [2, t1.locator('.tb h3')], [3, t1.locator('.b1')], [4, t1.locator('.b2')]]);
  await foto(q, '06-06-web-tarjetas');

  // Portal: página del programa (la plana del programa incluye a la nueva docente)
  await ir(q, '#/programas/enfermeria-tecnica', 2500);
  const sec = q.locator('section.block', { has: q.locator('h2', { hasText: 'Plana docente del programa' }) });
  await subirA(q, sec, 90);
  const tn = sec.locator('article', { hasText: APELLIDOS }).first();
  await marcar(q, [[1, sec.locator('h2')], [2, tn]]);
  await foto(q, '06-07-web-plana-programa');
  await tn.locator('[data-prof]').click(); await espera(q, 1000);
  await marcar(q, [[1, q.locator('.modal h4', { hasText: 'Información académica' })], [2, q.locator('.modal h4', { hasText: 'Unidades didácticas' })]]);
  await foto(q, '06-08-web-perfil-docente');
  await cerrarModal(q);
});

escena('06-plana-jerarquica', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/jerarquica');
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo integrante/ })],
    [2, p.locator('[role=tablist]').first()],
    [3, p.locator('main tbody tr').first().locator('td').nth(2)],
    [4, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '06-09-jerarquica-listado');

  // Nuevo integrante con una persona ya registrada en Plana docente
  await p.getByRole('link', { name: /Nuevo integrante/ }).click(); await espera(p, 1300);
  const per = await p.locator('#f_personaId option', { hasText: APELLIDOS }).first().getAttribute('value').catch(() => null);
  if (per) await p.selectOption('#f_personaId', per); else await p.selectOption('#f_personaId', { index: 1 });
  await p.fill('#f_cargo', 'Jefa del Área de Formación Continua y Extensión');
  await p.fill('#f_unidad', 'Unidad de Formación Continua');
  await arriba(p);
  await marcar(p, [[1, '#f_personaId'], [2, '#f_cargo'], [3, '#f_unidad'], [4, '#f_orden'], [5, p.locator('[data-f="esDirector"]')], [6, '#f_estado']]);
  await foto(p, '06-10-jerarquica-formulario');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);

  // Página y mensaje de la Dirección
  await alto(p, 1150);
  await ir(p, '#/admin/paginas/pg-jerarquica');
  await p.fill('#f_contenido', 'Conoce al equipo directivo del IESTP “Ica”: la Dirección General, las jefaturas de unidad y los coordinadores de los programas de estudio.');
  if (!(await p.inputValue('#f_mensaje'))) {
    await p.fill('#f_mensaje', 'Formamos profesionales técnicos con valores, comprometidos con el desarrollo de Ica y del país. Te invitamos a ser parte de nuestra comunidad educativa.');
  }
  await arriba(p);
  await marcar(p, [[1, '#f_contenido'], [2, '[data-f="imagen"]'], [3, '#f_mensaje'], [4, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '06-11-jerarquica-pagina');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);

  // Portal: Plana jerárquica
  const q = pub;
  await alto(q, 1000);
  await ir(q, '#/nosotros/plana-jerarquica', 2500);
  await subirA(q, q.locator('.pz-ptabs'), 90);
  await marcar(q, [[1, q.locator('.pz-tcard').first()], [2, q.locator('.pz-tcard').first().locator('[data-cg]')]]);
  await foto(q, '06-12-web-plana-jerarquica');
  await subirA(q, q.locator('section.director'), 90);
  const nueva = q.locator('.pz-tcard', { hasText: 'Formación Continua y Extensión' }).first();
  await marcar(q, [[1, q.locator('section.director')], [2, q.locator('h2', { hasText: 'Coordinadores de programas' })]]);
  await foto(q, '06-13-web-mensaje-coordinadores');
  await nueva.locator('[data-cg]').click(); await espera(q, 1000);
  await foto(q, '06-14-web-cargo-academico');
  await cerrarModal(q);
});
