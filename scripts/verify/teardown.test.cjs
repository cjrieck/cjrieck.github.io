// Real-browser checks for the "take it apart" teardown, run against the built site and the real data in src/data/projects.json.
// They look at layout, DOM, computed style and aria state, never at screenshots (WebKit flattens the 3D stack in them).
const { test, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { serveBuild, launchBrowser, openPage } = require('./helpers.cjs');
const { ROOT, NOTES, LEADERS, SLIDER, TABS, showTeardown, whenSettled, pickTab, setView, stageHeightsAcrossTabs } = require('./teardown-helpers.cjs');
const { projects } = require('../../src/data/projects.json');

let site;
let browser;
const opened = [];

before(async () => {
  site = await serveBuild();
  try {
    browser = await launchBrowser();
  } catch (error) {
    await site.close();
    site = undefined;
    throw error;
  }
});

after(async () => {
  if (browser) await browser.close();
  if (site) await site.close();
});

afterEach(async () => {
  for (const page of opened.splice(0)) await page.context().close();
});

async function open(options) {
  const page = await openPage(browser, site.url, options);
  opened.push(page);
  return page;
}

const parts = (project) => (project.layers || []).length;
const plates = (project) => 1 + (project.layers || []).filter((layer) => layer.kind !== 'interface').length;
const indexOf = (id) => projects.findIndex((project) => project.id === id);
const visibilityOf = (page, selector) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).visibility, selector);
const valueText = (page) => page.getAttribute(SLIDER, 'aria-valuetext');

// Where the real mouse has to go to put the slider's thumb at `fraction` (0 to 1) of its travel.
// The thumb is 18 px wide, so its centre runs from 9 px in to 9 px short of the far end.
async function sliderPoints(page) {
  const box = await page.locator(SLIDER).boundingBox();
  return { y: box.y + box.height / 2, at: (fraction) => box.x + 9 + fraction * (box.width - 18) };
}

// Presses on the thumb at one position, drags to another and holds there
async function dragTo(page, from, to) {
  const { y, at } = await sliderPoints(page);
  await page.mouse.move(at(from), y);
  await page.mouse.down();
  await page.mouse.move(at(to), y, { steps: 15 });
}

test('stage stays at the approved 610 px when notes fit', async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  assert.equal(await page.evaluate((selector) => document.querySelector(`${selector} .td-stage`).offsetHeight, ROOT), 610, 'the stage starts at 610 px');

  // Every tab, in both views: straight after the click and on every frame of the motion
  const { afterClick, everyFrame, tabs } = await stageHeightsAcrossTabs(page);
  assert.equal(tabs, projects.length);
  assert.equal(Object.keys(afterClick).length, 2 * projects.length);
  assert.deepEqual(Object.entries(afterClick).filter(([, height]) => height !== 610), [], 'the stage is 610 px after every click');
  assert.deepEqual(everyFrame, [610], 'and never any other height from one frame to the next');
  await whenSettled(page);
  assert.equal(await page.evaluate((selector) => document.querySelector(`${selector} .td-stage`).style.height, ROOT), '', 'the stage was never grown');
  assert.deepEqual(page.errors, []);
});

test('dragging past halfway snaps to the parts, short of it snaps back', async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  assert.equal(await valueText(page), 'The Product');

  // Letting go at 40% from the product: held at 40% the notes are showing, released they go away again
  await dragTo(page, 0, 0.4);
  const held = await page.evaluate((s) => Number(document.querySelector(s).value), SLIDER);
  assert.ok(Math.abs(held - 40) <= 3, `the thumb followed the mouse to about 40, not ${held}`);
  assert.match(await valueText(page), /percent apart/, 'while held, the slider reports how far apart it is');
  assert.equal(await page.locator(`${ROOT} .td-track.dragging`).count(), 1);
  await page.waitForFunction((s) => getComputedStyle(document.querySelector(s)).visibility === 'visible', NOTES);
  await page.mouse.up();
  await whenSettled(page);
  assert.equal(await valueText(page), 'The Product');
  assert.equal(await page.inputValue(SLIDER), '0');
  assert.equal(await visibilityOf(page, NOTES), 'hidden');
  assert.equal(await page.locator(`${ROOT} .td-track.dragging`).count(), 0);

  // 60% from the product goes the rest of the way
  await dragTo(page, 0, 0.6);
  await page.mouse.up();
  await whenSettled(page);
  assert.equal(await valueText(page), 'The Parts');
  assert.equal(await page.inputValue(SLIDER), '100');
  assert.equal(await visibilityOf(page, NOTES), 'visible');
  assert.equal(await page.textContent(`${ROOT} .td-end.on`), 'The Parts');

  // From the parts: 60% stays, 40% comes back
  await dragTo(page, 1, 0.6);
  await page.mouse.up();
  await whenSettled(page);
  assert.equal(await valueText(page), 'The Parts');
  assert.equal(await page.inputValue(SLIDER), '100');

  await dragTo(page, 1, 0.4);
  await page.mouse.up();
  await whenSettled(page);
  assert.equal(await valueText(page), 'The Product');
  assert.equal(await page.inputValue(SLIDER), '0');
  assert.equal(await visibilityOf(page, NOTES), 'hidden');
  assert.equal(await page.textContent(`${ROOT} .td-end.on`), 'The Product');
  assert.deepEqual(page.errors, []);
});

