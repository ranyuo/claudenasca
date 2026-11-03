const { espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// PDF mínimo válido para las cargas de archivo de la escena.
function pdf(texto) {
  const obj = [];
  obj.push('<< /Type /Catalog /Pages 2 0 R >>');
  obj.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  const s = `BT /F1 18 Tf 60 760 Td (${texto}) Tj ET`;
  obj.push(`<< /Length ${s.length} >>\nstream\n${s}\nendstream`);
  obj.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  let out = '%PDF-1.4\n'; const off = [];
  obj.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${obj.length + 1}\n0000000000 65535 f \n` + off.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${obj.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

// Cuenta de prueba con rol Transparencia (sin permiso de aprobación).
const RESP = { usuario: 'mparedes.transp01', nombre: 'Marco Paredes Huamán', temporal: 'Temporal#Ica2026', clave: 'Transparencia#Ica2026' };

async function crearCuenta(p) {
  await ir(p, '#/admin/usuarios/nuevo', 1500);
  await p.fill('[name=usuario]', RESP.usuario); await p.fill('[name=nombre]', RESP.nombre);
  await p.selectOption('[name=rol]', 'transparencia');
  await p.fill('[name=pass1]', RESP.temporal); await p.fill('[name=pass2]', RESP.temporal);
  await p.fill('[name=correo]', 'transparencia.demo@ica.aplicacion.io');
  await p.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(p, 2500);
}

async function entrarComo(ctx) {
  const q = await (await ctx()).newPage();
  await ir(q, '#/admin', 1500);
  await q.fill('#lg-u', RESP.usuario); await q.fill('#lg-p', RESP.temporal); await q.press('#lg-p', 'Enter'); await espera(q, 3000);
  if (await q.locator('[name=current_password]').count()) {
    await q.fill('[name=current_password]', RESP.temporal);
    await q.fill('section [name=password]', RESP.clave); await q.fill('section [name=password_confirmation]', RESP.clave);
    await q.getByRole('button', { name: 'Cambiar contraseña' }).click(); await espera(q, 2000);
  }
  return q;
}

async function nuevoDocumento(q, nombre, tipo, desc) {
  await ir(q, '#/admin/documentos/nuevo', 1500);
  await q.fill('[name=nombre]', nombre);
  await q.selectOption('[name=tipoId]', { label: tipo });
  await q.fill('[name=vigencia]', '2026');
  await q.fill('[name=descripcion]', desc);
  await q.locator('form input[type=file]').first().setInputFiles({ name: nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.pdf', mimeType: 'application/pdf', buffer: pdf(nombre) });
  await espera(q, 2000);
  await q.selectOption('#f_estado', 'Publicado');
}

// 01 · Inicio y aprobaciones
escena('01-inicio-aprobaciones', async ({ adm, ctx }) => {
  const p = adm;
  await alto(p, 850);
  await crearCuenta(p);

  // El responsable de Transparencia envía dos documentos a aprobación
  const q = await entrarComo(ctx);
  await alto(q, 900);
  await nuevoDocumento(q, 'Plan Anual de Trabajo 2026', 'Plan', 'Plan Anual de Trabajo del IESTP “Ica” aprobado para el periodo 2026.');
  await arriba(q);
  await marcar(q, [[1, '#f_estado'], [2, q.locator('.hint', { hasText: 'aprobación del Administrador' })], [3, q.getByRole('button', { name: /Guardar cambios/ })]]);
  await foto(q, '01-05-enviar-aprobacion');
  await q.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(q, 2000);
  await nuevoDocumento(q, 'Reglamento Interno 2026', 'Reglamento', 'Reglamento Interno actualizado del IESTP “Ica”.');
  await q.getByRole('button', { name: /Guardar cambios/ }).click(); await espera(q, 2000);
  await ir(q, '#/admin/documentos', 1500);
  await q.fill('#lf-q', '2026'); await q.locator('[data-lf] button.btn').first().click(); await espera(q, 1200);
  await marcar(q, [[1, q.locator('main tbody tr', { hasText: 'Plan Anual de Trabajo 2026' }).locator('td').nth(4)]]);
  await foto(q, '01-06-en-revision');

  // Inicio del Administrador
  await ir(p, '#/admin/dashboard', 1800);
  await marcar(p, [
    [1, p.locator('.db-period')],
    [2, p.locator('[data-dbcsv]')],
    [3, p.locator('.db-hacts a.btn').last()],
    [4, p.locator('.db-kpis')],
    [5, p.locator('.adm-side a[href="#/admin/aprobaciones"]')],
    [6, p.locator('.adm-top a[aria-label$="pendientes"]')],
  ]);
  await foto(p, '01-01-inicio');

  const card = t => p.locator('.db-card', { has: p.locator('h2', { hasText: t }) }).first();
  await subirA(p, card('Tráfico del portal'), 100);
  await marcar(p, [[1, card('Tráfico del portal')], [2, card('Libro de reclamaciones')]]);
  await foto(p, '01-02-trafico');

  await alto(p, 980); await subirA(p, card('Pendientes por atender'), 100);
  await marcar(p, [[1, card('Pendientes por atender')], [2, card('Pendientes por atender').locator('li', { hasText: 'Publicaciones por aprobar' })], [3, card('Contenido publicado')], [4, card('Próximas fechas')]]);
  await foto(p, '01-03-pendientes');

  await alto(p, 850); await subirA(p, card('Salud del portal'), 100);
  const acad = p.locator('.panel', { has: p.locator('h2', { hasText: 'Gestión académica' }) }).last();
  await marcar(p, [[1, card('Salud del portal')], [2, card('Salud del portal').locator('li.no a').first()], [3, card('Actividad reciente')], [4, acad]]);
  await foto(p, '01-04-salud');

  // Bandeja de aprobaciones
  await ir(p, '#/admin/aprobaciones', 1500);
  const fila = p.locator('main tbody tr', { hasText: 'Plan Anual de Trabajo 2026' });
  await marcar(p, [
    [1, p.locator('main .panel h2').first()],
    [2, fila.locator('td').nth(1)],
    [3, fila.locator('td').nth(2)],
    [4, fila.locator('[data-act=preview]')],
    [5, fila.locator('[data-act=open]')],
    [6, fila.locator('[data-act=ok]')],
    [7, fila.locator('[data-act=back]')],
  ]);
  await foto(p, '01-07-aprobaciones');

  // Aprobar y publicar
  await fila.locator('[data-act=ok]').click(); await espera(p, 800);
  await marcar(p, [[1, p.locator('.modal').last()]]);
  await foto(p, '01-08-aprobar');
  await p.locator('.modal').last().getByRole('button', { name: 'Aprobar y publicar' }).click(); await espera(p, 2000);

  // Devolver con observaciones
  const fila2 = p.locator('main tbody tr', { hasText: 'Reglamento Interno 2026' });
  await fila2.locator('[data-act=back]').click(); await espera(p, 800);
  const dlg = p.locator('.modal').last();
  await dlg.locator('textarea').fill('Falta adjuntar la resolución directoral que aprueba el reglamento. Inclúyela en el mismo PDF y vuelve a enviarlo.');
  await marcar(p, [[1, dlg.locator('textarea')], [2, dlg.getByRole('button', { name: 'Devolver' })]]);
  await foto(p, '01-09-devolver');
  await dlg.getByRole('button', { name: 'Devolver' }).click(); await espera(p, 2000);
  await marcar(p, [[1, p.locator('main .panel').first()]]);
  await foto(p, '01-10-sin-pendientes');

  // El responsable ve la observación
  await ir(q, '#/admin/documentos', 1500);
  await q.fill('#lf-q', 'Reglamento Interno 2026'); await q.locator('[data-lf] button.btn').first().click(); await espera(q, 1200);
  const f2 = q.locator('main tbody tr', { hasText: 'Reglamento Interno 2026' });
  await f2.locator('[data-act=edit]').click(); await espera(q, 1500);
  await arriba(q);
  await marcar(q, [[1, '#f_estado'], [2, q.locator('.notice.err', { hasText: 'Observación' })]]);
  await foto(q, '01-11-observacion');
  await q.context().close();
});
