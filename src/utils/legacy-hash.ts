const LEGACY_SECTIONS: Record<string, string> = {
  '#/expertise': '#process',
  '#/projects': '#work',
};

// Old HashRouter links look like #/path, with or without a trailing slash.
// Returns the new hash, or null if the hash needs no change.
export function resolveLegacyHash(hash: string): string | null {
  if (!hash.startsWith('#/')) return null;
  return LEGACY_SECTIONS[hash.replace(/\/+$/, '')] ?? '#top';
}

export function applyLegacyHash(): void {
  const hash = resolveLegacyHash(window.location.hash);
  if (hash) window.history.replaceState(null, '', hash);
}

// Jumps to the section named by the hash, never animating, and returns where its top edge landed
// (null if there is no such section). The theme smooths scrolling for nav clicks, so the smooth
// behavior is switched off just for this call rather than trusting the browser's 'instant' keyword.
export function scrollToCurrentHash(): number | null {
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return null;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  try {
    target.scrollIntoView();
  } finally {
    root.style.scrollBehavior = previous;
  }
  return target.getBoundingClientRect().top;
}

const SETTLE_MS = 600; // how long to keep correcting once the page and its fonts have loaded
const GIVE_UP_MS = 10000; // ...and the longest to keep correcting if they never finish
// A scroll this soon after our own jump is not taken for the visitor: WebKit can write a stale offset back a frame or two later
const OWN_JUMP_MS = 100;
// Captured, so a page handler that stops propagation cannot hide them
const TAKEOVER_EVENTS = ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown', 'hashchange'];
const LISTEN = { passive: true, capture: true };

// Lands on the hash section now, then keeps it there while the layout above it settles. Fonts change
// the page height after the first jump, and WebKit can hand back a stale scroll offset a frame after a
// jump, so one scroll is not enough. Stops as soon as the visitor scrolls, types or clicks, or the page
// has settled. Returns a function that stops it early.
export function holdHashTarget(): () => void {
  let landed = scrollToCurrentHash();
  if (landed === null) return () => {};
  let stopAt = Date.now() + GIVE_UP_MS;
  let jumpedAt = Date.now();
  let lastY = window.scrollY;
  let lastHeight = document.documentElement.scrollHeight;
  let waiting = 0;
  let frame = 0;
  let stopped = false;

  const loaded = () => {
    waiting -= 1;
    if (waiting === 0) stopAt = Math.min(stopAt, Date.now() + SETTLE_MS);
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.cancelAnimationFrame(frame);
    window.removeEventListener('load', loaded);
    TAKEOVER_EVENTS.forEach((type) => window.removeEventListener(type, stop, LISTEN));
  };
  // One look at the page: has the visitor scrolled, and if not, is the section still where it landed?
  const check = () => {
    // The page moved with no layout change and not by our doing (a dragged scrollbar sends no events): the visitor has it
    if (window.scrollY !== lastY && document.documentElement.scrollHeight === lastHeight && Date.now() - jumpedAt > OWN_JUMP_MS) {
      stop();
      return;
    }
    const target = document.getElementById(window.location.hash.slice(1));
    if (target && Math.abs(target.getBoundingClientRect().top - (landed as number)) > 1) {
      landed = scrollToCurrentHash();
      jumpedAt = Date.now();
    }
    lastY = window.scrollY;
    lastHeight = document.documentElement.scrollHeight;
  };
  const tick = () => {
    const expired = Date.now() > stopAt;
    check(); // one last look at the end too: a background tab gets no frames until it is shown
    if (expired) stop();
    else if (!stopped) frame = window.requestAnimationFrame(tick);
  };

  if (document.readyState !== 'complete') {
    waiting += 1;
    window.addEventListener('load', loaded, { once: true });
  }
  if (document.fonts) {
    waiting += 1;
    document.fonts.ready.then(() => !stopped && loaded());
  }
  if (waiting === 0) stopAt = Date.now() + SETTLE_MS;
  TAKEOVER_EVENTS.forEach((type) => window.addEventListener(type, stop, LISTEN));
  frame = window.requestAnimationFrame(tick);
  return stop;
}