// A visitor in a hurry: parts view, then eight tab clicks 30 ms apart that wander over every project and end on Noggin
const RAPID = ['peachi', 'noggin', 'nbcuniversal', 'soundcloud', 'nbcuniversal', 'peachi', 'soundcloud', 'noggin'];

async function clickRapidly(page) {
  await setView(page, 'parts');
  await showTeardown(page);
  const boxes = [];
  for (let i = 0; i < projects.length; i++) boxes.push(await page.locator(TABS).nth(i).boundingBox());
  let current = 0; // the first project is showing
  for (const id of RAPID) {
    const i = indexOf(id);
    assert.notEqual(i, current, 'every click in the sequence is on a different tab than the one showing');
    current = i;
    await page.mouse.click(boxes[i].x + boxes[i].width / 2, boxes[i].y + boxes[i].height / 2);
    await page.waitForTimeout(30);
  }
  await whenSettled(page);
}

test('rapid tab clicks end on the last project with nothing left over', async () => {
  const last = projects[indexOf(RAPID[RAPID.length - 1])];
  assert.ok(parts(last) > 0 && parts(last) !== parts(projects[indexOf(RAPID[RAPID.length - 2])]), 'the last project is told apart from the one before it by its part count');
  const page = await open({ width: 1176 });
  await clickRapidly(page);

  const state = await page.evaluate(({ selector, notes }) => {
    const root = document.querySelector(selector);
    return {
      tossed: root.querySelectorAll('.td-tossed').length,
      stacks: root.querySelectorAll('.td-stack').length,
      notesOut: root.querySelectorAll('.td-notes-out').length,
      leaders: root.querySelectorAll('.td-leaders').length,
      pressed: Array.from(root.querySelectorAll('.td-tab[aria-pressed="true"]')).map((t) => t.textContent),
      notes: Array.from(document.querySelectorAll(`${notes} .td-note`)).map((n) => ({ title: n.querySelector('h3').textContent, opacity: getComputedStyle(n).opacity })),
      plates: root.querySelectorAll('.td-stack > .td-layer').length,
      card: root.querySelector('.td-card h3').textContent,
    };
  }, { selector: ROOT, notes: NOTES });

  assert.equal(state.tossed, 0, 'no flying plates are left');
  assert.equal(state.stacks, 1, 'only the current stack is in the scene');
  assert.equal(state.notesOut, 0, 'no fading copy of the old notes is left');
  assert.equal(state.leaders, 1, 'no fading copy of the old connector lines is left');
  assert.deepEqual(state.pressed, [last.title], 'the last-clicked tab is the only one pressed');
  assert.equal(state.card, last.title);
  assert.equal(state.plates, plates(last));
  assert.equal(state.notes.length, parts(last), 'exactly the last project\'s notes are there');
  assert.deepEqual(state.notes.map((n) => n.title), last.layers.map((l) => l.title));
  assert.deepEqual(state.notes.filter((n) => n.opacity !== '1'), [], 'every note is fully visible');
  assert.deepEqual(page.errors, []);
});

test('notes are hidden after going back to the product view', async () => {
  const page = await open({ width: 1176 });
  await clickRapidly(page);
  assert.equal(await visibilityOf(page, NOTES), 'visible', 'the notes were showing in the parts view');
  assert.equal(await visibilityOf(page, LEADERS), 'visible');

  await page.locator(`${ROOT} .td-end[data-to="0"]`).click();
  await page.waitForFunction(({ notes, leaders }) => getComputedStyle(document.querySelector(notes)).visibility === 'hidden'
    && getComputedStyle(document.querySelector(leaders)).visibility === 'hidden', { notes: NOTES, leaders: LEADERS }, { timeout: 1500 });
  await whenSettled(page);
  assert.equal(await visibilityOf(page, NOTES), 'hidden');
  assert.equal(await visibilityOf(page, LEADERS), 'hidden');
  assert.equal(await valueText(page), 'The Product');
  assert.equal(await page.locator(`${ROOT} .td-tossed, ${ROOT} .td-notes-out`).count(), 0);
  assert.deepEqual(page.errors, []);
});

