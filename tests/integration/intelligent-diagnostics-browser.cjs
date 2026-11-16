// Browser integration against real API/DEM; no mocked scientific result.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const dir = path.join(os.tmpdir(), "paf-diagnostic-qa");
  fs.mkdirSync(dir, { recursive: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      (process.env.DEMO_URL || "http://127.0.0.1:8000/") + "#/intelligent",
    );
    for (const [id, name, lat, lon, radius, expected] of [
      [
        "erg-chebbi",
        "Nome arbitrário no local de Erg Chebbi",
        31.1381,
        -3.9761,
        5,
        "insufficient_data",
      ],
      [
        "barringer",
        "Nome arbitrário em Barringer",
        35.0333,
        -111.0167,
        2,
        "insufficient_data",
      ],
      [
        "barringer-contexto",
        "Barringer com entorno",
        35.0333,
        -111.0167,
        3,
        "below_threshold",
      ],
    ]) {
      const form = page.locator("#intelligent-form");
      await form.locator("[name=nome]").fill(name);
      await form.locator("[name=latitude]").fill(String(lat));
      await form.locator("[name=longitude]").fill(String(lon));
      await form.locator("[name=raio_km]").fill(String(radius));
      const complete = page.waitForResponse(
        async (r) =>
          r.url().includes("/api/analyze/") &&
          r.request().method() === "GET" &&
          (await r.json()).status === "complete",
        { timeout: 380000 },
      );
      await page.locator("#intelligent-submit").click();
      const job = await (await complete).json();
      assert.equal(
        job.result.comparisons[id === "erg-chebbi" ? "marte" : "lua"].diagnosis
          .outcome,
        expected,
      );
      await page
        .locator("#intelligent-result h2")
        .filter({ hasText: name })
        .waitFor();
      const technical = page
        .locator("#intelligent-result details")
        .filter({
          has: page
            .locator("summary")
            .filter({ hasText: /^Technical Analysis Details$/ }),
        })
        .first();
      await technical.locator("summary").first().click();
      assert.match(await technical.innerText(), new RegExp(expected === "below_threshold" ? "Below Threshold" : "Insufficient Data"));
      const downloadEvent = page.waitForEvent("download");
      await page.locator(".intelligent-export-diagnostic").click();
      const download = await downloadEvent;
      const file = path.join(dir, id + "-browser.json");
      await download.saveAs(file);
      assert.equal(JSON.parse(fs.readFileSync(file, "utf8")).id, job.id);
      if (id === "barringer") {
        await page.locator(".intelligent-apply-suggestion").click();
        assert.equal(await form.locator("[name=raio_km]").inputValue(), "2.5");
      }
      if (id === "barringer-contexto") {
        const geometryEvent = page.waitForEvent("download");
        await page.locator(".intelligent-export-geometry").click();
        const geometry = await geometryEvent;
        const output = path.join(dir, "barringer-measured.geojson");
        await geometry.saveAs(output);
        const feature = JSON.parse(fs.readFileSync(output, "utf8"));
        assert.equal(feature.geometry.coordinates[0].length, 73);
        assert.equal(Object.keys(feature.properties.measurements).length, 11);
      }
      await page.screenshot({
        path: path.join(dir, id + "-technical.png"),
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.setViewportSize({ width: 1366, height: 768 });
    }
    assert.deepEqual(errors, []);
    console.log(
      "PASS REAL: Erg Chebbi/Barringer diagnostics, arbitrary names with real coordinates, absent versus computed low score, radius suggestion, JSON/GeoJSON downloads, mobile layout; no runtime errors. " +
        dir,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
