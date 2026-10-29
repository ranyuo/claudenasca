const { browser, login, BASE } = require('./lib.cjs');
(async () => {
  const b = await browser(); const { ctx, p } = await login(b, 'nasca', process.env.QA30_PASS);
  await p.goto(BASE + '/respaldos.php');
  const before = await p.$$eval('a[href*="download="]', a => a.map(x => x.getAttribute('href')));
  await Promise.all([p.waitForNavigation(), p.click('button:has-text("Crear respaldo completo")')]);
  console.log('Mensaje:', (await p.locator('.notice, [role=status]').allTextContents()).join(' | ').slice(0, 200));
  const after = await p.$$eval('a[href*="download="]', a => a.map(x => x.getAttribute('href')));
  const nuevo = after.find(h => !before.includes(h)) || after[0];
  console.log('Respaldos:', after.length, 'nuevo:', nuevo);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`a[href="${nuevo}"]`)]);
  const dest = process.env.OUT + '/' + dl.suggestedFilename(); await dl.saveAs(dest); console.log('Descargado:', dest);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
