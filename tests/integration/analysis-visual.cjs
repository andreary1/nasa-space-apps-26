const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const url = process.env.DEMO_URL || "http://localhost:8000/deliverables/demo/";
const go = async (page, name) => {
  await page.goto(url + "#/" + name);
  try {
    await page.waitForSelector(`#view-${name}:not([hidden])`);
  } catch (error) {
    console.error(
      "Navigation diagnostics",
      await page.evaluate(() => ({
        hash: location.hash,
        visible: [...document.querySelectorAll("[data-page-view]")]
          .filter((e) => !e.hidden)
          .map((e) => e.id),
        toast: document.getElementById("toast-container")?.textContent,
      })),
    );
    throw error;
  }
};

const instrument = () => {
  window.reveals = [];
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (frames, options) {
    if (
      this.closest("#view-analysis") &&
      Array.isArray(frames) &&
      frames[0]?.opacity === 0
    ) {
      window.reveals.push({
        key:
          this.id ||
          (this.classList.contains("site-option")
            ? `site:${this.dataset.value}`
            : this.matches(".surface")
              ? `surface:${this.querySelector("h2")?.textContent}`
              : this.tagName),
        delay: options.delay,
        duration: options.duration,
      });
    }
    return animate.call(this, frames, options);
  };
};
const contents = (page) =>
  page.evaluate(() => ({
    title: document.getElementById("catalog-title").textContent.trim(),
    names: [...document.querySelectorAll("#site-select option")].map((el) => [
      el.value,
      el.textContent,
    ]),
    selection: document.getElementById("site-select").value,
    empty: !document.getElementById("analysis-empty").hidden,
    emptyText: document.getElementById("analysis-empty").textContent,
    pair: document.getElementById("pair-title").textContent,
    coordinates: document.getElementById("site-coords").textContent,
    score: document.getElementById("score-display").textContent,
    distance: document.getElementById("distance-display").textContent,
    diagnoses: [...document.querySelectorAll(".diagnostics li")].map(
      (el) => el.textContent,
    ),
    metrics: [...document.querySelectorAll("#metrics-table-body tr")].map(
      (tr) => [...tr.cells].map((td) => td.textContent),
    ),
    rankings: document.getElementById("top-matches-list").textContent,
  }));
