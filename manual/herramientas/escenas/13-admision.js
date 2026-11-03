const { espera, ir, marcar, foto, alto, subirA, arriba, BASE } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// PDF ficticio generado con el propio navegador (no se guarda en el repositorio).
async function pdf(browser, nombre, titulo, lineas) {
  const pg = await browser.newPage();
  await pg.setContent(`<html><body style="font-family:Arial;padding:40px"><h2>IESTP “Ica”</h2><h3>${titulo}</h3>${lineas.map(l => `<p>${l}</p>`).join('')}<p style="color:#888">Documento ficticio de demostración.</p></body></html>`);
  const buffer = await pg.pdf({ format: 'A4' });
  await pg.close();
  return { name: nombre, mimeType: 'application/pdf', buffer };
}
async function filaNueva(p, campo, valores) {
  await p.locator(`[data-radd="${campo}"]`).click(); await espera(p, 500);
  const fila = p.locator(`[data-rows="${campo}"] tbody tr`).last();
  for (const [col, v] of Object.entries(valores)) await fila.locator(`[data-rc="${col}"]`).fill(v);
}
const toast = p => p.locator('.toast').last();

const SEC_USER = 'sec.admision', SEC_TMP = 'Temporal#Ica2026', SEC_PASS = 'Secretaria#Ica2026';

