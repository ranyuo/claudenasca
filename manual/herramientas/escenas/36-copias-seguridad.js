const { BASE, espera, ir, marcar, foto, alto, subirA } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 36 · Copias de seguridad
// Crea un respaldo manual y prueba sus descargas. NUNCA ejecuta una restauración ni guarda la programación diaria:
// ambas afectarían a las capturas de los demás capítulos.
escena('36-respaldos', async ({ adm }) => {
  const p = adm;
  const seccion = t => p.locator('section', { has: p.locator('h2', { hasText: t }) });

  // 1. Acceso desde la intranet
  await alto(p, 850);
  await ir(p, '#/admin/respaldo');
  await marcar(p, [[1, p.getByRole('link', { name: /Administrar respaldos y restauración/ })]]);
  await foto(p, '36-01-intranet', { clip: { x: 0, y: 0, width: 1366, height: 260 } });

  // 2. Pantalla de respaldos
  await alto(p, 900);
  await p.goto(BASE + '/respaldos.php'); await espera(p, 900);
  await marcar(p, [[1, seccion('Crear y descargar')], [2, seccion('Restaurar una copia')], [3, seccion('Respaldos diarios')]]);
  await foto(p, '36-02-pantalla');

  // 3. Crear un respaldo completo
  await p.getByRole('button', { name: 'Crear respaldo completo' }).click(); await espera(p, 2500);
  const item = seccion('Crear y descargar').locator('li').first();
  await marcar(p, [[1, p.locator('.notice.success')], [2, p.getByRole('button', { name: 'Crear respaldo completo' })], [3, p.getByRole('button', { name: /Descargar también como SQL/ })],
    [4, item], [5, item.getByRole('link', { name: /Descargar copia portable/ })]]);
  await foto(p, '36-03-respaldo-creado', { clip: { x: 0, y: 0, width: 1366, height: 560 } });

  // Descargas (se comprueba el nombre del archivo; no se guarda)
  const [portable] = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), item.getByRole('link', { name: /Descargar copia portable/ }).click()]);
  console.log('  · Copia portable: ' + portable.suggestedFilename());
  await portable.cancel().catch(() => {});
  const [sql] = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), p.getByRole('button', { name: /Descargar también como SQL/ }).click()]);
  console.log('  · Copia SQL: ' + sql.suggestedFilename());
  await sql.cancel().catch(() => {});

  // 4. Formulario de restauración (solo se muestra; no se envía)
  await p.goto(BASE + '/respaldos.php'); await espera(p, 900);
  const rest = seccion('Restaurar una copia');
  await rest.locator('select[name=backup_id]').selectOption({ index: 1 });
  await subirA(p, rest, 20);
  await marcar(p, [[1, rest.locator('select[name=backup_id]').locator('xpath=..')], [2, rest.locator('input[type=file]').locator('xpath=..')], [3, rest.locator('input[name=password]').locator('xpath=..')],
    [4, rest.locator('input[name=confirmation]').locator('xpath=..')], [5, rest.getByRole('button', { name: /Restaurar contenido/ })]]);
  await foto(p, '36-04-restaurar');

  // 5. Respaldos diarios (solo se muestra; no se guarda)
  const diar = seccion('Respaldos diarios');
  await subirA(p, diar, 20);
  await marcar(p, [[1, diar.locator('input[name=enabled]').locator('xpath=..')], [2, diar.locator('input[name=hour]').locator('xpath=..')], [3, diar.locator('input[name=retention]').locator('xpath=..')],
    [4, diar.getByRole('button', { name: 'Guardar programación' })], [5, diar.locator('code')], [6, diar.getByRole('button', { name: /Ejecutar programación ahora/ })]]);
  await foto(p, '36-05-programacion');
});
