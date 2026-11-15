export function initSidebar(navigation) {
  const sidebar = document.getElementById('app-sidebar');
  const toggle = document.getElementById('menu-toggle');
  const backdrop = document.getElementById('menu-backdrop');
  const workspace = document.getElementById('workspace');
  const mobile = matchMedia('(max-width: 760px)');
  const buttons = [...sidebar.querySelectorAll('[data-page]')];
  let open = false;

  function setOpen(value, returnFocus = true) {
    open = value && mobile.matches;
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    workspace.inert = open;
    sidebar.inert = mobile.matches && !open;
    if (open) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      (sidebar.querySelector('[aria-current="page"]') || buttons[0]).focus();
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      if (returnFocus && mobile.matches) toggle.focus();
    }
  }

  toggle.addEventListener('click', () => setOpen(!open));
  backdrop.addEventListener('click', () => setOpen(false));
  document.getElementById('menu-close').addEventListener('click', () => setOpen(false));
  sidebar.addEventListener('click', event => {
    const button = event.target.closest('[data-page], .brand');
    if (!button) return;
    event.preventDefault();
    // Clear inert before navigation focuses the active page heading.
    setOpen(false, false);
    navigation.show(button.dataset.page || 'globe');
  });
  sidebar.querySelector('nav').addEventListener('keydown', event => {
    const index = buttons.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); buttons[next].focus(); }
  });
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); setOpen(false); }
    if (event.key === 'Tab') {
      const items = [...sidebar.querySelectorAll('button, a[href]')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false, false);
}
