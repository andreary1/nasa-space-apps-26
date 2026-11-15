const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.DEMO_URL || "http://127.0.0.1:8000/";
(async () => {
  const { compareScience } =
    await import("../../scripts/ai_reports/intelligent_analysis.mjs");
  const { MOON_CRATER_REFERENCES } =
    await import("../../deliverables/demo/js/data/moon.js");
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const output = path.join(os.tmpdir(), "paf-intelligent-qa");
  fs.mkdirSync(output, { recursive: true });
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
    await page.goto(base + "#/intelligent");
    await page.locator("#view-intelligent:not([hidden])").waitFor();
    assert.equal(
      await page
        .locator('.sidebar nav [aria-current="page"]')
        .getAttribute("data-page"),
      "intelligent",
    );
    assert.equal(await page.locator(".sidebar nav [data-page]").count(), 8);
    for (const [width, height] of [
      [1920, 1080],
      [1600, 900],
      [1366, 768],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.screenshot({
        path: path.join(output, `form-${width}.png`),
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator("#intelligent-lat").fill("91");
    await page.locator("#intelligent-submit").click();
    assert.equal(
      await page.locator("#intelligent-lat").evaluate((e) => e.validity.valid),
      false,
    );
    await page.locator("#intelligent-lat").fill("-3.97");
    const requestBody = {
      nome: "Serra da Aratanha",
      latitude: -3.97,
      longitude: -38.63,
      raio_km: 5,
      comparar_com: ["lua", "marte"],
    };
    const owner = await page.evaluate(() =>
      sessionStorage.getItem("paf-analysis-session"),
    );
    const headers = {
      "Content-Type": "application/json",
      "X-Analysis-Session": owner,
    };
    const invalid = await fetch(new URL("/api/analyze", base), {
      method: "POST",
      headers,
      body: JSON.stringify({ ...requestBody, latitude: 91 }),
    });
    assert.equal(invalid.status, 400);
    const posted = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        new URL(r.url()).pathname === "/api/analyze",
    );
    await page.locator("#intelligent-submit").click();
    assert.ok(await page.locator("#intelligent-submit").isDisabled());
    const id = (await (await posted).json()).id;
    assert.ok(id);
    const duplicate = await fetch(new URL("/api/analyze", base), {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
    assert.equal((await duplicate.json()).id, id);
    const other = await fetch(new URL(`/api/analyze/${id}`, base), {
      headers: { "X-Analysis-Session": "11111111-1111-4111-8111-111111111111" },
    });
    assert.equal(other.status, 404);
    await page.waitForFunction(
      () =>
        document.querySelectorAll("#intelligent-history button").length > 0 ||
        !document.querySelector("#intelligent-error").hidden,
      {},
      { timeout: 410000 },
    );
    assert.equal(
      await page.locator("#intelligent-error").isVisible(),
      false,
      await page.locator("#intelligent-error").textContent(),
    );
    const job = await (
      await fetch(new URL(`/api/analyze/${id}`, base), { headers })
    ).json();
    assert.equal(job.status, "complete");
    assert.equal(job.result.pin.eligible, false);
    assert.equal(job.result.feature, null);
    assert.equal(job.result.comparisons.lua.score, null);
    assert.equal(job.result.comparisons.marte.score, null);
    assert.ok(
      job.result.topography.metrics.elevation_max_m >
        job.result.topography.metrics.elevation_min_m,
    );
    assert.ok(job.stages.some((s) => s.id === "processando_relevo"));
    fs.writeFileSync(
      path.join(output, "aratanha-real.json"),
      JSON.stringify(job.result, null, 2),
    );
    assert.equal(
      await page
        .locator(".intelligent-score strong")
        .allTextContents()
        .then((t) => t.join(",")),
      "N/D,N/D",
    );
    await page.screenshot({
      path: path.join(output, "aratanha-real.png"),
      fullPage: true,
    });
    await page.locator('.sidebar [data-page="map"]').click();
    assert.equal(await page.locator("#map-candidates-layer > g").count(), 0);
    assert.equal(await page.locator("#filter-all").textContent(), "Todos (24)");
    await page.locator('.sidebar [data-page="intelligent"]').click();
    await page.locator("#intelligent-history button").click();
    assert.match(
      await page.locator("#intelligent-result").innerText(),
      /Serra da Aratanha/,
    );
    console.log(
      `PASS REAL: Aratanha DEM ${job.result.topography.source.title}; metrics calculated, no invented scores/pin; real stages, validation, session isolation, duplicate prevention, history and 4 resolutions. AI: ${job.result.explanation.status}`,
    );
    // Positive pin lifecycle uses an explicitly artificial test-only response, never real data.
    const ref = MOON_CRATER_REFERENCES.find((r) => r.id === "censorinus");
    const measurements = Object.fromEntries(
      Object.entries(ref)
        .filter(([, v]) => typeof v === "number")
        .map(([key, value]) => [
          key,
          {
            value,
            unit: key.includes("slope")
              ? "deg"
              : key.endsWith("_m")
                ? "m"
                : "1",
            source: "Numerical test only",
          },
        ]),
    );
    const fake = compareScience({
      localidade: {
        ...requestBody,
        nome: "Fixture artificial de teste",
        latitude: 0,
        longitude: 0,
      },
      topography: {
        ...job.result.topography,
        coverage: 1,
        source: {
          id: "test",
          title: "Synthetic fixture, NOT real data",
          kind: "Test only",
        },
      },
      feature: {
        kind: "crater",
        reviewed: true,
        extent_m: 4139,
        source: "Automated test only",
        method: "Numerical fixture",
        measurement_resolution_m: 10,
        measurements,
      },
    });
    fake.id = "test-only";
    fake.explanation = {
      status: "unavailable",
      message: "Artificial automated test; no AI call.",
    };
    assert.equal(fake.pin.eligible, true);
    await page.route("**/api/analyze", (route) =>
      route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ id: "test-only" }),
      }),
    );
    await page.route("**/api/analyze/test-only", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-only",
          status: "complete",
          message: "Test fixture",
          stages: [],
          result: fake,
        }),
      }),
    );
    await page.locator("#intelligent-submit").click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll("#intelligent-history button").length === 2,
    );
    await page.locator(".intelligent-open-map").click();
    assert.ok(await page.locator("#view-map").isVisible());
    await page.locator("#btn-view-mundo").click();
    assert.equal(await page.locator("#map-candidates-layer > g").count(), 1);
    assert.equal(await page.locator("#filter-all").textContent(), "Todos (24)");
    assert.equal(await page.locator("#site-select option").count(), 24);
    await page.locator(".map-candidate").focus();
    await page.keyboard.press("Enter");
    assert.ok(await page.locator("#view-intelligent").isVisible());
    assert.match(
      await page.locator("#intelligent-result").innerText(),
      /Fixture artificial/,
    );
    assert.deepEqual(errors, []);
    const motion = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "no-preference",
    });
    await motion.goto(base + "#/intelligent");
    await motion.waitForFunction(() =>
      document
        .querySelector(".intelligent-form-card")
        .getAnimations()
        .some((a) => a.id === "intelligent-reveal"),
    );
    const timing = await motion
      .locator(".intelligent-form-card")
      .evaluate((el) =>
        el
          .getAnimations()
          .find((a) => a.id === "intelligent-reveal")
          .effect.getTiming(),
      );
    assert.equal(timing.duration, 460);
    assert.ok(timing.delay >= 120);
    await motion.emulateMedia({ reducedMotion: "reduce" });
    await motion.waitForFunction(
      () =>
        !document
          .querySelector("#view-intelligent")
          .getAnimations({ subtree: true })
          .some((a) => a.id === "intelligent-reveal"),
    );
    assert.equal(
      await motion
        .locator(".intelligent-form-card")
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
    );
    await motion.close();
    console.log(
      `PASS FIXTURE ONLY: eligible candidate renders separately, correct geographic anchor, opens its result; official counters/catalog unchanged; no runtime/console errors. Artifacts: ${output}`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
