// Utilidades compartidas por todas las escenas de captura del manual.
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:8080';
const USER = process.env.DEMO_USER || 'admin.ica';
const PASS = process.env.DEMO_PASS || 'DemoManual2026';
const OUT = path.resolve(process.env.IMG_DIR || path.join(__dirname, '..', 'img'));
fs.mkdirSync(OUT, { recursive: true });

const espera = (p, ms = 900) => p.waitForTimeout(ms);
// Se fuerza una recarga completa (?v=) para que la página lea los datos recién guardados.
async function ir(p, ruta, ms = 1300) { await p.goto(BASE + '/?v=' + Date.now() + ruta, { waitUntil: 'load' }); await espera(p, ms); }
async function limpiarMarcas(p) { await p.evaluate(() => document.querySelectorAll('.mnl-mark').forEach(e => e.remove())); }

// Dibuja recuadros numerados sobre los elementos indicados (coordenadas de la ventana).
async function marcar(p, marcas) {
  await limpiarMarcas(p);
  const cajas = [];
  for (const [n, loc] of marcas) {
    const l = typeof loc === 'string' ? p.locator(loc).first() : loc.first();
    const b = await l.boundingBox().catch(() => null);
    if (!b) { console.warn(`  ! marca ${n} no encontrada`); continue; }
    cajas.push({ n, ...b });
  }
  await p.evaluate(cajas => {
    for (const c of cajas) {
      const pad = 4;
      const box = document.createElement('div');
      box.className = 'mnl-mark';
      Object.assign(box.style, { position: 'fixed', left: (c.x - pad) + 'px', top: (c.y - pad) + 'px', width: (c.width + pad * 2) + 'px',
        height: (c.height + pad * 2) + 'px', border: '3px solid #e4002b', borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none',
        boxShadow: '0 0 0 2px rgba(255,255,255,.85)' });
      const num = document.createElement('div');
      num.className = 'mnl-mark';
      num.textContent = c.n;
      const left = Math.max(2, c.x - pad - 15), top = Math.max(2, c.y - pad - 15);
      Object.assign(num.style, { position: 'fixed', left: left + 'px', top: top + 'px', width: '30px', height: '30px', borderRadius: '50%',
        background: '#e4002b', color: '#fff', font: '700 16px/30px Inter, Arial, sans-serif', textAlign: 'center', zIndex: 2147483647,
        pointerEvents: 'none', boxShadow: '0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,.35)' });
      document.body.append(box, num);
    }
  }, cajas);
}

async function foto(p, id, opciones = {}) {
  const file = path.join(OUT, id + '.jpg');
  const tipo = { type: 'jpeg', quality: 78 };
  if (opciones.elemento) await p.locator(opciones.elemento).first().screenshot({ path: file, ...tipo });
  else await p.screenshot({ path: file, clip: opciones.clip, ...tipo });
  await limpiarMarcas(p);
  console.log('  ✓ ' + id);
}

async function entrar(p) {
  await ir(p, '#/admin', 1500);
  if (await p.locator('#lg-u').count()) {
    await p.fill('#lg-u', USER); await p.fill('#lg-p', PASS); await p.press('#lg-p', 'Enter');
    await p.getByText('Aprobaciones').first().waitFor({ timeout: 15000 }); await espera(p, 1500);
  }
}

async function alto(p, h) { await p.setViewportSize({ width: 1366, height: h }); await espera(p, 300); }
// Desplaza la página para que el elemento quede a `y` píxeles del borde superior (debajo del menú fijo).
async function subirA(p, loc, y = 120) {
  await loc.first().evaluate((e, y) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - y), y); await espera(p, 600);
}
async function arriba(p) { await p.evaluate(() => window.scrollTo(0, 0)); await espera(p, 300); }

async function captcha(form) {
  const q = await form.locator('.captcha b').innerText();
  return String(q.match(/\d+/g).map(Number).reduce((a, c) => a + c, 0));
}


module.exports = { BASE, USER, PASS, OUT, espera, ir, limpiarMarcas, marcar, foto, entrar, alto, subirA, arriba, captcha };
