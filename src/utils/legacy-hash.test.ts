import { applyLegacyHash, holdHashTarget, resolveLegacyHash, scrollToCurrentHash } from './legacy-hash';

afterEach(() => {
  window.history.replaceState(null, '', '#');
  document.documentElement.style.scrollBehavior = '';
  document.body.replaceChildren();
});

test.each([
  ['#/expertise', '#process'],
  ['#/projects', '#work'],
  ['#/expertise/', '#process'],
  ['#/projects/', '#work'],
  ['#/apps/potpourri/privacy', '#top'],
  ['#/nope', '#top'],
  ['#/', '#top'],
])('%s goes to %s', (from, to) => expect(resolveLegacyHash(from)).toBe(to));

test.each(['', '#', '#work', '#process', '#top', '#nope'])('%s is left alone', (hash) =>
  expect(resolveLegacyHash(hash)).toBeNull());

test('applyLegacyHash rewrites the URL without adding history', () => {
  window.location.hash = '#/projects';
  const before = window.history.length;
  applyLegacyHash();
  expect(window.location.hash).toBe('#work');
  expect(window.history.length).toBe(before);
});

test('applyLegacyHash sends an unknown old path to the top', () => {
  window.location.hash = '#/nope';
  applyLegacyHash();
  expect(window.location.hash).toBe('#top');
});

test('applyLegacyHash leaves a current hash unchanged', () => {
  window.location.hash = '#skills';
  const before = window.history.length;
  applyLegacyHash();
  expect(window.location.hash).toBe('#skills');
  expect(window.history.length).toBe(before);
});

test('applyLegacyHash changes nothing more the second time', () => {
  window.location.hash = '#/expertise/';
  applyLegacyHash();
  const before = window.history.length;
  applyLegacyHash();
  expect(window.location.hash).toBe('#process');
  expect(window.history.length).toBe(before);
});

function addSection(id: string) {
  const section = document.createElement('section');
  section.id = id;
  section.scrollIntoView = jest.fn();
  document.body.append(section);
  return section;
}

test('scrollToCurrentHash scrolls to the matching section', () => {
  const section = addSection('work');
  window.location.hash = '#work';
  scrollToCurrentHash();
  expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
});

test('scrollToCurrentHash jumps instantly even though the theme smooths scrolling', () => {
  const section = addSection('work');
  const behaviorDuringJump: string[] = [];
  section.scrollIntoView = jest.fn(() => {
    behaviorDuringJump.push(document.documentElement.style.scrollBehavior);
  });
  document.documentElement.style.scrollBehavior = 'smooth';
  window.location.hash = '#work';
  scrollToCurrentHash();
  expect(behaviorDuringJump).toEqual(['auto']);
  expect(section.scrollIntoView).toHaveBeenCalledWith();
  expect(document.documentElement.style.scrollBehavior).toBe('smooth');
});

test('scrollToCurrentHash ignores a hash with no matching element', () => {
  window.location.hash = '#nope';
  expect(scrollToCurrentHash()).toBeNull();
});

describe('holdHashTarget', () => {
  let top: number;
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    top = 100;
    frames = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { frames = []; });
    window.location.hash = '#work';
  });
  afterEach(() => jest.restoreAllMocks());

  function runFrame() {
    const callbacks = frames;
    frames = [];
    callbacks.forEach((callback) => callback(0));
  }

  function addMovingSection() {
    const section = addSection('work');
    section.getBoundingClientRect = () => ({ top } as DOMRect);
    return section;
  }

  test('lands again when the layout moves the section', () => {
    const section = addMovingSection();
    const stop = holdHashTarget();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
    runFrame();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
    top = 640;
    runFrame();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(2);
    stop();
  });

  test.each(['wheel', 'touchmove', 'pointerdown', 'keydown'])('stops once the visitor takes over with %s', (type) => {
    const section = addMovingSection();
    holdHashTarget();
    window.dispatchEvent(new Event(type));
    top = 640;
    runFrame();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  test('the stop function ends it and removes its listeners', () => {
    const section = addMovingSection();
    const remove = jest.spyOn(window, 'removeEventListener');
    const stop = holdHashTarget();
    stop();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach((type) =>
      expect(remove).toHaveBeenCalledWith(type, expect.any(Function), expect.anything()));
    top = 640;
    runFrame();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  test('gives up after the page has settled', () => {
    const section = addMovingSection();
    const now = jest.spyOn(Date, 'now').mockReturnValue(0);
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
    holdHashTarget();
    now.mockReturnValue(5000);
    top = 640;
    runFrame(); // the last look still corrects the position, then it stops
    expect(section.scrollIntoView).toHaveBeenCalledTimes(2);
    runFrame();
    expect(section.scrollIntoView).toHaveBeenCalledTimes(2);
    delete (document as { readyState?: string }).readyState;
  });
});
