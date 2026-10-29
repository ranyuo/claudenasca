// Inventario de datos de prueba (QA30 y QA29) presentes en el sitio.
const L = require('./lib.cjs'); const fs = require('node:fs');
(async () => { const b = await L.browser(); const { p } = await L.login(b, 'nasca', process.env.QA30_PASS);
  const inv = await p.evaluate(async () => { const d = (await (await fetch(portalURL('/api/portal'))).json()).data; const out = {};
    const scan = (name, arr) => { if (!Array.isArray(arr)) return; for (const tag of ['QA30', 'QA29', 'qa30', 'qa29']) { const n = arr.filter(r => r && typeof r === 'object' && JSON.stringify(r).includes(tag)); if (n.length) { const k = tag.toUpperCase(); out[name] = out[name] || {}; out[name][k] = (out[name][k] || 0) + n.filter(r => !out[name]['_ids_' + k]?.includes(r.id)).length; out[name]['act_' + k] = n.filter(r => !r.deleted).length; } } };
    for (const [k, v] of Object.entries(d)) if (k !== 'academico' && k !== 'auditoria') scan(k, v);
    for (const [k, v] of Object.entries(d.academico || {})) if (!['bitacora', 'notifs'].includes(k)) scan('academico.' + k, v);
    for (const v of Object.values(out)) for (const k of Object.keys(v)) if (k.startsWith('_')) delete v[k];
    return out; });
  fs.writeFileSync(L.EVID + '/inventario-datos-prueba.json', JSON.stringify(inv, null, 1));
  let t30 = 0, t29 = 0; for (const [k, v] of Object.entries(inv)) { t30 += v.act_QA30 || 0; t29 += v.act_QA29 || 0; console.log(k.padEnd(28), 'QA30 activos:', String(v.act_QA30 || 0).padStart(3), ' QA29 activos:', v.act_QA29 || 0); }
  console.log('TOTAL activos QA30:', t30, ' QA29:', t29); await b.close(); })();
