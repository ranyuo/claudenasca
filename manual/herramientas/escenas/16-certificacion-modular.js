const { espera, ir, marcar, foto, alto, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Usa los alumnos del capítulo 10: Milagros (egresada, 70946318) y Rosa (regular, 74125836, con cuenta).
const CLAVE_ALUMNA = 'RosaIca-2026#Clave';
const MODULOS = [
  { cod: 'MF1', nombre: 'Soporte técnico y mantenimiento de equipos informáticos', ciclos: 'I – II' },
  { cod: 'MF2', nombre: 'Desarrollo de aplicaciones y servicios web', ciclos: 'III – IV' },
  { cod: 'MF3', nombre: 'Gestión de plataformas y servicios de TI', ciclos: 'V – VI' },
];
const CERTS = [
  ['70946318', 'MF1', '2024-07-15'], ['70946318', 'MF2', '2025-07-14'], ['70946318', 'MF3', '2025-12-19'], ['74125836', 'MF1', '2025-12-19'],
];
const NOTAS = [
  ['74125836', 'Fundamentos de programación', '2025-II', 16], ['74125836', 'Ofimática empresarial', '2025-II', 15], ['74125836', 'Arquitectura de computadoras', '2025-II', 12],
];

async function elegir(p, sel, texto) {
  const v = await p.locator(sel).evaluate((s, t) => { const o = [...s.options].find(o => o.textContent.includes(t)); return o ? o.value : null; }, texto);
  if (v === null) throw new Error(`Opción «${texto}» no encontrada en ${sel}`);
  await p.selectOption(sel, v);
}

// El logo de documentos de la semilla no corresponde a la institución de ejemplo: durante la escena se usa el
// logo del portal (subido desde Configuración académica) y al final se restaura el valor original.
async function logoIca(p) {
  await ir(p, '#/admin/ix-config'); await p.locator('[data-tab="config:documentos"]').click(); await espera(p, 600);
  const orig = await p.evaluate(() => (IX.db().cfg.docs || {}).logoIzq || null);
  const svg = await p.evaluate(() => { const i = document.querySelector('img[src^="data:image/svg"]'); return i ? decodeURIComponent(i.src.split(',').slice(1).join(',')) : ''; });
  if (!svg) return { orig, cambiado: false };
  const f = require('path').join(require('os').tmpdir(), 'logo-ica-manual.svg'); require('fs').writeFileSync(f, svg);
  await p.setInputFiles('#dc_logoIzq', f); await espera(p, 2000);
  return { orig, cambiado: true };
}
async function restaurarLogo(p, l) { if (l.cambiado) await p.evaluate(o => { IX.db().cfg.docs.logoIzq = o; return IX.persist(); }, l.orig); }
const campo = (p, k) => p.locator(`#mform [data-fld="${k}"]`);
const enviar = async p => { await p.locator('#mform button[type=submit]').click(); await espera(p, 1500); };
const pestana = async (p, k) => { await ir(p, '#/admin/ix-certificados'); await p.locator(`[data-tab="certificados:${k}"]`).click(); await espera(p, 700); };
async function ingresar(ctx, usuario, clave) {
  const e = await (await ctx()).newPage();
  await ir(e, '#/admin', 1500);
  await e.fill('#lg-u', usuario); await e.fill('#lg-p', clave); await e.press('#lg-p', 'Enter');
  await e.waitForURL(/#\/admin/, { timeout: 15000 }); await espera(e, 1500);
  return e;
}

escena('16-certificacion-modular', async ({ adm, ctx }) => {
  const p = adm;
  await alto(p, 850);

  // 1. Módulos formativos del programa
  await pestana(p, 'modulos');
  for (const [i, m] of MODULOS.entries()) {
    if (await p.locator('#ix-root tbody tr', { hasText: m.nombre }).count()) continue;
    await p.locator('[data-new="modulos"]').click(); await espera(p, 600);
    await elegir(p, '#f_prog', 'APSTI'); await p.fill('#f_cod', m.cod); await p.fill('#f_nombre', m.nombre); await p.fill('#f_ciclos', m.ciclos);
    if (i === 0) {
      await marcar(p, [[1, campo(p, 'prog')], [2, campo(p, 'cod')], [3, campo(p, 'nombre')], [4, campo(p, 'ciclos')]]);
      await foto(p, '16-02-modulo');
    }
    await enviar(p);
  }
  await espera(p, 3000);
  await marcar(p, [[1, p.locator('#ix-root .pz-dnav')], [2, p.locator('#ix-root [role=tablist]')], [3, p.locator('#ix-root tbody tr').first()], [4, p.locator('[data-new="modulos"]')]]);
  await foto(p, '16-01-modulos');

  // 2. Certificaciones
  await pestana(p, 'certs');
  for (const [i, [dni, mod, fecha]] of CERTS.entries()) {
    await p.locator('[data-new="certs"]').click(); await espera(p, 600);
    await elegir(p, '#f_est', dni); await elegir(p, '#f_mod', 'APSTI-' + mod); await p.fill('#f_fecha', fecha);
    if (i === 0) {
      await marcar(p, [[1, campo(p, 'est')], [2, campo(p, 'mod')], [3, campo(p, 'fecha')], [4, campo(p, 'num')], [5, p.locator('#mform button[type=submit]')]]);
      await foto(p, '16-03-certificacion');
    }
    await enviar(p);
  }
  // Duplicado: el mismo módulo para la misma estudiante
  await p.locator('[data-new="certs"]').click(); await espera(p, 600);
  await elegir(p, '#f_est', CERTS[0][0]); await elegir(p, '#f_mod', 'APSTI-MF1');
  await p.locator('#mform button[type=submit]').click(); await espera(p, 600);
  await marcar(p, [[1, campo(p, 'mod')]]);
  await foto(p, '16-04-duplicado');
  await p.keyboard.press('Escape'); await espera(p, 3000);
  await marcar(p, [[1, p.locator('#ix-root tbody tr').first().locator('td').first()], [2, p.locator('#ix-root tbody tr').first().locator('td').nth(4)], [3, p.locator('[data-xls="certs"]')], [4, p.locator('[data-new="certs"]')]]);
  await foto(p, '16-05-certificaciones');

  // 3. Historial académico (notas)
  await pestana(p, 'notas');
  for (const [i, [dni, ud, per, nota]] of NOTAS.entries()) {
    await p.locator('[data-new="notas"]').click(); await espera(p, 600);
    await elegir(p, '#f_est', dni); await p.fill('#f_ud', ud); await p.fill('#f_periodo', per); await p.fill('#f_nota', String(nota));
    if (i === 0) {
      await marcar(p, [[1, campo(p, 'est')], [2, campo(p, 'ud')], [3, campo(p, 'periodo')], [4, campo(p, 'nota')]]);
      await foto(p, '16-06-nota');
    }
    await enviar(p);
  }

  // 4. Consulta y constancia
  const logo = await logoIca(p);
  await pestana(p, 'consulta');
  await alto(p, 1500);
  await p.fill('#cq', '70946318'); await p.locator('[data-form="cq"] button').click(); await espera(p, 900);
  await marcar(p, [[1, p.locator('[data-form="cq"]')], [2, p.locator('#ix-root .ficha dl').first()], [3, p.locator('#ix-root .ficha table').first()], [4, p.locator('[data-act="docCert"]')], [5, p.locator('[data-act="newCertFor"]')], [6, p.locator('#ix-root .ficha').nth(1)]]);
  await foto(p, '16-07-consulta');
  await p.locator('[data-act="docCert"]').click(); await espera(p, 1500);
  await alto(p, 1250);
  await marcar(p, [[1, p.locator('#mform .paper table')], [2, p.locator('#mform .pf')], [3, p.locator('#mform [data-act="pdfCert"]')]]);
  await foto(p, '16-08-constancia');
  await p.keyboard.press('Escape'); await espera(p, 400);
  await restaurarLogo(p, logo);

  // 5. Reportes
  await alto(p, 900);
  await pestana(p, 'reportes');
  await marcar(p, [[1, p.locator('#ix-root .kpis')], [2, p.locator('[data-act="repCertXLS"]')]]);
  await foto(p, '16-09-reportes');

  // 6. Integridad: no se elimina un alumno con certificaciones
  await alto(p, 850);
  await ir(p, '#/admin/ix-alumnos');
  await p.locator('#ix-root tbody tr', { hasText: '70946318' }).locator('[data-del]').click(); await espera(p, 700);
  await marcar(p, [[1, p.locator('#mform .alert')]]);
  await foto(p, '16-10-no-eliminar');
  await p.keyboard.press('Escape'); await espera(p, 400);

  // 7. Lo que ve la estudiante
  const e = await ingresar(ctx, '74125836', CLAVE_ALUMNA);
  await alto(e, 1000);
  await ir(e, '#/admin/ix-certificados', 1800);
  await marcar(e, [[1, e.locator('#ix-root .ficha dl').first()], [2, e.locator('#ix-root .ficha table').first()], [3, e.locator('[data-act="docCert"]')], [4, e.locator('#ix-root .ficha').nth(1)]]);
  await foto(e, '16-11-vista-estudiante');
  await e.context().close();
});
