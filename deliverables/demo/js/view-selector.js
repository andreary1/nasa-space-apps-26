export class ViewSelector {
  constructor(onChange, hasSelection, reducedMotion) {
    this.root = document.querySelector('.view-selector');
    this.toggle = document.getElementById('view-selector-toggle');
    this.menu = document.getElementById('view-selector-menu');
    this.items = [...this.menu.querySelectorAll('[data-view]')];
    this.hasSelection = hasSelection;
    this.reducedMotion = reducedMotion;
    this.listeners = new AbortController();
    const options = { signal: this.listeners.signal };
    this.root.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType !== 'touch') this.open();
      },
      options,
    );
    this.root.addEventListener(
      'pointerleave',
      () => {
        if (!this.pinned && !this.root.contains(document.activeElement))
          this.close();
      },
      options,
    );
    this.toggle.addEventListener(
      'click',
      () => {
        if (this.pinned) this.close();
        else {
          this.pinned = true;
          this.open();
        }
      },
      options,
    );
    this.items.forEach((item) =>
      item.addEventListener(
        'click',
        () => {
          onChange(item.dataset.view);
          this.close(true);
        },
        options,
      ),
    );
    this.root.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          if (this.hasSelection()) return; // The shared selection owns the first Esc.
          event.preventDefault();
          event.stopPropagation();
          this.close(true);
          return;
        }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
          return;
        event.preventDefault();
        this.pinned = true;
        this.open();
        let index = this.items.indexOf(document.activeElement);
        if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = this.items.length - 1;
        else
          index =
            index < 0
              ? event.key === 'ArrowDown'
                ? 0
                : this.items.length - 1
              : (index +
                  (event.key === 'ArrowDown' ? 1 : -1) +
                  this.items.length) %
                this.items.length;
        this.items[index].focus();
      },
      options,
    );
    this.root.addEventListener(
      'focusout',
      (event) => {
        if (!this.root.contains(event.relatedTarget)) this.close();
      },
      options,
    );
    document.addEventListener(
      'pointerdown',
      (event) => {
        if (!this.root.contains(event.target)) this.close();
      },
      options,
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (
          event.key === 'Escape' &&
          !this.hasSelection() &&
          !event.defaultPrevented
        )
          this.close();
      },
      options,
    );
  }

  open() {
    if (!this.menu.hidden) return;
    this.menu.hidden = false;
    this.toggle.setAttribute('aria-expanded', 'true');
    this.menu.animate(
      [
        { opacity: 0, transform: 'translateX(-6px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: this.reducedMotion.matches ? 0 : 180, easing: 'ease-out' },
    );
  }

  close(returnFocus = false) {
    this.pinned = false;
    this.menu.hidden = true;
    this.toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) this.toggle.focus({ preventScroll: true });
  }

  setActive(mode) {
    this.items.forEach((item) =>
      item.setAttribute('aria-checked', String(item.dataset.view === mode)),
    );
    this.toggle
      .querySelector('use')
      .setAttribute('href', mode === '2d' ? '#i-map' : '#i-globe');
  }

  dispose() {
    this.listeners.abort();
  }
}