const appearance = (page) =>
  page.evaluate(() => {
    const selectors = [
      ".sidebar",
      "#catalog-section",
      "#catalog-title",
      "#site-select",
      "#site-selector button",
      '#site-selector [aria-pressed="true"]',
      "#comparison-card-section",
      "#general-comparisons-section .surface",
    ];
    const properties = [
      "backgroundImage",
      "backgroundColor",
      "borderRadius",
      "borderColor",
      "boxShadow",
      "fontSize",
      "fontWeight",
      "color",
      "padding",
      "gap",
      "gridTemplateColumns",
    ];
    return selectors.map((selector) => {
      const el = document.querySelector(selector);
      if (!el || el.closest("[hidden]")) return null;
      const css = getComputedStyle(el);
      return properties.map((prop) => css[prop]);
    });
  });

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const output = path.join(os.tmpdir(), "paf-analysis-qa");
  fs.mkdirSync(output, { recursive: true });
  try {
    const errors = [];
    const current = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    current.on("pageerror", (e) => errors.push(e.message));
    current.on("console", (m) => {
      if (m.type() === "error" && !m.location().url.endsWith("/api/health"))
        errors.push(m.text());
    });
    current.on("response", (r) => {
      if (r.status() >= 400 && !r.url().endsWith("/api/health"))
        errors.push(`${r.status()} ${r.url()}`);
    });
    const baseline = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    baseline.on("pageerror", (e) => errors.push(`Baseline: ${e.message}`));
    const original = execFileSync(
      "git",
      ["show", "HEAD:deliverables/demo/js/components/siteSelector.js"],
      { encoding: "utf8" },
    );
    await baseline.route("**/js/components/siteSelector.js", (route) =>
      route.fulfill({ body: original, contentType: "text/javascript" }),
    );
    await baseline.route("**/js/components/analysisReveal.js", (route) =>
      route.fulfill({ body: "export {};", contentType: "text/javascript" }),
    );
    await baseline.route("**/styles/analysis.css", (route) =>
      route.fulfill({ body: "", contentType: "text/css" }),
    );
    await Promise.all([go(current, "analysis"), go(baseline, "analysis")]);
    for (const type of ["dune", "crater"]) {
      for (const page of [baseline, current])
        await page
          .locator(`[data-action="setAnalysisType"][data-value="${type}"]`)
          .click();
      assert.deepEqual(await contents(current), await contents(baseline));
      const options = await current
        .locator("#site-select option")
        .evaluateAll((options) => options.map((o) => o.value));
      assert.equal(options.length, type === "dune" ? 8 : 16);
      for (const index of options) {
        await current.locator("#site-select").selectOption(index);
        await baseline.locator("#site-select").selectOption(index);
        assert.deepEqual(
          await contents(current),
          await contents(baseline),
          `scientific text or state changed for ${index}`,
        );
        assert.equal(
          await current
            .locator('#site-selector [aria-pressed="true"]')
            .getAttribute("data-value"),
          index,
        );
      }
    }
    // Compare actual computed styles outside this page against the unmodified renderer/CSS.
    for (const name of [
      "map",
      "comparisons",
      "reports",
      "overview",
      "settings",
      "globe",
    ]) {
      for (const page of [baseline, current]) await go(page, name);
      assert.deepEqual(
        await appearance(current),
        await appearance(baseline),
        `${name}: unrelated appearance changed`,
      );
    }
    await baseline.close();
    for (const [width, height] of [
      [1920, 1080],
      [1600, 900],
      [1366, 768],
      [390, 844],
    ]) {
      await current.setViewportSize({ width, height });
      await go(current, "analysis");
      for (const type of ["dune", "crater"]) {
        await current
          .locator(`[data-action="setAnalysisType"][data-value="${type}"]`)
          .click();
        const index = type === "dune" ? "4" : "18";
        await current.locator(`#site-selector [data-value="${index}"]`).click();
        await current.locator('#site-selector [aria-pressed="true"]').focus();
        assert.equal(await current.locator("#site-select").inputValue(), index);
        assert.equal(
          await current
            .locator('#site-selector [aria-pressed="true"] strong')
            .evaluate((el) => getComputedStyle(el).color),
          "rgb(255, 255, 255)",
        );
        assert.equal(
          await current.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.equal(
          await current
            .locator("#site-selector button")
            .evaluateAll((cards) =>
              cards.some((el) => el.scrollWidth > el.clientWidth),
            ),
          false,
        );
        await current.locator("#tab-btn-bars").click();
        assert.ok(await current.locator("#studio-bars-view").isVisible());
        await current.locator("#tab-btn-radar").click();
        assert.ok(await current.locator("#studio-radar-view").isVisible());
        await current.locator("#tab-btn-profile").click();
        await current.screenshot({
          path: path.join(output, `${type}-${width}.png`),
          fullPage: true,
        });
        await current
          .locator("#catalog-section")
          .screenshot({
            path: path.join(output, `catalog-${type}-${width}.png`),
          });
      }
    }
    await current.close();
    const motion = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "no-preference",
    });
    await motion.addInitScript(instrument);
    motion.on("pageerror", (e) => errors.push(e.message));
    await go(motion, "analysis");
    await motion.waitForFunction(() =>
      window.reveals.some((r) => r.key === "site:0"),
    );
    const initial = await motion.evaluate(() => window.reveals);
    assert.ok(initial.some((r) => r.key === "H1" && r.delay === 0));
    assert.ok(initial.some((r) => r.key === "P" && r.delay === 60));
    const cards = initial.filter((r) => r.key.startsWith("site:"));
    assert.ok(
      cards.length > 1 &&
        cards.every((r) => r.delay >= 180 && r.duration === 460),
    );
    assert.ok(
      new Set(cards.map((r) => r.delay)).size > 1,
      "cards must be staggered",
    );
    assert.equal(
      initial.some((r) => r.key === "surface:Análise morfométrica"),
      false,
    );
    await motion
      .locator("#general-comparisons-section")
      .scrollIntoViewIfNeeded();
    await motion.waitForFunction(() =>
      window.reveals.some((r) => r.key === "surface:Análise morfométrica"),
    );
    await motion.waitForTimeout(850);
    const count = await motion.evaluate(() => window.reveals.length);
    await motion.evaluate(() => window.scrollTo(0, 0));
    await motion.waitForTimeout(100);
    await motion
      .locator("#general-comparisons-section")
      .scrollIntoViewIfNeeded();
    await motion.waitForTimeout(150);
    assert.equal(
      await motion.evaluate(() => window.reveals.length),
      count,
      "scroll reveal replayed",
    );
    await motion.locator('#site-selector [data-value="4"]').click();
    await motion.waitForTimeout(850);
    const cardCount = await motion.evaluate(
      () => window.reveals.filter((r) => r.key.startsWith("site:")).length,
    );
    await motion.locator('#site-selector [data-value="0"]').click();
    await motion.waitForTimeout(150);
    assert.equal(
      await motion.evaluate(
        () => window.reveals.filter((r) => r.key.startsWith("site:")).length,
      ),
      cardCount,
    );
    const hover = motion.locator('#site-selector [data-value="1"]');
    const before = await hover.boundingBox();
    await hover.hover();
    await motion.waitForTimeout(300);
    const after = await hover.boundingBox();
    assert.equal(after.height, before.height);
    assert.ok(Math.abs(after.y - before.y + 2) < 0.1);
    await motion.emulateMedia({ reducedMotion: "reduce" });
    await motion.waitForTimeout(100);
    assert.equal(
      await motion
        .locator("#view-analysis")
        .evaluate(
          (root) =>
            root
              .getAnimations({ subtree: true })
              .filter((a) => a.id === "analysis-reveal").length,
        ),
      0,
    );
    await motion.emulateMedia({ reducedMotion: "no-preference" });
    await motion
      .locator('[data-action="setAnalysisType"][data-value="crater"]')
      .click();
    await motion.waitForFunction(() =>
      document
        .querySelector("#view-analysis")
        .getAnimations({ subtree: true })
        .some((a) => a.id === "analysis-reveal"),
    );
    await motion.locator('.sidebar [data-page="comparisons"]').click();
    assert.equal(
      await motion
        .locator("#catalog-section")
        .evaluate(
          (el) =>
            el
              .getAnimations({ subtree: true })
              .filter((a) => a.id === "analysis-reveal").length,
        ),
      0,
      "shared catalog animation leaked into another page",
    );
    await motion.close();
    const reduced = await browser.newPage({
      viewport: { width: 1366, height: 768 },
      reducedMotion: "reduce",
    });
    await reduced.addInitScript(instrument);
    await go(reduced, "analysis");
    await reduced.waitForTimeout(200);
    assert.equal(await reduced.evaluate(() => window.reveals.length), 0);
    assert.equal(
      await reduced
        .locator("#site-selector button")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
    );
    await reduced.close();
    const noObserver = await browser.newPage({
      viewport: { width: 1366, height: 768 },
    });
    await noObserver.route("**/js/components/analysisReveal.js", (route) =>
      route.fulfill({ body: "export {};", contentType: "text/javascript" }),
    );
    await go(noObserver, "analysis");
    await noObserver.waitForSelector("#globe-loading[hidden]", {
      state: "attached",
    });
    await noObserver.evaluate(async () => {
      const native = window.IntersectionObserver;
      delete window.IntersectionObserver;
      try {
        await import("./js/components/analysisReveal.js?no-observer");
      } finally {
        window.IntersectionObserver = native;
      }
    });
    assert.equal(
      await noObserver
        .locator("#site-selector button")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
    );
    assert.deepEqual(errors, []);
    console.log(
      `PASS: identical scientific text/metrics for all 24 sites; unchanged computed styles outside analysis; cards, filters, charts, dropdown and 4 resolutions; one-time/staggered scroll reveal, hover, reduced motion, no-IO fallback; no new console errors (existing optional /api/health 404 excluded). Captures: ${output}`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
