const os = require('os');
const path = require('path');
const { BASE, espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Retrato ilustrado ficticio (no es una persona real), generado en la carpeta temporal.
async function retrato(browser, nombre, fondo, ropa) {
  const file = path.join(os.tmpdir(), nombre + '.jpg');
  const pg = await browser.newPage({ viewport: { width: 480, height: 560 } });
  await pg.setContent(`<body style="margin:0"><svg width="480" height="560" xmlns="http://www.w3.org/2000/svg">
    <rect width="480" height="560" fill="${fondo}"/><circle cx="240" cy="215" r="105" fill="#b98a66"/>
    <path d="M140 190 Q145 95 240 95 Q335 95 340 190 Q320 130 240 128 Q160 130 140 190Z" fill="#1b1b1b"/>
    <path d="M60 560 Q70 360 240 345 Q410 360 420 560Z" fill="${ropa}"/><path d="M205 350 L240 410 L275 350Z" fill="#fff"/></svg></body>`);
  await pg.screenshot({ path: file, type: 'jpeg', quality: 85 }); await pg.close();
  return file;
}
// PDF ficticio de sustento (título profesional de ejemplo).
async function pdfFicticio(browser, nombre, titulo) {
  const file = path.join(os.tmpdir(), nombre + '.pdf');
  const pg = await browser.newPage();
  await pg.setContent(`<body style="font-family:Arial;padding:60px"><h1 style="color:#123">${titulo}</h1><p>Documento FICTICIO generado para el manual de uso. No tiene validez.</p></body>`);
  await pg.pdf({ path: file, format: 'A4' }); await pg.close();
  return file;
}
const NOM = 'Wilfredo', APE = 'Ccori Huarcaya';
const USUARIO = 'wccori.docente', CLAVE1 = 'Temporal-Ica-2026', CLAVE2 = 'MiClaveDocente-2026';

// 07 · CV docente
escena('07-cv-docente', async ({ adm, pub, browser, ctx }) => {
  const p = adm;

  // Ficha del docente en Plana docente (si no existe)
  await alto(p, 1500);
  await ir(p, '#/admin/docentes');
  await p.fill('#lf-q', 'Ccori Huarcaya'); await p.getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 800);
  if (!(await p.locator('main tbody tr', { hasText: APE }).count())) {
    await ir(p, '#/admin/docentes/nuevo');
    await p.locator('[data-imgf="foto"]').setInputFiles(await retrato(browser, 'manual-07-docente', '#e8efe3', '#3d4f7c'));
    await espera(p, 2500);
    await p.fill('#f_titulo', 'Ing.'); await p.fill('#f_nombres', NOM); await p.fill('#f_apellidos', APE);
    await p.fill('#f_correo', 'wccori@ica.aplicacion.io'); await p.fill('#f_especialidad', 'Ingeniero Electricista');
    await p.selectOption('#f_condicion', 'Nombrado');
    await p.locator('[data-pp="ei"]').check(); await espera(p, 600);
    await p.selectOption('#f_estado', 'Publicado');
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  }
  await p.getByRole('button', { name: 'Limpiar' }).click().catch(() => {}); await espera(p, 400);

  // Listado del CV docente
  await alto(p, 900);
  await ir(p, '#/admin/cvdocente', 1500);
  const fila = p.locator('main tbody tr', { hasText: APE }).first();
  const href = await fila.locator('a', { hasText: 'Gestionar' }).getAttribute('href');
  const pid = href.split('/').pop();
  await subirA(p, p.locator('main .kpis'), 100);
  await marcar(p, [[1, p.locator('main .kpis')], [2, fila.locator('td').nth(2)], [3, fila.locator('td').nth(3)], [4, fila.locator('td').last()]]);
  await foto(p, '07-01-listado');

  // Panel del CV (vista del administrador)
  await alto(p, 1250);
  await ir(p, '#/admin/cvdocente/' + pid, 1500);
  await marcar(p, [[1, p.locator('.pz-cvban a.btn')], [2, p.locator('.pz-kpis')], [3, p.locator('main .notice.warn')], [4, p.locator('.pz-cvcards')], [5, p.locator('.pz-quick2')]]);
  await foto(p, '07-02-panel');

  // Datos personales
  await ir(p, `#/admin/cvdocente/${pid}/datos`, 1500);
  const f = p.locator('form[data-cvf]');
  await f.locator('[name=dni]').fill('41526378');
  await f.locator('[name=fnac]').fill('1984-06-12');
  await f.locator('[name=sexo]').selectOption('Masculino');
  await f.locator('[name=telefono]').fill('956 111 222');
  await f.locator('[name=correoPersonal]').fill('wilfredo.ccori@correo-demo.pe');
  await f.locator('[name=direccion]').fill('Calle Los Molinos N.º 245, Ica');
  await f.locator('[name=perfil]').fill('Ingeniero electricista con experiencia en instalaciones eléctricas industriales y mantenimiento de máquinas eléctricas. Docente de educación superior tecnológica desde 2015.');
  await arriba(p);
  await marcar(p, [[1, p.locator('.pz-cvnav')], [2, p.locator('.pz-photo')], [3, f.locator('[name=nombres]')], [4, f.locator('[name=perfil]')], [5, f.getByRole('button', { name: /Guardar datos personales/ })]]);
  await foto(p, '07-03-datos-personales');
  await f.getByRole('button', { name: /Guardar datos personales/ }).click(); await espera(p, 1800);

  // Formación académica: agregar un registro
  await ir(p, `#/admin/cvdocente/${pid}/formacion`, 1500);
  await p.locator('[data-add="pregrado"]').click(); await espera(p, 700);
  const m = p.locator('.modal-bg').last();
  await m.locator('[name=anio]').fill('2002 - 2008');
  await m.locator('[name=nivel]').fill('Título profesional');
  await m.locator('[name=especialidad]').fill('Ingeniería Eléctrica');
  await m.locator('[name=institucion]').fill('Universidad Nacional San Luis Gonzaga');
  await m.locator('[name=lugar]').fill('Ica');
  await marcar(p, [[1, m.locator('form[data-li]')], [2, m.locator('[data-s]')]]);
  await foto(p, '07-04-agregar-formacion');
  await m.locator('[data-s]').click(); await espera(p, 1800);
  await arriba(p);
  const panelPre = p.locator('.panel', { has: p.locator('[data-add="pregrado"]') });
  await marcar(p, [[1, panelPre.locator('tbody tr').first()], [2, p.locator('[data-add="posgrado"]')]]);
  await foto(p, '07-05-formacion');

  // Documentos y autorización
  await ir(p, `#/admin/cvdocente/${pid}/documentos`, 1500);
  await p.fill('#dc-t', 'Título profesional de Ingeniero Electricista');
  await p.locator('#dc-f').setInputFiles(await pdfFicticio(browser, 'manual-07-titulo', 'Título profesional (ejemplo ficticio)'));
  await p.locator('[data-updoc]').click(); await espera(p, 2000);
  await p.locator('#au-ok').check();
  await arriba(p);
  await marcar(p, [[1, p.locator('[data-upcv]')], [2, p.locator('.pz-files').last()], [3, p.locator('#au-ok').locator('xpath=..')], [4, p.locator('[data-aut]')]]);
  await foto(p, '07-06-documentos-autorizacion');
  await p.locator('[data-aut]').click(); await espera(p, 1800);
  await arriba(p);
  await marcar(p, [[1, p.locator('.notice.ok').first()], [2, p.locator('[data-rev]')]]);
  await foto(p, '07-07-autorizado');

  // Portal: el docente aparece en la Plana docente con su hoja de vida
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/nosotros/plana-docente?p=ei&q=Ccori', 2500);
  const card = q.locator('.pz-tcard', { hasText: APE }).first();
  await subirA(q, q.locator('form[data-ps]'), 90);
  await marcar(q, [[1, q.locator('form[data-ps]')], [2, card.locator('.tb h3')], [3, card.locator('.b1')]]);
  await foto(q, '07-08-web-hoja-de-vida');

  // Cuenta del docente: carga docente (Programación de horarios) y usuario
  await alto(p, 900);
  await ir(p, '#/admin/ix-horarios', 1500);
  await p.locator('[data-tab$=":config"]').first().click(); await espera(p, 800);
  await p.locator('[data-tab="hconf:docentes"]').click(); await espera(p, 800);
  if (!(await p.locator('main tbody tr', { hasText: 'Ccori' }).count())) {
    await p.getByRole('button', { name: '+ Nuevo' }).click(); await espera(p, 800);
    await p.selectOption('#f_per', pid);
    for (const d of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']) await p.locator(`#f_dias input[value="${d}"]`).check();
    await marcar(p, [[1, '#f_per'], [2, '#f_dias'], [3, p.locator('#mform footer button[type=submit]')]]);
    await foto(p, '07-09-carga-docente');
    await p.locator('#mform footer button[type=submit]').click(); await espera(p, 1800);
  }

  await alto(p, 1250);
  await ir(p, '#/admin/usuarios/nuevo', 1500);
  await p.fill('#f_usuario', USUARIO);
  await p.fill('#f_nombre', `${NOM} ${APE}`);
  await p.selectOption('#f_rol', 'docente');
  const vin = await p.locator('#f_vin option', { hasText: 'Ccori' }).first().getAttribute('value');
  await p.selectOption('#f_vin', vin);
  await p.fill('#f_pass1', CLAVE1); await p.fill('#f_pass2', CLAVE1);
  await p.fill('#f_correo', 'wccori@ica.aplicacion.io');
  await p.selectOption('#f_personaId', pid);
  await arriba(p);
  await marcar(p, [[1, '#f_rol'], [2, '#f_vin'], [3, p.locator('[data-f="pass1"]')], [4, '#f_personaId'], [5, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '07-10-usuario-docente');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // El docente ingresa con su cuenta
  const d = await (await ctx()).newPage();
  await alto(d, 900);
  await ir(d, '#/admin', 1500);
  await d.fill('#lg-u', USUARIO); await d.fill('#lg-p', CLAVE1); await d.press('#lg-p', 'Enter');
  await d.waitForURL(/accounts\.php|#\/admin/, { timeout: 15000 }); await espera(d, 1500);
  if (/accounts\.php/.test(d.url())) {
    const fc = d.locator('form', { has: d.locator('input[name=current_password]') });
    await fc.locator('[name=current_password]').fill(CLAVE1);
    await fc.locator('[name=password]').fill(CLAVE2); await fc.locator('[name=password_confirmation]').fill(CLAVE2);
    await fc.locator('button').click(); await espera(d, 1500);
  }
  await ir(d, '#/admin/dashboard', 2000);
  const ficha = d.locator('section', { has: d.locator('h2', { hasText: 'Mi ficha docente' }) }).first();
  await subirA(d, ficha, 100);
  await marcar(d, [[1, ficha.getByRole('link', { name: /Actualizar mi CV docente/ })], [2, ficha.getByRole('link', { name: /Ver en el portal/ })], [3, d.locator('.adm-side, aside nav, nav.side').first().getByText('CV Docente')]]);
  await foto(d, '07-11-docente-inicio');
  await ir(d, '#/admin/cvdocente', 2000);
  await marcar(d, [[1, d.locator('.pz-cvban')], [2, d.locator('.pz-cvcards')]]);
  await foto(d, '07-12-docente-mi-cv');

  // El docente agrega un curso de formación continua a su propio CV
  await alto(d, 1000);
  await ir(d, `#/admin/cvdocente/${pid}/continua`, 2000);
  await d.locator('[data-add="continua"]').click(); await espera(d, 700);
  const mc = d.locator('.modal-bg').last();
  await mc.locator('[name=curso]').fill('Diplomado en Sistemas Fotovoltaicos');
  await mc.locator('[name=institucion]').fill('Centro de Capacitación Técnica del Sur');
  await mc.locator('[name=tema]').fill('Energía solar');
  await mc.locator('[name=periodo]').fill('03/03/2025 - 30/06/2025');
  await mc.locator('[name=horas]').fill('120');
  await mc.locator('[data-s]').click(); await espera(d, 1800);
  await arriba(d);
  const pc = d.locator('.panel', { has: d.locator('[data-add="continua"]') });
  await marcar(d, [[1, pc.locator('tbody tr').first()], [2, d.locator('form[data-cvf]')]]);
  await foto(d, '07-13-docente-formacion-continua');
  await d.context().close();
});
