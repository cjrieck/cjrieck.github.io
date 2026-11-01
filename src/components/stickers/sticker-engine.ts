import {
  LIFT, TILT, HOLD, TOUCH_DELAY,
  canPeel, isNearHome, placementPercent, surfaceIndexAt, aimPoint, edgeScrollAmount,
} from './sticker-logic';
import { trackOnce } from '../../utils/analytics';
import { clamp } from '../../utils/math';

type Key = 'x' | 'y' | 's' | 'lift' | 'rot' | 'tx' | 'ty' | 'lf' | 'foil';

type Sticker = {
  el: HTMLElement; home: HTMLElement; w: number; h: number; foilEl: HTMLElement;
  state: 'charging' | 'held' | 'home' | 'stuck'; kind: 'sk' | 'die'; homeRot: number;
  gx: number; gy: number; x: number; y: number; rot: number; base: number; s: number;
  lift: number; tx: number; ty: number; lf: number; foil: number;
  vx: number; vy: number; vrot: number; vs: number; vlift: number; vtx: number; vty: number; vlf: number; vfoil: number;
  id: number; touch: boolean; px: number; py: number; sx: number; sy: number; ox: number; oy: number; moved: boolean;
};

type Press = { t: HTMLElement; touch: boolean; id: number; x: number; y: number; timer?: number; a?: Sticker; at?: number };

