const fs = require('fs');
const os = require('os');
const path = require('path');
const { BASE, espera, ir, marcar, foto, alto, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Datos ficticios que reutilizan los capítulos 11, 16, 17 y 18.
const ALUMNOS = [
  { dni: '74125836', nom: 'Ccahua Palomino, Rosa Elena', periodo: '2025-I', ciclo: 'III', sec: 'A', turno: 'Mañana', estado: 'Regular', correo: 'rosa.ccahua@correo-demo.pe', tel: '956123478' },
  { dni: '73581426', nom: 'Taipe Molina, Kevin Arturo', periodo: '2025-I', ciclo: 'III', sec: 'A', turno: 'Mañana', estado: 'Regular', correo: '', tel: '' },
  { dni: '70946318', nom: 'Yupanqui Soto, Milagros Isabel', periodo: '2023-I', ciclo: 'VI', sec: 'A', turno: 'Mañana', estado: 'Egresado', correo: 'milagros.yupanqui@correo-demo.pe', tel: '987452163' },
];
const CLAVE_ALUMNA = 'RosaIca-2026#Clave';

// Elige en un <select> la primera opción cuyo texto contiene `texto`.
async function elegir(p, sel, texto) {
  const v = await p.locator(sel).evaluate((s, t) => { const o = [...s.options].find(o => o.textContent.includes(t)); return o ? o.value : null; }, texto);
  if (v === null) throw new Error(`Opción «${texto}» no encontrada en ${sel}`);
  await p.selectOption(sel, v);
}
async function llenarAlumno(p, a) {
  await p.fill('#f_dni', a.dni); await p.fill('#f_nom', a.nom); await elegir(p, '#f_prog', 'APSTI');
  await p.fill('#f_periodo', a.periodo); await p.selectOption('#f_ciclo', a.ciclo); await p.selectOption('#f_sec', a.sec);
  await p.selectOption('#f_turno', a.turno); await p.selectOption('#f_estado', a.estado); await p.fill('#f_correo', a.correo); await p.fill('#f_tel', a.tel);
}
const fila = (p, dni) => p.locator('#ix-root tbody tr', { hasText: dni });
const campo = (p, k) => p.locator(`#mform [data-fld="${k}"]`);

escena('10-maestro-alumnos', async ({ adm, ctx }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/ix-alumnos');

  // Formulario de registro (primer alumno)
  await p.locator('[data-new="estudiantes"]').click(); await espera(p, 700);
  await llenarAlumno(p, ALUMNOS[0]);
  await alto(p, 900);
  await marcar(p, [[1, campo(p, 'dni')], [2, campo(p, 'nom')], [3, campo(p, 'prog')], [4, campo(p, 'periodo')],
    [5, p.locator('#mform [data-fld="ciclo"], #mform [data-fld="sec"], #mform [data-fld="turno"]').first()], [6, campo(p, 'estado')],
    [7, campo(p, 'correo')], [8, p.locator('#mform button[type=submit]')]]);
  await foto(p, '10-02-formulario');
  await p.locator('#mform button[type=submit]').click(); await espera(p, 1500);

  // Resto de alumnos (si ya existen, se omiten)
  for (const a of ALUMNOS.slice(1)) {
    if (await fila(p, a.dni).count()) continue;
    await p.locator('[data-new="estudiantes"]').click(); await espera(p, 600);
    await llenarAlumno(p, a);
    await p.locator('#mform button[type=submit]').click(); await espera(p, 1500);
  }

  // Validaciones del formulario
  await p.locator('[data-new="estudiantes"]').click(); await espera(p, 600);
  await p.fill('#f_dni', ALUMNOS[1].dni); await p.fill('#f_tel', '98745'); await p.fill('#f_correo', 'kevin.taipe@correo');
  await espera(p, 2500);
  await p.locator('#mform button[type=submit]').click(); await espera(p, 600);
  await marcar(p, [[1, campo(p, 'dni')], [2, campo(p, 'nom')], [3, campo(p, 'correo')], [4, campo(p, 'tel')]]);
  await foto(p, '10-03-validacion');
  await p.keyboard.press('Escape'); await espera(p, 400);

  // Listado con datos
  await p.setViewportSize({ width: 1600, height: 850 });
  await ir(p, '#/admin/ix-alumnos');
  await marcar(p, [[1, p.locator('#ix-root .kpis')], [2, '#q_estudiantes'], [3, p.locator('[data-xls="estudiantes"]')], [4, p.locator('[data-new="estudiantes"]')],
    [5, fila(p, ALUMNOS[0].dni).locator('td').nth(5).locator('.pill')], [6, fila(p, ALUMNOS[0].dni).locator('[data-act="mkAcc"]')], [7, fila(p, ALUMNOS[0].dni).locator('td.act .btnrow')]]);
  await foto(p, '10-01-listado');

  // Crear acceso a la intranet
  await fila(p, ALUMNOS[0].dni).locator('[data-act="mkAcc"]').click(); await espera(p, 1500);
  const temporal = (await p.locator('#mform dd.mono').nth(1).innerText()).trim();
  await marcar(p, [[1, p.locator('#mform dl')], [2, p.locator('#mform .mb p.note')]]);
  await foto(p, '10-04-acceso-creado');
  await p.keyboard.press('Escape'); await espera(p, 400);
  await ir(p, '#/admin/ix-alumnos');
  await marcar(p, [[1, fila(p, ALUMNOS[0].dni).locator('td').nth(7)], [2, p.locator('#ix-root .kpi').nth(3)]]);
  await foto(p, '10-05-con-acceso');
  await alto(p, 850);

  // Editar: cambio de estado académico
  await fila(p, ALUMNOS[1].dni).locator('[data-edit]').click(); await espera(p, 700);
  await marcar(p, [[1, campo(p, 'estado')], [2, campo(p, 'ciclo')], [3, p.locator('#mform button[type=submit]')]]);
  await foto(p, '10-06-editar');
  await p.keyboard.press('Escape'); await espera(p, 400);

  // Primer ingreso de la alumna: cambio obligatorio de la contraseña temporal
  const e = await (await ctx()).newPage();
  await alto(e, 850);
  await ir(e, '#/admin', 1500);
  await e.fill('#lg-u', ALUMNOS[0].dni); await e.fill('#lg-p', temporal); await e.press('#lg-p', 'Enter');
  await e.waitForURL(/accounts\.php/, { timeout: 15000 }); await espera(e, 800);
  const f = e.locator('form', { has: e.locator('input[name=current_password]') });
  await f.locator('input[name=current_password]').fill(temporal);
  await f.locator('input[name=password]').fill(CLAVE_ALUMNA); await f.locator('input[name=password_confirmation]').fill(CLAVE_ALUMNA);
  await marcar(e, [[1, e.locator('.notice').first()], [2, f]]);
  await foto(e, '10-07-cambio-clave');
  await f.locator('button').click(); await e.waitForLoadState('load'); await espera(e, 800);
  await alto(e, 1080);
  await ir(e, '#/admin', 2000);
  await marcar(e, [[1, e.locator('#ix-root .kpis').first()], [2, e.locator('#ix-root .grid2 > *').first()], [3, e.locator('#ix-root .quick')]]);
  await foto(e, '10-08-panel-estudiante');
  await e.context().close();

  // Carga masiva desde Excel (Bolsa laboral › Padrón): solo vista previa, se descarta
  const csv = path.join(os.tmpdir(), 'padron_ejemplo_manual.csv');
  fs.writeFileSync(csv, '﻿DNI;Apellidos y Nombres;Condición;Fecha de Nacimiento;Correo;Domicilio;Celular;Programa de Estudio;Año de Egreso;Dónde labora;Área\n'
    + '71830264;Llamocca Ramos, Jhon Edison;Egresado;12/05/2001;jhon.llamocca@correo-demo.pe;Jr. Lima 245, Ica;912345670;APSTI;2024;Servicios Informáticos del Sur S.A.C.;Soporte técnico\n'
    + '72190357;Ormeño Cárdenas, Lucero Abigail;Por Concluir;03/09/2005;;;923456781;Contabilidad;;;\n'
    + '7219;Fila con error;Egresado;;;;;Contabilidad;2024;;\n');
  await alto(p, 1000);
  await ir(p, '#/admin/ix-bolsa/padron', 1500);
  await p.setInputFiles('#pd-f', csv); await espera(p, 1800);
  await arriba(p);
  await p.locator('[data-pdi]').scrollIntoViewIfNeeded(); await espera(p, 400);
  await p.evaluate(() => window.scrollBy(0, 200)); await espera(p, 400);
  await marcar(p, [[1, p.locator('#pd-f').locator('xpath=..')], [2, p.locator('.notice').filter({ hasText: 'fila(s)' })], [3, p.locator('tr.pz-bad').first()], [4, p.locator('[data-pdi]')]]);
  await foto(p, '10-09-padron');
  await p.locator('[data-pdx]').click(); await espera(p, 800);
  await alto(p, 850);
});
