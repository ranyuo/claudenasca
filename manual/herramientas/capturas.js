// Genera las capturas del manual sobre una instalación LOCAL de prueba con datos ficticios (IESTP “Ica”).
// Uso: BASE=http://127.0.0.1:8080 node capturas.js [prefijo]
//   prefijo opcional: solo ejecuta las escenas cuyo id empieza así (p. ej. "26-").
// Cada capítulo tiene su archivo en escenas/NN-nombre.js, que exporta [{ id, fn }].
// Nunca ejecutar contra un portal de producción: el guion crea y modifica registros.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { BASE, OUT, entrar } = require('./lib');
const SOLO = process.argv[2] || '';

if (!/127\.0\.0\.1|localhost/i.test(BASE)) {
  console.error('BASE no es una instalación local. Abortado.');
  process.exit(1);
}

const ESCENAS = fs.readdirSync(path.join(__dirname, 'escenas')).filter(f => f.endsWith('.js')).sort()
  .flatMap(f => require('./escenas/' + f));

(async () => {
  const b = await chromium.launch();
  const ctx = o => b.newContext({ viewport: { width: 1366, height: 850 }, deviceScaleFactor: 1.5, locale: 'es-PE', timezoneId: 'America/Lima', acceptDownloads: true, ...o });
  const adm = await (await ctx()).newPage();
  const pub = await (await ctx()).newPage();
  for (const pg of [adm, pub]) pg.on('pageerror', e => console.warn('  ! error JS:', e.message));
  await entrar(adm);
  let fallos = 0;
  for (const e of ESCENAS) {
    if (SOLO && !e.id.startsWith(SOLO)) continue;
    console.log('▶ ' + e.id);
    try { await e.fn({ adm, pub, browser: b, ctx }); }
    catch (err) { fallos++; console.error('  ✗ ' + e.id + ': ' + err.message.split('\n')[0]); await adm.screenshot({ path: path.join(OUT, '_error-' + e.id + '.jpg'), type: 'jpeg' }).catch(() => {}); await pub.screenshot({ path: path.join(OUT, '_error-pub-' + e.id + '.jpg'), type: 'jpeg' }).catch(() => {}); }
  }
  await b.close();
  process.exit(fallos ? 1 : 0);
})();
