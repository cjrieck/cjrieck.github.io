// The teardown: an imperative engine that React mounts once. Every frame of motion is written straight to the DOM.
import type { TeardownData } from '../../data/projects';
import {
  NOTES_FROM,
  REVEAL,
  TOSS,
  TOSS_STAGGER,
  arrivalStiffness,
  noteSlot,
  plateSpread,
  plateStiffness,
  snapsToParts,
  splitLayers,
} from './teardown-logic';
import type { PartRow } from './teardown-logic';

const ART: Record<string, string> = {
  app: `<svg viewBox="0 0 300 380"><defs><g id="td-row"><rect x="22" y="190" width="256" height="40" rx="6"/><rect class="f-pic" x="32" y="198" width="24" height="24" rx="4"/><path d="M68 204h120M68 216h76"/></g></defs><rect x="22" y="22" width="256" height="34" rx="6"/><circle cx="40" cy="39" r="6"/><path d="M196 39h64"/><rect class="f-pic" x="22" y="70" width="256" height="104" rx="8"/><path d="M22 150l70-44 54 30 46-24 86 40" stroke-dasharray="5 4"/><use href="#td-row"/><use href="#td-row" y="46"/><use href="#td-row" y="92"/><rect x="22" y="338" width="256" height="26" rx="8"/><circle class="f-line" cx="60" cy="351" r="5"/><circle class="f-line" cx="120" cy="351" r="5"/><circle class="f-line" cx="180" cy="351" r="5"/><circle class="f-line" cx="240" cy="351" r="5"/></svg>`,
  services: `<svg viewBox="0 0 300 380"><path class="s-soft" stroke-dasharray="4 4" d="M70 90L150 170M230 80L150 170M150 170L70 270M150 170L230 260M70 270L150 335M230 260L150 335M70 90L230 80"/><circle class="f-card" cx="70" cy="90" r="22"/><circle class="f-card" cx="230" cy="80" r="22"/><circle class="f-card" cx="150" cy="170" r="30"/><circle class="f-card" cx="70" cy="270" r="22"/><circle class="f-card" cx="230" cy="260" r="22"/><circle class="f-card" cx="150" cy="335" r="22"/><circle class="f-line" cx="70" cy="90" r="5"/><circle class="f-line" cx="230" cy="80" r="5"/><circle class="f-line" cx="70" cy="270" r="5"/><circle class="f-line" cx="230" cy="260" r="5"/><circle class="f-line" cx="150" cy="335" r="5"/><circle class="f-accent" cx="150" cy="170" r="8"/></svg>`,
  infrastructure: `<svg viewBox="0 0 300 380"><defs><g id="td-unit"><rect x="8" width="60" height="20" rx="3"/><rect class="f-line" x="14" y="7" width="6" height="6"/><path d="M28 10h30"/></g><g id="td-rack"><rect class="f-card" width="76" height="150" rx="5"/><use href="#td-unit" y="10"/><use href="#td-unit" y="38"/><use href="#td-unit" y="66"/><use href="#td-unit" y="94"/><use href="#td-unit" y="122"/><rect class="f-accent" x="14" y="45" width="6" height="6"/></g></defs><use href="#td-rack" x="24" y="28"/><use href="#td-rack" x="112" y="28"/><use href="#td-rack" x="200" y="28"/><use href="#td-rack" x="24" y="202"/><use href="#td-rack" x="112" y="202"/><use href="#td-rack" x="200" y="202"/></svg>`,
};
// A kind that isn't drawn here (including one that is also an Object property) gets a plain plate
const artFor = (kind: string): string | undefined => (Object.prototype.hasOwnProperty.call(ART, kind) ? ART[kind] : undefined);

const KNOB = 18;
const NS = 'http://www.w3.org/2000/svg';
// On desktop the stage grows by this much per note beyond the notes' natural height, so nothing sits against the edge
const NOTE_SLACK = 14;
// The space under each note on phones (`.td-note` margin-bottom)
const NOTE_GAP = 10;

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string | null): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// A label from the data, or the default when it is missing or isn't a non-empty string
const word = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() !== '' ? v : fallback);

