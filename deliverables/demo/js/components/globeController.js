import { Globe } from './globe.js';

export function createGlobeController(locations, onSelect, panels, onClear) {
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const container = document.getElementById('globe');
const stage = document.querySelector('.globe-stage');
const section = stage;
const loading = document.getElementById('globe-loading');
const status = document.getElementById('exploration-status');
const hint = document.getElementById('interaction-hint');
const listeners = new AbortController();
const state = {
  selection: null,
  transition: null,
  drag: null,
  speed: 0,
  scale: 1,
  visible: true,
  frame: null,
  previous: 0,
  disposed: false,
};
let globe;

function select(location) {
  state.selection = location;
  state.transition = {
    from: globe.planet.quaternion.clone(),
    to: globe.targetFor(location),
    started: performance.now(),
    duration: reducedMotion.matches ? 0 : 1450,
  };
  globe.select(location.id);
  onSelect(location.id);
  status.textContent = location.name;
  hint.textContent = 'Esc to resume exploration';
  ensureFrame();
}

function clearSelection() {
  if (!state.selection) return;
  const focusedInPanel = panels.elements.some((element) =>
    element.contains(document.activeElement),
  );
  const pin = globe.pins.find(
    (pin) => pin.location.id === state.selection.id,
  )?.button;
  state.selection = null;
  state.transition = null;
  globe.select(null);
  panels.hide();
  onClear();
  status.textContent = 'Explore the planet';
  hint.textContent = 'Drag to rotate · Select a pin';
  if (focusedInPanel) {
    if (pin && !pin.hidden) pin.focus({ preventScroll: true });
    else container.focus({ preventScroll: true });
  }
  ensureFrame();
}

function frame(now) {
  state.frame = null;
  if (!state.visible || document.hidden || state.disposed) return;
  const dt = Math.min((now - (state.previous || now)) / 1000, 0.05);
  state.previous = now;
  const smoothing = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 5);
  const targetSpeed =
    !state.selection && !state.drag && !reducedMotion.matches ? 0.035 : 0;
  state.speed += (targetSpeed - state.speed) * smoothing;
  if (state.transition) {
    const transition = state.transition;
    const t =
      transition.duration === 0
        ? 1
        : Math.min((now - transition.started) / transition.duration, 1);
    const eased = t * t * (3 - 2 * t);
    globe.planet.quaternion.slerpQuaternions(
      transition.from,
      transition.to,
      eased,
    );
    if (t > 0.55 && !panels.visible) panels.show();
    if (t === 1) {
      state.transition = null;
      state.speed = 0;
    }
  } else if (!state.drag && !state.selection) globe.spin(state.speed * dt);
  const targetScale = state.selection ? 1.045 : 1;
  state.scale += (targetScale - state.scale) * smoothing;
  if (Math.abs(targetScale - state.scale) < 0.00001) state.scale = targetScale;
  globe.planet.scale.setScalar(state.scale);
  panels.update(now);
  globe.render();
  state.frame = requestAnimationFrame(frame);
}

function ensureFrame() {
  if (
    state.frame === null &&
    state.visible &&
    !document.hidden &&
    !state.disposed
  ) {
    state.previous = 0;
    state.frame = requestAnimationFrame(frame);
  }
}

function stopFrame() {
  if (state.frame !== null) cancelAnimationFrame(state.frame);
  state.frame = null;
  state.previous = 0;
}

function bindInteractions() {
  const options = { signal: listeners.signal };
  stage.addEventListener(
    'pointerdown',
    (event) => {
      if (!event.isPrimary || event.button !== 0 || state.drag) return;
      const pin = event.target.closest('.globe-pin');
      if (
        !pin &&
        event.target !== container &&
        event.target !== globe.renderer.domElement
      )
        return;
      state.drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      globe.suppressClick = false;
    },
    options,
  );
  window.addEventListener(
    'pointermove',
    (event) => {
      const drag = state.drag;
      if (!drag || event.pointerId !== drag.id) return;
      if (
        !drag.moved &&
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6
      ) {
        drag.moved = true;
        globe.suppressClick = true;
        state.transition = null;
        stage.setPointerCapture(event.pointerId);
        container.classList.add('dragging');
        if (state.selection && !panels.visible) panels.show();
      }
      if (drag.moved)
        globe.rotate(
          (event.clientX - drag.x) * 0.005,
          (event.clientY - drag.y) * 0.005,
        );
      drag.x = event.clientX;
      drag.y = event.clientY;
    },
    options,
  );
  const finishDrag = (event) => {
    if (!state.drag || event.pointerId !== state.drag.id) return;
    if (stage.hasPointerCapture(event.pointerId))
      stage.releasePointerCapture(event.pointerId);
    state.drag = null;
    container.classList.remove('dragging');
    // The next pointerdown resets click suppression, after the current click dispatch.
  };
  window.addEventListener('pointerup', finishDrag, options);
  window.addEventListener('pointercancel', finishDrag, options);
  stage.addEventListener('lostpointercapture', finishDrag, options);
  container.addEventListener(
    'keydown',
    (event) => {
      const directions = {
        ArrowLeft: [-0.12, 0],
        ArrowRight: [0.12, 0],
        ArrowUp: [0, -0.12],
        ArrowDown: [0, 0.12],
      };
      if (directions[event.key]) {
        event.preventDefault();
        state.transition = null;
        globe.rotate(...directions[event.key]);
      }
    },
    options,
  );
  // Keyboard-generated button clicks must work even after a drag.
  stage.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Enter' || event.key === ' ')
        globe.suppressClick = false;
    },
    options,
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && !document.getElementById('view-globe').hidden) clearSelection();
    },
    options,
  );
  document
    .getElementById('close-selection')
    .addEventListener('click', clearSelection, options);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) stopFrame();
      else ensureFrame();
    },
    options,
  );
  reducedMotion.addEventListener('change', ensureFrame, options);
}

let observer;
try {
  globe = new Globe(container, locations, select);
  bindInteractions();
  observer = new IntersectionObserver(
    ([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible) ensureFrame();
      else stopFrame();
    },
    { threshold: 0 },
  );
  observer.observe(section);
  ensureFrame();
  globe.load().then(() => { loading.hidden = true; }).catch(error => { loading.textContent = 'Could not load planet textures.'; loading.setAttribute('role', 'alert'); console.error(error); });
} catch (error) {
  loading.textContent =
    'Could not load the 3D globe. Check WebGL 2 support and open the demo through the HTTP server.';
  loading.setAttribute('role', 'alert');
  console.error('Could not initialize the globe:', error);
}

window.addEventListener(
  'pagehide',
  (event) => {
    if (event.persisted) {
      stopFrame();
      return;
    }
    state.disposed = true;
    stopFrame();
    observer?.disconnect();
    listeners.abort();
    panels.dispose();
    globe?.dispose();
  },
  { signal: listeners.signal },
);
window.addEventListener('pageshow', ensureFrame, { signal: listeners.signal });

return {
  resize() { if (globe) { globe.resize(); ensureFrame(); } },
  select(id) { const location = locations.find(item => item.id === id); if (globe && location && state.selection?.id !== id) select(location); },
  refresh(next) { locations = next; globe?.setLocations(next); },
  filter(type) { if (globe) globe.filter = type; },
};
}
