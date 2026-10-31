import { fireEvent } from '@testing-library/react';
import type { Project, TeardownData } from '../../data/projects';
import { mountTeardown } from './teardown-engine';

const full: Project = {
  id: 'full',
  title: 'Full',
  summary: 'All of it',
  layers: [
    { kind: 'interface', title: 'What you see', note: 'One.' },
    { kind: 'app', title: 'The app', note: 'Two.' },
    { kind: 'mystery', title: 'Mystery', note: 'Three.' },
  ],
};
const none: Project = { id: 'none', title: 'None', summary: 'Nothing', layers: [] };
const missing: Project = { id: 'missing', title: 'Missing', summary: 'No layers key' };
const single: Project = { id: 'single', title: 'Single', summary: 'Face only', layers: [{ kind: 'interface', title: 'Face', note: 'Only.' }] };
const data: TeardownData = { projects: [full, none, missing, single] };

// Everything mounted by a test is stopped and removed afterwards, and every stub undone.
const stops: Array<() => void> = [];
const roots: HTMLElement[] = [];
const undo: Array<() => void> = [];

function mount(d: TeardownData = data, opts: Parameters<typeof mountTeardown>[2] = {}) {
  const root = document.createElement('div');
  document.body.append(root);
  roots.push(root);
  const stop = mountTeardown(root, d, opts);
  stops.push(stop);
  return { root, stop };
}

afterEach(() => {
  stops.splice(0).forEach((stop) => stop());
  roots.splice(0).forEach((root) => root.remove());
  undo.splice(0).reverse().forEach((fn) => fn());
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const click = fireEvent.click;
const tabIn = (root: HTMLElement, title: string) => Array.from(root.querySelectorAll<HTMLElement>('.td-tab')).find((t) => t.textContent === title)!;
const inputIn = (root: HTMLElement) => root.querySelector<HTMLInputElement>('input[type=range]')!;
// The brief's helper: pointer down on the input, set its value, then let go on the window
function dragTo(input: HTMLInputElement, value: number) {
  fireEvent.pointerDown(input);
  fireEvent.input(input, { target: { value: String(value) } });
  fireEvent.pointerUp(window);
}

// Animation frames that only run when the test says so
function fakeFrames() {
  const queue = new Map<number, FrameRequestCallback>();
  let id = 0;
  let clock = performance.now();
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    queue.set(++id, cb);
    return id;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((i) => {
    queue.delete(i);
  });
  jest.spyOn(performance, 'now').mockImplementation(() => clock);
  return {
    pending: () => queue.size,
    run(count: number) {
      for (let i = 0; i < count; i++) {
        clock += 16;
        const due = Array.from(queue.values());
        queue.clear();
        due.forEach((cb) => cb(clock));
      }
    },
  };
}

// matchMedia answering the reduced-motion and narrow-screen questions, and remembering who listens
function stubMedia({ reduce = false, narrow = false } = {}) {
  const original = window.matchMedia;
  const listeners: Array<{ query: string; type: string; options: unknown }> = [];
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('reduced-motion') ? reduce : narrow,
      media: query,
      addEventListener(type: string, _fn: unknown, options: unknown) {
        listeners.push({ query, type, options });
      },
      removeEventListener() {},
    } as unknown as MediaQueryList);
  undo.push(() => {
    window.matchMedia = original;
  });
  return listeners;
}

function stubProperty(proto: object, name: string, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(proto, name);
  Object.defineProperty(proto, name, { configurable: true, ...descriptor });
  undo.push(() => {
    if (original) Object.defineProperty(proto, name, original);
    else delete (proto as Record<string, unknown>)[name];
  });
}

