// Genera las capturas del manual sobre una instalación de DEMOSTRACIÓN con datos ficticios.
// Uso: BASE=http://127.0.0.1:8080 node capturas.js [prefijo]
//   prefijo opcional: solo ejecuta las escenas cuyo id empieza así (p. ej. "07-").
// Nunca ejecutar contra un portal de producción: el guion crea y modifica registros.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:8080';
const USER = process.env.DEMO_USER || 'admin.demo';
const PASS = process.env.DEMO_PASS || 'DemoManual2026';
const OUT = path.resolve(__dirname, '..', 'img');
const SOLO = process.argv[2] || '';
fs.mkdirSync(OUT, { recursive: true });

if (!/127\.0\.0\.1|localhost|demo/i.test(BASE)) {
  console.error('BASE no parece una instalación de demostración. Abortado.');
  process.exit(1);
}

// ---------- utilidades ----------
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
  const tipo = { type: 'jpeg', quality: 82 };
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

// ---------- escenas ----------
const ESCENAS = [];
const escena = (id, fn) => ESCENAS.push({ id, fn });

// 00 · Acceso y entorno de trabajo
escena('00-acceso', async ({ pub }) => {
  const p = pub;
  await alto(p, 850);
  await ir(p, '#/admin', 1500);
  await marcar(p, [[1, '#lg-u'], [2, '#lg-p'], [3, p.locator('form button[type=submit]')]]);
  await foto(p, '00-01-inicio-sesion');
});

escena('00-entorno', async ({ adm }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/dashboard', 2000);
  await marcar(p, [
    [1, 'aside, nav.side, .sidebar'],
    [2, p.getByText('Apariencia', { exact: true }).first()],
    [3, p.getByText('Ver sitio web', { exact: false }).first()],
    [4, p.getByText('Salir', { exact: true }).first()],
    [5, p.locator('main h1, main h2').first()],
  ]);
  await foto(p, '00-02-panel-inicio');
});

