const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1920, height: 1080}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
    await page.goto(process.env.DEMO_URL || 'http://localhost:8000/deliverables/demo/');
    await page.waitForSelector('#globe-loading[hidden]', {state: 'attached'});
    const navigate = async name => {
      if (await page.locator('#menu-toggle').isVisible()) await page.locator('#menu-toggle').click();
      await page.locator(`.sidebar [data-page="${name}"]`).click();
    };
    const checkLayout = async width => {
      const boxes = await page.evaluate(() => ({
        stats: document.querySelector('#view-globe .statistics').getBoundingClientRect().bottom,
        table: document.getElementById('comparison').getBoundingClientRect().top,
        bottom: document.querySelector('.dashboard').getBoundingClientRect().bottom,
        panels: [...document.querySelectorAll('.panel')].map(e => ({left: e.getBoundingClientRect().left, right: e.getBoundingClientRect().right, bottom: e.getBoundingClientRect().bottom})),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      assert.equal(boxes.overflow, false);
      assert.ok(boxes.table > boxes.stats, `Table overlaps statistics: ${JSON.stringify({width,...boxes})}`);
      assert.ok(boxes.panels.every(p => p.left >= 0 && p.right <= width && p.bottom <= boxes.bottom + 1), JSON.stringify({width,...boxes}));
    };
    for (const [width, height] of [[1920,1080],[1600,900],[1366,768],[390,844]]) {
      await page.setViewportSize({width,height});
      await navigate('globe');
      await page.keyboard.press('Escape');
      await page.locator('#pins [data-location="barringer"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForSelector('#comparison.is-visible');
      assert.equal(await page.locator('#metrics tr').count(),5);
      assert.equal(await page.locator('#compact-table thead th').count(),3);
      assert.match(await page.locator('#compact-reference').textContent(),/Shackleton/);
      await checkLayout(width);
      await page.screenshot({path:path.join(os.tmpdir(),`paf-refined-${width}-moon.png`),fullPage:true});
      await navigate('comparisons');
      await page.locator('#site-select').selectOption({label:'Lençóis Maranhenses'});
      await navigate('globe');
      await page.waitForSelector('#comparison.is-visible');
      assert.equal(await page.locator('[data-comparison-target="lunar"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('.compact-empty').count(),1);
      const score = await page.locator('#martian-score').textContent();
      await page.locator('[data-comparison-target="martian"]').click();
      assert.equal(await page.locator('#metrics tr').count(),8);
      assert.equal(await page.locator('#metrics tr').nth(1).locator('td').first().textContent(),'45');
      assert.equal(await page.locator('#martian-score').textContent(),score);
      await checkLayout(width);
      await page.screenshot({path:path.join(os.tmpdir(),`paf-refined-${width}-mars.png`),fullPage:true});
      await page.keyboard.press('Escape');
      console.log(`PASS ${width}×${height}: both table variants, no clipping, shared scores and reset to Moon`);
    }
    await page.setViewportSize({width:1366,height:768});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('#pins [data-location="barringer"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('#comparison.is-visible');
    await page.waitForTimeout(1300);
    const score = await page.locator('#lunar-score').textContent();
    await page.locator('[data-comparison-target="martian"]').click();
    await page.waitForTimeout(160);
    await page.locator('[data-comparison-target="lunar"]').click({force:true});
    await page.waitForFunction(() => document.getElementById('compact-target-name').textContent === 'Lua' && !document.getElementById('compact-table-content').hasAttribute('aria-busy'));
    assert.equal(await page.locator('#metrics tr').count(),5);
    assert.equal(await page.locator('#lunar-score').textContent(),score);
    await page.evaluate(() => document.querySelector('[data-comparison-target="martian"]').click());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.panel.is-visible').count(),0);
    assert.equal(await page.locator('#compact-table-content').getAttribute('aria-busy'),null);
    assert.deepEqual(errors,[]);
    console.log('PASS: normal-motion transitions, rapid cancellation, Escape during a transition and no console errors.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