describe('the teardown', () => {
  let root: HTMLElement;
  let input: HTMLInputElement;
  let onSelect: jest.Mock;
  let stop: () => void;
  const control = () => root.querySelector<HTMLElement>('.td-control')!;
  const tab = (title: string) => tabIn(root, title);
  const drag = dragTo;

  beforeEach(() => {
    onSelect = jest.fn();
    ({ root, stop } = mount(data, { onSelect }));
    input = inputIn(root);
  });

  test('notes are numbered and plain text', () => {
    const labels = Array.from(root.querySelectorAll('.td-note-label')).map((n) => n.textContent);
    expect(labels).toEqual(['Part 01', 'Part 02', 'Part 03']);
    expect(root.querySelector('.td-ph')).toBeNull();
    expect(root.querySelector('.td-note p')).toHaveTextContent('One.');
  });
  test('an unknown kind gets a plain plate with its title', () => {
    expect(root.querySelector('.td-plain')).toHaveTextContent('Mystery');
  });
  test('no slider when layers is empty or missing, and onSelect reports it', () => {
    expect(onSelect).toHaveBeenLastCalledWith(true);
    click(tab('None'));
    expect(control().hidden).toBe(true);
    expect(onSelect).toHaveBeenLastCalledWith(false);
    click(tab('Missing'));
    expect(control().hidden).toBe(true);
    click(tab('Full'));
    expect(control().hidden).toBe(false);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });
  test('interface only still shows the slider and one note', () => {
    click(tab('Single'));
    expect(control().hidden).toBe(false);
    expect(root.querySelectorAll('.td-note')).toHaveLength(1);
    // The old project's plates are still flying off in .td-tossed
    expect(root.querySelectorAll('.td-stack:not(.td-tossed) .td-layer')).toHaveLength(1);
  });
  test('notes are hidden in the product view', () => {
    expect(root.querySelector<HTMLElement>('.td-notes')!.style.visibility).toBe('hidden');
  });
  test('releasing at 49 stays on the product and at 50 goes to the parts', () => {
    drag(input, 49);
    expect(input).toHaveAttribute('aria-valuetext', 'The Product');
    drag(input, 50);
    expect(input).toHaveAttribute('aria-valuetext', 'The Parts');
  });
  test('arrow keys, Home and End jump between states', () => {
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(input).toHaveAttribute('aria-valuetext', 'The Parts');
    fireEvent.keyDown(input, { key: 'Home' });
    expect(input).toHaveAttribute('aria-valuetext', 'The Product');
    fireEvent.keyDown(input, { key: 'End' });
    expect(input).toHaveAttribute('aria-valuetext', 'The Parts');
  });
  test('switching projects keeps focus and does not rebuild the tabs', () => {
    const t = tab('None');
    t.focus();
    click(t);
    expect(document.activeElement).toBe(t);
    expect(tab('None')).toBe(t);
    expect(t).toHaveAttribute('aria-pressed', 'true');
  });
  test('cleanup removes everything, so mounting twice leaves one teardown', () => {
    const clear = jest.spyOn(window, 'clearInterval');
    stop();
    expect(root.innerHTML).toBe('');
    expect(clear).toHaveBeenCalled();
    stops.push(mountTeardown(root, data));
    expect(root.querySelectorAll('.td-stage')).toHaveLength(1);
  });
});

describe('labels', () => {
  test.each([
    ['missing', undefined],
    ['null', null],
    ['empty', {}],
    ['blank or not text', { whole: '', parts: 5, part: '   ' }],
  ])('fall back to the defaults when labels are %s', (_name, labels) => {
    const { root } = mount({ labels, projects: [full] } as unknown as TeardownData);
    expect(Array.from(root.querySelectorAll('.td-end')).map((b) => b.textContent)).toEqual(['The Product', 'The Parts']);
    expect(inputIn(root)).toHaveAttribute('aria-valuetext', 'The Product');
    expect(root.querySelector('.td-note-label')).toHaveTextContent('Part 01');
  });
  test('the data labels are used, as text', () => {
    const { root } = mount({ labels: { whole: 'Whole <b>', parts: 'Pieces', part: 'Piece' }, projects: [full] });
    expect(Array.from(root.querySelectorAll('.td-end')).map((b) => b.textContent)).toEqual(['Whole <b>', 'Pieces']);
    expect(root.querySelector('.td-end b')).toBeNull();
    expect(root.querySelector('.td-note-label')).toHaveTextContent('Piece 01');
  });
});

