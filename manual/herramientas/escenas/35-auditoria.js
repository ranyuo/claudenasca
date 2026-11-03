const { BASE, espera, ir, marcar, foto, alto, subirA } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 35 · Auditoría
// Genera un intento de acceso fallido (con un usuario que no existe) para que el filtro tenga resultados.
escena('35-auditoria', async ({ adm, ctx }) => {
  const p = adm;
  const c = await ctx(); const q = await c.newPage();
  await ir(q, '#/admin', 1500);
  await q.fill('#lg-u', 'usuario.inexistente'); await q.fill('#lg-p', 'ClaveDePrueba2026'); await q.press('#lg-p', 'Enter'); await espera(q, 1500);
  await c.close();

  // 1. Auditoría dentro de la intranet
  await alto(p, 950);
  await ir(p, '#/admin/auditoria');
  await marcar(p, [[1, p.getByRole('link', { name: /Consultar y exportar el historial completo/ })], [2, p.locator('[data-acsv]')], [3, p.locator('form[data-af]')],
    [4, p.locator('main table thead').first()], [5, p.locator('main .panel .pb').last()]]);
  await foto(p, '35-01-auditoria');

  // 2. Filtro por módulo «Cuentas»
  await p.selectOption('#af-entidad', 'Cuentas');
  await p.fill('#af-q', 'Intento');
  await p.locator('form[data-af]').getByRole('button', { name: 'Filtrar' }).click(); await espera(p, 900);
  await marcar(p, [[1, '#af-q'], [2, '#af-entidad'], [3, p.locator('main tbody tr', { hasText: 'usuario.inexistente' }).first()]]);
  await foto(p, '35-02-filtro', { clip: { x: 0, y: 0, width: 1366, height: 640 } });

  // 3. Historial completo (auditoria.php)
  await alto(p, 900);
  await p.goto(BASE + '/auditoria.php'); await espera(p, 900);
  await marcar(p, [[1, p.locator('form').first()], [2, p.getByText(/registros\. Página/).first()], [3, p.getByRole('link', { name: /Exportar todos los resultados a CSV/ })],
    [4, p.locator('table thead')]]);
  await foto(p, '35-03-historial-completo');

  // 4. Búsqueda de intentos fallidos y exportación
  await p.fill('input[name=q]', 'Intento de acceso fallido');
  await p.getByRole('button', { name: 'Filtrar historial' }).click(); await espera(p, 900);
  await marcar(p, [[1, 'input[name=q]'], [2, p.locator('tbody tr').first()]]);
  await foto(p, '35-04-intentos-fallidos', { clip: { x: 0, y: 0, width: 1366, height: 620 } });
  const [descarga] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.getByRole('link', { name: /Exportar todos los resultados a CSV/ }).click()]);
  console.log('  · CSV exportado: ' + descarga.suggestedFilename());
  await descarga.cancel().catch(() => {});
});