// 13 · Admisión
escena('13-admision', async ({ adm, pub, browser, ctx }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/admision');
  const fila26 = p.locator('main tbody tr').filter({ hasText: /Proceso vigente/ }).first();
  await marcar(p, [
    [1, p.getByRole('link', { name: /Nuevo proceso de admisión/ })],
    [2, 'form[data-lf]'],
    [3, fila26.locator('td').nth(3)],
    [4, fila26.locator('td').nth(4)],
    [5, fila26.locator('td').nth(5)],
    [6, fila26.locator('td').last()],
  ]);
  await foto(p, '13-01-listado');

  // Nuevo proceso: datos generales y documentos
  await p.getByRole('link', { name: /Nuevo proceso de admisión/ }).click(); await espera(p, 1300);
  await alto(p, 1250); await arriba(p);
  await p.fill('[name=anio]', '2027');
  await p.fill('[name=titulo]', 'Concurso de Admisión 2027');
  await p.fill('[name=subtitulo]', 'Inscripciones del 4 de enero al 26 de febrero de 2027');
  await p.fill('[name=descripcion]', 'Elige tu carrera técnica entre nuestros ocho programas de estudio. Revisa el prospecto, los requisitos y el cronograma antes de inscribirte.');
  await p.locator('[data-ff=prospecto]').setInputFiles(await pdf(browser, 'Prospecto-Admision-2027.pdf', 'Prospecto de Admisión 2027', ['Programas de estudio, vacantes y modalidades.']));
  await espera(p, 1800);
  await p.locator('[data-ff=reglamento]').setInputFiles(await pdf(browser, 'Reglamento-Admision-2027.pdf', 'Reglamento de Admisión 2027', ['Aprobado con Resolución Directoral N.º 045-2026-IESTP-ICA.']));
  await espera(p, 1800); await arriba(p);
  const campo = n => p.locator(`[data-f="${n}"]`);
  await marcar(p, [
    [1, campo('anio')], [2, campo('titulo')], [3, campo('subtitulo')], [4, campo('descripcion')],
    [5, campo('prospecto')], [6, campo('reglamento')],
    [7, p.locator('label[for=f_estado]').locator('xpath=..')], [8, campo('vigente')],
  ]);
  await foto(p, '13-02-formulario');

  // Resultados por programa y turno, y vacantes
  const res = p.locator('[data-custom=resultados]');
  const filaProg = t => res.locator('tbody tr', { hasText: t });
  await filaProg('Contabilidad').locator('input[data-rr]').first().setInputFiles(await pdf(browser, 'Resultados-Contabilidad-Manana.pdf', 'Resultados · Contabilidad · turno mañana', ['1. Quispe Ramos, Ana · Ingresó', '2. Torres Vega, Luis · Ingresó']));
  await espera(p, 1800);
  await filaProg('Contabilidad').locator('input[data-rr]').last().setInputFiles(await pdf(browser, 'Resultados-Contabilidad-Noche.pdf', 'Resultados · Contabilidad · segundo turno', ['1. Rojas Paredes, Julia · Ingresó']));
  await espera(p, 1800);
  await filaProg('Enfermería Técnica').locator('input[data-rr]').first().setInputFiles(await pdf(browser, 'Resultados-Enfermeria-Manana.pdf', 'Resultados · Enfermería Técnica · turno mañana', ['1. Flores Díaz, Carmen · Ingresó']));
  await espera(p, 1800);
  const vac = p.locator('[data-custom=vacantes]');
  for (const [prog, m, t] of [['Contabilidad', '20', '20'], ['Enfermería Técnica', '25', '15'], ['Guía Oficial de Turismo', '20', '']]) {
    const fv = vac.locator('tbody tr', { hasText: prog });
    await fv.locator('input').nth(0).fill(m); if (t) await fv.locator('input').nth(1).fill(t);
    await fv.locator('input').nth(3).fill(String(+m + (+t || 0)));
  }
  await alto(p, 1150);
  await subirA(p, campo('resultados'), 100);
  await marcar(p, [
    [1, res.locator('.notice')],
    [2, filaProg('Contabilidad').locator('td').nth(2)],
    [3, res.locator('thead th').nth(3)],
    [4, filaProg('Enfermería Técnica').locator('td').nth(3)],
    [5, vac.locator('tbody tr', { hasText: 'Contabilidad' })],
    [6, vac.locator('thead th').last()],
  ]);
  await foto(p, '13-03-resultados-vacantes');

  // Reemplazar un resultado (queda en el historial)
  await filaProg('Enfermería Técnica').locator('input[data-rr]').first().setInputFiles(await pdf(browser, 'Resultados-Enfermeria-Manana-v2.pdf', 'Resultados · Enfermería Técnica · turno mañana (rectificado)', ['1. Flores Díaz, Carmen · Ingresó', '2. Vargas León, Ana · Ingresó']));
  await espera(p, 800);
  await p.locator('.modal [data-r="1"]').last().click(); await espera(p, 2200);
  await alto(p, 1150);
  const hist = res.locator('details');
  await hist.locator('summary').click(); await espera(p, 400);
  await subirA(p, filaProg('Enfermería Técnica'), 200);
  await marcar(p, [[1, filaProg('Enfermería Técnica').locator('td').nth(2)], [2, hist]]);
  await foto(p, '13-04-historial-resultados');

  // Cronograma, requisitos y modalidades
  await filaNueva(p, 'cronograma', { actividad: 'Inscripción de postulantes', fecha: '04/01/2027 al 26/02/2027' });
  await filaNueva(p, 'cronograma', { actividad: 'Examen de admisión (modalidad ordinaria)', fecha: '07/03/2027' });
  await filaNueva(p, 'cronograma', { actividad: 'Publicación de resultados', fecha: '09/03/2027' });
  await filaNueva(p, 'cronograma', { actividad: 'Matrícula de ingresantes', fecha: '10/03/2027 al 19/03/2027' });
  await p.fill('[name=requisitos]', 'Certificado de estudios de educación secundaria\nCopia simple del DNI\nDos fotografías tamaño carné\nRecibo de pago por derecho de inscripción');
  await filaNueva(p, 'modalidades', { nombre: 'Ordinaria', detalle: 'Examen de conocimientos y aptitud vocacional.' });
  await filaNueva(p, 'modalidades', { nombre: 'Exoneración', detalle: 'Primeros puestos de secundaria, deportistas calificados y personas con discapacidad.' });
  await filaNueva(p, 'modalidades', { nombre: 'Centro de nivelación', detalle: 'Ingreso por orden de mérito al concluir el ciclo de nivelación.' });
  await alto(p, 1150);
  await subirA(p, campo('cronograma'), 100);
  await marcar(p, [
    [1, campo('cronograma').locator('tbody')],
    [2, p.locator('[data-radd=cronograma]')],
    [3, campo('cronograma').locator('tbody tr').first().locator('.row-acts')],
    [4, campo('requisitos')],
    [5, campo('modalidades')],
  ]);
  await foto(p, '13-05-cronograma-requisitos');

  // Un borrador no puede ser vigente
  await arriba(p);
  await p.selectOption('#f_estado', 'Borrador');
  await p.locator('[data-f=vigente] input').check();
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 900);
  await alto(p, 850); await arriba(p);
  const lado = p.locator('label[for=f_estado]').locator('xpath=../..');
  await marcar(p, [[1, '#f_estado'], [2, campo('vigente')]]);
  await foto(p, '13-06-error-vigente', { clip: { x: 900, y: 150, width: 466, height: 420 } });

  // Publicar como proceso vigente
  await p.selectOption('#f_estado', 'Publicado');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await ir(p, '#/admin/admision');
  const f27 = p.locator('main tbody tr', { hasText: 'Concurso de Admisión 2027' });
  const f26 = p.locator('main tbody tr').filter({ hasNotText: 'Concurso de Admisión 2027' }).first();
  await marcar(p, [[1, f27.locator('td').nth(2)], [2, f27.locator('td').nth(3)], [3, f27.locator('td').nth(4)], [4, f26.locator('td').nth(4)]]);
  await foto(p, '13-07-listado-vigente');

  // Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/admision', 2500);
  await subirA(q, q.locator('h1').first(), 260);
  await marcar(q, [
    [1, q.locator('h1').first()],
    [2, q.locator('[data-docx]').first().locator('xpath=..')],
    [3, q.locator('section', { hasText: 'Resultados por programa' }).locator('tbody tr', { hasText: 'Contabilidad' }).locator('td').last()],
    [4, q.locator('section', { hasText: 'Resultados por programa' }).locator('tbody tr', { hasText: 'Guía Oficial' }).locator('td').last()],
  ]);
  await foto(q, '13-08-web-admision');
  await alto(q, 1250);
  await subirA(q, q.locator('h2', { hasText: 'Cronograma' }), 110);
  await marcar(q, [
    [1, q.locator('section', { has: q.locator('h2', { hasText: 'Cronograma' }) })],
    [2, q.locator('section', { has: q.locator('h2', { hasText: 'Vacantes publicadas' }) }).locator('p').first()],
    [3, q.locator('section', { has: q.locator('h2', { hasText: 'Vacantes publicadas' }) }).locator('table')],
    [4, q.locator('section', { has: q.locator('h2', { hasText: /^Requisitos/ }) })],
    [5, q.locator('section', { has: q.locator('h2', { hasText: 'Modalidades' }) })],
    [6, q.locator('section', { has: q.locator('h2', { hasText: 'Costos' }) }).locator('h2')],
    [7, q.getByText(/Procesos anteriores:/)],
  ]);
  await foto(q, '13-09-web-detalle');

  // Flujo de aprobación: la Secretaría académica edita y el Administrador aprueba
  await alto(p, 850);
  await ir(p, '#/admin/usuarios');
  if (!(await p.locator('main tbody tr', { hasText: SEC_USER }).count())) {
    await ir(p, '#/admin/usuarios/nuevo');
    await p.fill('[name=usuario]', SEC_USER);
    await p.fill('[name=nombre]', 'Carmen Huamán Torres');
    await p.selectOption('[name=rol]', 'secretaria');
    await p.fill('[name=correo]', 'secretaria.academica@ica.aplicacion.io');
    await p.fill('[name=pass1]', SEC_TMP); await p.fill('[name=pass2]', SEC_TMP);
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  }
  const s = await (await ctx()).newPage();
  s.on('pageerror', e => console.warn('  ! error JS:', e.message));
  await ir(s, '#/admin', 1500);
  await s.fill('#lg-u', SEC_USER); await s.fill('#lg-p', SEC_TMP); await s.press('#lg-p', 'Enter'); await espera(s, 2500);
  if (/accounts\.php/.test(s.url())) {
    await s.fill('[name=current_password]', SEC_TMP); await s.fill('form:has([name=current_password]) [name=password]', SEC_PASS);
    await s.fill('form:has([name=current_password]) [name=password_confirmation]', SEC_PASS);
    await s.locator('form:has([name=current_password]) button').click(); await espera(s, 2000);
  } else if (await s.locator('#lg-u').count()) {
    await s.fill('#lg-u', SEC_USER); await s.fill('#lg-p', SEC_PASS); await s.press('#lg-p', 'Enter'); await espera(s, 2500);
  }
  await alto(s, 850);
  await ir(s, '#/admin/admision', 1500);
  await s.locator('main tbody tr', { hasText: 'Concurso de Admisión 2027' }).locator('[data-act=edit]').click(); await espera(s, 1300);
  await filaNueva(s, 'cronograma', { actividad: 'Entrega de constancias de ingreso', fecha: '22/03/2027' });
  await arriba(s);
  await marcar(s, [[1, s.getByText('Carmen Huamán Torres').first().locator('xpath=..')], [2, s.locator('label[for=f_estado]').locator('xpath=..').locator('.hint')]]);
  await foto(s, '13-10-secretaria-aprobacion');
  await s.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(s, 900);
  await marcar(s, [[1, toast(s)], [2, s.locator('main tbody tr', { hasText: 'Concurso de Admisión 2027' }).locator('td').nth(5)]]);
  await foto(s, '13-11-en-revision');
  await espera(s, 1500);

  // El Administrador revisa y aprueba
  await ir(p, '#/admin/aprobaciones', 1500);
  const pend = p.locator('main tbody tr', { hasText: 'Admisión 2027' });
  await marcar(p, [[1, p.locator('a[href="#/admin/aprobaciones"]').first()], [2, pend.locator('td').nth(2)], [3, pend.locator('[data-act=preview]')],
    [4, pend.getByRole('button', { name: /Aprobar y publicar/ })], [5, pend.getByRole('button', { name: /Devolver/ })]]);
  await foto(p, '13-12-aprobaciones');
  await pend.getByRole('button', { name: /Aprobar y publicar/ }).click(); await espera(p, 700);
  await p.locator('.modal [data-r="1"]').last().click(); await espera(p, 2000);
  await s.context().close();
});
