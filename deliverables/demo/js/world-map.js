// Plate carrée (equirectangular): longitude is linear in X; latitude in Y.
export function projectLocation(latitude, longitude) {
  return { x: (longitude + 180) / 360, y: (90 - latitude) / 180 };
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Falha ao carregar ${source}`));
    image.src = source;
  });

export class WorldMap {
  constructor(container, locations, onSelect, invalidate, reducedMotion) {
    this.container = container;
    this.canvas = document.getElementById('map-canvas');
    this.context = this.canvas.getContext('2d');
    this.invalidate = invalidate;
    this.reducedMotion = reducedMotion;
    this.view = { zoom: 1, x: 0, y: 0 };
    this.active = false;
    this.dirty = true;
    this.focusProgress = 1;
    this.pointers = new Map();
    this.listeners = new AbortController();
    this.pins = locations.map((location) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'globe-pin map-pin';
      button.dataset.category = location.category;
      button.dataset.tone = location.tone || '';
      button.dataset.location = location.id;
      button.setAttribute(
        'aria-label',
        `Selecionar ${location.name}, ${location.country}, ${location.type}`,
      );
      button.setAttribute('aria-pressed', 'false');
      // Pin identity is the same existing CSS/SVG system, not another data list.
      button.innerHTML = `<span class="pin-badge"><svg aria-hidden="true"><use href="#i-${location.category === 'crater' ? 'crater' : 'dune'}"/></svg></span><span class="pin-stem"></span><span class="pin-dot"></span><span class="pin-tooltip"></span>`;
      button.querySelector('.pin-tooltip').textContent =
        `${location.name} · ${location.country} · ${location.type}`;
      button.addEventListener(
        'click',
        () => {
          if (!this.suppressClick) onSelect(location);
        },
        { signal: this.listeners.signal },
      );
      document.getElementById('map-pins').append(button);
      return {
        button,
        location,
        point: projectLocation(location.lat, location.lon),
      };
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.bindInteractions();
  }

  async load() {
    const [day, water, normal, clouds] = await Promise.all(
      [
        'earth-day-2k.jpg',
        'earth-water.jpg',
        'earth-normal-2k.png',
        'earth-clouds.jpg',
      ].map((file) => loadImage(`assets/${file}`)),
    );
    if (this.disposed) return;
    const raster = document.createElement('canvas');
    raster.width = 2048;
    raster.height = 1024;
    const ctx = raster.getContext('2d', { willReadFrequently: true });
    const pixels = (image) => {
      ctx.clearRect(0, 0, 2048, 1024);
      ctx.drawImage(image, 0, 0, 2048, 1024);
      return ctx.getImageData(0, 0, 2048, 1024);
    };
    const surface = pixels(day),
      mask = pixels(water).data,
      relief = pixels(normal).data,
      haze = pixels(clouds).data;
    // Palette-only raster styling, computed once. No scientific metrics are derived.
    for (let i = 0; i < surface.data.length; i += 4) {
      const ocean = clamp((mask[i] / 255 - 0.1) / 0.55, 0, 1);
      const light = clamp(
        (relief[i] - 128) * -0.8 + (relief[i + 1] - 128) * -0.6,
        -22,
        18,
      );
      const cloud = (haze[i] / 255) * 0.14 * ocean;
      const brightness =
        (surface.data[i] + surface.data[i + 1] + surface.data[i + 2]) / 765;
      const land = [
        223 + light + brightness * 10,
        230 + light + brightness * 8,
        242 + light,
      ];
      const sea = [
        99 + brightness * 35,
        158 + brightness * 30,
        188 + brightness * 25,
      ];
      for (let channel = 0; channel < 3; channel++) {
        const color = land[channel] * (1 - ocean) + sea[channel] * ocean;
        surface.data[i + channel] = color * (1 - cloud) + 243 * cloud;
      }
    }
    ctx.putImageData(surface, 0, 0);
    this.raster = raster;
    document.getElementById('map-loading').hidden = true;
    this.markDirty();
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    const mobile = matchMedia('(max-width: 1000px)').matches;
    this.bounds = mobile
      ? { left: 12, top: 50, width: width - 24, height: height - 110 }
      : {
          left: clamp(width * 0.18, 260, 320),
          top: 180,
          width: width - clamp(width * 0.18, 260, 320) - 28,
          height: height - 260,
        };
    this.centerX = this.bounds.left + this.bounds.width / 2;
    this.centerY = this.bounds.top + this.bounds.height / 2;
    this.baseWidth = Math.min(this.bounds.width, this.bounds.height * 2);
    this.baseHeight = this.baseWidth / 2;
    const ratio = Math.min(devicePixelRatio, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // Recompute a selected camera after a resize without changing shared selection.
    if (this.selection && !this.manuallyMoved) {
      const point = projectLocation(this.selection.lat, this.selection.lon);
      this.view.x = (0.5 - point.x) * this.baseWidth * this.view.zoom;
      this.view.y = (0.5 - point.y) * this.baseHeight * this.view.zoom;
      this.transition = null;
      this.focusProgress = 1;
    }
    this.markDirty();
  }

  setActive(active) {
    this.active = active;
    if (!active) {
      this.pointers.clear();
      this.transition = null;
      this.container.classList.remove('dragging');
    } else this.resize();
  }

  markDirty() {
    this.dirty = true;
    if (this.active) this.invalidate();
  }

  moveTo(target, selection = false) {
    this.transition = {
      from: { ...this.view },
      to: target,
      started: performance.now(),
      duration: this.reducedMotion.matches ? 0 : selection ? 900 : 350,
      selection,
    };
    this.focusProgress = selection ? 0 : 1;
    this.markDirty();
  }

  focus(location) {
    this.selection = location;
    this.manuallyMoved = false;
    this.pins.forEach((pin) =>
      pin.button.setAttribute(
        'aria-pressed',
        String(pin.location.id === location.id),
      ),
    );
    const point = projectLocation(location.lat, location.lon),
      zoom = 1.35;
    this.moveTo(
      {
        zoom,
        x: (0.5 - point.x) * this.baseWidth * zoom,
        y: (0.5 - point.y) * this.baseHeight * zoom,
      },
      true,
    );
  }

  clearSelection() {
    this.selection = null;
    this.pins.forEach((pin) =>
      pin.button.setAttribute('aria-pressed', 'false'),
    );
    if (this.active) this.reset();
    else {
      this.transition = null;
      this.view = { zoom: 1, x: 0, y: 0 };
      this.markDirty();
    }
  }

  reset() {
    this.manuallyMoved = false;
    this.moveTo({ zoom: 1, x: 0, y: 0 });
  }

  update(now) {
    if (this.transition) {
      const transition = this.transition;
      const t = transition.duration
        ? Math.min((now - transition.started) / transition.duration, 1)
        : 1;
      const eased = t * t * (3 - 2 * t);
      for (const key of ['zoom', 'x', 'y'])
        this.view[key] =
          transition.from[key] +
          (transition.to[key] - transition.from[key]) * eased;
      if (transition.selection) this.focusProgress = t;
      this.dirty = true;
      if (t === 1) this.transition = null;
    }
    if (this.dirty) this.render();
  }

  render() {
    if (!this.width || !this.height) return;
    const { zoom, x, y } = this.view;
    const width = this.baseWidth * zoom,
      height = this.baseHeight * zoom;
    const left = this.centerX - width / 2 + x,
      top = this.centerY - height / 2 + y;
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();
    this.context.beginPath();
    this.context.rect(
      this.bounds.left,
      this.bounds.top,
      this.bounds.width,
      this.bounds.height,
    );
    this.context.clip();
    if (this.raster)
      this.context.drawImage(this.raster, left, top, width, height);
    this.context.restore();
    this.pins.forEach(({ button, point }) => {
      const px = left + point.x * width,
        py = top + point.y * height;
      button.hidden =
        px < this.bounds.left + 15 ||
        px > this.bounds.left + this.bounds.width - 15 ||
        py < this.bounds.top + 55 ||
        py > this.bounds.top + this.bounds.height - 5;
      // Anchor the center of the pin's dot exactly on the projected coordinate.
      button.style.transform = `translate(${px - 21}px, ${py - 53.5}px)`;
    });
    this.canvas.dataset.zoom = zoom.toFixed(4);
    document.getElementById('map-zoom').textContent =
      `${Math.round(zoom * 100)}%`;
    document.getElementById('map-zoom-in').disabled = zoom >= 5;
    document.getElementById('map-zoom-out').disabled = zoom <= 1;
    this.dirty = false;
  }

  constrain() {
    this.view.x = clamp(
      this.view.x,
      (-this.baseWidth * this.view.zoom) / 2,
      (this.baseWidth * this.view.zoom) / 2,
    );
    this.view.y = clamp(
      this.view.y,
      (-this.baseHeight * this.view.zoom) / 2,
      (this.baseHeight * this.view.zoom) / 2,
    );
  }

  zoomAt(zoom, clientX, clientY) {
    const bounds = this.container.getBoundingClientRect();
    const x = clientX - bounds.left - this.centerX,
      y = clientY - bounds.top - this.centerY;
    const factor = clamp(zoom, 1, 5) / this.view.zoom;
    this.view.x = x - (x - this.view.x) * factor;
    this.view.y = y - (y - this.view.y) * factor;
    this.view.zoom = clamp(zoom, 1, 5);
    this.transition = null;
    this.manuallyMoved = true;
    this.focusProgress = 1;
    this.constrain();
    this.markDirty();
  }

  bindInteractions() {
    const options = { signal: this.listeners.signal };
    const zoomBy = (factor) => {
      const bounds = this.container.getBoundingClientRect();
      this.zoomAt(
        this.view.zoom * factor,
        bounds.left + this.centerX,
        bounds.top + this.centerY,
      );
    };
    document
      .getElementById('map-zoom-in')
      .addEventListener('click', () => zoomBy(1.3), options);
    document
      .getElementById('map-zoom-out')
      .addEventListener('click', () => zoomBy(1 / 1.3), options);
    document
      .getElementById('map-reset')
      .addEventListener('click', () => this.reset(), options);
    this.container.addEventListener(
      'wheel',
      (event) => {
        if (!this.active) return;
        const rect = this.container.getBoundingClientRect();
        const px = event.clientX - rect.left,
          py = event.clientY - rect.top;
        if (
          px < this.bounds.left ||
          px > this.bounds.left + this.bounds.width ||
          py < this.bounds.top ||
          py > this.bounds.top + this.bounds.height
        )
          return;
        event.preventDefault();
        const delta =
          event.deltaY *
          (event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? this.height
              : 1);
        this.zoomAt(
          this.view.zoom * Math.exp(-clamp(delta, -200, 200) * 0.002),
          event.clientX,
          event.clientY,
        );
      },
      { ...options, passive: false },
    );
    this.container.addEventListener(
      'pointerdown',
      (event) => {
        if (!this.active || event.button !== 0) return;
        if (!this.pointers.size) this.suppressClick = false;
        this.pointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
          startX: event.clientX,
          startY: event.clientY,
        });
        if (this.pointers.size > 1) {
          this.suppressClick = true;
          this.container.setPointerCapture(event.pointerId);
        }
      },
      options,
    );
    this.container.addEventListener(
      'pointermove',
      (event) => {
        const point = this.pointers.get(event.pointerId);
        if (!point) return;
        const previous = [...this.pointers.values()].map((p) => ({ ...p }));
        const dx = event.clientX - point.x,
          dy = event.clientY - point.y;
        point.x = event.clientX;
        point.y = event.clientY;
        if (this.pointers.size > 1) {
          const current = [...this.pointers.values()];
          const distance = (points) =>
            Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
          const midpoint = (points) => ({
            x: (points[0].x + points[1].x) / 2,
            y: (points[0].y + points[1].y) / 2,
          });
          const before = midpoint(previous),
            after = midpoint(current);
          this.view.x += after.x - before.x;
          this.view.y += after.y - before.y;
          this.zoomAt(
            (this.view.zoom * distance(current)) /
              Math.max(1, distance(previous)),
            after.x,
            after.y,
          );
          return;
        }
        if (
          !this.suppressClick &&
          Math.hypot(point.x - point.startX, point.y - point.startY) > 6
        ) {
          this.suppressClick = true;
          this.container.setPointerCapture(event.pointerId);
          this.container.classList.add('dragging');
        }
        if (!this.suppressClick) return;
        this.view.x += dx;
        this.view.y += dy;
        this.transition = null;
        this.manuallyMoved = true;
        this.focusProgress = 1;
        this.constrain();
        this.markDirty();
      },
      options,
    );
    const finish = (event) => {
      this.pointers.delete(event.pointerId);
      if (this.container.hasPointerCapture(event.pointerId))
        this.container.releasePointerCapture(event.pointerId);
      if (!this.pointers.size) this.container.classList.remove('dragging');
    };
    this.container.addEventListener('pointerup', finish, options);
    this.container.addEventListener('pointercancel', finish, options);
    this.container.addEventListener(
      'lostpointercapture',
      (event) => {
        this.pointers.delete(event.pointerId);
        if (!this.pointers.size) this.container.classList.remove('dragging');
      },
      options,
    );
    this.container.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter' || event.key === ' ')
          this.suppressClick = false;
        if (event.target !== this.container) return;
        const directions = {
          ArrowLeft: [45, 0],
          ArrowRight: [-45, 0],
          ArrowUp: [0, 45],
          ArrowDown: [0, -45],
        };
        if (directions[event.key]) {
          event.preventDefault();
          const [dx, dy] = directions[event.key];
          this.view.x += dx;
          this.view.y += dy;
          this.transition = null;
          this.focusProgress = 1;
          this.manuallyMoved = true;
          this.constrain();
          this.markDirty();
        } else if (['+', '=', '-', 'Home'].includes(event.key)) {
          event.preventDefault();
          if (event.key === 'Home') this.reset();
          else zoomBy(event.key === '-' ? 1 / 1.3 : 1.3);
        }
      },
      options,
    );
  }

  dispose() {
    this.disposed = true;
    this.active = false;
    this.listeners.abort();
    this.resizeObserver.disconnect();
    this.pointers.clear();
    this.transition = null;
    this.raster = null;
    this.canvas.width = this.canvas.height = 0;
  }
}
