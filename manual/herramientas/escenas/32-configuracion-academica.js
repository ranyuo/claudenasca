const { espera, ir, marcar, foto, alto } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// 32 · Configuración académica. No se cambia el periodo; los textos de documentos se restauran al final.
escena('32-configuracion-academica', async ({ adm }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/ix-config');
  await marcar(p, [[1, p.locator('#ix-root [role=tablist]')], [2, '#f_periodo'], [3, p.locator('#ix-root form[data-form="cfg"] button')]]);
  await foto(p, '32-01-periodo');

  // Formato inválido del periodo (no se guarda)
  const antes = await p.inputValue('#f_periodo');
  await p.fill('#f_periodo', '2027-1'); await p.locator('#ix-root form[data-form="cfg"] button').click(); await espera(p, 500);
  await marcar(p, [[1, p.locator('#ix-root [data-fld="periodo"]')]]);
  await foto(p, '32-02-periodo-error');
  await p.fill('#f_periodo', antes);

  // Constancias y reportes
  await ir(p, '#/admin/ix-config');
  await p.locator('[data-tab="config:documentos"]').click(); await espera(p, 800);
  const orig = await p.evaluate(() => { const d = IX.db().cfg.docs || {}; return { sub: d.sub || '', lema: d.lema || '', firma: d.firma !== false, firmaNom: d.firmaNom || '', firmaCargo: d.firmaCargo || 'Director(a) General', pie: d.pie || '' }; });
  await p.fill('#dc_lema', 'Año de la Esperanza y el Fortalecimiento de la Educación');
  await p.fill('#dc_fn', 'Lic. Teresa Huamaní Cabrera'); await p.fill('#dc_fc', 'Directora General');
  await p.fill('#dc_pie', 'Av. Los Maestros 245, Ica · secretaria@ica.aplicacion.io · Telf. (056) 214578');
  await p.locator('form[data-form="docsCfg"] button[type=submit]').click(); await espera(p, 1800);
  await alto(p, 1500);
  await marcar(p, [[1, p.locator('#ix-root .panel', { hasText: 'Logotipos' }).first()], [2, p.locator('#ix-root .panel', { hasText: 'Encabezado' }).first()],
    [3, p.locator('#ix-root .panel', { hasText: 'Mostrar firma' }).first()], [4, p.locator('#ix-root .panel', { hasText: 'Pie de página' }).first()],
    [5, p.locator('form[data-form="docsCfg"] .btnrow').last()], [6, p.locator('#ix-root .ap-preview')]]);
  await foto(p, '32-03-documentos');

  // Restaurar los textos originales
  await p.fill('#dc_sub', orig.sub); await p.fill('#dc_lema', orig.lema); await p.fill('#dc_fn', orig.firmaNom); await p.fill('#dc_fc', orig.firmaCargo); await p.fill('#dc_pie', orig.pie);
  if ((await p.isChecked('#dc_firma')) !== orig.firma) await p.click('#dc_firma');
  await p.locator('form[data-form="docsCfg"] button[type=submit]').click(); await espera(p, 1500);
  await alto(p, 850);
});
