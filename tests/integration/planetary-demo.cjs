const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : {}),
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const results = [];
  const errors = [];
  for (const [width, height] of [
    [1920, 1080],
    [1600, 900],
    [1366, 768],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      ...(width === 390 ? { isMobile: true, hasTouch: true } : {}),
    });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.goto(
      process.env.DEMO_URL || 'http://localhost:8000/deliverables/demo/',
    );
    await page.waitForFunction(
      () => document.querySelector('#globe-loading').hidden,
    );
    assert.equal(
      await page
        .locator('.sidebar')
        .evaluate((e) => e.getBoundingClientRect().left),
      0,
    );
    if (width > 1000) {
      const frame = await page.locator('.dashboard').boundingBox();
      assert.deepEqual(frame, { x: 0, y: 0, width, height });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollHeight),
        height,
      );
    }
    assert.equal(await page.locator('.panel.is-visible').count(), 0);
    assert.equal(
      await page
        .locator('.globe-pin[hidden]')
        .evaluateAll((es) =>
          es.every((e) => getComputedStyle(e).display === 'none'),
        ),
      true,
    );
    const pin = page.locator('[data-location="barringer"]');
    const before = await pin.getAttribute('style');
    await page.waitForTimeout(450);
    assert.notEqual(await pin.getAttribute('style'), before);
    if (width === 390) {
      const bounds = await pin.boundingBox();
      await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + 15);
    } else {
      await pin.click({ force: true });
    }
    await page.waitForFunction(
      () =>
        document.querySelector('#lunar-score').textContent === '0,87' &&
        document.querySelector('#martian-score').textContent === '0,83',
    );
    await page.waitForTimeout(600);
    assert.equal(await page.locator('#lunar-score').textContent(), '0,87');
    assert.equal(await page.locator('#martian-score').textContent(), '0,83');
    assert.equal(await page.locator('.panel.is-visible').count(), 2);
    assert.equal(await page.locator('#comparison-table thead th').count(), 3);
    assert.equal(await page.locator('#metrics tr').count(), 5);
    assert.deepEqual(
      await page
        .locator('#metrics tr')
        .allTextContents()
        .then((rows) => rows.map((row) => row.replace(/\s+/g, ' ').trim())),
      [
        'Diâmetro (km)1,18621,0',
        'Profundidade (km)0,1704,10',
        'BordasElevadasElevadas',
        'Declividade (°)34,128,6',
        'Estrutura internaPiso definidoPiso com elevação',
      ],
    );
    const lunarTab = page.locator('[data-comparison-target="lunar"]');
    const martianTab = page.locator('[data-comparison-target="martian"]');
    assert.equal(await lunarTab.getAttribute('aria-pressed'), 'true');
    await martianTab.click();
    await page.waitForFunction(
      () =>
        document.querySelector('#comparison-target-heading').textContent ===
        'Marte',
    );
    assert.equal(await page.locator('.comparison-empty').count(), 1);
    assert.equal(await page.locator('#lunar-score').textContent(), '0,87');
    assert.equal(await page.locator('#martian-score').textContent(), '0,83');
    // Rapid toggles must not allow a stale animation to overwrite the last tab.
    await page.evaluate(() => {
      document.querySelector('[data-comparison-target="lunar"]').click();
      document.querySelector('[data-comparison-target="martian"]').click();
      document.querySelector('[data-comparison-target="lunar"]').click();
    });
    await page.waitForFunction(
      () =>
        document.querySelector('#comparison-target-heading').textContent ===
          'Lua' &&
        !document
          .querySelector('#comparison-content')
          .hasAttribute('aria-busy'),
    );
    assert.equal(await page.locator('#metrics tr').count(), 5);
    const pos = await pin.getAttribute('style');
    await page.waitForTimeout(500);
    assert.equal(
      await pin.getAttribute('style'),
      pos,
      'Selected globe must stop',
    );
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      stats: document.querySelector('.statistics').getBoundingClientRect()
        .bottom,
      table: document.querySelector('#comparison').getBoundingClientRect().top,
      panels: [...document.querySelectorAll('.panel')].map((e) => ({
        left: e.getBoundingClientRect().left,
        right: e.getBoundingClientRect().right,
        bottom: e.getBoundingClientRect().bottom,
        containerBottom: document
          .querySelector('.dashboard')
          .getBoundingClientRect().bottom,
      })),
    }));
    assert.equal(geometry.overflow, false);
    assert.ok(
      geometry.stats < geometry.table,
      'Statistics and comparison must not overlap',
    );
    assert.ok(
      geometry.panels.every(
        (e) => e.left >= 0 && e.right <= width && e.bottom <= e.containerBottom,
      ),
    );
    await page.screenshot({
      path: require('node:os').tmpdir() + `/paf-${width}-selected.png`,
      fullPage: true,
    });
    await page.locator('[data-location="lencois"]').click({ force: true });
    await page.waitForFunction(
      () => document.querySelector('#martian-score').textContent === '0,84',
    );
    assert.equal(await lunarTab.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.comparison-empty').count(), 1);
    await martianTab.click();
    await page.waitForFunction(
      () =>
        document.querySelector('#comparison-target-heading').textContent ===
          'Marte' &&
        !document
          .querySelector('#comparison-content')
          .hasAttribute('aria-busy'),
    );
    assert.equal(await page.locator('#metrics tr').count(), 8);
    assert.deepEqual(
      await page
        .locator('#metrics tr')
        .evaluateAll((rows) =>
          rows.map((row) => [...row.cells].map((cell) => cell.textContent)),
        ),
      [
        ['Tipo de duna', 'Barcana', 'Barcana'],
        ['Altura média (m)', '45', '40'],
        ['Comprimento de onda (m)', '280', '310'],
        ['Orientação / azimute (°)', '75', '82'],
        ['Densidade de dunas', '—', '—'],
        ['Espaçamento médio (m)', '280', '310'],
        ['Padrão de distribuição', 'Agrupado', 'Agrupado'],
        ['Índice de aridez', '—', '—'],
      ],
    );
    assert.equal(await page.locator('#lunar-score').textContent(), '—');
    assert.equal(await page.locator('#martian-score').textContent(), '0,84');
    const duneLayout = await page.evaluate(() => ({
      top: document.querySelector('#comparison').getBoundingClientRect().top,
      bottom: document.querySelector('#similarity').getBoundingClientRect()
        .bottom,
      stats: document.querySelector('.statistics').getBoundingClientRect()
        .bottom,
      sectionBottom: document
        .querySelector('.dashboard')
        .getBoundingClientRect().bottom,
    }));
    assert.ok(
      duneLayout.top > duneLayout.stats,
      'Eight-row table must clear statistics',
    );
    assert.ok(
      duneLayout.bottom <= duneLayout.sectionBottom,
      'Panels must fit the first section',
    );
    await page.screenshot({
      path: require('node:os').tmpdir() + `/paf-${width}-mars.png`,
      fullPage: true,
    });
    // Escape during a table transition must cancel pending work.
    await page.evaluate(() =>
      document.querySelector('[data-comparison-target="lunar"]').click(),
    );
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.panel.is-visible').count(), 0);
    await page.locator('#globe').focus();
    await page.keyboard.press('ArrowRight');
    const stage = await page.locator('#globe').boundingBox();
    const x = stage.x + stage.width * 0.5,
      y = stage.y + stage.height * 0.65;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 90, y - 35, { steps: 10 });
    await page.mouse.up();
    assert.equal(
      await page.locator('.panel.is-visible').count(),
      0,
      'Drag must not select',
    );
    if (width === 1600) {
      await page.reload();
      await page.waitForFunction(
        () => document.querySelector('#globe-loading').hidden,
      );
      await page.locator('[data-location="lencois"]').click({ force: true });
      await page.waitForTimeout(3500);
      assert.equal(await page.locator('#lunar-score').textContent(), '—');
      assert.equal(await page.locator('#martian-score').textContent(), '0,84');
      assert.ok(
        (await page.locator('#comparison-location').textContent()).includes(
          'Lençóis',
        ),
      );

      const other = await page
        .locator('.globe-pin:not([hidden])[aria-pressed="false"]')
        .first();
      await other.click({ force: true });
      await page.waitForTimeout(3500);
      assert.equal(
        await page.locator('.globe-pin[aria-pressed="true"]').count(),
        1,
      );
      await page.locator('#close-selection').click();
      assert.equal(
        await page.locator('#comparison').getAttribute('aria-hidden'),
        'true',
      );
    }
    results.push({ width, height, ...geometry });
    await page.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 1366, height: 768 },
    reducedMotion: 'reduce',
  });
  await reduced.goto(
    process.env.DEMO_URL || 'http://localhost:8000/deliverables/demo/',
  );
  await reduced.waitForFunction(
    () => document.querySelector('#globe-loading').hidden,
  );
  const pin = reduced.locator('[data-location="barringer"]');
  const style = await pin.getAttribute('style');
  await reduced.waitForTimeout(400);
  assert.equal(await pin.getAttribute('style'), style);
  await pin.click();
  await reduced.waitForTimeout(100);
  assert.equal(await reduced.locator('#lunar-score').textContent(), '0,87');
  await reduced.keyboard.press('Escape');
  await reduced.close();

  const lifecycle = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  await lifecycle.addInitScript(() => {
    window.testFrames = 0;
    const original = requestAnimationFrame;
    window.requestAnimationFrame = (callback) =>
      original((time) => {
        window.testFrames++;
        callback(time);
      });
  });
  await lifecycle.goto(
    process.env.DEMO_URL || 'http://localhost:8000/deliverables/demo/',
  );
  await lifecycle.waitForFunction(
    () => document.querySelector('#globe-loading').hidden,
  );
  await lifecycle.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.style.height = '1800px';
    document.body.append(spacer);
    scrollTo(0, 1600);
  });
  await lifecycle.waitForTimeout(400);
  const stopped = await lifecycle.evaluate(() => window.testFrames);
  await lifecycle.waitForTimeout(400);
  assert.equal(
    await lifecycle.evaluate(() => window.testFrames),
    stopped,
    'Offscreen section must stop rendering',
  );
  await lifecycle.evaluate(() => scrollTo(0, 0));
  await lifecycle.waitForTimeout(400);
  assert.ok(
    (await lifecycle.evaluate(() => window.testFrames)) > stopped,
    'Visible section must resume rendering',
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      { passed: true, results, errors, reducedMotion: true },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