test('keyboard: slider keys and focus stay put', async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  await page.focus(SLIDER);
  const focused = () => page.evaluate(() => (document.activeElement.matches('input[type=range]') ? 'slider' : document.activeElement.className));
  // The title of the tab that has the focus, or what has it instead
  const focusedTab = () => page.evaluate(() => (document.activeElement.matches('.td-tab') ? document.activeElement.textContent : `<${document.activeElement.tagName.toLowerCase()}>`));

  for (const [key, text, value] of [
    ['End', 'The Parts', '100'],
    ['Home', 'The Product', '0'],
    ['ArrowRight', 'The Parts', '100'],
    ['ArrowLeft', 'The Product', '0'],
    ['ArrowUp', 'The Parts', '100'],
    ['ArrowDown', 'The Product', '0'],
  ]) {
    await page.keyboard.press(key);
    assert.equal(await valueText(page), text, `${key} sets the slider to ${text}`);
    assert.equal(await page.inputValue(SLIDER), value, `${key} moves the slider all the way to ${value}`);
    assert.equal(await focused(), 'slider', `focus stays on the slider after ${key}`);
  }

  // The keys do move the scene, not only the label
  await page.keyboard.press('End');
  await whenSettled(page);
  assert.equal(await visibilityOf(page, NOTES), 'visible');
  await page.keyboard.press('Home');
  await whenSettled(page);
  assert.equal(await visibilityOf(page, NOTES), 'hidden');

  // A key that is not one of the six leaves the slider's own behaviour alone
  await page.keyboard.press('a');
  assert.equal(await valueText(page), 'The Product');

  // Tabs: Enter selects, and the focus stays on the tab that was pressed
  const third = projects[2].title;
  await page.locator(TABS).nth(2).focus();
  await page.keyboard.press('Enter');
  await whenSettled(page);
  assert.equal(await page.getAttribute(`${TABS}:nth-child(3)`, 'aria-pressed'), 'true');
  assert.equal(await page.locator(`${TABS}[aria-pressed="true"]`).count(), 1);
  assert.equal(await page.textContent(`${ROOT} .td-card h3`), third);
  assert.equal(await focusedTab(), third, 'the focus is still on the tab');

  // And Space does the same on the next tab. (The tab is focused directly: Safari's Tab key skips buttons unless the visitor turned that on.)
  await page.locator(TABS).nth(3).focus();
  await page.keyboard.press('Space');
  await whenSettled(page);
  assert.equal(await page.getAttribute(`${TABS}:nth-child(4)`, 'aria-pressed'), 'true');
  assert.equal(await focusedTab(), projects[3].title, 'and on the next tab after Space');
  assert.deepEqual(page.errors, []);
});