// 03 · Noticias
escena('03-noticias', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/noticias');
  await marcar(p, [
    [1, p.getByRole('button', { name: /Nueva noticia/ }).or(p.getByText('Nueva noticia'))],
    [2, p.locator('[role=tablist]').first()],
    [3, p.locator('main form, main .filters, main .card').first()],
    [4, p.getByText(/Ver papelera/)],
    [5, p.locator('main tbody tr').first().locator('td').last()],
  ]);
  await foto(p, '03-01-listado');

  // Formulario vacío
  await p.getByText('Nueva noticia').first().click(); await espera(p, 1300);
  await alto(p, 1520); await arriba(p);
  const lbl = t => p.locator('label, .lbl', { hasText: t }).first();
  await marcar(p, [
    [1, p.locator('main input').first()],
    [2, p.locator('main textarea').first()],
    [3, p.locator('[contenteditable=true]').first()],
    [4, lbl('Imagen principal').locator('xpath=..')],
    [5, p.locator('main aside, main .side, main .col-side').first().or(p.getByText('Estado y publicación').locator('xpath=../..'))],
  ]);
  await foto(p, '03-02-formulario');

  // Formulario completado
  await p.locator('main input').first().fill('Taller de primeros auxilios para la comunidad');
  await p.locator('main textarea').first().fill('El programa de Enfermería Técnica organiza un taller gratuito de primeros auxilios abierto a la comunidad.');
  await p.locator('[contenteditable=true]').first().click();
  await p.keyboard.type('El taller se realizará el sábado 14 de noviembre de 2026 en el laboratorio de Enfermería Técnica. Los participantes recibirán una constancia de asistencia.');
  const selects = p.locator('main select');
  const nSel = await selects.count();
  for (let i = 0; i < nSel; i++) {
    const opts = await selects.nth(i).locator('option').allInnerTexts();
    if (opts.includes('Académico')) await selects.nth(i).selectOption({ label: 'Académico' });
    if (opts.some(o => /imagen completa/i.test(o))) await selects.nth(i).selectOption({ index: 1 });
  }
  await arriba(p);
  const estadoSel = p.locator('main select').filter({ has: p.locator('option', { hasText: 'Publicada' }) }).first();
  await marcar(p, [
    [1, estadoSel],
    [2, p.locator('main select').filter({ has: p.locator('option', { hasText: 'Académico' }) }).first()],
    [3, p.locator('main input[type=datetime-local]').first()],
    [4, p.getByText('Noticia destacada')],
    [5, p.getByRole('button', { name: /Vista previa/ })],
    [6, p.getByRole('button', { name: /Guardar cambios/ })],
  ]);
  await foto(p, '03-03-formulario-completo');

  // Vista previa
  await p.getByRole('button', { name: /Vista previa/ }).click(); await espera(p, 1500);
  await alto(p, 850);
  await foto(p, '03-04-vista-previa');
  await p.keyboard.press('Escape'); await espera(p, 400);
  const cerrar = p.locator('[data-close]'); if (await cerrar.count()) await cerrar.first().click().catch(() => {});
  await espera(p, 500);

  // Guardar como borrador
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  await alto(p, 850); await arriba(p);
  const fila = p.locator('main tbody tr', { hasText: 'Taller de primeros auxilios' });
  await marcar(p, [[1, fila.locator('td').nth(4)]]);
  await foto(p, '03-05-guardado-borrador');

  // Publicar: editar y cambiar estado
  await fila.locator('button, a').nth(1).click(); await espera(p, 1300);
  await alto(p, 1520); await arriba(p);
  await p.locator('main select').filter({ has: p.locator('option', { hasText: 'Publicada' }) }).first().selectOption('Publicada');
  await marcar(p, [[1, p.locator('main select').filter({ has: p.locator('option', { hasText: 'Publicada' }) }).first()], [2, p.getByRole('button', { name: /Guardar cambios/ })], [3, p.getByText('Historial').locator('xpath=../..')]]);
  await foto(p, '03-06-publicar');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 1800);
  await alto(p, 850); await arriba(p);
  await marcar(p, [[1, p.locator('main tbody tr', { hasText: 'Taller de primeros auxilios' }).locator('td').nth(4)]]);
  await foto(p, '03-07-publicada');

  // Resultado en la web pública
  await alto(pub, 850);
  await ir(pub, '#/noticias', 2200);
  const tarjeta = pub.locator('article.ncard', { hasText: 'Taller de primeros auxilios' }).first();
  await subirA(pub, pub.getByText('Todas', { exact: true }).first(), 110);
  await marcar(pub, [[1, pub.getByText('Todas', { exact: true }).first().locator('xpath=..')], [2, tarjeta]]);
  await foto(pub, '03-08-web-listado');
  await tarjeta.locator('h3 a').click(); await espera(pub, 2000);
  await foto(pub, '03-09-web-detalle');

  // Papelera
  await ir(p, '#/admin/noticias');
  const fila2 = p.locator('main tbody tr', { hasText: 'Feria de proyectos' });
  p.once('dialog', d => d.accept());
  await fila2.locator('button').last().click(); await espera(p, 900);
  const conf = p.getByRole('button', { name: 'Eliminar', exact: true }).last();
  await marcar(p, [[1, p.locator('.modal, [role=dialog], .ov').last()]]);
  await foto(p, '03-10-eliminar');
  await conf.click(); await espera(p, 1500);
  await p.getByText(/Ver papelera/).first().click(); await espera(p, 1300);
  await marcar(p, [[1, p.locator('main tbody tr').first().locator('td').last()]]);
  await foto(p, '03-11-papelera');

  // Categorías
  await ir(p, '#/admin/catnoticias');
  await marcar(p, [[1, p.locator('main tbody').first()]]);
  await foto(p, '03-12-categorias');
});

