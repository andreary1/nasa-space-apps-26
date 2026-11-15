// Presentation only. The shared components and selection events remain owned by app.js.
export function initAnalysisReveal(
  root = document.getElementById("view-analysis"),
) {
  if (
    !root ||
    !("IntersectionObserver" in window) ||
    !Element.prototype.animate
  )
    return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const seen = new Set(),
    pending = new Map(),
    active = new Map();
  let frame;
  const selectors =
    ".page-heading h1, .page-heading .description, :scope > .segmented, #catalog-section > .toolbar, #site-selector > button, #analysis-empty, #analysis-results .surface";
  const keyFor = (element) =>
    element.matches(".site-option")
      ? `site:${element.textContent.trim()}`
      : element.id ||
        (element.closest(".page-heading")
          ? element.className || element.tagName
          : element.matches(".toolbar")
            ? "catalog-toolbar"
            : element.matches(".segmented")
              ? "type-filter"
              : `block:${element.querySelector("h2")?.textContent}`);
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (
          !isIntersecting ||
          root.hidden ||
          !root.contains(target) ||
          target.closest("[hidden]")
        )
          continue;
        const item = pending.get(target);
        observer.unobserve(target);
        pending.delete(target);
        if (!item || seen.has(item.key)) continue;
        seen.add(item.key);
        if (reduced.matches || target.contains(document.activeElement))
          continue;
        // No hidden CSS state: without JS/IO/WAAPI every element stays readable.
        const animation = target.animate(
          [
            { opacity: 0, translate: "0 16px" },
            { opacity: 1, translate: "0 0" },
          ],
          {
            duration: 460,
            delay: item.delay,
            easing: "cubic-bezier(.2,.65,.3,1)",
            fill: "backwards",
          },
        );
        animation.id = "analysis-reveal";
        active.set(target, animation);
        animation.finished
          .catch(() => {})
          .finally(() => {
            if (active.get(target) === animation) active.delete(target);
          });
      }
    },
    { threshold: 0.08 },
  );
  function scan() {
    for (const [element, animation] of active) {
      if (
        root.hidden ||
        !root.contains(element) ||
        element.closest("[hidden]") ||
        reduced.matches
      ) {
        animation.cancel();
        active.delete(element);
      }
    }
    for (const element of pending.keys()) {
      if (
        root.hidden ||
        !root.contains(element) ||
        element.closest("[hidden]")
      ) {
        observer.unobserve(element);
        pending.delete(element);
      }
    }
    if (root.hidden) return;
    const targets = [...root.querySelectorAll(selectors)];
    let card = 0;
    for (const element of targets) {
      if (element.closest("[hidden]")) continue;
      const key = keyFor(element);
      if (seen.has(key) || pending.has(element)) continue;
      if (reduced.matches) {
        seen.add(key);
        continue;
      }
      const delay = element.matches("h1")
        ? 0
        : element.matches(".description")
          ? 60
          : element.matches(".site-option")
            ? 180 + (card++ % 4) * 50
            : 120;
      pending.set(element, { key, delay });
      observer.observe(element);
    }
  }
  const mutations = new MutationObserver(() => {
    // Cancel promptly when shared nodes move to another page, before the next paint.
    for (const [element, animation] of active) {
      if (root.hidden || !root.contains(element)) {
        animation.cancel();
        active.delete(element);
      }
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(scan);
  });
  mutations.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"],
  });
  const onMotionChange = () => {
    if (reduced.matches) {
      for (const animation of active.values()) animation.cancel();
      active.clear();
      for (const { key } of pending.values()) seen.add(key);
      pending.clear();
      observer.disconnect();
    }
    scan();
  };
  reduced.addEventListener("change", onMotionChange);
  root.addEventListener("focusin", (event) => {
    for (const [element, animation] of active) {
      if (element.contains(event.target)) {
        animation.cancel();
        active.delete(element);
      }
    }
  });
  window.addEventListener(
    "pagehide",
    () => {
      mutations.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      reduced.removeEventListener("change", onMotionChange);
      for (const animation of active.values()) animation.cancel();
    },
    { once: true },
  );
  scan();
}
initAnalysisReveal();
