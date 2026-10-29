// Utilidades QA30 contra el sitio publicado. Credenciales por variables de entorno (QA30_PASS).
const { chromium } = require('playwright');
const fs = require('node:fs'); const path = require('node:path');
const BASE = process.env.QA30_BASE || 'https://nasca.aplicacion.io';
const EVID = path.join(__dirname, '../../evidencias/qa30');
const results = [];
function rec(fase, caso, estado, detalle = '') { results.push({ fase, caso, estado, detalle: String(detalle).slice(0, 400) }); console.log(`[${estado}] ${fase} · ${caso}${detalle ? ' — ' + String(detalle).slice(0, 200) : ''}`); }
function save(name) { fs.mkdirSync(EVID, { recursive: true }); fs.writeFileSync(path.join(EVID, name + '.json'), JSON.stringify(results, null, 1)); }
async function browser() { return chromium.launch(); }
async function login(b, user, pass, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...opts });
  const p = await ctx.newPage(); p._errors = [];
  p.on('pageerror', e => p._errors.push(e.message));
  await p.goto(BASE + '/#/admin', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('#lg-u', { timeout: 30000 });
  await p.fill('#lg-u', user); await p.fill('#lg-p', pass);
  await p.click('form button[type=submit]');
  try { await p.waitForFunction(() => location.hash.startsWith('#/admin/') && window.PORTAL_BOOTSTRAP?.user, null, { timeout: 25000 }); }
  catch { const msg = await p.locator('#lg-e').textContent().catch(() => ''); await ctx.close(); throw new Error('Login falló: ' + msg); }
  await p.waitForLoadState('domcontentloaded'); await p.waitForTimeout(1500);
  return { ctx, p };
}
async function shot(p, name) { await p.screenshot({ path: path.join(EVID, name + '.png') }).catch(() => {}); }
module.exports = { BASE, EVID, results, rec, save, browser, login, shot };
