const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

const csv = (nombre, filas) => ({ name: nombre, mimeType: 'text/csv', buffer: Buffer.from('﻿' + filas.map(f => f.join(';')).join('\r\n') + '\r\n', 'utf8') });
const CAB = ['dni', 'apellidos', 'nombres', 'codigo_programa', 'tipo_beca', 'motivo'];
const TIPO = 'Beca socioeconómica';

// 15 · Becas
escena('15-becas', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/becas');
  await marcar(p, [
    [1, p.locator('main [role=tablist], main .tabs').first()],
    [2, p.locator('[data-csv]')],
    [3, p.getByRole('link', { name: /Nuevo beneficiario/ })],
    [4, 'form[data-lf]'],
    [5, p.locator('main tbody tr').first().locator('td').nth(1)],
    [6, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '15-01-beneficiarios');

  // Periodo de becas 2026-II
  await ir(p, '#/admin/becasper/nuevo');
  const campo = n => p.locator(`[data-f="${n}"]`);
  await p.fill('[name=anio]', '2026');
  await p.selectOption('[name=periodo]', 'II');
  await p.locator('[data-f=vigente] input').check();
  await p.selectOption('#f_estado', 'Publicado');
  await marcar(p, [[1, campo('anio')], [2, campo('periodo')], [3, campo('vigente')], [4, p.locator('main .notice').first()], [5, '#f_estado']]);
  await foto(p, '15-02-periodo');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await ir(p, '#/admin/becasper');
  const per = p.locator('main tbody tr', { hasText: 'II' }).filter({ hasText: '2026' }).first();
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo periodo/ })], [2, per.locator('td').nth(2)], [3, per.locator('td').nth(3)], [4, per.locator('td').nth(4)]]);
  await foto(p, '15-03-periodos');

  // Tipo de beca
  await ir(p, '#/admin/becastipos/nuevo');
  await p.fill('[name=nombre]', TIPO);
  await p.fill('[name=descripcion]', 'Estudiantes en situación económica vulnerable acreditada con informe de Bienestar Estudiantil. Exoneración del 50 % de la matrícula.');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  await ir(p, '#/admin/becastipos');
  const tipo = p.locator('main tbody tr', { hasText: TIPO });
  await marcar(p, [[1, p.getByRole('link', { name: /Nuevo tipo de beca/ })], [2, tipo.locator('td').nth(1)], [3, tipo.locator('td').nth(2)], [4, tipo.locator('td').nth(3)]]);
  await foto(p, '15-04-tipos');

  // Beneficiario registrado a mano
  await ir(p, '#/admin/becas/nuevo');
  await p.selectOption('[name=periodoId]', { label: '2026 - II' });
  await p.fill('[name=dni]', '72458193');
  await p.fill('[name=apellidos]', 'Mendoza Quispe');
  await p.fill('[name=nombres]', 'Luz Marina');
  await p.selectOption('[name=programaId]', { label: 'Enfermería Técnica' });
  await p.selectOption('[name=tipoId]', { label: TIPO });
  await p.fill('[name=motivo]', 'Informe socioeconómico favorable · semestre III');
  await marcar(p, [[1, campo('periodoId')], [2, campo('dni')], [3, campo('apellidos')], [4, campo('programaId')], [5, campo('tipoId')], [6, campo('motivo')], [7, '#f_estado']]);
  await foto(p, '15-05-formulario');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);

  // Importación con errores
  await alto(p, 1000);
  await ir(p, '#/admin/becasimport');
  await p.selectOption('#im-p', { label: '2026 - II' });
  await p.locator('#im-f').setInputFiles(csv('becarios-2026-II.csv', [CAB,
    ['74125896', 'Huamán Torres', 'Ana Lucía', 'CONT', 'Exoneración 100 %', 'Primer puesto semestre I'],
    ['70369258', 'Salazar Núñez', 'Jorge Luis', 'APSTI', 'Exoneración 50 %', 'Segundo puesto semestre I'],
    ['7158964', 'Rojas Paredes', 'Elena', 'GOT', 'Exoneración 100 %', 'Primer puesto semestre III'],
    ['71234560', 'Vargas León', 'Miguel', 'MECA', 'Exoneración 50 %', 'Segundo puesto semestre III'],
    ['72458193', 'Mendoza Quispe', 'Luz Marina', 'ENF', TIPO, 'Registrada a mano'],
  ]));
  await espera(p, 1200);
  await subirA(p, p.locator('#im-p'), 120);
  await marcar(p, [[1, p.locator('#im-p').locator('xpath=..')], [2, p.locator('#im-f').locator('xpath=..')], [3, p.locator('#im-r .kpis')], [4, p.locator('#im-r tbody tr', { hasText: '7158964' })], [5, p.locator('#im-r .notice.err')]]);
  await foto(p, '15-06-importar-errores');

  // Archivo corregido
  await ir(p, '#/admin/becasimport');
  await p.selectOption('#im-p', { label: '2026 - II' });
  await p.locator('#im-f').setInputFiles(csv('becarios-2026-II-corregido.csv', [CAB,
    ['74125896', 'Huamán Torres', 'Ana Lucía', 'CONT', 'Exoneración 100 %', 'Primer puesto semestre I'],
    ['70369258', 'Salazar Núñez', 'Jorge Luis', 'APSTI', 'Exoneración 50 %', 'Segundo puesto semestre I'],
    ['71589642', 'Rojas Paredes', 'Elena', 'GOT', 'Exoneración 100 %', 'Primer puesto semestre III'],
    ['71234560', 'Vargas León', 'Miguel', 'MA', 'Exoneración 50 %', 'Segundo puesto semestre III'],
    ['72458193', 'Mendoza Quispe', 'Luz Marina', 'ENF', TIPO, 'Registrada a mano'],
  ]));
  await espera(p, 1200);
  await subirA(p, p.locator('#im-r .kpis'), 120);
  await marcar(p, [[1, p.locator('#im-r .kpis')], [2, p.locator('#im-r tbody tr', { hasText: '72458193' })], [3, p.locator('[data-doimp]')]]);
  await foto(p, '15-07-importar-validado');
  await p.locator('[data-doimp]').click(); await espera(p, 2000);
  await alto(p, 850);
  await marcar(p, [[1, p.locator('.modal').last()]]);
  await foto(p, '15-08-importacion-finalizada');
  await p.keyboard.press('Escape'); await espera(p, 400);

  // Reportes
  await ir(p, '#/admin/becasrep');
  await marcar(p, [[1, p.locator('main .chips')], [2, p.locator('main .kpi').first()], [3, p.locator('main .panel', { hasText: 'Por programa' })], [4, p.locator('main .panel', { hasText: 'Por tipo de beca' })], [5, p.locator('[data-rcsv]')]]);
  await foto(p, '15-09-reportes');

  // Portal público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/becas', 2500);
  await subirA(q, q.locator('form[data-bf]'), 150);
  await marcar(q, [[1, q.locator('form[data-bf]')], [2, q.locator('#bres [role=status]').first()], [3, q.locator('[data-pdf]')], [4, q.locator('#bres tbody tr').first()]]);
  await foto(q, '15-10-web-becas');
  await q.fill('#bf-s', '72458193');
  await q.locator('form[data-bf]').getByRole('button', { name: /Buscar/ }).click(); await espera(q, 1500);
  await subirA(q, q.locator('form[data-bf]'), 150);
  await marcar(q, [[1, '#bf-s'], [2, q.locator('#bres tbody tr').first()], [3, q.locator('h2', { hasText: 'Tipos de beca y requisitos' }).locator('xpath=..')]]);
  await foto(q, '15-11-web-dni');
});
