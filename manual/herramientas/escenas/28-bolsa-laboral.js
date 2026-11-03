const fs = require('fs');
const os = require('os');
const path = require('path');
const { BASE, espera, ir, marcar, foto, alto, subirA, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Datos ficticios de la escena
const RUC = (() => { const b = '2060193475', w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]; let s = 0; for (let i = 0; i < 10; i++) s += +b[i] * w[i]; let d = 11 - s % 11; if (d === 10) d = 0; if (d === 11) d = 1; return b + d; })();
const EMP = 'AGROEXPORTADORA VALLE DE ICA S.A.C.';
const PASS_EMP = 'EmpresaDemo2026!';
const DNI = '71839264';
const ALUMNA = 'HUAMANÍ CCORAHUA, LUCÍA MARIBEL';
const PASS_EST = 'EgresadaDemo2026!';
const PUESTO = 'Asistente de control de calidad en planta de empaque';

function pdfDemo(nombre) {
  const f = path.join(os.tmpdir(), nombre);
  fs.writeFileSync(f, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
  return f;
}
// Inicio de sesión de una cuenta de la comunidad (empresa, estudiante o egresado) en su propio contexto
async function ingresar(pg, usuario, clave) {
  await ir(pg, '#/admin', 1500);
  await pg.fill('#lg-u', usuario); await pg.fill('#lg-p', clave); await pg.press('#lg-p', 'Enter');
  await pg.waitForLoadState('load'); await espera(pg, 3000);
}
const optValor = async (pg, sel, texto) => pg.locator(`${sel} option`, { hasText: texto }).first().getAttribute('value');

// 28 · Bolsa laboral
escena('28-bolsa-laboral', async ({ adm, ctx }) => {
  const p = adm;
  // 1. Portal: registro libre de la empresa
  const q = await (await ctx()).newPage();
  await alto(q, 700);
  await ir(q, '#/servicios/bolsa-laboral', 2500);
  await subirA(q, q.locator('.pz-mt').first(), 300);
  await marcar(q, [[1, q.locator('.pz-mt [data-tab="o"]')], [2, q.locator('.pz-mt [data-tab="e"]')], [3, q.locator('.pz-mt [data-tab="i"]')], [4, q.locator('.side-box').filter({ hasText: 'Responsable' }).last()]]);
  await foto(q, '28-01-web-bolsa');

  await q.locator('.pz-mt [data-tab="e"]').click(); await espera(q, 1200);
  await q.fill('#f_ruc', RUC); await q.fill('#f_nom', EMP); await q.fill('#f_sector', 'Agroindustria');
  await q.fill('#f_ubic', 'Subtanjalla, Ica'); await q.fill('#f_dir', 'Carretera Panamericana Sur km 300, Subtanjalla, Ica');
  await q.fill('#f_contacto', 'Jorge Arteaga Pariona'); await q.fill('#f_cargoC', 'Jefe de Recursos Humanos');
  await q.fill('#f_correo', 'rrhh@agrovalleica-demo.pe'); await q.fill('#f_tel', '956123456'); await q.fill('#f_web', 'www.agrovalleica-demo.pe');
  await q.fill('#f_pass', PASS_EMP); await q.check('#empDecl');
  await alto(q, 1350);
  await subirA(q, q.locator('.pz-bl-reg').first(), 80);
  const fl = k => q.locator(`[data-fld="${k}"]`);
  await marcar(q, [[1, q.locator('.pz-bl-reg .alert').first()], [2, fl('ruc')], [3, fl('nom')], [4, fl('contacto')], [5, fl('correo')], [6, fl('pass')],
    [7, q.locator('#empDecl').locator('xpath=ancestor::label[1]')], [8, q.getByRole('button', { name: 'Crear cuenta de empresa' })]]);
  await foto(q, '28-02-web-registro');
  await q.getByRole('button', { name: 'Crear cuenta de empresa' }).click();
  await q.getByText('Empresa registrada').first().waitFor({ timeout: 15000 }); await espera(q, 800);
  await alto(q, 800);
  const dq = q.locator('.modal, [role=dialog]').last();
  await marcar(q, [[1, dq.getByText(/pendiente de validación/)], [2, dq.getByText(/Tu usuario es/)], [3, dq.getByRole('link', { name: /Ingresar a la intranet/ })]]);
  await foto(q, '28-03-web-registrada');
  await q.context().close();

  // 2. Intranet: panel y validación de la empresa
  await alto(p, 1000);
  await ir(p, '#/admin/ix-bolsa', 1800);
  await marcar(p, [[1, p.locator('main [role=tablist], main .tabs').first()], [2, p.locator('.pz-kpis')], [3, p.locator('.pz-kpi', { hasText: 'Empresas pendientes' })], [4, p.locator('.pz-welcome a.btn')]]);
  await foto(p, '28-04-panel');

  await alto(p, 900);
  await ir(p, '#/admin/ix-bolsa/empresas', 1800);
  const fe = p.locator('tr[data-eid]', { hasText: RUC });
  await fe.locator('[data-erj]').scrollIntoViewIfNeeded(); await arriba(p);
  await marcar(p, [[1, p.locator('[data-ef]').first().locator('xpath=..')], [2, fe.locator('td').nth(4)], [3, fe.locator('[data-eap]')], [4, fe.locator('[data-erj]')], [5, p.locator('form[data-bcfg]')]]);
  await foto(p, '28-05-validacion');
  await fe.locator('[data-eap]').click(); await espera(p, 2000);

  // 3. Empresa: publica una oferta
  const e = await (await ctx()).newPage();
  await alto(e, 1000);
  await ingresar(e, RUC, PASS_EMP);
  await ir(e, '#/admin/ix-bolsa', 2200);
  await e.getByRole('button', { name: /Publicar oferta/ }).click(); await espera(e, 900);
  await e.fill('#f_puesto', PUESTO);
  await e.fill('#f_desc', 'Control de calidad de uva de mesa y espárrago en la línea de empaque, registro de controles y apoyo en auditorías BPM.');
  await e.fill('#f_req', 'Egresado(a) de Producción Agropecuaria. Disponibilidad a tiempo completo. Deseable experiencia en campaña agroexportadora.');
  await e.selectOption('#f_modal', 'Presencial');
  await e.selectOption('#f_prog', await optValor(e, '#f_prog', 'Producción Agropecuaria'));
  await e.fill('#f_vac', '2');
  const lim = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10); await e.fill('#f_limite', lim);
  const de = e.locator('.modal, [role=dialog]').last(); const ef = k => de.locator(`[data-fld="${k}"]`);
  await marcar(e, [[1, ef('puesto')], [2, ef('desc')], [3, ef('req')], [4, ef('modal')], [5, ef('prog')], [6, ef('limite')], [7, de.getByRole('button', { name: /^Registrar$/ })]]);
  await foto(e, '28-06-empresa-oferta');
  await de.getByRole('button', { name: /^Registrar$/ }).click(); await espera(e, 2000);

  // 4. Intranet: aprobar la oferta
  await alto(p, 850);
  await ir(p, '#/admin/ix-bolsa/gestion', 2000);
  const fo = p.locator('.ix tr', { hasText: PUESTO }).first();
  await marcar(p, [[1, p.locator('.ix [data-tab="bolsa:ofertas"]').first().locator('xpath=..')], [2, fo.locator('td').nth(7)], [3, fo.getByRole('button', { name: 'Aprobar' })], [4, fo.getByRole('button', { name: 'Rechazar' })]]);
  await foto(p, '28-07-aprobar-oferta');
  await fo.getByRole('button', { name: 'Aprobar' }).click(); await espera(p, 2000);

  // 5. Portal: la oferta aparece publicada
  const w = await (await ctx()).newPage();
  await alto(w, 900);
  await ir(w, '#/servicios/bolsa-laboral', 2500);
  const card = w.locator('.pz-of', { hasText: PUESTO }).first();
  await subirA(w, w.locator('.pz-of-f').first(), 100);
  await marcar(w, [[1, w.locator('.pz-of-f').first()], [2, card], [3, card.locator('[data-post]')], [4, w.locator('.pz-of-cta')]]);
  await foto(w, '28-08-web-oferta');
  await w.context().close();

  // 6. Cuenta de la egresada (Maestro de alumnos › Crear acceso)
  await alto(p, 850);
  await ir(p, '#/admin/ix-alumnos', 2000);
  if (!(await p.locator('.ix tr', { hasText: DNI }).count())) {
    await p.getByRole('button', { name: /Registrar alumno/ }).click(); await espera(p, 800);
    await p.fill('#f_dni', DNI); await p.fill('#f_nom', ALUMNA);
    await p.selectOption('#f_prog', await optValor(p, '#f_prog', 'Producción Agropecuaria'));
    await p.selectOption('#f_estado', 'Egresado'); await p.fill('#f_correo', 'lucia.huamani@correo-demo.pe'); await p.fill('#f_tel', '956214378');
    await p.getByRole('button', { name: 'Registrar', exact: true }).click(); await espera(p, 1800);
  }
  await p.locator('.ix tr', { hasText: DNI }).getByRole('button', { name: /Crear acceso/ }).click(); await espera(p, 1800);
  const da = p.locator('.modal, [role=dialog]').last();
  const temporal = ((await da.innerText()).match(/Contraseña temporal\s+(\S+)/) || [])[1];
  if (!temporal) throw new Error('No se obtuvo la contraseña temporal');
  await marcar(p, [[1, da.locator('dl')]]);
  await foto(p, '28-09-acceso-egresada');
  await da.getByRole('button', { name: /Cerrar/ }).last().click().catch(() => {});

  // 7. Egresada: cambia la contraseña temporal, completa su perfil con CV y postula
  const s = await (await ctx()).newPage();
  await alto(s, 900);
  await ingresar(s, DNI, temporal);
  if (s.url().includes('accounts.php')) {
    await s.fill('input[name=current_password]', temporal); await s.fill('input[name=password]', PASS_EST); await s.fill('input[name=password_confirmation]', PASS_EST);
    await s.getByRole('button', { name: 'Cambiar contraseña' }).click(); await s.waitForLoadState('load'); await espera(s, 1500);
  }
  await ir(s, '#/admin/ix-bolsa', 2200);
  await s.locator('.ix [data-tab="bolsa:perfil"]').first().click(); await espera(s, 800);
  await s.getByRole('button', { name: /Editar perfil y subir CV/ }).click(); await espera(s, 800);
  await s.fill('#f_resumen', 'Profesional técnica en Producción Agropecuaria con experiencia en campañas de uva de mesa y control de calidad.');
  await s.fill('#f_competencias', 'Buenas prácticas agrícolas (BPA)\nControl de calidad en empaque\nTrabajo en equipo');
  await s.fill('#f_exp', '2025 · Inspectora de calidad – Fundo San José, Ica');
  await s.setInputFiles('#f_cv', pdfDemo('CV_Lucia_Huamani.pdf')); await espera(s, 400);
  const dp = s.locator('.modal, [role=dialog]').last(); const sf = k => dp.locator(`[data-fld="${k}"]`);
  await marcar(s, [[1, sf('correo')], [2, sf('resumen')], [3, sf('competencias')], [4, sf('exp')], [5, sf('cv')]]);
  await foto(s, '28-10-perfil-cv');
  await dp.locator('button[type=submit]').last().click(); await espera(s, 2500);

  await s.locator('.ix [data-tab="bolsa:ofertas"]').first().click(); await espera(s, 800);
  const bp = s.locator('.ix .ficha', { hasText: PUESTO }).first().locator('[data-act=postular]');
  if (!(await bp.count())) { await s.locator('.ix [data-chg="bSolo"]').click(); await espera(s, 800); }
  await s.locator('.ix .ficha', { hasText: PUESTO }).first().locator('[data-act=postular]').click(); await espera(s, 900);
  const dc = s.locator('.modal, [role=dialog]').last();
  await marcar(s, [[1, dc.locator('.modal-body, .mb, p').first()], [2, dc.getByRole('button', { name: 'Postular', exact: true })]]);
  await foto(s, '28-11-postular');
  await dc.getByRole('button', { name: 'Postular', exact: true }).click(); await espera(s, 2200);

  // 8. Empresa: revisa al postulante, su CV y cambia el estado
  await ir(e, '#/admin/ix-bolsa', 2200);
  await e.locator('.ix [data-tab="bolsa:post"]').first().click(); await espera(e, 900);
  const fp = e.locator('.ix tr', { hasText: ALUMNA }).first();
  await fp.locator('select[data-chg="postEst"]').selectOption('En revisión'); await espera(e, 1800);
  const fp2 = e.locator('.ix tr', { hasText: ALUMNA }).first();
  await marcar(e, [[1, e.locator('.ix [data-tab="bolsa:post"]').first()], [2, fp2.locator('td').first()], [3, fp2.locator('select[data-chg="postEst"]')], [4, fp2.getByRole('button', { name: /Ver perfil y CV/ })]]);
  await foto(e, '28-12-postulantes');
  await fp2.getByRole('button', { name: /Ver perfil y CV/ }).click(); await espera(e, 900);
  const dv = e.locator('.modal, [role=dialog]').last();
  await marcar(e, [[1, dv.locator('.prof').first()], [2, dv.getByText('Competencias').first().locator('xpath=..')], [3, dv.getByRole('link', { name: /Descargar CV/ })]]);
  await foto(e, '28-13-perfil-cv-empresa');
  await e.context().close();

  // 9. Egresada: consulta el estado de su postulación
  await ir(s, '#/admin/ix-bolsa', 2200);
  await s.locator('.ix [data-tab="bolsa:mias"]').first().click(); await espera(s, 900);
  const fm = s.locator('.ix tr', { hasText: PUESTO }).first();
  await marcar(s, [[1, s.locator('.ix [data-tab="bolsa:mias"]').first()], [2, fm]]);
  await foto(s, '28-14-mis-postulaciones');
  await s.context().close();
});
