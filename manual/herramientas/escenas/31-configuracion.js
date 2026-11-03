const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 31 · Configuración general
// Regla: esta escena NO debe dejar cambios visibles. Las capturas del formulario se toman sin guardar
// (se recarga la página después). El botón de WhatsApp se activa solo para la captura del portal y se revierte al final.
escena('31-configuracion', async ({ adm, pub }) => {
  const p = adm;
  const campo = id => p.locator('#' + id).locator('xpath=ancestor::div[contains(@class,"field")][1]');

  // 1. Datos institucionales
  await alto(p, 950);
  await ir(p, '#/admin/config');
  await marcar(p, [[1, campo('f_nombre')], [2, campo('f_nombreCorto')], [3, campo('f_logoSigla')], [4, campo('f_slogan')], [5, campo('f_lema')],
    [6, campo('f_descripcion')]]);
  await foto(p, '31-01-datos-institucionales');

  // 2. Logotipo, contacto e identificación
  await subirA(p, p.getByText('Logotipo oficial', { exact: false }).first(), 90);
  await marcar(p, [[1, p.getByText('Logotipo oficial', { exact: false }).first().locator('xpath=ancestor::div[contains(@class,"field")][1]')],
    [2, campo('f_direccion')], [3, campo('f_telefono')], [4, campo('f_correo')], [5, campo('f_horario')], [6, campo('f_ruc')]]);
  await foto(p, '31-02-logo-contacto');

  // 3. Redes, WhatsApp y SEO (valores de ejemplo, sin guardar)
  await p.fill('#f_fb', 'https://www.facebook.com/iestp.ica.demo');
  await p.fill('#f_ig', 'https://www.instagram.com/iestp.ica.demo');
  await p.fill('#f_waNum', '51956000111');
  await p.fill('#f_waMsg', 'Hola, deseo información sobre el IESTP “Ica”.');
  await p.fill('#f_seoTitulo', 'IESTP “Ica” | Portal institucional');
  await p.fill('#f_seoDesc', 'Programas de estudio, admisión, matrícula, transparencia y servicios en línea del IESTP “Ica”.');
  await subirA(p, p.locator('#f_lat'), 90);
  await marcar(p, [[1, campo('f_lat')], [2, campo('f_fb')], [3, p.locator('#f_waOn').locator('xpath=..')], [4, campo('f_waNum')], [5, campo('f_waMsg')],
    [6, campo('f_seoTitulo')], [7, campo('f_seoDesc')]]);
  await foto(p, '31-03-redes-whatsapp-seo');

  // 4. Correos receptores, límites y guardado
  await subirA(p, p.locator('#f_correoReclamos'), 330);
  await marcar(p, [[1, campo('f_correoReclamos')], [2, campo('f_correoContacto')], [3, campo('f_limDesc')], [4, campo('f_limPed')],
    [5, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '31-04-correos-limites');

  // 5. Validación: WhatsApp activado con un número incompleto (no se guarda)
  await p.check('#f_waOn');
  await p.fill('#f_waNum', '95600');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 900);
  await subirA(p, p.locator('#f_waNum'), 260);
  await marcar(p, [[1, campo('f_waNum')]]);
  await foto(p, '31-05-validacion');
  await ir(p, '#/admin/config'); // descarta lo escrito

  // 6. Dónde se ven los datos en el portal
  await alto(pub, 850);
  await ir(pub, '#/', 2500);
  await marcar(pub, [[1, pub.getByText('Formación tecnológica de calidad').first()], [2, pub.getByText('informes@ica.aplicacion.io').first().locator('xpath=..')],
    [3, pub.locator('header a[href="#/"]').filter({ hasText: 'IESTP' }).first()], [4, pub.getByText('Formación tecnológica para el desarrollo de Ica').last()]]);
  await foto(pub, '31-06-web-cabecera', { clip: { x: 0, y: 0, width: 1366, height: 260 } });
  const pie = pub.locator('footer.site-footer');
  await subirA(pub, pie.locator('.f-main'), 60);
  await marcar(pub, [[1, pie.locator('.f-about .f-brand')], [2, pie.locator('.f-about p').first()], [3, pie.locator('.f-about a[href*="facebook"]').first()],
    [4, pie.locator('.f-col').filter({ hasText: 'Contacto' }).first()]]);
  await foto(pub, '31-07-web-pie');

  // 7. Botón flotante de WhatsApp: se activa, se fotografía y se revierte
  await ir(p, '#/admin/config');
  const orig = { on: await p.isChecked('#f_waOn'), num: await p.inputValue('#f_waNum'), msg: await p.inputValue('#f_waMsg') };
  await p.check('#f_waOn');
  await p.fill('#f_waNum', '51956000111');
  await p.fill('#f_waMsg', 'Hola, deseo información sobre el IESTP “Ica”.');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  try {
    await ir(pub, '#/', 2500);
    const wa = pub.locator('a[href*="wa.me"], a[href*="whatsapp"]').last();
    await wa.waitFor({ timeout: 5000 });
    await marcar(pub, [[1, wa]]);
    await foto(pub, '31-08-web-whatsapp', { clip: { x: 683, y: 560, width: 683, height: 290 } });
  } finally {
    await ir(p, '#/admin/config');
    if (orig.on) await p.check('#f_waOn'); else await p.uncheck('#f_waOn');
    await p.fill('#f_waNum', orig.num);
    await p.fill('#f_waMsg', orig.msg);
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  }

  // 8. Otros parámetros que viven en sus propios módulos (sin guardar)
  await alto(p, 850);
  await ir(p, '#/admin/popup');
  await p.fill('#f_titulo', 'Inscripciones abiertas: Admisión 2027-I');
  await p.fill('#f_texto', 'Revisa los requisitos y el cronograma del proceso de admisión del IESTP “Ica”.');
  await p.fill('#f_boton', 'Ver admisión'); await p.fill('#f_enlace', '#/admision');
  await p.fill('#f_inicio', '2026-11-03'); await p.fill('#f_fin', '2026-12-15');
  const quitar = p.getByRole('button', { name: /Quitar imagen/ });
  if (await quitar.count()) { p.once('dialog', d => d.accept()); await quitar.first().click(); await espera(p, 600);
    const ok = p.getByRole('button', { name: /^(Retirar|Aceptar|Sí)$/ }); if (await ok.count()) await ok.last().click().catch(() => {}); await espera(p, 600); }
  await arriba(p);
  await marcar(p, [[1, p.locator('[role=tablist], .tabs').first()], [2, p.locator('#f_activo').locator('xpath=..')], [3, p.locator('#f_titulo').locator('xpath=ancestor::div[contains(@class,"field")][1]')], [4, p.locator('#f_inicio').locator('xpath=ancestor::div[contains(@class,"field")][1]')]]);
  await foto(p, '31-09-ventana-emergente');
  await ir(p, '#/admin/tupacfg');
  await marcar(p, [[1, campo('f_anio')], [2, p.getByText('Valor de la UIT por año', { exact: false }).first().locator('xpath=ancestor::div[contains(@class,"field")][1]')]]);
  await foto(p, '31-10-uit');
});
