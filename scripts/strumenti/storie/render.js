const { chromium } = require('playwright');
(async () => {
  const [,, html, png] = process.argv;
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await pg.goto('file://' + html);
  await pg.waitForFunction(() => document.body.dataset.ready == '1');
  await pg.waitForTimeout(300);
  const info = await pg.evaluate(() => {
    const r = {}; r.bottom = +document.body.dataset.bottom;
    r.over = [...document.querySelectorAll('.col > *')].map(e => { const q = e.getBoundingClientRect(); return [e.className, Math.round(q.left), Math.round(q.right), Math.round(q.top), Math.round(q.bottom), e.scrollWidth > e.clientWidth + 2]; });
    return r;
  });
  console.log(JSON.stringify(info));
  await pg.screenshot({ path: png });
  await b.close();
})();
