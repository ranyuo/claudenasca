const fs = require('fs');
const os = require('os');
const path = require('path');
const { espera, ir, marcar, foto, alto, arriba } = require('../lib');

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
  // Logo izquierdo: se sube el logo del portal (la semilla trae otro); al final se restaura el original.
  const logoOrig = await p.evaluate(() => (IX.db().cfg.docs || {}).logoIzq || null);
  const svg = await p.evaluate(() => { const i = document.querySelector('img[src^="data:image/svg"]'); return i ? decodeURIComponent(i.src.split(',').slice(1).join(',')) : ''; });
  if (svg) { const f = path.join(os.tmpdir(), 'logo-ica-manual.svg'); fs.writeFileSync(f, svg); await p.setInputFiles('#dc_logoIzq', f); await espera(p, 2000); }
  await p.fill('#dc_lema', 'Año de la Esperanza y el Fortalecimiento de la Educación');
  await p.fill('#dc_fn', 'Lic. Teresa Huamaní Cabrera'); await p.fill('#dc_fc', 'Directora General');
  await p.fill('#dc_pie', 'Av. Los Maestros 245, Ica · secretaria@ica.aplicacion.io · Telf. (056) 214578');
  await p.locator('form[data-form="docsCfg"] button[type=submit]').click(); await espera(p, 6000);
  await alto(p, 1800); await arriba(p);
  const panel = t => p.locator('#ix-root .panel').filter({ has: p.locator('h2', { hasText: new RegExp('^' + t + '$') }) }).first();
  await marcar(p, [[1, panel('Logotipos')], [2, panel('Encabezado')], [3, panel('Firma')], [4, panel('Pie de página')],
    [5, p.locator('form[data-form="docsCfg"] .btnrow').last()], [6, p.locator('#ix-root .ap-preview')]]);
  await foto(p, '32-03-documentos');

  // Restaurar los textos originales
  await p.fill('#dc_sub', orig.sub); await p.fill('#dc_lema', orig.lema); await p.fill('#dc_fn', orig.firmaNom); await p.fill('#dc_fc', orig.firmaCargo); await p.fill('#dc_pie', orig.pie);
  if ((await p.isChecked('#dc_firma')) !== orig.firma) await p.click('#dc_firma');
  await p.locator('form[data-form="docsCfg"] button[type=submit]').click(); await espera(p, 1500);
  if (svg) await p.evaluate(o => { IX.db().cfg.docs.logoIzq = o; return IX.persist(); }, logoOrig);
  await alto(p, 850);
});
