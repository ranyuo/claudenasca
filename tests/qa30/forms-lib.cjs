const L = require('./lib.cjs');
async function open(b, hash, sel) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage();
  p._req = []; p.on('response', r => { if (/api%2F(solicitudes|archivos)/.test(r.url())) r.text().then(t => p._req.push(r.status() + ' ' + t.slice(0, 160))).catch(() => {}); });
  await p.goto(L.BASE + '/#' + hash, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForSelector(sel, { timeout: 30000 }); await p.waitForTimeout(800); return { ctx, p };
}
async function fill(p, sel, values, { captcha = true, wrongCaptcha = false } = {}) {
  const f = p.locator(sel);
  for (const [n, v] of Object.entries(values)) {
    const el = f.locator(`[name="${n}"]`); const c = await el.count(); if (!c) { console.log('  falta campo', n); continue; }
    if (!(await el.first().isVisible()) && (await el.first().getAttribute('type')) !== 'radio' && (await el.first().getAttribute('type')) !== 'checkbox' && (await el.first().getAttribute('type')) !== 'file') continue;
    const type = await el.first().getAttribute('type'); const tag = await el.first().evaluate(e => e.tagName);
    if (type === 'radio') await f.locator(`[name="${n}"][value="${v}"]`).check({ force: true });
    else if (type === 'checkbox') { if (v) await el.check({ force: true }); }
    else if (type === 'file') await el.setInputFiles(v);
    else if (tag === 'SELECT') await el.selectOption(v);
    else await el.fill(String(v));
  }
  if (captcha) { const q = await f.evaluate(form => (form.innerText.match(/Cuánto es\s*(\d+)\s*\+\s*(\d+)/) || []).slice(1).map(Number));
    await f.locator('[name=captcha]').fill(String(wrongCaptcha ? q[0] + q[1] + 1 : q[0] + q[1])); }
  await p.waitForTimeout(1500);
  await f.locator('button:not([type=button]):not([type=reset])').last().click(); await p.waitForTimeout(3500);
  const toast = (await p.locator('.toast, [role=alert], [role=status], .errmsg, .err').allInnerTexts()).join(' | ').replace(/\s+/g, ' ');
  const main = (await p.locator('main').innerText()).replace(/\s+/g, ' ');
  const code = (main.match(/\b(RCL|LR|MPV|EXP|MP)[-\s]?\d{4}[-\s]?\d{3,6}\b/) || [])[0] || '';
  return { toast, code, ok: p._req.some(r => r.startsWith('200') || r.startsWith('201')), req: p._req.slice(-2).join(' || ') };
}
module.exports = { open, fill };