/* Company and skill stickers peel off and stay wherever they are dropped */
export function mountStickers(): () => void {
  const ctl = new AbortController();
  const { signal } = ctl;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement, hand = document.createElement('div');
  hand.id = 'hand'; hand.setAttribute('aria-hidden', 'true'); document.body.append(hand);
  const surfaces = Array.from(document.querySelectorAll<HTMLElement>('main > section, footer'));
  const states = new WeakMap<Element, Sticker>(), live = new Set<Sticker>();
  let press: Press | null = null, held: Sticker | null = null, raf = 0, last = 0;
  const buzz = (n: number) => { if (navigator.vibrate) navigator.vibrate(n); };
  // Once a long press lifts a sticker, the finger carries it instead of scrolling the page
  const guard = (el: Element) => el.addEventListener('touchmove', (e) => { if (held) e.preventDefault(); }, { passive: false, signal });
  document.querySelectorAll('.lid, .sheet').forEach(guard);
  document.querySelectorAll<HTMLImageElement>('.cell img').forEach((i) => { i.draggable = false; });

  const spring = (a: Sticker, key: Key, to: number, k: number, c: number, dt: number) => {
    const m = a as unknown as Record<string, number>, v = 'v' + key;
    if (reduce) { m[key] = to; m[v] = 0; return; }
    m[v] += ((to - m[key]) * k - m[v] * c) * dt; m[key] += m[v] * dt;
  };
  function paint(a: Sticker) {
    const at = a.el.parentNode === hand ? `translate(${a.x}px,${a.y}px) ` : '';
    const tilt = live.has(a) ? `perspective(700px) rotateX(${a.tx}deg) rotateY(${a.ty}deg) ` : '';
    a.el.style.transform = `${at}translate(-50%,-50%) ${tilt}rotate(${a.rot}deg) scale(${a.s})`;
    if (a.kind === 'sk') a.el.style.boxShadow = `${4 + a.lift * 10}px ${5 + a.lift * 13}px 0 var(--ink)`;
    else a.el.style.filter = a.lift > .01 ? `drop-shadow(${a.lift * 9}px ${a.lift * 11}px 0 var(--ink))` : '';
    const on = a.foil > .01;
    a.foilEl.style.display = on ? 'block' : 'none';
    if (!on) return;
    // Like tilting a real holographic sticker: the colors drift as it moves and leans
    const phase = reduce ? 0 : (a.x + a.y) * .009 + a.tx * .05 + a.ty * .05 + a.rot * .04, s = (a.foilEl.firstChild as HTMLElement).style;
    a.foilEl.style.opacity = String(Math.min(a.foil * 1.4, 1));
    s.setProperty('--r', a.foil * 190 + '%');
    s.setProperty('--px', (a.gx + 1) * 50 + '%'); s.setProperty('--py', (a.gy + 1) * 50 + '%');
    s.setProperty('--fx', 50 + 50 * Math.sin(phase) + '%'); s.setProperty('--fy', 50 + 50 * Math.cos(phase * .7) + '%');
    s.setProperty('--gx', 50 + 70 * Math.sin(phase * 1.6) + '%');
  }
  // Where the sticker's center belongs for the current pointer; it can't be carried off screen
  const aim = (a: Sticker) => aimPoint(a.px, a.py, a.ox, a.oy, a.lf, a.w, a.h, window.innerWidth, window.innerHeight);
  // c is how far along the press-and-hold is: 0 lying flat, 1 about to come free
  function settle(a: Sticker, rot: number, dt: number, c = 0) {
    const lean = reduce ? 0 : TILT * .7 * c;
    spring(a, 's', 1 + c * .05, 700, 22, dt); spring(a, 'lift', c * .4, 900, 50, dt); spring(a, 'rot', rot, 300, 20, dt);
    spring(a, 'tx', a.gy * lean, 600, 30, dt); spring(a, 'ty', -a.gx * lean, 600, 30, dt);
    spring(a, 'foil', c, 500, 44, dt);
  }
  function tick(t: number) {
    const dt = Math.min((t - last) / 1000 || .016, .032); last = t;
    for (const a of live) {
      if (a.state === 'held') {
        if (!a.moved && Math.hypot(a.px - a.sx, a.py - a.sy) > 40) a.moved = true;
        spring(a, 'lf', a.touch ? 1 : 0, 300, 26, dt); // on touch it floats up out from under the finger
        const [nx, ny] = aim(a);
        a.vx = a.vx * .75 + (nx - a.x) / dt * .25; a.vy = a.vy * .75 + (ny - a.y) / dt * .25; a.x = nx; a.y = ny;
        // Near the top or bottom edge the page scrolls, so a sticker can reach any section
        const amount = edgeScrollAmount(a.py, window.innerHeight, dt);
        if (amount && a.moved) window.scrollBy({ top: amount, behavior: 'instant' as ScrollBehavior });
        spring(a, 'rot', a.base + (reduce ? 0 : clamp(a.vx * .016, -16, 16)), 240, 16, dt);
        spring(a, 's', LIFT, 380, 22, dt); spring(a, 'lift', 1, 300, 24, dt); spring(a, 'foil', 1, 500, 44, dt);
        // The side you grabbed comes up toward you, like peeling it by that corner
        spring(a, 'tx', reduce ? 0 : a.gy * TILT, 200, 16, dt); spring(a, 'ty', reduce ? 0 : -a.gx * TILT, 200, 16, dt);
      } else if (a.state === 'home') {
        const r = a.home.getBoundingClientRect(), hx = r.left + r.width / 2, hy = r.top + r.height / 2;
        spring(a, 'x', hx, 260, 24, dt); spring(a, 'y', hy, 260, 24, dt); settle(a, a.homeRot, dt);
        if (reduce || Math.hypot(hx - a.x, hy - a.y) + (Math.abs(a.vx) + Math.abs(a.vy)) / 40 + Math.abs(a.s - 1) * 10 + Math.abs(a.tx) + Math.abs(a.ty) < .6) {
          restore(a); continue;
        }
      } else {
        const c = press && press.a === a ? clamp((t - (press.at as number)) / HOLD, 0, 1) : 0;
        settle(a, a.base, dt, c);
        if (a.state === 'stuck' && !c && (reduce || Math.abs(a.s - 1) + Math.abs(a.vs) / 50 + Math.abs(a.rot - a.base) + Math.abs(a.vrot) / 50 + Math.abs(a.tx) + Math.abs(a.ty) + Math.abs(a.lift) + a.foil < .01)) {
          a.s = 1; a.rot = a.base; a.tx = a.ty = a.lift = a.foil = 0; live.delete(a);
        }
      }
      paint(a);
    }
    raf = live.size ? requestAnimationFrame(tick) : 0;
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  // Takes a peeled copy away and leaves its home sticker where it was
  const restore = (a: Sticker) => { a.el.remove(); a.home.classList.remove('peeled'); live.delete(a); };

  function peelFromHome(home: HTMLElement): Sticker {
    const r = home.getBoundingClientRect(), m = new DOMMatrix(getComputedStyle(home).transform), copy = home.cloneNode(true) as HTMLElement;
    const isSk = home.classList.contains('sk'), pic = (isSk ? copy.querySelector('img') : copy) as HTMLImageElement, w = home.offsetWidth, h = home.offsetHeight, rot = Math.atan2(m.b, m.a) * 180 / Math.PI;
    pic.alt = ''; pic.draggable = false;
    const foilEl = document.createElement('span'); foilEl.className = 'foil'; foilEl.append(document.createElement('i'));
    let el = copy;
    if (isSk) el.append(foilEl);
    else { // an image can't hold the foil, so a die-cut sticker gets a wrapper and the foil takes its shape
      el = document.createElement('div'); el.className = 'die-wrap'; el.append(copy, foilEl);
      copy.removeAttribute('class'); copy.removeAttribute('width'); copy.removeAttribute('height');
      const mask = `url("${(home as HTMLImageElement).src}")`;
      foilEl.style.setProperty('-webkit-mask-image', mask); foilEl.style.setProperty('mask-image', mask);
    }
    el.classList.add('loose'); el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, { width: w + 'px', height: h + 'px', margin: '0', left: '0', top: '0' });
    guard(el);
    const a: Sticker = {
      el, home, w, h, foilEl, state: 'charging', kind: isSk ? 'sk' : 'die', homeRot: parseFloat(getComputedStyle(home).getPropertyValue('--r')) || 0, gx: 0, gy: 0,
      x: r.left + r.width / 2, y: r.top + r.height / 2, rot, base: rot, s: Math.hypot(m.a, m.b), lift: 0, tx: 0, ty: 0, lf: 0, foil: 0, vx: 0, vy: 0, vrot: 0, vs: 0, vlift: 0, vtx: 0, vty: 0, vlf: 0, vfoil: 0,
      id: 0, touch: false, px: 0, py: 0, sx: 0, sy: 0, ox: 0, oy: 0, moved: false,
    };
    states.set(el, a); home.classList.add('peeled'); hand.append(el);
    return a;
  }
  // The press itself starts the peel, so holding never feels like nothing is happening
  function beginPeel() {
    if (!press) return;
    const a = states.get(press.t) || peelFromHome(press.t);
    paint(a);
    const r = a.el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    a.gx = clamp((press.x - cx) / (a.w / 2), -1, 1); a.gy = clamp((press.y - cy) / (a.h / 2), -1, 1);
    press.a = a; press.at = performance.now(); press.timer = window.setTimeout(pickUp, HOLD);
    live.add(a); paint(a); kick();
  }
  function pickUp() {
    if (!press || !press.a) return;
    const { a, id, x, y, touch } = press; clearTimeout(press.timer); press = null;
    const r = a.el.getBoundingClientRect(); a.x = r.left + r.width / 2; a.y = r.top + r.height / 2;
    a.el.style.left = a.el.style.top = '0'; hand.append(a.el);
    Object.assign(a, { state: 'held', id, touch, px: x, py: y, sx: x, sy: y, ox: x - a.x, oy: y - a.y, moved: false, lf: 0 });
    held = a; root.classList.add('holding');
    try { root.setPointerCapture(id); } catch (_) { /* pointer already gone */ }
    buzz(10); live.add(a); paint(a); kick();
    trackOnce('sticker-peeled');
  }
  // A swipe that began on a sticker turned out to be a scroll: put it straight back
  function dropPress() {
    if (!press) return;
    const { a } = press; clearTimeout(press.timer); press = null;
    if (a && a.state === 'charging') restore(a);
  }
  function stick(a: Sticker) {
    if (isNearHome(a.x, a.y, a.home.getBoundingClientRect())) { // dropped by its old spot: it goes home
      a.state = 'home'; a.vx = clamp(a.vx, -1500, 1500); a.vy = clamp(a.vy, -1500, 1500); return;
    }
    const rects = surfaces.map((s) => s.getBoundingClientRect()), i = surfaceIndexAt(a.y, rects);
    const host = surfaces[i], r = rects[i], p = placementPercent(a.x, a.y, {
      left: r.left, top: r.top, clientLeft: host.clientLeft, clientTop: host.clientTop, clientWidth: host.clientWidth, clientHeight: host.clientHeight,
    });
    a.el.style.left = p.left + '%';
    a.el.style.top = p.top + '%';
    host.append(a.el); // last one placed lands on top
    a.state = 'stuck'; a.base = a.rot + (reduce ? 0 : (Math.random() - .5) * 6); buzz(8); // never goes on quite straight
  }
  document.addEventListener('pointerdown', (e) => {
    if (held || press || e.button || !e.isPrimary || !canPeel(e.pointerType)) return;
    const el = e.target as Element, t = el.closest && el.closest<HTMLElement>('.loose,.sk:not(.peeled),.cell img:not(.peeled)');
    if (!t) return;
    const touch = e.pointerType !== 'mouse';
    press = { t, touch, id: e.pointerId, x: e.clientX, y: e.clientY };
    if (touch) press.timer = window.setTimeout(beginPeel, TOUCH_DELAY); // a quick swipe still scrolls the page, and nothing moves
    else beginPeel();
  }, { signal });
  window.addEventListener('pointermove', (e) => {
    if (held && e.pointerId === held.id) { held.px = e.clientX; held.py = e.clientY; return; }
    if (!press || e.pointerId !== press.id) return;
    const d = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    if (press.touch) { if (d > 10) dropPress(); }
    else if (d > 3) pickUp(); // with a mouse there's no scrolling to protect, so dragging works without the wait
  }, { signal });
  function letGo(e: PointerEvent) {
    if (held && e.pointerId === held.id) {
      const a = held; held = null; root.classList.remove('holding');
      if (e.type === 'pointerup') { a.px = e.clientX; a.py = e.clientY; [a.x, a.y] = aim(a); }
      stick(a); paint(a); kick();
      return;
    }
    if (!press || e.pointerId !== press.id) return;
    if (e.type !== 'pointerup') { dropPress(); return; }
    const { t, x, y, a } = press; clearTimeout(press.timer); press = null;
    if (a && a.state === 'charging') a.state = 'home'; // let go too soon: it lies back down in its spot
    kick();
    // A sticker never breaks the page: a plain click lands on whatever it's covering
    if (states.has(t)) {
      const under = document.elementsFromPoint(x, y).find((n) => !n.closest('.loose'));
      if (under) under.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
    }
  }
  ['pointerup', 'pointercancel'].forEach((n) => window.addEventListener(n, letGo as EventListener, { signal }));
  root.addEventListener('lostpointercapture', letGo, { signal });
  window.addEventListener('dragstart', (e) => { const el = e.target as Element; if (el.closest && el.closest('.loose,.sk,.cell img')) e.preventDefault(); }, { signal });
  window.addEventListener('contextmenu', (e) => { if (held || (press && press.touch)) e.preventDefault(); }, { signal });

  return () => {
    ctl.abort();
    if (press) clearTimeout(press.timer);
    press = null; held = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0; live.clear();
    hand.remove();
    document.querySelectorAll('.loose').forEach((el) => el.remove());
    document.querySelectorAll('.peeled').forEach((el) => el.classList.remove('peeled'));
    root.classList.remove('holding');
  };
}