type Spring = { x: number; v: number };
type Row = { note: HTMLElement; plate: number; path: SVGPathElement; a: SVGCircleElement; b: SVGCircleElement };
type Tossed = { node: HTMLElement; dir: number; far: number; t: number; plates: Array<{ n: HTMLElement; base: string; op: number }> };

const KEYS = new Map([
  ['ArrowRight', 1],
  ['ArrowUp', 1],
  ['End', 1],
  ['ArrowLeft', 0],
  ['ArrowDown', 0],
  ['Home', 0],
]);

export function mountTeardown(
  root: HTMLElement,
  data: TeardownData,
  opts: { imageBase?: string; onSelect?: (hasParts: boolean) => void } = {},
): () => void {
  const projects = Array.isArray(data.projects) ? data.projects : [];
  if (!projects.length) {
    opts.onSelect?.(false);
    return () => {};
  }
  const imageBase = opts.imageBase || '';
  const given: Record<string, unknown> = data.labels && typeof data.labels === 'object' ? (data.labels as Record<string, unknown>) : {};
  const names = { whole: word(given.whole, 'The Product'), parts: word(given.parts, 'The Parts'), part: word(given.part, 'Part') };

  // One signal takes down every listener; the timers and the frame are tracked so cleanup can clear them
  const ac = new AbortController();
  const { signal } = ac;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  root.classList.add('td');
  root.innerHTML = `
      <div class="td-tabs" role="group" aria-label="Projects"></div>
      <div class="td-stage">
        <section class="td-scene"><div class="td-stack"></div></section>
        <ol class="td-notes"></ol>
        <svg class="td-leaders" aria-hidden="true"></svg>
        <div class="td-control">
          <button class="td-end" type="button" data-to="0"></button>
          <div class="td-track">
            <i class="td-fill"></i><i class="td-detent"></i>
            <span class="td-thumb"><i class="td-knob"></i></span>
            <input type="range" min="0" max="100" step="1" value="0" aria-label="Take the project apart">
          </div>
          <button class="td-end" type="button" data-to="1"></button>
        </div>
      </div>`;
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const stack = $<HTMLElement>('.td-stack'), scene = $<HTMLElement>('.td-scene'), stage = $<HTMLElement>('.td-stage'), notesBox = $<HTMLElement>('.td-notes'), svg = $<SVGSVGElement>('.td-leaders'), tabs = $<HTMLElement>('.td-tabs');
  const control = $<HTMLElement>('.td-control'), track = $<HTMLElement>('.td-track'), input = $<HTMLInputElement>('input[type=range]'), thumb = $<HTMLElement>('.td-thumb'), fill = $<HTMLElement>('.td-fill');
  const ends = Array.from(root.querySelectorAll<HTMLButtonElement>('.td-end'));
  // The labels come from the data, so they go in as text
  ends[0].textContent = names.whole;
  ends[1].textContent = names.parts;
  input.setAttribute('aria-valuetext', names.whole);
  const rmq = window.matchMedia('(prefers-reduced-motion: reduce)'), nmq = window.matchMedia('(max-width: 639px)');

  let currentId = projects[0].id, plates: HTMLElement[] = [], anchors: HTMLElement[] = [], rows: Row[] = [], spread = 0;
  let reduce = rmq.matches, target = 0, dragging = false, touched = false, raf = 0, prev = 0, lastV = 0, visible = true;
  const M: Spring = { x: 0, v: 0 }; // main spring, follows the control
  const H: Spring = { x: 0, v: 0 }; // phones: the height of the notes, chasing what the current project's notes need
  let L: Spring[] = [];             // one loose spring per plate, each with its own stiffness
  let E: Spring[] = [];             // one spring per plate, settling it into place when a project arrives
  let tossed: Tossed[] = [];        // the outgoing project's plates while they fly off
  let reveal = REVEAL, arriveDir = 0, stackScale = 1;

  // Decode every project's image up front so a new project never flashes in empty
  const preloaded = projects.filter((p) => p.image).map((p) => {
    const i = new Image(); i.src = imageBase + p.image;
    i.decode?.()?.catch(() => {});
    return i;
  });

  const makeNote = ({ layer, label }: PartRow) => {
    const note = el('li', 'td-note'), body = el('p');
    if (layer.note) body.textContent = layer.note;
    note.append(el('span', 'td-note-label', label), el('h3', '', layer.title), body);
    return note;
  };

  function build(arriving = false) {
    const p = projects.find((x) => x.id === currentId) || projects[0];
    currentId = p.id;
    const { under, rows: parts } = splitLayers(p, names.part);

    // The project's default view is always the top plate; everything else comes from the data
    const card = el('div', 'td-layer td-card');
    if (p.image) {
      const pic = el('div', 'td-pic'), img = el('img');
      img.decoding = 'sync'; img.src = imageBase + p.image; img.alt = p.imageAlt || '';
      pic.append(img); card.append(pic);
    }
    card.append(el('h3', '', p.title), el('p', '', p.summary), el('i', 'td-anchor'));
    const below = under.map((l) => {
      const n = el('div', 'td-layer');
      n.setAttribute('aria-hidden', 'true');
      const art = artFor(l.kind);
      if (art) n.innerHTML = art; else n.append(el('div', 'td-plain', l.title));
      n.append(el('i', 'td-anchor'));
      return n;
    });
    plates = [card, ...below];
    stack.replaceChildren(...plates);
    anchors = plates.map((n) => n.querySelector('.td-anchor') as HTMLElement);
    scene.setAttribute('aria-label', `${p.title} project and its parts`);

    notesBox.replaceChildren();
    svg.replaceChildren();
    rows = parts.map((part) => {
      const note = makeNote(part);
      notesBox.append(note);
      const path = document.createElementNS(NS, 'path'), a = document.createElementNS(NS, 'circle'), b = document.createElementNS(NS, 'circle');
      path.setAttribute('pathLength', '1'); a.setAttribute('r', '4'); a.setAttribute('class', 'from'); b.setAttribute('r', '2.5'); b.setAttribute('class', 'to');
      svg.append(path, a, b);
      return { note, plate: part.plate, path, a, b };
    });

    spread = plateSpread(plates.length);
    // Arriving while layered, the new stack starts closed and takes itself apart
    L = plates.map(() => ({ x: arriving ? 0 : M.x, v: 0 }));
    E = plates.map(() => ({ x: arriving ? 0 : 1, v: 0 }));
    reveal = arriving ? 0 : REVEAL;
    // Arriving on a phone, the notes' height eases from the old project's to the new one's; otherwise it is simply right
    if (!arriving) snapH();

    // Nothing to take apart means no control at all
    control.hidden = rows.length === 0;
    if (rows.length === 0) setState(false, !arriving);
    render();
    opts.onSelect?.(rows.length > 0);
  }

  function buildTabs() {
    tabs.replaceChildren(...projects.map((x, i) => {
      const t = el('button', 'td-tab', x.title);
      t.type = 'button';
      t.setAttribute('aria-pressed', String(x.id === currentId));
      t.addEventListener('click', () => {
        const from = projects.findIndex((y) => y.id === currentId);
        if (i !== from) switchTo(x.id, i > from ? -1 : 1);
      }, { signal });
      return t;
    }));
  }

  // Going forward the old project peels off to the left and the new one is underneath; going back, it peels right
  function switchTo(id: string, dir: number) {
    currentId = id;
    Array.from(tabs.children).forEach((t, i) => t.setAttribute('aria-pressed', String(projects[i].id === id)));
    if (reduce) { build(); return; }
    toss(dir);
    arriveDir = dir;
    build(true);
    kick();
  }

  function toss(dir: number) {
    const node = el('div', 'td-stack td-tossed');
    node.style.transform = stack.style.transform;
    const old = Array.from(stack.children) as HTMLElement[];
    node.append(...old); // moved, not copied, so the images stay decoded
    node.setAttribute('aria-hidden', 'true');
    scene.append(node);
    const far = stage.clientWidth * 0.62 / stackScale;
    old.forEach((n) => { n.style.transformOrigin = dir < 0 ? '100% 50%' : '0 50%'; });
    tossed.push({ node, dir, far, t: 0, plates: old.map((n) => ({ n, base: n.style.transform, op: n.style.opacity === '' ? 1 : +n.style.opacity })) });

    // The old notes and connector lines step aside quickly so they don't fight the new ones
    if (nmq.matches || M.x < NOTES_FROM) return;
    [notesBox, svg].forEach((box) => {
      if (typeof box.animate !== 'function') return;
      const c = box.cloneNode(true) as typeof box;
      c.setAttribute('aria-hidden', 'true');
      if (box === notesBox) {
        c.classList.add('td-notes-out');
        Object.assign(c.style, { left: `${box.offsetLeft}px`, top: `${box.offsetTop}px`, width: `${box.offsetWidth}px`, height: `${box.offsetHeight}px` });
      }
      stage.append(c);
      c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-in', fill: 'forwards' }).onfinish = () => c.remove();
    });
  }

  function flyTossed(dt: number) {
    tossed = tossed.filter((g) => {
      g.t += dt;
      g.plates.forEach(({ n, base, op }, i) => {
        const p = clamp((g.t - i * TOSS_STAGGER) / TOSS, 0, 1), e = p * p;
        const peel = Math.min(p * 4, 1);
        n.style.transform = `${base} translate3d(${g.dir * g.far * e}px,${-18 * peel}px,${90 * e}px) rotateY(${-g.dir * 42 * peel * (0.5 + e / 2)}deg) rotateZ(${g.dir * 12 * e}deg)`;
        n.style.opacity = String(op * clamp((1 - p) / 0.3, 0, 1));
      });
      if (g.t < TOSS + g.plates.length * TOSS_STAGGER) return true;
      g.node.remove();
      return false;
    });
  }

  // Phones: how tall the notes need to be to show them all, the last note's bottom edge below the top of the box plus its margin
  const naturalH = () => {
    const last = rows[rows.length - 1];
    return last ? last.note.getBoundingClientRect().bottom - notesBox.getBoundingClientRect().top + NOTE_GAP : 0;
  };
  const hGoal = () => (nmq.matches ? naturalH() : 0);
  const snapH = () => { H.x = hGoal(); H.v = 0; };

  const spring = (s: Spring, to: number, k: number, c: number, h: number) => { s.v += (k * (to - s.x) - c * s.v) * h; s.x += s.v * h; };
  const settle = () => {
    M.x = target; M.v = 0;
    L.forEach((l) => { l.x = target; l.v = 0; });
    E.forEach((e) => { e.x = 1; e.v = 0; });
    snapH();
    reveal = REVEAL;
    tossed.forEach((g) => g.node.remove());
    tossed = [];
  };

  // Desktop: the stage keeps its height unless some project's notes would not fit in it. Each project's notes are laid out
  // hidden at the real column width, and the stage grows to the tallest set plus a little room for each note.
  function fitStage() {
    stage.style.height = '';
    if (nmq.matches) return;
    // The slider's row counts as part of the stage's chrome even while this project has no slider
    const wasHidden = control.hidden;
    control.hidden = false;
    const base = stage.offsetHeight, chrome = base - notesBox.offsetHeight; // base is --td-height
    control.hidden = wasHidden;
    const probe = el('ol', 'td-notes td-notes-measure');
    probe.style.width = `${notesBox.offsetWidth}px`;
    stage.append(probe);
    let tallest = 0;
    projects.forEach((p) => {
      probe.replaceChildren(...splitLayers(p, names.part).rows.map(makeNote));
      tallest = Math.max(tallest, probe.offsetHeight + NOTE_SLACK * probe.children.length);
    });
    probe.remove();
    if (chrome + tallest > base) stage.style.height = `${Math.ceil(chrome + tallest)}px`;
  }

  function render() {
    const narrow = nmq.matches, te = clamp(M.x, 0, 1.06), t1 = Math.min(te, 1), N = plates.length;
    notesBox.style.height = narrow ? `${Math.ceil(t1 * Math.max(0, H.x))}px` : '';

    // Scale the stack so the flat card and the exploded stack both fit the scene
    const sw = scene.clientWidth, sh = scene.clientHeight;
    const rs = Math.min(sw / 300, sh / 380, 1.2) * 0.94, es = Math.min(sw / 480, sh / 480) * 0.8, s = rs + (es - rs) * t1;
    stackScale = s;
    const dx = narrow ? 0 : (notesBox.offsetWidth + 20) / 2 * (1 - t1); // centre the card until the notes arrive
    stack.style.transform = `translate3d(${dx}px,0,0) scale3d(${s},${s},${s}) rotateX(${55 * te}deg) rotateZ(${-40 * te}deg)`;

    plates.forEach((n, i) => {
      const l = L[i], e = clamp(l.x, 0, 1.08);
      const z = ((N - 1 - i) - (N - 1) / 2) * spread * e + (N - 1 - i) * 0.4;
      const j = reduce ? 0 : clamp(l.v * 5, -8, 8); // lean with velocity: the loose, jiggly part
      const away = 1 - E[i].x; // a new plate rises from just under the old one, slightly crooked
      n.style.transform = `translate3d(${j}px,${away * 14}px,${z}px) rotateZ(${arriveDir * -3 * away}deg) scale(${1 - away * 0.07})`;
      if (i) n.style.opacity = String(clamp(e * 12, 0, 1));
    });

    const W = track.clientWidth, x = clamp(M.x, 0, 1) * (W - KNOB);
    thumb.style.transform = `translateX(${x}px)`;
    fill.style.width = `${x + KNOB / 2}px`;

    // The lit label previews where the control will land when released
    const layered = snapsToParts((dragging ? Number(input.value) / 100 : target));
    ends[0].classList.toggle('on', !layered);
    ends[1].classList.toggle('on', layered);

    const ps = rows.map((_, i) => {
      const slot = noteSlot(i, rows.length);
      return clamp((t1 - NOTES_FROM - slot * 0.1) / 0.3, 0, 1) * clamp((reveal - 0.1 - slot * 0.07) / 0.28, 0, 1);
    });
    rows.forEach((r, i) => { r.note.style.opacity = String(ps[i]); r.note.style.transform = `translateX(${(1 - ps[i]) * 12}px)`; });
    // Below this point nothing of the layers can show, whatever the individual notes are doing
    const hidden = t1 <= NOTES_FROM ? 'hidden' : '';
    notesBox.style.visibility = hidden;
    svg.style.visibility = hidden;
    if (narrow) return;

    const b = stage.getBoundingClientRect();
    rows.forEach((r, i) => {
      const a = anchors[r.plate].getBoundingClientRect(), n = r.note.getBoundingClientRect(), p = ps[i];
      const x0 = a.left + a.width / 2 - b.left, y0 = a.top + a.height / 2 - b.top;
      const x1 = n.left - b.left - 4, y1 = n.top - b.top + 11, ex = Math.max(x0 + 14, x1 - 36);
      r.path.setAttribute('d', `M${x0} ${y0}H${ex}L${x1} ${y1}`);
      r.path.style.strokeDashoffset = String(1 - p);
      r.a.setAttribute('cx', String(x0)); r.a.setAttribute('cy', String(y0)); r.a.style.opacity = String(p);
      r.b.setAttribute('cx', String(x1)); r.b.setAttribute('cy', String(y1)); r.b.style.opacity = String(p);
    });
  }

  function frame(ts: number) {
    const dt = clamp((ts - prev) / 1000, 0.001, 0.05); prev = ts;
    const goal = hGoal();
    if (reduce) settle();
    else {
      const n = Math.ceil(dt / 0.008), h = dt / n, k = dragging ? 520 : 170, c = dragging ? 40 : 14;
      for (let s = 0; s < n; s++) {
        spring(M, target, k, c, h);
        L.forEach((l, i) => { const kk = plateStiffness(i); spring(l, M.x, kk, Math.sqrt(kk), h); }); // staggered by stiffness
        E.forEach((e, i) => { const kk = arrivalStiffness(i); spring(e, 1, kk, Math.sqrt(kk) * 1.25, h); });
        spring(H, goal, 260, 32, h);
      }
      reveal = Math.min(reveal + dt, REVEAL);
      flyTossed(dt);
    }
    render();
    const busy = !reduce && (dragging || tossed.length > 0 || reveal < REVEAL || Math.abs(M.x - target) > 4e-4 || Math.abs(M.v) > 2e-3
      || L.some((l) => Math.abs(l.x - M.x) > 4e-4 || Math.abs(l.v) > 2e-3) || E.some((e) => Math.abs(e.x - 1) > 4e-4 || Math.abs(e.v) > 2e-3)
      || Math.abs(H.x - goal) > 0.25 || Math.abs(H.v) > 0.5); // the notes' height is in pixels, so its limits are too
    if (busy) raf = window.requestAnimationFrame(frame);
    else { raf = 0; settle(); render(); }
  }
  const kick = () => { if (!raf && !signal.aborted) { prev = performance.now(); raf = window.requestAnimationFrame(frame); } };

  function setState(layered: boolean, instant?: boolean) {
    target = layered ? 1 : 0;
    input.value = layered ? '100' : '0';
    input.setAttribute('aria-valuetext', layered ? names.parts : names.whole);
    if (instant) { settle(); if (plates.length) render(); } else kick();
  }

  function tick() {
    track.classList.add('tick');
    later(() => track.classList.remove('tick'), 140);
    navigator.vibrate?.(6);
  }

  input.addEventListener('input', () => {
    const v = Number(input.value) / 100;
    if (snapsToParts(lastV) !== snapsToParts(v)) tick();
    lastV = v; target = v; touched = true;
    input.setAttribute('aria-valuetext', `${input.value} percent apart`);
    kick();
  }, { signal });
  input.addEventListener('keydown', (e) => {
    const to = KEYS.get(e.key);
    if (to === undefined) return;
    e.preventDefault(); touched = true; setState(to === 1); lastV = to;
  }, { signal });
  input.addEventListener('pointerdown', () => { dragging = true; touched = true; track.classList.add('dragging'); kick(); }, { signal });
  const release = () => {
    if (!dragging) return;
    dragging = false; track.classList.remove('dragging');
    const layered = snapsToParts(Number(input.value) / 100);
    setState(layered); lastV = layered ? 1 : 0;
  };
  window.addEventListener('pointerup', release, { signal });
  window.addEventListener('pointercancel', release, { signal });
  input.addEventListener('blur', release, { signal });
  ends.forEach((b) => b.addEventListener('click', () => { touched = true; const on = b.dataset.to === '1'; setState(on); lastV = on ? 1 : 0; }, { signal }));

  // Until someone touches it, the stack occasionally breathes apart to show it can
  function nudge() {
    if (touched || reduce || !rows.length || !visible || document.hidden) return;
    target = 0.08; kick();
    later(() => { if (!touched) { target = 0; kick(); } }, 420);
  }
  const watcher = new window.IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  watcher.observe(root);
  const nudger = window.setInterval(nudge, 7000);

  // The layout changed (the window, the fonts, the breakpoint): fit the stage to the notes, then draw again
  const relayout = () => { fitStage(); snapH(); render(); };
  window.addEventListener('resize', relayout, { signal });
  nmq.addEventListener('change', relayout, { signal });
  rmq.addEventListener('change', (e) => { reduce = e.matches; kick(); }, { signal });
  document.fonts?.ready?.then(() => { if (!signal.aborted) relayout(); });
  buildTabs();
  build();
  relayout();

  return () => {
    ac.abort();
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    window.clearInterval(nudger);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    watcher.disconnect();
    preloaded.length = 0;
    tossed = [];
    root.innerHTML = '';
    root.classList.remove('td');
  };
}
