// Consolida los JSON de evidencias QA30 en una tabla Markdown por fase.
const fs = require('node:fs'); const path = require('node:path');
const dir = path.join(__dirname, '../../evidencias/qa30');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('fase-b-ids') && f !== 'fase-a-codigos.json').sort();
const rows = []; for (const f of files) for (const r of JSON.parse(fs.readFileSync(path.join(dir, f)))) rows.push({ ...r, f });
// Último resultado por caso (los reintentos reemplazan a los anteriores)
const last = new Map(); for (const r of rows.filter(r => !/publicados visibles en portal/.test(r.caso))) last.set(r.fase + '|' + r.caso, r);
const out = []; const tot = {};
for (const fase of ['A', 'B', 'C', 'D']) {
  const rs = [...last.values()].filter(r => r.fase === fase); if (!rs.length) continue;
  const c = {}; rs.forEach(r => c[r.estado] = (c[r.estado] || 0) + 1); tot[fase] = c;
  out.push(`\n### Fase ${fase} · ${rs.length} casos · ${Object.entries(c).map(([k, v]) => `${k}: ${v}`).join(' · ')}\n\n| Resultado | Caso | Detalle |\n|---|---|---|`);
  for (const r of rs) out.push(`| ${r.estado} | ${r.caso.replace(/\|/g, '/')} | ${String(r.detalle || '').replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 220)} |`);
}
fs.writeFileSync(path.join(dir, 'resultados-detalle.md'), out.join('\n') + '\n'); console.log(JSON.stringify(tot));
