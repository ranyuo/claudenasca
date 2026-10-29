// Fase B: módulos académicos (ix-*). Crea 5 registros por entidad desde el formulario modal real,
// edita 1 y elimina 1 (el último). Llenado genérico según el tipo de cada campo.
const L = require('./lib.cjs'); const fs = require('node:fs');
const PLAN = [
  ['estudiantes', '/admin/ix-alumnos', null], ['titulos', '/admin/ix-titulos', null],
  ['modulos', '/admin/ix-certificados', 'Módulos formativos'], ['certs', '/admin/ix-certificados', 'Certificaciones'], ['notas', '/admin/ix-certificados', 'Historial académico'],
  ['empresas', '/admin/ix-bolsa', null], ['ofertas', '/admin/ix-bolsa', null],
  ['uds', '/admin/ix-horarios', 'Configuración'], ['ambientes', '/admin/ix-horarios', 'Configuración'], ['docentes', '/admin/ix-horarios', 'Configuración'],
  ['areas', '/admin/ix-config', null], ['tramites', '/admin/ix-config', null],
];
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
async function goTo(p, route, tab, ek) {
  await p.evaluate(h => { location.hash = h; }, route); await p.waitForTimeout(1500);
  if (tab) { const t = p.locator('main button, main a, main [role=tab]').filter({ hasText: new RegExp('^\\s*' + tab) }); if (await t.count()) { await t.first().click(); await p.waitForTimeout(1000); } }
  if (!(await p.locator(`[data-new="${ek}"]`).count())) { // buscar en otras pestañas
    for (const t of await p.$$eval('main .tabs button, main [role=tab], main .seg button', b => b.map(x => x.innerText.trim()).filter(Boolean))) {
      await p.locator('main .tabs button, main [role=tab], main .seg button').filter({ hasText: t }).first().click().catch(() => {}); await p.waitForTimeout(800);
      if (await p.locator(`[data-new="${ek}"]`).count()) return true; } return false; }
  return true;
}
async function fillModal(p, ek, i, sfx) {
  const m = p.locator('.modal:visible, dialog[open], [role=dialog]:visible').last();
  const fields = await m.locator('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([readonly]):not([disabled]), select:not([disabled]), textarea:not([disabled])').all();
  for (const f of fields) {
    if (!(await f.isVisible())) continue;
    const info = await f.evaluate(e => ({ tag: e.tagName, type: e.type, name: (e.name || e.id || '').toLowerCase(), label: (e.closest('.fld')?.querySelector('label')?.innerText || '').toLowerCase(), min: e.min, max: e.max, ml: e.maxLength, pattern: e.pattern, val: e.value, opts: e.tagName === 'SELECT' ? [...e.options].map(o => [o.value, o.text]) : null }));
    const k = info.name + ' ' + info.label;
    if (info.tag === 'SELECT') { const opts = info.opts.filter(([v]) => v !== ''); if (!opts.length) continue; const qas = opts.filter(([, t]) => /QA30/.test(t)); const qa = qas.length ? qas[(i - 1) % qas.length] : null; if (!info.val || qa) await f.selectOption(qa ? qa[0] : opts[Math.min(i - 1, opts.length - 1)][0]); continue; }
    let v;
    if (info.type === 'number') v = /a[ñn]o|year/.test(k) ? '2026' : /nota|calif/.test(k) ? String(12 + i) : /cr[eé]dito|hora|cap|vacan|ciclo|sem/.test(k) ? String(i + 1) : String(info.min ? Math.max(+info.min, 1) : i);
    else if (info.type === 'date') v = '2026-10-' + String(20 + i).padStart(2, '0');
    else if (info.type === 'time') v = ['08:00', '09:00', '10:00', '11:00', '14:00'][i - 1];
    else if (info.type === 'month') v = '2026-10';
    else if (info.type === 'datetime-local') v = '2026-10-29T09:00';
    else if (info.type === 'email') v = `qa30.${ek}${i}@portal.invalid`;
    else if (info.type === 'url' || /web|url|enlace/.test(k)) v = 'https://example.org/qa30';
    else if (/dni|documento/.test(k)) v = '9904' + sfx.slice(-3) + i;
    else if (/ruc/.test(k)) v = '2099900' + sfx.slice(-3) + i;
    else if (/tel|cel|fono/.test(k)) v = '999000' + sfx.slice(-2) + i;
    else if (/^(cod|codigo|c[oó]digo)\b|\bc[oó]digo/.test(k)) v = ('Q3' + sfx.slice(-3) + i).slice(0, info.ml > 0 ? info.ml : 20);
    else if (/a[ñn]o/.test(k)) v = '2026';
    else if (info.val) continue;
    else if (info.tag === 'TEXTAREA') v = `QA30-0${i} texto de prueba ficticio para ${ek}.`;
    else v = `QA30-0${i} ${ek}`;
    if (info.ml > 0) v = v.slice(0, info.ml);
    await f.fill(v);
  }
  return m;
}
(async () => {
  const b = await L.browser(); const { p } = await L.login(b, 'nasca', process.env.QA30_PASS); const out = {};
  for (const [ek, route, tab] of PLAN.filter(x => !ONLY || ONLY.includes(x[0]))) {
    if (!(await goTo(p, route, tab, ek))) { L.rec('B', `${ek}: crear 5 registros`, 'BLOQUEADO', `no se encontró botón Nuevo en ${route}`); continue; }
    const before = await p.evaluate(ek => (window.IXDB || {})[ek], ek);
    let ok = 0; const errs = [];
    for (let i = 1; i <= 5; i++) {
      const sfx = String(Date.now()).slice(-5);
      await p.locator(`[data-new="${ek}"]`).first().click(); await p.waitForTimeout(700);
      const m = await fillModal(p, ek, i, sfx);
      await m.locator('button').filter({ hasText: /^\s*Registrar\s*$/ }).last().click(); await p.waitForTimeout(1800);
      const still = await p.locator('.modal:visible, dialog[open]').count();
      if (still) { const e = (await m.locator('.err, .ferr, .alert, [aria-invalid=true]').allInnerTexts().catch(() => [])).join(' | ').replace(/\s+/g, ' '); errs.push(`#${i}: ${e.slice(0, 220)}`); await L.shot(p, `B-ix-${ek}-error-${i}`); await p.keyboard.press('Escape'); await p.locator('.modal:visible button').filter({ hasText: /Cancelar|Cerrar|✕/ }).first().click().catch(() => {}); await p.waitForTimeout(500); }
      else ok++;
      if (i === 1 && still) break; // si el primero falla, el resto también
    }
    L.rec('B', `${ek} (académico): crear 5 registros`, ok === 5 ? 'OK' : 'FALLA', `${ok}/5 registrados` + (errs.length ? ' · ' + errs.join(' ; ') : ''));
    if (!ok) continue;
    // Editar el primer registro QA30 encontrado
    await p.locator(`[data-q="${ek}"]`).fill('QA30').catch(() => {}); await p.locator(`[data-q="${ek}"]`).press('Enter').catch(() => {}); await p.waitForTimeout(900);
    const edits = p.locator(`[data-edit^="${ek}:"]`); const n = await edits.count();
    if (n) { await edits.first().click(); await p.waitForTimeout(700); const m = p.locator('.modal:visible, dialog[open]').last();
      const t = m.locator('input[type=text]:not([readonly]):not([disabled])').filter({ hasNot: p.locator('[name*=dni]') });
      let changed = false; for (const el of await t.all()) { const v = await el.inputValue(); if (/QA30-0\d/.test(v)) { await el.fill(v.replace(/QA30-0(\d)/, 'QA30-E$1')); changed = true; break; } }
      await m.locator('button').filter({ hasText: /Guardar cambios/ }).last().click(); await p.waitForTimeout(1800);
      const closed = !(await p.locator('.modal:visible, dialog[open]').count());
      L.rec('B', `${ek} (académico): editar registro`, closed ? 'OK' : 'FALLA', changed ? 'texto modificado y guardado' : 'guardado sin cambio de texto'); if (!closed) await p.keyboard.press('Escape');
      // Eliminar el último registro QA30
      const dels = p.locator(`[data-del^="${ek}:"]`); const dn = await dels.count();
      if (dn) { await dels.last().click(); await p.waitForTimeout(700); const blocked = await p.locator('.modal:visible').filter({ hasText: 'No se puede eliminar' }).count();
        if (blocked) { L.rec('B', `${ek} (académico): eliminar registro`, 'OK', 'bloqueado por integridad referencial (esperado)'); await p.keyboard.press('Escape'); }
        else { await p.locator('.modal:visible button, dialog[open] button').filter({ hasText: /^\s*Eliminar\s*$/ }).last().click(); await p.waitForTimeout(1800);
          const after = await p.locator(`[data-del^="${ek}:"]`).count(); L.rec('B', `${ek} (académico): eliminar registro`, after === dn - 1 ? 'OK' : 'FALLA', `${dn} → ${after} filas QA30`); } }
    } else L.rec('B', `${ek} (académico): editar registro`, 'BLOQUEADO', 'sin botón Editar');
    L.save('fase-b-academico');
  }
  if (p._errors.length) L.rec('B', 'Errores JavaScript en módulos académicos', 'FALLA', p._errors.slice(0, 5).join(' | '));
  L.save('fase-b-academico'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