describe('data that is unusual but allowed', () => {
  test('a layer without a note still gets a numbered note', () => {
    const { root } = mount({ projects: [{ id: 'q', title: 'Q', summary: 'S', layers: [{ kind: 'app', title: 'Bare' }] }] });
    expect(root.querySelectorAll('.td-note')).toHaveLength(1);
    expect(root.querySelector('.td-note-label')).toHaveTextContent('Part 01');
    expect(root.querySelector('.td-note h3')).toHaveTextContent('Bare');
    expect(root.querySelector('.td-note p')).toBeEmptyDOMElement();
  });
  test('a kind that is also an object property still gets a plain plate', () => {
    const { root } = mount({ projects: [{ id: 'q', title: 'Q', summary: 'S', layers: [{ kind: 'constructor', title: 'Odd', note: 'n' }] }] });
    expect(root.querySelector('.td-plain')).toHaveTextContent('Odd');
  });
  test('more than six plates mount and move without a bad number', () => {
    const frames = fakeFrames();
    const layers = Array.from({ length: 9 }, (_v, i) => ({ kind: i % 2 ? 'services' : 'app', title: `Layer ${i}`, note: 'n' }));
    const { root } = mount({ projects: [{ id: 'big', title: 'Big', summary: 'S', layers: [{ kind: 'interface', title: 'Top', note: 'n' }, ...layers] }] });
    fireEvent.keyDown(inputIn(root), { key: 'End' });
    frames.run(90);
    const plates = Array.from(root.querySelectorAll<HTMLElement>('.td-layer'));
    expect(plates).toHaveLength(10);
    plates.forEach((p) => {
      expect(p.style.transform).not.toMatch(/NaN|Infinity/);
      expect(p.style.opacity).not.toBe('NaN');
    });
  });
  test('with many notes, every note still ends fully visible', () => {
    const frames = fakeFrames();
    const layers = Array.from({ length: 9 }, (_v, i) => ({ kind: 'app', title: `Layer ${i}`, note: 'n' }));
    const { root } = mount({ projects: [{ id: 'big', title: 'Big', summary: 'S', layers }] });
    fireEvent.keyDown(inputIn(root), { key: 'End' });
    frames.run(300);
    const notes = Array.from(root.querySelectorAll<HTMLElement>('.td-note'));
    expect(notes).toHaveLength(9);
    expect(notes.map((n) => n.style.opacity)).toEqual(notes.map(() => '1'));
  });
  test('no projects mounts nothing and reports no parts', () => {
    const onSelect = jest.fn();
    const root = document.createElement('div');
    const stop = mountTeardown(root, { projects: [] }, { onSelect });
    expect(onSelect).toHaveBeenCalledWith(false);
    expect(() => stop()).not.toThrow();
  });
});

describe('switching projects', () => {
  test('rapid tab clicks end on the last project with nothing left over', () => {
    const frames = fakeFrames();
    const fades: Array<{ onfinish: null | (() => void) }> = [];
    stubProperty(Element.prototype, 'animate', {
      writable: true,
      value() {
        const fade = { onfinish: null as null | (() => void) };
        fades.push(fade);
        return fade;
      },
    });
    const { root } = mount();
    const input = inputIn(root);
    fireEvent.keyDown(input, { key: 'End' });
    frames.run(90); // fully apart, so switching has notes to move out of the way

    ['None', 'Missing', 'Single', 'Full'].forEach((title) => click(tabIn(root, title)));
    expect(root.querySelectorAll('.td-tossed').length).toBeGreaterThan(1);
    expect(root.querySelectorAll('.td-notes-out').length).toBeGreaterThan(0);

    fades.forEach((fade) => fade.onfinish?.());
    expect(root.querySelectorAll('.td-notes-out')).toHaveLength(0);
    expect(root.querySelectorAll('svg.td-leaders')).toHaveLength(1);

    frames.run(120);
    expect(root.querySelectorAll('.td-tossed')).toHaveLength(0);
    expect(root.querySelectorAll('.td-stack')).toHaveLength(1);
    expect(root.querySelectorAll('.td-layer')).toHaveLength(3);
    expect(Array.from(root.querySelectorAll('.td-tab[aria-pressed="true"]')).map((t) => t.textContent)).toEqual(['Full']);
    expect(root.querySelector('.td-scene')).toHaveAttribute('aria-label', 'Full project and its parts');
  });
  test('switching while apart works in a browser without Element.animate', () => {
    const frames = fakeFrames();
    const { root } = mount();
    fireEvent.keyDown(inputIn(root), { key: 'End' });
    frames.run(90);
    click(tabIn(root, 'Single'));
    expect(root.querySelector('.td-scene')).toHaveAttribute('aria-label', 'Single project and its parts');
    expect(root.querySelectorAll('.td-notes-out')).toHaveLength(0);
  });
  test('with reduced motion nothing is tossed', () => {
    stubMedia({ reduce: true });
    const { root } = mount();
    click(tabIn(root, 'Single'));
    expect(root.querySelectorAll('.td-tossed')).toHaveLength(0);
    expect(root.querySelectorAll('.td-layer')).toHaveLength(1);
  });
});