// 07 · Libro de reclamaciones
escena('07-reclamos', async ({ adm, pub }) => {
  const p = adm;
  // Configuración del responsable y plazos
  await alto(p, 1100);
  await ir(p, '#/admin/reclamos/config');
  const inp = t => p.getByLabel(t, { exact: false }).first();
  const campo = t => p.locator('label', { hasText: t }).first().locator('xpath=..');
  await inp('Responsable institucional').fill('Rosa Mendoza Soto');
  await inp('Cargo').fill('Jefa de la Unidad de Bienestar y Empleabilidad');
  await inp('Correo institucional').fill('reclamaciones@demo.edu.pe');
  await inp('Área que recibe').selectOption({ label: 'Mesa de Partes' }).catch(() => {});
  await marcar(p, [[1, campo('Responsable institucional')], [2, campo('Área que recibe')], [3, campo('reclamos (días')], [4, campo('Alertar')],
    [5, p.getByRole('button', { name: /^Guardar$/ })]]);
  await foto(p, '07-01-responsable-plazos');
  await p.getByRole('button', { name: /^Guardar$/ }).click(); await espera(p, 1500);

  // Formulario público
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/servicios/libro-de-reclamaciones', 2500);
  await subirA(q, q.getByText('Registrar reclamo o queja', { exact: true }).first(), 420);
  await marcar(q, [[1, q.getByText('Registrar reclamo o queja', { exact: true }).first()], [2, q.getByText('Consultar estado', { exact: true }).first()], [3, q.getByText('Información', { exact: true }).first()]]);
  await foto(q, '07-02-web-libro');
  await q.selectOption('#l2-td', 'DNI'); await q.fill('#l2-nd', '45678912'); await q.fill('#l2-no', 'Ana'); await q.fill('#l2-ap', 'Quispe Ramos');
  await q.fill('#l2-e', 'ana.quispe@correo-demo.pe'); await q.fill('#l2-t', '987654321'); await q.selectOption('#l2-c', 'Estudiante');
  await q.selectOption('#l2-p', { index: 5 });
  await q.locator('label.rec').first().click(); await q.fill('#l2-f', '2026-10-28'); await q.selectOption('#l2-ar', 'SA');
  await q.fill('#l2-d', 'Solicité mi constancia de estudios el 20 de octubre y a la fecha no se me ha entregado ni informado el motivo de la demora.');
  await q.fill('#l2-pe', 'Solicito la entrega de la constancia de estudios y que se me informe el estado del trámite.');
  await alto(q, 1700);
  await q.locator('#l2-td').scrollIntoViewIfNeeded(); await q.evaluate(() => window.scrollBy(0, -140)); await espera(q, 500);
  await marcar(q, [[1, q.locator('h3', { hasText: 'Datos del usuario' })], [2, q.locator('h3', { hasText: 'Datos del reclamo' })], [3, q.locator('label.rec').first().locator('xpath=..')], [4, '#l2-d'], [5, '#l2-pe']]);
  await foto(q, '07-03-web-formulario');
  const form = q.locator('form', { has: q.locator('#l2-nd') });
  await form.locator('input[name=declaro]').check({ force: true }); await form.locator('input[name=acepto]').check({ force: true });
  await form.locator('input[name=captcha]').fill(await captcha(form));
  await alto(q, 900);
  await subirA(q, q.locator('#l2-x'), 140);
  await marcar(q, [[1, '#l2-x'], [2, form.locator('input[name=declaro]').locator('xpath=..')], [3, form.locator('.captcha')], [4, q.getByRole('button', { name: /Enviar reclamo/ })]]);
  await foto(q, '07-04-web-envio');
  await q.getByRole('button', { name: /Enviar reclamo/ }).click(); await espera(q, 3000);
  const codigo = (await q.locator('text=/RCL-\\d{4}-\\d{5}/').first().innerText()).match(/RCL-\d{4}-\d{5}/)[0];
  await marcar(q, [[1, q.locator('text=/RCL-\\d{4}-\\d{5}/').first()], [2, q.getByText(/Código de verificación:/).last()], [3, q.locator('[role=dialog], .modal, .ov').last().getByText(/días hábiles \(hasta/).first()], [4, q.getByRole('button', { name: /Descargar constancia/ })]]);
  await foto(q, '07-05-web-codigo');
  const verif = ((await q.locator('body').innerText()).match(/Código de verificación:\s*([0-9A-F]{8,})/) || [])[1] || '';
  await q.getByRole('button', { name: 'Aceptar' }).click().catch(() => {});

  // Bandeja interna
  await alto(p, 850);
  await ir(p, '#/admin/reclamos', 1500);
  await marcar(p, [[1, p.locator('[role=tablist]').first()], [2, p.locator('main .kpi, main .stat, main .card').first().locator('xpath=..')], [3, p.locator('main tbody tr', { hasText: codigo })], [4, p.getByText('Acciones rápidas').locator('xpath=../..')]]);
  await foto(p, '07-06-resumen');
  await ir(p, '#/admin/reclamos/bandeja', 1500);
  await marcar(p, [[1, p.locator('main select').first().locator('xpath=ancestor::form[1] | ancestor::div[contains(@class,"card")][1]').first()], [2, p.getByRole('button', { name: /Reporte CSV/ })], [3, p.locator('main tbody tr', { hasText: codigo })]]);
  await foto(p, '07-07-bandeja');

  // Detalle
  await p.locator('main tbody tr', { hasText: codigo }).locator('button, a').first().click(); await espera(p, 1500);
  await alto(p, 1500); await arriba(p);
  const sec = t => p.locator('h2', { hasText: t }).first().locator('xpath=ancestor::div[contains(@class,"panel")][1]');
  await marcar(p, [[1, sec('Registro original')], [2, sec('Respuesta institucional')], [3, sec('Plazo y derivación')], [4, sec('Gestión')], [5, p.getByRole('button', { name: /Hoja de reclamación/ })]]);
  await foto(p, '07-08-detalle');

  // Derivar
  const der = sec('Plazo y derivación');
  await p.selectOption('#lr-ar', { label: 'Secretaría Académica' });
  await p.fill('#lr-arn', 'Verificar el estado de la constancia de estudios y emitirla a la brevedad.');
  await der.scrollIntoViewIfNeeded();
  await marcar(p, [[1, '#lr-ar'], [2, '#lr-arn'], [3, p.getByRole('button', { name: /Derivar y notificar/ })]]);
  await foto(p, '07-09-derivar');
  await p.getByRole('button', { name: /Derivar y notificar/ }).click(); await espera(p, 1800);
  const ok = p.getByRole('button', { name: /^(Aceptar|Confirmar|Sí)/ }); if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1500); }

  // Cambiar estado a En atención
  const ges = sec('Gestión');
  await p.selectOption('#lr-st', 'En atención');
  await p.fill('#lr-sn', 'Secretaría Académica confirma que la constancia está en proceso de firma.');
  await ges.scrollIntoViewIfNeeded();
  await marcar(p, [[1, '#lr-st'], [2, '#lr-sn'], [3, p.getByRole('button', { name: /Actualizar estado/ })], [4, p.getByRole('button', { name: /Anular registro/ })]]);
  await foto(p, '07-10-estado');
  await p.getByRole('button', { name: /Actualizar estado/ }).click(); await espera(p, 1800);
  if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1200); }

  // Respuesta y atención
  const res = sec('Respuesta institucional');
  await p.fill('#lr-resp', 'Estimada Ana: su constancia de estudios ya fue emitida y puede recogerla en Secretaría Académica de lunes a viernes, de 08:00 a 14:00. Lamentamos la demora.');
  await res.scrollIntoViewIfNeeded();
  await marcar(p, [[1, '#lr-resp'], [2, p.getByRole('button', { name: /Guardar respuesta y marcar atendido/ })]]);
  await foto(p, '07-11-respuesta');
  await p.getByRole('button', { name: /Guardar respuesta y marcar atendido/ }).click(); await espera(p, 1800);
  if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1500); }
  const his = sec('Historial de estados');
  await his.scrollIntoViewIfNeeded(); await espera(p, 400);
  await marcar(p, [[1, his], [2, sec('Notificaciones')]]);
  await foto(p, '07-12-historial');

  // Consulta ciudadana
  await alto(q, 900);
  await ir(q, '#/servicios/libro-de-reclamaciones', 2500);
  await q.getByText('Consultar estado', { exact: true }).first().click(); await espera(q, 800);
  const cons = q.locator('form[data-lrq2]');
  await q.fill('#lq2-c', codigo); await q.fill('#lq2-d', '45678912');
  await cons.scrollIntoViewIfNeeded();
  await marcar(q, [[1, cons]]);
  await foto(q, '07-13-web-consulta');
  await cons.getByRole('button', { name: /Consultar/ }).click(); await espera(q, 2200);
  await subirA(q, q.locator('#lq2-c'), 140);
  await foto(q, '07-14-web-respuesta');

  await alto(p, 850);
  await ir(p, '#/admin/reclamos/notificaciones', 1500);
  await foto(p, '07-15-correo-pendiente');
});

// ---------- ejecución ----------
(async () => {
  const b = await chromium.launch();
  const ctx = o => b.newContext({ viewport: { width: 1366, height: 850 }, deviceScaleFactor: 2, locale: 'es-PE', timezoneId: 'America/Lima', ...o });
  const adm = await (await ctx()).newPage();
  const pub = await (await ctx()).newPage();
  for (const pg of [adm, pub]) pg.on('pageerror', e => console.warn('  ! error JS:', e.message));
  await entrar(adm);
  let fallos = 0;
  for (const e of ESCENAS) {
    if (SOLO && !e.id.startsWith(SOLO)) continue;
    console.log('▶ ' + e.id);
    try { await e.fn({ adm, pub }); }
    catch (err) { fallos++; console.error('  ✗ ' + e.id + ': ' + err.message.split('\n')[0]); await adm.screenshot({ path: path.join(OUT, '_error-' + e.id + '.jpg'), type: 'jpeg' }).catch(() => {}); await pub.screenshot({ path: path.join(OUT, '_error-pub-' + e.id + '.jpg'), type: 'jpeg' }).catch(() => {}); }
  }
  await b.close();
  process.exit(fallos ? 1 : 0);
})();
