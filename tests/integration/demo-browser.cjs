const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

// Serve the original branch separately for measured visual comparison.
function referenceServer() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paf-kauan-reference-'));
  const prefix = 'deliverables/demo/';
  const files = execFileSync('git', ['ls-tree', '-r', '--name-only', 'origin/novoFrontKauan', prefix], {encoding: 'utf8'}).trim().split('\n');
  for (const file of files) {
    const target = path.join(root, file.slice(prefix.length));
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, execFileSync('git', ['show', `origin/novoFrontKauan:${file}`], {maxBuffer: 12 * 1024 * 1024}));
  }
  const types = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg'};
  const server = http.createServer((request, response) => {
    const name = path.resolve(root, '.' + decodeURIComponent(request.url === '/' ? '/index.html' : request.url));
    if (!name.startsWith(root + path.sep) || !fs.existsSync(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', types[path.extname(name)] || 'text/plain');
    fs.createReadStream(name).pipe(response);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({server, url: `http://127.0.0.1:${server.address().port}/`})));
}

(async () => {
  const reference = await referenceServer();
  const browser = await chromium.launch({executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const output = path.join(os.tmpdir(), 'paf-design-qa');
  fs.mkdirSync(output, {recursive: true});
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1366, height: 768}, reducedMotion: 'reduce'});
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400 && response.url().includes('localhost')) errors.push(`${response.status()} ${response.url()}`); });
    const url = process.env.DEMO_URL || 'http://localhost:8000/deliverables/demo/';
    await page.goto(url);
    await page.waitForSelector('#globe-loading[hidden]', {state: 'attached'});
    assert.ok(await page.locator('#view-globe').isVisible());
    assert.equal(await page.locator('#pins button').count(), 24);
    assert.equal(await page.locator('.glass-panel, .spotlight-card, .border-beam-card, .shiny-text').count(), 0);
    assert.equal(await page.locator('script[src*="tailwind"]').count(), 0);
    assert.equal(await page.locator('.panel.is-visible').count(), 0);
    assert.equal(await page.locator('#comparison').getAttribute('aria-hidden'), 'true');
    const baseline = await browser.newPage({viewport: {width: 1366, height: 768}, reducedMotion: 'reduce'});
    await baseline.goto(reference.url);
    await baseline.waitForSelector('#globe-loading[hidden]', {state: 'attached'});
    for (const [width, height] of [[1366, 768], [1920, 1080]]) {
      await page.setViewportSize({width, height});
      await baseline.setViewportSize({width, height});
      await page.waitForTimeout(150);
      for (const selector of ['.dashboard-frame', '.dashboard', '.sidebar', '.globe-stage']) {
        const actual = await page.locator(selector).boundingBox();
        const expected = await baseline.locator(selector).boundingBox();
        for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(actual[key] - expected[key]) < 1, `${selector}.${key}: visual divergence`);
      }
      for (const selector of ['.intro', '.exploration-caption']) {
        const actual = await page.locator(selector).boundingBox(), expected = await baseline.locator(selector).boundingBox();
        assert.ok(Math.abs(actual.x - expected.x) < 1 && Math.abs(actual.y - expected.y) < 1, `${selector}: position`);
      }
      await page.screenshot({path: path.join(output, `integrated-${width}.png`)});
      await baseline.screenshot({path: path.join(output, `reference-${width}.png`)});
    }
    await baseline.close();
    await page.setViewportSize({width: 1366, height: 768});
    const goTo = async name => {
      if (await page.locator('#menu-toggle').isVisible()) await page.locator('#menu-toggle').click();
      await page.locator(`.sidebar nav [data-page="${name}"]`).click();
      assert.equal(await page.locator('[data-page-view]:visible').count(), 1);
      assert.ok(await page.locator(`#view-${name}`).isVisible());
      assert.equal(await page.locator('.sidebar nav [aria-current="page"]').getAttribute('data-page'), name);
    };
    const barringer = page.locator('#pins [data-location="barringer"]');
    await barringer.focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('#comparison.is-visible');
    const statisticsBox = await page.locator('#view-globe .statistics').boundingBox();
    const floatingTableBox = await page.locator('#comparison').boundingBox();
    assert.ok(statisticsBox.y + statisticsBox.height <= floatingTableBox.y, 'statistics overlap the floating table');
    assert.equal(await page.locator('#metrics tr').count(), 5);
    assert.notEqual(await page.locator('#lunar-score').innerText(), '—');
    assert.equal(await page.locator('#martian-score').innerText(), '—');
    assert.equal(await page.locator('#comparison').getAttribute('aria-hidden'), 'false');
    const selected = await page.locator('#pair-title').textContent();
    const canvas = await page.locator('#globe canvas').elementHandle();
    await page.screenshot({path: path.join(output, 'selected-desktop.png')});
    await goTo('comparisons');
    assert.equal(await page.locator('#pair-title').textContent(), selected);
    assert.equal(await page.locator('#metrics-table-body tr').count(), 11);
    await page.locator('#tab-btn-bars').click();
    assert.ok(await page.locator('#studio-bars-view').isVisible());
    await page.locator('#tab-btn-radar').click();
    assert.ok(await page.locator('#studio-radar-view svg').isVisible());
    await page.screenshot({path: path.join(output, 'comparison-desktop.png')});
    await goTo('analysis');
    assert.ok(await page.locator('#analysis-empty').isVisible());
    assert.equal(await page.locator('#site-selector button').count(), 8);
    await page.locator('[data-action="setAnalysisType"][data-value="crater"]').click();
    assert.ok(await page.locator('#analysis-results').isVisible());
    assert.equal(await page.locator('#site-selector button').count(), 16);
    await goTo('map');
    assert.equal(await page.locator('#map-pins-layer g').count(), 24);
    await page.screenshot({path: path.join(output, 'map-desktop.png')});
    await page.locator('#btn-view-ne').click();
    const regionPins = await page.locator('#map-pins-layer g').count();
    assert.ok(regionPins < 24);
    await page.locator('#filter-dune').click();
    await goTo('settings');
    assert.match(await page.locator('#view-settings').innerText(), /indisponível/i);
    await page.goBack();
    await page.waitForFunction(() => !document.getElementById('view-map').hidden);
    assert.equal(await page.locator('#btn-view-ne').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#filter-dune').getAttribute('aria-pressed'), 'true');
    await page.locator('#btn-view-mundo').click();
    assert.equal(await page.locator('#map-pins-layer g').count(), 8);
    await page.locator('#site-selector button').filter({hasText: 'Duna'}).first().click();
    await goTo('globe');
    assert.ok(await canvas.evaluate(element => element === document.querySelector('#globe canvas')));
    await page.waitForSelector('#similarity.is-visible');
    assert.equal(await page.locator('#lunar-score').innerText(), '—');
    assert.notEqual(await page.locator('#martian-score').innerText(), '—');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#comparison').getAttribute('aria-hidden'), 'true');
    await page.locator('#globe').focus();
    await page.keyboard.press('ArrowRight');
    const globeBox = await page.locator('#globe').boundingBox();
    await page.mouse.move(globeBox.x + 150, globeBox.y + 150);
    await page.mouse.down(); await page.mouse.move(globeBox.x + 210, globeBox.y + 180, {steps: 8}); await page.mouse.up();
    await goTo('reports');
    await page.locator('[data-action="fillPreset"][data-value="barringer"]').click();
    await page.locator('#input-name').fill('QA <test>');
    await page.locator('#c-altura_borda_m').fill('0');
    await page.locator('[data-action="addNewSiteFromForm"]').click();
    assert.ok(await page.locator('#view-comparisons').isVisible());
    assert.equal(await page.locator('#pins button').count(), 25);
    assert.match(await page.locator('#pair-title').innerText(), /QA <test>/);
    await goTo('reports');
    await page.locator('#input-lat').fill('91');
    await page.locator('[data-action="addNewSiteFromForm"]').click();
    assert.equal(await page.locator('#pins button').count(), 25);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('[data-action="exportCurrentSiteJson"]').click();
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(async () => JSON.parse(await navigator.clipboard.readText()).metrics.rim_height_m), 0);
    await page.setViewportSize({width: 390, height: 844});
    await page.locator('#menu-toggle').click();
    assert.ok(await page.locator('#workspace').evaluate(element => element.inert));
    await page.locator('.sidebar nav [data-page="settings"]').focus();
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('.sidebar .brand').evaluate(element => element === document.activeElement));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    for (const name of ['overview', 'globe', 'map', 'comparisons', 'analysis', 'reports', 'settings']) {
      await goTo(name);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: mobile overflow`);
    }
    await goTo('globe');
    await page.waitForFunction(() => document.querySelectorAll('.toast-msg').length === 0);
    await page.screenshot({path: path.join(output, 'integrated-mobile.png'), fullPage: true});
    await page.locator('#menu-toggle').click();
    await page.screenshot({path: path.join(output, 'menu-mobile.png')});
    await page.locator('#menu-close').click();
    await page.locator('#menu-toggle').click();
    await page.locator('#menu-backdrop').click({position: {x: 380, y: 20}});
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    const ids = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id));
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(errors, []);
    console.log(`PASS: original layout geometry at 1366/1920; floating panels/rings; seven views; preserved WebGL, selection, filters, charts, registration, JSON, keyboard/mobile. Screenshots: ${output}`);
  } finally {
    await browser.close();
    reference.server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