describe('cleanup', () => {
  test('every listener hangs off one signal, and stopping aborts it', () => {
    const media = stubMedia();
    // The window's own addEventListener and the one every element shares
    const onElements = jest.spyOn(EventTarget.prototype, 'addEventListener');
    const onWindow = jest.spyOn(window, 'addEventListener');
    const { stop } = mount();
    const calls = [...onElements.mock.calls, ...onWindow.mock.calls];
    const signals = [...calls.map((call) => (call[2] as AddEventListenerOptions | undefined)?.signal), ...media.map((l) => (l.options as AddEventListenerOptions | undefined)?.signal)];
    expect(calls.map((call) => call[0])).toEqual(expect.arrayContaining(['pointerup', 'pointercancel', 'resize', 'input', 'keydown', 'pointerdown', 'blur', 'click']));
    expect(media.map((l) => l.type)).toEqual(['change', 'change']);
    expect(signals.length).toBeGreaterThan(10);
    expect(signals[0]).toBeDefined();
    expect(new Set(signals).size).toBe(1); // none without it, and all the same one
    expect(signals[0]!.aborted).toBe(false);
    stop();
    expect(signals[0]!.aborted).toBe(true);
  });
  test('stopping clears the interval, the timeouts, the frame and the observer', () => {
    jest.useFakeTimers();
    const frames = fakeFrames();
    let disconnects = 0;
    const original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {
        disconnects += 1;
      }
    } as unknown as typeof IntersectionObserver;
    undo.push(() => {
      window.IntersectionObserver = original;
    });

    const { root, stop } = mount();
    const input = inputIn(root);
    fireEvent.pointerDown(input); // starts the frame loop
    fireEvent.input(input, { target: { value: '60' } }); // crossing the halfway point starts the tick timeout
    expect(frames.pending()).toBe(1);
    expect(jest.getTimerCount()).toBeGreaterThan(1);
    stop();
    expect(frames.pending()).toBe(0);
    expect(jest.getTimerCount()).toBe(0);
    expect(disconnects).toBe(1);
    expect(root.innerHTML).toBe('');
    expect(root).not.toHaveClass('td');
  });
  test('the idle nudge stops with the teardown', () => {
    jest.useFakeTimers();
    const frames = fakeFrames();
    const { stop } = mount();
    jest.advanceTimersByTime(7000);
    expect(frames.pending()).toBe(1);
    stop();
    expect(frames.pending()).toBe(0);
    jest.advanceTimersByTime(30000);
    expect(frames.pending()).toBe(0);
  });
  test('mount, stop, mount again is safe', () => {
    const root = document.createElement('div');
    const stopFirst = mountTeardown(root, data);
    stopFirst();
    expect(root.innerHTML).toBe('');
    expect(root.className).toBe('');
    stops.push(mountTeardown(root, data));
    expect(root).toHaveClass('td');
    expect(root.querySelectorAll('.td-stage')).toHaveLength(1);
    expect(root.querySelectorAll('.td-tab')).toHaveLength(4);
  });
});

describe('below 640px', () => {
  // The notes are 40px tall each, starting 100px down, so a project's natural height is 40 per note plus the 10px margin
  function stubNoteLayout() {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const rect = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
      if (this.classList.contains('td-notes')) rect.top = 100;
      if (this.classList.contains('td-note')) rect.bottom = 100 + 40 * (Array.from(this.parentElement!.children).indexOf(this) + 1);
      return rect as DOMRect;
    });
  }
  const heightOf = (root: HTMLElement) => root.querySelector<HTMLElement>('.td-notes')!.style.height;
  const apart = (root: HTMLElement) => click(root.querySelectorAll<HTMLElement>('.td-end')[1]);

  test('the notes box follows a spring instead of jumping when another project arrives', () => {
    stubMedia({ narrow: true });
    stubNoteLayout();
    const frames = fakeFrames();
    const { root } = mount();
    expect(heightOf(root)).toBe('0px');
    apart(root);
    frames.run(120);
    expect(heightOf(root)).toBe('130px'); // three notes

    click(tabIn(root, 'Single'));
    expect(heightOf(root)).toBe('130px'); // no jump on the switch itself
    const heights: number[] = [];
    for (let i = 0; i < 120; i++) {
      frames.run(1);
      heights.push(parseInt(heightOf(root), 10));
    }
    expect(heights[0]).toBeLessThan(130);
    expect(heights[0]).toBeGreaterThan(50);
    heights.slice(1).forEach((h, i) => expect(h).toBeLessThanOrEqual(heights[i]));
    expect(heights[heights.length - 1]).toBe(50); // one note
  });
  test('reduced motion snaps the height', () => {
    stubMedia({ narrow: true, reduce: true });
    stubNoteLayout();
    const frames = fakeFrames();
    const { root } = mount();
    apart(root);
    frames.run(2);
    expect(heightOf(root)).toBe('130px');
    click(tabIn(root, 'Single'));
    expect(heightOf(root)).toBe('50px');
  });
  test('from 640px up the notes box has no height of its own', () => {
    stubMedia({ narrow: false });
    stubNoteLayout();
    const frames = fakeFrames();
    const { root } = mount();
    apart(root);
    frames.run(120);
    expect(heightOf(root)).toBe('');
  });
});

