const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

const NOMBRE = 'Ica turquesa';

async function color(p, c, v) {
  const hex = p.locator(`[data-hex="${c}"]`);
  await hex.fill(v); await hex.dispatchEvent('input'); await espera(p, 200);
}

// 33 · Temas y apariencia
// La escena cambia el tema activo del portal: al final SIEMPRE se reactiva el tema original
// y se elimina el tema de prueba, porque los demás capítulos se capturan después en la misma instalación.
escena('33-temas', async ({ adm, ctx }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/temas', 1500);
  const original = await p.evaluate(() => DB.config.tema);
  try {
    // Listado de temas
    const item = t => p.locator('article.tm-item', { has: p.locator('h3', { hasText: t }) }).first();
    await marcar(p, [
      [1, p.locator('.adm-top a[href="#/admin/temas"]')],
      [2, p.locator('.tm-active')],
      [3, p.getByRole('link', { name: /Nuevo tema/ })],
      [4, p.getByRole('link', { name: /Editar tema activo/ })],
    ]);
    await foto(p, '33-01-tema-activo');
    await subirA(p, p.locator('.tm-grid'), 100);
    const esm = item('Esmeralda');
    await marcar(p, [[1, p.locator('.tm-grid')], [2, esm.locator('[data-act]')], [3, esm.getByRole('link', { name: /Editar/ })], [4, esm.locator('[data-dup]')]]);
    await foto(p, '33-02-temas');

    // Duplicar y editar
    await esm.locator('[data-dup]').click(); await espera(p, 1800);
    await alto(p, 1250); await arriba(p);
    await p.fill('#tf-l', NOMBRE); await p.locator('#tf-l').dispatchEvent('input');
    await p.fill('#tf-d', 'Turquesa y arena, inspirado en el desierto de Ica'); await p.locator('#tf-d').dispatchEvent('input');
    await color(p, 'navy', '#0b4f5c'); await color(p, 'navy2', '#127a80'); await color(p, 'blue', '#0e7c86'); await color(p, 'gold', '#e9b949');
    await p.selectOption('#tf-fh', 'Poppins'); await espera(p, 300);
    const panel = t => p.locator('.panel', { has: p.locator('h2', { hasText: t }) }).first();
    await marcar(p, [[1, panel('Identificación')], [2, panel('Colores')], [3, panel('Tipografía y forma')], [4, panel('Vista previa')], [5, panel('Legibilidad')], [6, p.locator('.tm-save')]]);
    await foto(p, '33-03-editor');

    // Advertencia de contraste
    await color(p, 'blue', '#9fe3e8');
    await subirA(p, panel('Legibilidad'), 100);
    await marcar(p, [[1, panel('Legibilidad').locator('li', { hasText: 'acento' })]]);
    await foto(p, '33-04-contraste');
    await p.locator('[data-save="0"]').click(); await espera(p, 700);
    await marcar(p, [[1, p.locator('.modal').last()]]);
    await foto(p, '33-05-confirmar-contraste');
    await p.locator('.modal').last().getByRole('button', { name: /Cancelar/ }).click(); await espera(p, 500);
    await color(p, 'blue', '#0e7c86');

    // Guardar y activar
    await p.locator('[data-save="1"]').click(); await espera(p, 2200);
    await alto(p, 850); await arriba(p);
    await marcar(p, [[1, p.locator('.tm-active')], [2, p.locator('.adm-side')]]);
    await foto(p, '33-06-activado');

    // Portal con el nuevo tema
    const q = await (await ctx()).newPage();
    await alto(q, 850);
    await ir(q, '#/', 2500);
    await q.locator('.modal [data-close], .modal .close').first().click({ timeout: 1000 }).catch(() => {});
    await marcar(q, [[1, q.locator('header').first()], [2, q.locator('.slide.on .cap a.btn').first()], [3, q.locator('section.quick')]]);
    await foto(q, '33-07-web-tema');
    await q.context().close();

    // Volver al tema original y eliminar el de prueba
    await ir(p, '#/admin/temas', 1500);
    const orig = p.locator('article.tm-item', { has: p.locator(`[data-act="${original}"]`) }).first();
    await subirA(p, orig, 120);
    await marcar(p, [[1, orig.locator(`[data-act="${original}"]`)]]);
    await foto(p, '33-08-reactivar');
    await orig.locator(`[data-act="${original}"]`).click(); await espera(p, 2000);
    const mio = item(NOMBRE);
    await subirA(p, mio, 120);
    await mio.locator('[data-del]').click(); await espera(p, 700);
    await marcar(p, [[1, p.locator('.modal').last()]]);
    await foto(p, '33-09-eliminar');
    await p.locator('.modal').last().getByRole('button', { name: 'Eliminar', exact: true }).click(); await espera(p, 1500);
  } finally {
    // Garantía: tema original activo y sin temas de prueba, aunque algún paso haya fallado.
    await ir(p, '#/admin/temas', 1500);
    await p.evaluate(({ original, NOMBRE }) => {
      const T = DB.config.temas; let cambio = false;
      if (DB.config.tema !== original && T[original]) { DB.config.tema = original; cambio = true; }
      for (const k of Object.keys(T)) if (T[k].label === NOMBRE || /\(copia/.test(T[k].label)) { if (k !== DB.config.tema) { delete T[k]; cambio = true; } }
      if (cambio) { saveDB(); applyTheme(); }
    }, { original, NOMBRE });
    await espera(p, 1500);
  }
});