test('phone: switching projects in the parts view does not jump the page', async () => {
  const page = await open({ width: 390 });
  await setView(page, 'parts');
  await pickTab(page, indexOf('noggin'));
  await page.evaluate(() => {
    const sampler = { heights: [document.documentElement.scrollHeight], running: true };
    const sample = () => {
      if (!sampler.running) return;
      sampler.heights.push(document.documentElement.scrollHeight);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    window.heightSampler = sampler;
  });
  await pickTab(page, indexOf('soundcloud'));
  const heights = await page.evaluate(() => {
    window.heightSampler.running = false;
    return window.heightSampler.heights;
  });

  const first = heights[0];
  const last = heights[heights.length - 1];
  const totalChange = Math.abs(last - first);
  let largest = 0;
  for (let i = 1; i < heights.length; i++) largest = Math.max(largest, Math.abs(heights[i] - heights[i - 1]));
  assert.ok(heights.length > 10, `the page height was sampled across the whole switch (${heights.length} frames)`);
  assert.ok(totalChange > 0, `the page is a different height after the switch (${first} to ${last})`);
  assert.ok(largest < totalChange / 2, `the page height eases: the largest one-frame change is ${largest} of ${totalChange}`);
  assert.deepEqual(page.errors, []);
});

test('project switching keeps the frame rate', { skip: process.env.BROWSER && process.env.BROWSER !== 'chromium' }, async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  await setView(page, 'parts');
  // Frames are timed inside the page. Only the frames from the click to the last change count, so the idle frames before and after cannot flatter the average.
  await page.evaluate((selector) => {
    const timing = { frames: [], clicked: Infinity, lastChange: 0, running: true };
    document.addEventListener('click', () => { timing.clicked = Math.min(timing.clicked, performance.now()); }, { capture: true });
    const frame = (time) => {
      if (!timing.running) return;
      timing.frames.push(time);
      requestAnimationFrame(frame);
    };
    new MutationObserver(() => { timing.lastChange = performance.now(); })
      .observe(document.querySelector(selector), { attributes: true, childList: true, subtree: true });
    requestAnimationFrame(frame);
    window.frameTiming = timing;
  }, ROOT);
  await pickTab(page, indexOf('noggin'));
  const frames = await page.evaluate(() => {
    const timing = window.frameTiming;
    timing.running = false;
    return timing.frames.filter((time) => time >= timing.clicked && time <= timing.lastChange);
  });

  assert.ok(frames.length >= 30, `the switch was timed over a real animation (${frames.length} frames)`);
  const average = (frames[frames.length - 1] - frames[0]) / (frames.length - 1);
  console.log(`  frame rate: ${frames.length} frames, average ${average.toFixed(1)} ms`);
  assert.ok(average <= 20, `average frame time during a switch is ${average.toFixed(1)} ms (the mockup averaged 17)`);
  assert.deepEqual(page.errors, []);
});

test('every project image is decoded before its tab is clicked', async () => {
  const page = await open({ width: 1176 });
  const images = projects.filter((project) => project.image).map((project) => project.image);
  assert.ok(images.length > 1, 'the data has several project images');

  // Straight after load, before any tab is clicked: every image has been requested, and the ones on the page are ready
  const loaded = await page.evaluate(() => ({
    requested: performance.getEntriesByType('resource').map((entry) => entry.name),
    onPage: Array.from(document.images).filter((img) => img.src.includes('/projects/')).map((img) => ({ src: img.src, complete: img.complete, width: img.naturalWidth })),
  }));
  for (const name of images) assert.ok(loaded.requested.some((url) => url.endsWith(`/projects/${name}`)), `${name} was fetched during load`);
  assert.ok(loaded.onPage.length >= 1);
  assert.deepEqual(loaded.onPage.filter((img) => !img.complete || img.width === 0), []);

  // Then each tab in turn: the instant the click handler returns, the new card's picture is already complete
  const arrivals = await page.evaluate((selector) => Array.from(document.querySelectorAll(`${selector} .td-tab`)).map((tab, i) => {
    if (i === 0) return null; // already showing
    tab.click();
    const img = document.querySelector(`${selector} .td-stack:not(.td-tossed) .td-card img`);
    return { tab: tab.textContent, src: img.src, complete: img.complete, width: img.naturalWidth };
  }).filter(Boolean), ROOT);
  assert.equal(arrivals.length, projects.length - 1);
  assert.deepEqual(arrivals.filter((a) => !a.complete || a.width === 0), [], 'no card arrives blank');
  await whenSettled(page);
  assert.deepEqual(page.errors, []);
});

test('the slider input stays invisible but present, and still takes the touch', async () => {
  for (const width of [1176, 390]) {
    const page = await open({ width });
    await showTeardown(page);
    const input = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      const track = el.closest('.td-track').getBoundingClientRect();
      const x = track.left + track.width / 2, y = track.top + track.height / 2;
      const hit = document.elementsFromPoint(x, y)[0];
      return {
        opacity: getComputedStyle(el).opacity,
        height: el.getBoundingClientRect().height,
        width: el.getBoundingClientRect().width,
        trackWidth: track.width,
        hit: hit === el,
        hitTag: `${hit.tagName}.${hit.className}`,
        inViewport: y > 0 && y < window.innerHeight,
      };
    }, SLIDER);
    assert.ok(input.inViewport, `the slider is on screen at ${width}`);
    assert.equal(input.opacity, '0', `at ${width} the input is fully transparent, or iOS paints its own white thumb over the knob`);
    assert.equal(input.height, 44, `at ${width} the touch target is 44 px tall`);
    assert.equal(input.width, input.trackWidth, `at ${width} the input covers the whole track`);
    assert.ok(input.hit, `at ${width} the input is the first thing under the middle of the track (got ${input.hitTag})`);
    assert.deepEqual(page.errors, []);
  }
});