describe('fitting the stage to the notes (640px and up)', () => {
  let perNote = 100;
  // Stage 610px tall, 90px of it padding, gaps and the slider; a project's notes are `perNote` tall each
  function stubSizes() {
    stubProperty(HTMLElement.prototype, 'offsetHeight', {
      get(this: HTMLElement) {
        const stage = this.classList.contains('td-stage') ? this : this.parentElement;
        const stageHeight = stage && stage.style.height ? parseFloat(stage.style.height) : 610;
        if (this.classList.contains('td-stage')) return stageHeight;
        if (this.classList.contains('td-notes-measure')) return perNote * this.children.length;
        // With the slider hidden its row collapses and the notes get 32px more
        if (this.classList.contains('td-notes')) return stageHeight - 90 + (stage?.querySelector('.td-control[hidden]') ? 32 : 0);
        return 0;
      },
    });
  }
  const stageOf = (root: HTMLElement) => root.querySelector<HTMLElement>('.td-stage')!;

  beforeEach(() => {
    perNote = 100;
  });

  test('leaves the height alone when the notes fit', () => {
    stubSizes();
    const { root } = mount();
    expect(stageOf(root).style.height).toBe(''); // 3 x 100 + 3 x 14 + 90 = 432
  });
  test('grows the stage by the tallest notes plus 14px a note, and only when they would not fit', () => {
    perNote = 200;
    stubSizes();
    const { root } = mount();
    expect(stageOf(root).style.height).toBe('732px'); // 3 x 200 + 3 x 14 + 90
    expect(root.querySelector('.td-notes-measure')).toBeNull();
  });
  test('fits again on resize', () => {
    stubSizes();
    const { root } = mount();
    expect(stageOf(root).style.height).toBe('');
    perNote = 200;
    fireEvent(window, new Event('resize'));
    expect(stageOf(root).style.height).toBe('732px');
    perNote = 100;
    fireEvent(window, new Event('resize'));
    expect(stageOf(root).style.height).toBe('');
  });
  test('fits again when the fonts have loaded', async () => {
    let loaded!: () => void;
    const ready = new Promise<void>((resolve) => {
      loaded = resolve;
    });
    stubProperty(document, 'fonts', { value: { ready } });
    stubSizes();
    const { root } = mount();
    expect(stageOf(root).style.height).toBe('');
    perNote = 200;
    loaded();
    await ready;
    await Promise.resolve();
    expect(stageOf(root).style.height).toBe('732px');
  });
  test('does no layout work for fonts that load after stopping', async () => {
    let loaded!: () => void;
    const ready = new Promise<void>((resolve) => {
      loaded = resolve;
    });
    stubProperty(document, 'fonts', { value: { ready } });
    const { stop } = mount();
    stop();
    const measured = jest.spyOn(Element.prototype, 'getBoundingClientRect');
    loaded();
    await ready;
    await Promise.resolve();
    expect(measured).not.toHaveBeenCalled();
  });
  test('measures a project while the slider is hidden as if it were showing', () => {
    perNote = 200;
    stubSizes();
    const { root } = mount();
    click(tabIn(root, 'None'));
    fireEvent(window, new Event('resize'));
    expect(stageOf(root).style.height).toBe('732px');
  });
  test('below 640px the stage height is cleared', () => {
    perNote = 200;
    stubMedia({ narrow: true });
    stubSizes();
    const { root } = mount();
    expect(stageOf(root).style.height).toBe('');
  });
});
