const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const { SITES_DATA } =
    await import("../../deliverables/demo/js/data/sites.js");
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const output = path.join(os.tmpdir(), "paf-map-qa");
  fs.mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(
      (process.env.DEMO_URL || "http://localhost:8000/deliverables/demo/") +
        "#/map",
    );
    await page.waitForSelector('#world-map-svg[data-texture-ready="true"]');
    await page.waitForSelector("#globe-loading[hidden]", { state: "attached" });
    const represented = () =>
      page
        .locator("#map-pins-layer > g")
        .evaluateAll((pins) =>
          pins
            .flatMap((p) => p.dataset.members.split(",").map(Number))
            .sort((a, b) => a - b),
        );
    assert.deepEqual(
      await represented(),
      SITES_DATA.map((_, i) => i),
    );
    assert.ok((await page.locator(".map-cluster").count()) > 0);
    assert.equal(await page.locator("#map-labels-layer text").count(), 0);
    assert.equal(await page.locator("#map-basemap-layer polygon").count(), 0);
    assert.equal(await page.locator("#site-selector button").count(), 24);
    assert.deepEqual(
      await page.locator("#site-selector strong").allTextContents(),
      SITES_DATA.map((s) => s.name),
    );
    const active = () => page.locator('#site-selector [aria-pressed="true"]');
    const card = page.locator('#site-selector [data-value="4"]');
    const identity = await card.elementHandle();
    await card.click();
    await page.waitForTimeout(350);
    assert.equal(
      await identity.evaluate(
        (el) =>
          el === document.querySelector('#site-selector [data-value="4"]'),
      ),
      true,
    );
    assert.equal(await page.locator("#site-select").inputValue(), "4");
    assert.equal(await active().count(), 1);
    assert.equal(
      await active()
        .locator("strong")
        .evaluate((el) => getComputedStyle(el).color),
      "rgb(255, 255, 255)",
    );
    assert.equal(
      await active()
        .locator("svg")
        .evaluate((el) => getComputedStyle(el).stroke),
      "rgb(255, 255, 255)",
    );
    assert.equal(
      await page
        .locator('.map-pin[data-site="erg_chebbi"]')
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#site-select").selectOption("23");
    assert.equal(await active().getAttribute("data-value"), "23");
    assert.equal(
      await page
        .locator('.map-pin[data-site="lonar"]')
        .getAttribute("aria-pressed"),
      "true",
    );
    // Every source record remains independently reachable through cluster expansion.
    for (const [index, site] of SITES_DATA.entries()) {
      await page.locator("#btn-view-mundo").click();
      let found = false;
      for (let attempt = 0; attempt < 15; attempt++) {
        const key = await page
          .locator("#map-pins-layer > g")
          .evaluateAll(
            (pins, idx) =>
              pins.find((p) =>
                p.dataset.members.split(",").map(Number).includes(idx),
              )?.dataset.members,
            index,
          );
        assert.ok(key, `${site.id}: missing group`);
        const pin = page.locator(`#map-pins-layer > g[data-members="${key}"]`);
        await pin.focus();
        await page.keyboard.press("Enter");
        if (!key.includes(",")) {
          found = true;
          break;
        }
      }
      assert.ok(found, `${site.id}: cannot expand group`);
      assert.equal(
        await page.locator("#site-select").inputValue(),
        String(index),
      );
      assert.equal(await active().getAttribute("data-value"), String(index));
      assert.equal(
        await page
          .locator(`.map-pin[data-site="${site.id}"]`)
          .getAttribute("aria-pressed"),
        "true",
      );
    }
    await page.locator("#btn-view-mundo").click();
    await page.locator("#filter-dune").click();
    assert.deepEqual(
      await represented(),
      SITES_DATA.flatMap((s, i) => (s.type === "dune" ? [i] : [])),
    );
    assert.equal(
      await page.locator("#site-selector button").count(),
      24,
      "map filters do not filter the shared catalog",
    );
    await page.locator("#filter-crater").click();
    assert.deepEqual(
      await represented(),
      SITES_DATA.flatMap((s, i) => (s.type === "crater" ? [i] : [])),
    );
    await page.locator("#filter-all").click();
    for (const [button, bounds] of [
      ["#btn-view-br", [-85, -35, -30, 10]],
      ["#btn-view-ne", [-48.5, -16, -34, -1.8]],
    ]) {
      await page.locator(button).click();
      assert.deepEqual(
        await represented(),
        SITES_DATA.flatMap((s, i) =>
          s.lon >= bounds[0] &&
          s.lon <= bounds[2] &&
          s.lat >= bounds[1] &&
          s.lat <= bounds[3]
            ? [i]
            : [],
        ),
      );
    }
    const initial = await page
      .locator("#world-map-svg")
      .getAttribute("viewBox");
    await page.locator("#map-zoom-in").click();
    const zoomed = await page.locator("#world-map-svg").getAttribute("viewBox");
    assert.notEqual(zoomed, initial);
    const box = await page.locator("#world-map-svg").boundingBox();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.72, {
      steps: 5,
    });
    await page.mouse.up();
    const dragged = await page
      .locator("#world-map-svg")
      .getAttribute("viewBox");
    assert.notEqual(dragged, zoomed);
    await page.locator("#map-zoom-reset").click();
    assert.equal(
      await page.locator("#world-map-svg").getAttribute("viewBox"),
      initial,
    );
    await page.locator("#world-map-svg").focus();
    await page.keyboard.press("+");
    assert.notEqual(
      await page.locator("#world-map-svg").getAttribute("viewBox"),
      initial,
    );
    await page.keyboard.press("Home");
    assert.equal(
      await page.locator("#world-map-svg").getAttribute("viewBox"),
      initial,
    );
    // Geographic coordinates follow the transformed map, not fixed screen pixels.
    await page.locator("#btn-view-mundo").click();
    const worldBox = await page.locator("#world-map-svg").boundingBox();
    await page.mouse.move(
      worldBox.x + worldBox.width / 2,
      worldBox.y + worldBox.height / 2,
    );
    const center = (
      await page.locator("#map-coord-display").textContent()
    ).match(/Lat: ([-\d.]+)° \| Lon: ([-\d.]+)°/);
    assert.ok(
      Math.abs(Number(center[1])) < 0.15 && Math.abs(Number(center[2])) < 0.15,
      "map center must report equator/Greenwich within one screen pixel",
    );
    for (const [width, height] of [
      [1920, 1080],
      [1600, 900],
      [1366, 768],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(250);
      await page.locator("#btn-view-mundo").click();
      await page.locator("#site-select").selectOption("4");
      await page.waitForTimeout(350);
      assert.deepEqual(
        await represented(),
        SITES_DATA.map((_, i) => i),
      );
      assert.equal(
        await page.locator(".map-pin-badge").evaluateAll((badges) => {
          const map = document
            .getElementById("world-map-svg")
            .getBoundingClientRect();
          return badges.some((badge) => {
            const b = badge.getBoundingClientRect();
            return b.top < map.top || b.bottom > map.bottom;
          });
        }),
        false,
        `${width}: marker badges must remain inside the global map`,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.equal(
        await page
          .locator("#site-selector")
          .evaluate((el) => el.scrollWidth > el.clientWidth),
        false,
      );
      assert.equal(
        await page
          .locator("#site-selector button")
          .evaluateAll((cards) =>
            cards.some((el) => el.scrollWidth > el.clientWidth),
          ),
        false,
      );
      await page.screenshot({
        path: path.join(output, `map-${width}.png`),
        fullPage: true,
      });
      await page
        .locator(".map-stage")
        .screenshot({ path: path.join(output, `stage-${width}.png`) });
      await page
        .locator("#catalog-section")
        .screenshot({ path: path.join(output, `catalog-${width}.png`) });
    }
    assert.deepEqual(errors, []);
    console.log(
      `PASS: all 24 pins reachable through clusters; map/card/dropdown synchronization; filters, regions, zoom, drag, keyboard, coordinates; 4 resolutions; no console errors. Captures: ${output}`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
