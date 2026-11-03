const { espera, ir, marcar, foto, alto, subirA, arriba, captcha } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Usa lo registrado en los capítulos 16 (certificaciones y constancia) y 17 (título TIT-APSTI-2026-0007).
const COD_TITULO = 'TIT-APSTI-2026-0007';
const COD_MANUAL = 'CE-2026-000154';

escena('18-verificacion-documentos', async ({ adm, pub }) => {
  const p = adm;
  await alto(p, 1000);

  // 1. Registro manual de un documento
  await ir(p, '#/admin/certificados');
  if (!(await p.locator('main tbody tr', { hasText: COD_MANUAL }).count())) {
    await p.getByText('Nuevo documento').first().click(); await espera(p, 1000);
    await p.fill('#f_codigo', COD_MANUAL); await p.fill('#f_dni', '73581426'); await p.fill('#f_nombres', 'Kevin Arturo Taipe Molina');
    await p.selectOption('#f_programaId', 'apsti'); await p.selectOption('#f_tipo', 'Certificado de estudios'); await p.fill('#f_fecha', '2026-10-20');
    await p.fill('#f_detalle', 'Ciclos I y II · periodos 2025-I y 2025-II');
    const fld = k => p.locator(`[data-f="${k}"]`);
    await marcar(p, [[1, fld('codigo')], [2, p.locator('[data-f="dni"], [data-f="nombres"]').first()], [3, fld('tipo')], [4, fld('fecha')], [5, fld('detalle')], [6, '#f_estado'], [7, p.getByRole('button', { name: /Guardar cambios/ })]]);
    await foto(p, '18-02-nuevo');
    await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  }

  // 2. Listado
  await ir(p, '#/admin/certificados');
  const fila = t => p.locator('main tbody tr', { hasText: t }).first();
  await marcar(p, [[1, p.locator('main .pz-dnav')], [2, p.locator('main input[type=search], main input[placeholder^="Buscar"]').first()], [3, fila(COD_TITULO).locator('td').nth(3)],
    [4, fila(COD_MANUAL).locator('td').nth(5)], [5, fila(COD_MANUAL).locator('td').last()]]);
  await foto(p, '18-01-listado');

  // 3. Registro sincronizado: solo se cambia el estado
  await fila(COD_TITULO).locator('td').last().locator('a, button').filter({ hasText: /Editar/ }).or(fila(COD_TITULO).locator('td').last().locator('[title*="Editar"], [aria-label*="Editar"]')).first().click();
  await espera(p, 1200); await arriba(p);
  await marcar(p, [[1, '#f_codigo'], [2, p.locator('main .panel').filter({ hasText: 'Sincronizado desde' }).first()], [3, '#f_estado']]);
  await foto(p, '18-03-sincronizado');

  // 4. Anular el documento manual
  await ir(p, '#/admin/certificados');
  await fila(COD_MANUAL).locator('td').last().locator('a, button').filter({ hasText: /Editar/ }).or(fila(COD_MANUAL).locator('td').last().locator('[title*="Editar"], [aria-label*="Editar"]')).first().click();
  await espera(p, 1200); await arriba(p);
  await p.selectOption('#f_estado', 'Anulado');
  await p.fill('#f_motivo', 'Emitido con un error en el periodo académico. Se reemplazó por el certificado CE-2026-000161.');
  await marcar(p, [[1, '#f_estado'], [2, p.locator('[data-f="motivo"]')], [3, p.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(p, '18-04-anular');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2000);
  const ok = p.getByRole('button', { name: /^(Aceptar|Confirmar|Sí|Anular)/ }); if (await ok.count()) { await ok.first().click().catch(() => {}); await espera(p, 1500); }

  // 5. Consulta pública
  const q = pub;
  await alto(q, 900);
  await ir(q, '#/servicios/consulta-certificados', 2500);
  const f = q.locator('form[data-cq]');
  await subirA(q, f, 130);
  await marcar(q, [[1, f.locator('.pz-seg')], [2, '#cq-v'], [3, f.locator('.captcha')], [4, f.locator('button.pz-cq-b')], [5, q.locator('.pz-cq-i')]]);
  await foto(q, '18-05-web-consulta');

  const consultar = async (tipo, valor) => {
    await f.locator(`input[name=t][value=${tipo}]`).check({ force: true }); await q.fill('#cq-v', valor);
    await f.locator('input[name=captcha]').fill(await captcha(f));
    await f.locator('button.pz-cq-b').click(); await espera(q, 2000);
  };
  await consultar('codigo', COD_TITULO);
  await alto(q, 1100);
  await subirA(q, q.locator('#cq-r'), 110);
  await marcar(q, [[1, q.locator('#cq-r .pz-cert-s').first()], [2, q.locator('#cq-r dl').first()]]);
  await foto(q, '18-06-web-valido');

  await ir(q, '#/servicios/consulta-certificados', 2500);
  await consultar('dni', '70946318');
  await subirA(q, q.locator('#cq-r'), 110);
  await marcar(q, [[1, q.locator('#cq-r .pz-cq-tit')], [2, q.locator('#cq-r .pz-cq-list article').first()], [3, q.locator('#cq-r .pz-cq-list a').first()]]);
  await foto(q, '18-07-web-dni');

  await ir(q, '#/servicios/consulta-certificados', 2500);
  await consultar('codigo', COD_MANUAL);
  await subirA(q, q.locator('#cq-r'), 110);
  await marcar(q, [[1, q.locator('#cq-r .pz-cert-s').first()], [2, q.locator('#cq-r dl dt', { hasText: 'Motivo' }).locator('xpath=following-sibling::dd[1]')]]);
  await foto(q, '18-08-web-anulado');
  await alto(q, 850); await alto(p, 850);
});
