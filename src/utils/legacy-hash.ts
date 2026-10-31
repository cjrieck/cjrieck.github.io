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
  target.scrollIntoView();
  root.style.scrollBehavior = previous;
  return target.getBoundingClientRect().top;
}

const SETTLE_MS = 600; // how long to keep correcting once the page and its fonts have loaded
const GIVE_UP_MS = 10000; // ...and the longest to keep correcting if they never finish
const TAKEOVER_EVENTS = ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown', 'hashchange'];

// Lands on the hash section now, then keeps it there while the layout above it settles. Fonts and
// the teardown change the page height after the first jump, and WebKit can hand back a stale scroll
// offset a frame after a jump, so one scroll is not enough. Stops as soon as the visitor scrolls,
// types or clicks, or the page has settled. Returns a function that stops it early.
export function holdHashTarget(): () => void {
  let landed = scrollToCurrentHash();
  let stopAt = Date.now() + GIVE_UP_MS;
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
    TAKEOVER_EVENTS.forEach((type) => window.removeEventListener(type, stop));
  };
  const tick = () => {
    if (Date.now() > stopAt) return stop();
    const target = document.getElementById(window.location.hash.slice(1));
    if (target && landed !== null && Math.abs(target.getBoundingClientRect().top - landed) > 1) {
      landed = scrollToCurrentHash();
    }
    frame = window.requestAnimationFrame(tick);
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
  TAKEOVER_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));
  frame = window.requestAnimationFrame(tick);
  return stop;
}
