const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');

const url = process.env.DEMO_URL || 'http://localhost:8000/deliverables/demo/';
const snapshot = (page) =>
  page.evaluate(() => ({
    location: document.getElementById('comparison-location').textContent,
    heading: document.getElementById('comparison-target-heading').textContent,
    metrics: document.getElementById('metrics').textContent,
    details: document.getElementById('location-details').textContent,
    lunar: document.getElementById('lunar-score').textContent,
    martian: document.getElementById('martian-score').textContent,
  }));
const activeMode = (page, mode) =>
  page.waitForFunction(
    (mode) =>
      mode === '2d'
        ? !document.getElementById('map-stage').hidden
        : !document.querySelector('.globe-stage').hidden,
    mode,
  );
async function switchMode(page, mode) {
  await page.locator('#view-selector-toggle').click();
  await page.locator(`[data-view="${mode}"]`).click();
  await activeMode(page, mode);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : {}),
  });
  try {
    const errors = [];
    for (const [width, height] of [
      [1920, 1080],
      [1600, 900],
      [1366, 768],
      [390, 844],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: 'reduce',
        ...(width === 390 ? { isMobile: true, hasTouch: true } : {}),
      });
      let navigations = 0;
      page.on('request', (request) => {
        if (request.isNavigationRequest()) navigations++;
      });
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.addInitScript(() => {
        window.webglDraws = 0;
        const draw = WebGL2RenderingContext.prototype.drawElements;
        WebGL2RenderingContext.prototype.drawElements = function (...args) {
          window.webglDraws++;
          return draw.apply(this, args);
        };
      });
      await page.goto(url);
      await page.waitForFunction(
        () => document.getElementById('globe-loading').hidden,
      );
      assert.equal(
        await page.locator('#map-stage').evaluate((e) => e.hidden),
        true,
      );
      // Keyboard entry and roving menu navigation.
      await page.locator('#view-selector-toggle').focus();
      await page.keyboard.press('ArrowUp');
      assert.equal(
        await page
          .locator('[data-view="2d"]')
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press('Enter');
      await activeMode(page, '2d');
      await page.waitForFunction(
        () => document.getElementById('map-canvas').dataset.zoom === '1.0000',
      );
      assert.equal(await page.locator('.map-pin:not([hidden])').count(), 6);
      assert.equal(await page.locator('.panel.is-visible').count(), 0);
      const identity = await page.evaluate(async () => {
        const { locations } = await import('./js/data.js');
        const { projectLocation } = await import('./js/world-map.js');
        return locations.map((location) => ({
          same:
            !!document.querySelector(
              `#map-pins [data-location="${location.id}"]`,
            ) &&
            !!document.querySelector(`#pins [data-location="${location.id}"]`),
          country: location.country,
          point: projectLocation(location.lat, location.lon),
        }));
      });
      assert.ok(
        identity.every(
          (item) =>
            item.same &&
            item.country &&
            item.point.x >= 0 &&
            item.point.x <= 1 &&
            item.point.y >= 0 &&
            item.point.y <= 1,
        ),
      );
      const map = page.locator('#world-map');
      const rect = await map.boundingBox();
      const x = rect.x + rect.width * 0.65,
        y = rect.y + rect.height * 0.6;
      const draws = await page.evaluate(() => window.webglDraws);
      await page.mouse.move(x, y);
      await page.mouse.wheel(0, -300);
      await page.waitForFunction(
        () => Number(document.getElementById('map-canvas').dataset.zoom) > 1,
      );
      const before = await page
        .locator('.map-pin[data-location="barringer"]')
        .getAttribute('style');
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 45, y + 25, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(100);
      assert.notEqual(
        await page
          .locator('.map-pin[data-location="barringer"]')
          .getAttribute('style'),
        before,
      );
      assert.equal(
        await page.locator('.panel.is-visible').count(),
        0,
        'Drag must not select a pin',
      );
      assert.equal(
        await page.evaluate(() => window.webglDraws),
        draws,
        '2D interactions must not render the hidden globe',
      );
      await page.locator('#map-reset').click();
      await page.waitForFunction(
        () => document.getElementById('map-canvas').dataset.zoom === '1.0000',
      );
      if (width === 390) {
        const cdp = await page.context().newCDPSession(page);
        const cx = rect.x + rect.width * 0.5,
          cy = rect.y + rect.height * 0.5;
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            { x: cx - 25, y: cy, id: 1 },
            { x: cx + 25, y: cy, id: 2 },
          ],
        });
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            { x: cx - 55, y: cy, id: 1 },
            { x: cx + 55, y: cy, id: 2 },
          ],
        });
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchEnd',
          touchPoints: [],
        });
        await page.waitForFunction(
          () => Number(document.getElementById('map-canvas').dataset.zoom) > 1,
        );
        await page.locator('#map-reset').click();
        await page.waitForFunction(
          () => document.getElementById('map-canvas').dataset.zoom === '1.0000',
        );
      }
      await page.screenshot({
        path: path.join(os.tmpdir(), `paf-map-${width}-global.png`),
        fullPage: true,
      });
      await page.locator('.map-pin[data-location="barringer"]').click();
      await page.waitForFunction(
        () => document.getElementById('lunar-score').textContent === '0,87',
      );
      await page.locator('[data-comparison-target="martian"]').click();
      await page.waitForFunction(
        () =>
          document.getElementById('comparison-target-heading').textContent ===
          'Marte',
      );
      const data = await snapshot(page);
      await switchMode(page, '3d');
      assert.deepEqual(
        await snapshot(page),
        data,
        'Switch to 3D must preserve all selected data and comparison',
      );
      await switchMode(page, '2d');
      assert.deepEqual(
        await snapshot(page),
        data,
        'Switch to 2D must preserve scores without replaying',
      );
      await page.locator('.map-pin[data-location="lencois"]').click();
      await page.waitForFunction(
        () => document.getElementById('martian-score').textContent === '0,84',
      );
      assert.equal(
        await page
          .locator('[data-comparison-target="lunar"]')
          .getAttribute('aria-pressed'),
        'true',
      );
      await page.locator('[data-comparison-target="martian"]').click();
      assert.equal(await page.locator('#metrics tr').count(), 8);
      await page.screenshot({
        path: path.join(os.tmpdir(), `paf-map-${width}-selected.png`),
        fullPage: true,
      });
      await page.locator('#view-selector-toggle').click();
      await page.keyboard.press('Escape');
      await page.waitForFunction(
        () => document.getElementById('map-canvas').dataset.zoom === '1.0000',
      );
      assert.equal(await page.locator('.panel.is-visible').count(), 0);
      assert.equal(
        await page.locator('#view-selector-menu').evaluate((e) => e.hidden),
        false,
        'Selection owns the first Escape',
      );
      await page.keyboard.press('Escape');
      assert.equal(
        await page.locator('#view-selector-menu').evaluate((e) => e.hidden),
        true,
      );
      await page.locator('#view-selector-toggle').click();
      await page.mouse.click(width - 10, 10);
      assert.equal(
        await page.locator('#view-selector-menu').evaluate((e) => e.hidden),
        true,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.equal(navigations, 1);
      console.log(
        `PASS ${width}×${height}: modes, shared selection, navigation, zoom, drag, Esc, no hidden WebGL draws`,
      );
      await page.close();
    }
    // Exercise asynchronous fades and cancellation with motion enabled as well.
    const animated = await browser.newPage({
      viewport: { width: 1600, height: 900 },
    });
    animated.on('pageerror', (error) => errors.push(error.message));
    await animated.addInitScript(() => {
      window.mapTestFrames = 0;
      const frame = requestAnimationFrame;
      window.requestAnimationFrame = (callback) =>
        frame((time) => {
          window.mapTestFrames++;
          callback(time);
        });
    });
    await animated.goto(url);
    await animated.waitForFunction(
      () => document.getElementById('globe-loading').hidden,
    );
    await animated.locator('#view-selector-toggle').hover();
    const menuBox = await animated.locator('#view-selector-menu').boundingBox();
    await animated.mouse.move(menuBox.x + 20, menuBox.y + 25, { steps: 8 });
    assert.equal(
      await animated.locator('#view-selector-menu').evaluate((e) => e.hidden),
      false,
    );
    await animated.locator('[data-view="2d"]').click();
    await activeMode(animated, '2d');
    await animated.waitForTimeout(450);
    const idleFrames = await animated.evaluate(() => window.mapTestFrames);
    await animated.waitForTimeout(250);
    assert.equal(
      await animated.evaluate(() => window.mapTestFrames),
      idleFrames,
      'Idle 2D view must not keep a render loop',
    );
    await animated.locator('.map-pin[data-location="barringer"]').click();
    await animated.waitForFunction(
      () => document.getElementById('lunar-score').textContent === '0,87',
    );
    // Cancel an in-flight fade back to 3D, retaining the current 2D view.
    await animated.evaluate(() =>
      document.querySelector('[data-view="3d"]').click(),
    );
    await animated.waitForTimeout(60);
    await animated.evaluate(() =>
      document.querySelector('[data-view="2d"]').click(),
    );
    await animated.waitForTimeout(450);
    await activeMode(animated, '2d');
    assert.equal(
      await animated.locator('#map-stage').evaluate((e) => e.hidden),
      false,
    );
    assert.equal(
      await animated.locator('.globe-stage').evaluate((e) => e.hidden),
      true,
    );
    assert.equal(await animated.locator('#lunar-score').textContent(), '0,87');
    await animated.keyboard.press('Escape');
    await animated.waitForFunction(
      () => document.getElementById('map-canvas').dataset.zoom === '1.0000',
    );
    await animated.close();
    assert.deepEqual(errors, []);
    console.log('Map integration: all checks passed; no console errors.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
