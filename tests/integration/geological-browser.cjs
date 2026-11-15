// Real Wolfe Creek API flow and persisted scientific discovery; no mocked result.
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const dir = path.join(os.tmpdir(), "paf-geological-qa");
  fs.mkdirSync(dir, { recursive: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(
      (process.env.DEMO_URL || "http://127.0.0.1:8000/") + "#/intelligent",
    );
    const form = page.locator("#intelligent-form");
    await form.locator("[name=nome]").fill("Cratera de Wolfe Creek");
    await form.locator("[name=latitude]").fill("-19.17167");
    await form.locator("[name=longitude]").fill("127.79556");
    await form.locator("[name=raio_km]").fill("3");
    await form.locator("[name=comparar_com]").selectOption("lua");
    const complete = page.waitForResponse(
      async (r) =>
        r.url().includes("/api/analyze/") &&
        r.request().method() === "GET" &&
        (await r.json()).status === "complete",
      { timeout: 480000 },
    );
    await page.locator("#intelligent-submit").click();
    const job = await (await complete).json();
    assert.equal(job.result.discovery_pin.eligible, true);
    assert.equal(job.result.pin.eligible, false);
    await page
      .locator(".intelligent-discovery h3")
      .filter({ hasText: "Wolfe Creek" })
      .waitFor();
    const researchDetails = page.locator(".intelligent-discovery details");
    await researchDetails.locator("summary").click();
    assert.match(await researchDetails.innerText(), /Google Search/);
    const snapshot = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("paf-geological-history-v1")),
    );
    assert.equal(snapshot.length, 1);
    assert.equal(snapshot[0].result.discovery.text, undefined);
    await page.screenshot({
      path: path.join(dir, "wolfe-discovery.png"),
      fullPage: true,
    });
    await page.locator(".intelligent-open-discovery-map").click();
    await page.locator("#view-map:not([hidden])").waitFor();
    const pin = page.locator("#map-discoveries-layer .map-discovery");
    await pin.waitFor();
    assert.equal(await pin.count(), 1);
    assert.equal(
      await page.locator("#map-candidates-layer .map-candidate").count(),
      0,
    );
    assert.match(
      await page.locator("#map-discovery-count").innerText(),
      /^1 descoberta/,
    );
    assert.equal(await page.locator("#filter-all").innerText(), "Todos (24)");
    await pin.hover();
    assert.match(
      await page.locator("#map-pin-tooltip").innerText(),
      /Descoberta — comparação pendente.*Wolfe/s,
    );
    await page.screenshot({
      path: path.join(dir, "wolfe-map.png"),
      fullPage: true,
    });
    await pin.click();
    await page.locator("#view-intelligent:not([hidden])").waitFor();
    assert.match(
      await page.locator("#intelligent-result").innerText(),
      /Wolfe Creek/,
    );
    await page.reload();
    await page.locator(".intelligent-open-discovery-map").count();
    await page.locator("#intelligent-history button").click();
    await researchDetails.locator("summary").click();
    assert.match(
      await page.locator(".intelligent-discovery").innerText(),
      /Histórico científico local/,
    );
    await page.locator(".intelligent-open-discovery-map").click();
    await pin.waitFor();
    assert.equal(await pin.count(), 1);
    // Selection/keyboard still opens the persisted result after reload.
    await pin.focus();
    await page.keyboard.press("Enter");
    await page.locator("#view-intelligent:not([hidden])").waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS REAL: Wolfe discovery versus candidate, live sources/DEM, map tooltip/click/keyboard, 24 official points preserved, scientific persistence after reload, no Google output stored, mobile/no runtime errors. " +
        dir,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
