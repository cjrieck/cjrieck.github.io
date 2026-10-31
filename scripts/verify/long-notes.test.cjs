// Real-browser checks for hand-edited data the real file does not have yet: long notes, no parts, seven plates,
// a kind with no drawing, a layers list that is missing, a project that is only its card.
//
// The site is built once, into a temporary folder, with src/data/projects.json swapped for the fixture below. The real
// file is put back as soon as the build is done, and again whatever happens (a failed build, a failed test, Ctrl-C).
// Only a kill -9 could leave the fixture behind; the real file's copy is then in the folder printed when the test starts.
const { test, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { serveBuild, launchBrowser, openPage } = require('./helpers.cjs');
const { ROOT, NOTES, showTeardown, whenSettled, pickTab, quickTab, frames, setView, stageHeightsAcrossTabs } = require('./teardown-helpers.cjs');

const REPO = path.resolve(__dirname, '..', '..');
const DATA = path.join(REPO, 'src', 'data', 'projects.json');

// Ordinary words, so lines break the way they do in a real note. Exactly `length` characters.
const SENTENCE = 'We built the first version quickly, then spent months making it fast, simple and dependable for the people who used it every single day. ';
function note(length) {
  const text = SENTENCE.repeat(Math.ceil(length / SENTENCE.length)).slice(0, length);
  return text.endsWith(' ') ? `${text.slice(0, -1)}.` : text;
}

const fixture = {
  labels: { whole: 'The Product', parts: 'The Parts', part: 'Part' },
  projects: [
    {
      id: 'long',
      title: 'Long notes',
      summary: 'Four parts with a 300-character note each.',
      image: 'noggin.webp',
      imageAlt: 'A tablet',
      layers: [
        { kind: 'interface', title: 'What you see', note: note(300) },
        { kind: 'app', title: 'The app', note: note(300) },
        { kind: 'services', title: 'The services', note: note(300) },
        { kind: 'infrastructure', title: 'The infrastructure', note: note(300) },
      ],
    },
    {
      id: 'short',
      title: 'Short notes',
      summary: 'Two parts with a short note each.',
      image: 'soundcloud.webp',
      imageAlt: 'Two phones',
      layers: [
        { kind: 'interface', title: 'What you see', note: 'A short note.' },
        { kind: 'app', title: 'The app', note: 'Another short note.' },
      ],
    },
    { id: 'empty', title: 'No parts', summary: 'An empty list of layers, so nothing to take apart.', image: 'nbc.webp', imageAlt: 'A phone', layers: [] },
    {
      id: 'many',
      title: 'Many parts',
      summary: 'Seven plates under the card, two of them with a kind that has no drawing.',
      image: 'peachi.webp',
      imageAlt: 'A phone',
      layers: [
        { kind: 'app', title: 'First layer', note: note(90) },
        { kind: 'services', title: 'Second layer', note: note(90) },
        { kind: 'infrastructure', title: 'Third layer', note: note(90) },
        { kind: 'app', title: 'Fourth layer', note: note(90) },
        { kind: 'services', title: 'Fifth layer', note: note(90) },
        // The name of something every JavaScript object has, which must not be mistaken for a drawing
        { kind: 'constructor', title: 'Sixth layer', note: note(90) },
        { kind: 'hologram', title: 'Seventh layer', note: note(90) },
      ],
    },
    { id: 'missing', title: 'No layers key', summary: 'A project with no layers at all and no picture.' },
    {
      id: 'face',
      title: 'Only the card',
      summary: 'A project whose one layer is its own card.',
      image: 'nbc.webp',
      imageAlt: 'A phone',
      layers: [{ kind: 'interface', title: 'What you see', note: note(120) }],
    },
  ],
};
const at = (id) => fixture.projects.findIndex((project) => project.id === id);

let site;
let browser;
let buildDir;
let backupDir;
let restored = true;
const opened = [];

// Puts the real data file back exactly as it was. Safe to call any number of times, and from an exit handler.
function restoreData() {
  if (restored) return;
  fs.copyFileSync(path.join(backupDir, 'projects.json'), DATA);
  restored = true;
}
const onSignal = (signal) => () => {
  restoreData();
  process.exit(128 + (signal === 'SIGINT' ? 2 : 15));
};
const onInterrupt = onSignal('SIGINT');
const onTerminate = onSignal('SIGTERM');

function build(into) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(REPO, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js'), 'build'], {
      cwd: REPO,
      env: { ...process.env, BUILD_PATH: into, GENERATE_SOURCEMAP: 'false', CI: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.once('error', reject);
    child.once('close', (code) => (code === 0 ? resolve() : reject(new Error(`The build failed (exit ${code}):\n${output.split('\n').slice(-40).join('\n')}`))));
  });
}

before(async () => {
  backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'projects-json-backup-'));
  fs.copyFileSync(DATA, path.join(backupDir, 'projects.json'));
  console.log(`  (a copy of src/data/projects.json is in ${backupDir} while this test runs)`);
  restored = false;
  process.on('exit', restoreData); // the last resort: this runs when the process ends for any reason Node can catch
  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onTerminate);
  buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'long-notes-build-'));
  try {
    fs.writeFileSync(DATA, `${JSON.stringify(fixture, null, 2)}\n`);
    await build(buildDir);
  } finally {
    restoreData();
  }
  site = await serveBuild(buildDir);
  try {
    browser = await launchBrowser();
  } catch (error) {
    await site.close();
    site = undefined;
    throw error;
  }
});

after(async () => {
  try {
    if (browser) await browser.close();
    if (site) await site.close();
  } finally {
    restoreData();
    process.off('SIGINT', onInterrupt);
    process.off('SIGTERM', onTerminate);
    if (buildDir) fs.rmSync(buildDir, { recursive: true, force: true });
    if (backupDir) fs.rmSync(backupDir, { recursive: true, force: true });
  }
});

afterEach(async () => {
  for (const page of opened.splice(0)) await page.context().close();
});

async function open(options) {
  const page = await openPage(browser, site.url, options);
  opened.push(page);
  return page;
}

// Shows a project, taken apart if it has anything to take apart. The motion has finished when this returns.
async function showParts(page, id) {
  await pickTab(page, at(id));
  if (await page.locator(`${ROOT} .td-control`).isVisible()) await setView(page, 'parts');
}

// The same, without waiting for the motion to end: for checks of layout, which the motion does not change
async function showPartsNow(page, id) {
  await quickTab(page, at(id));
  if (await page.locator(`${ROOT} .td-control`).isVisible()) {
    await page.locator(`${ROOT} .td-end[data-to="1"]`).click();
    await frames(page);
  }
}

// How the notes sit in their box and in the stage, and how tall they need to be
const measureNotes = (page) => page.evaluate(({ selector, notes }) => {
  const box = document.querySelector(notes);
  const stage = document.querySelector(`${selector} .td-stage`);
  const boxRect = box.getBoundingClientRect();
  const rects = Array.from(box.children).map((n) => n.getBoundingClientRect());
  const last = rects[rects.length - 1];
  return {
    count: rects.length,
    scrollHeight: box.scrollHeight,
    clientHeight: box.clientHeight,
    boxHeight: boxRect.height,
    stageHeight: stage.offsetHeight,
    stageChrome: stage.offsetHeight - box.offsetHeight,
    needed: rects.reduce((sum, r) => sum + r.height, 0) + 14 * rects.length,
    firstTop: rects.length ? rects[0].top - boxRect.top : 0,
    lastBottom: rects.length ? boxRect.bottom - last.bottom : 0,
    lastRight: rects.length ? last.right : 0,
    stageRight: stage.getBoundingClientRect().right,
    lastBottomEdge: rects.length ? last.bottom : 0,
    stageBottom: stage.getBoundingClientRect().bottom,
    opacities: Array.from(box.children).map((n) => getComputedStyle(n).opacity),
  };
}, { selector: ROOT, notes: NOTES });

const visibleCount = (page, selector) => page.locator(selector).evaluateAll((els) => els.filter((e) => e.getClientRects().length > 0).length);

const DESKTOP = [768, 1176, 1440];

for (const width of DESKTOP) {
  test(`no note is clipped at ${width}`, async () => {
    const page = await open({ width });
    await showTeardown(page);
    let checked = 0;
    await showParts(page, fixture.projects[0].id); // the first take-apart, with its motion, so the notes are showing
    for (const project of fixture.projects) {
      await showPartsNow(page, project.id);
      const m = await measureNotes(page);
      const rows = (project.layers || []).length;
      assert.equal(m.count, rows, `${project.id} shows its ${rows} notes`);
      if (!rows) continue;
      checked++;
      assert.ok(m.scrollHeight <= m.clientHeight + 1, `${project.id}: the notes box scrolls (${m.scrollHeight} of ${m.clientHeight})`);
      assert.ok(m.firstTop >= -1, `${project.id}: the first note starts ${-m.firstTop} px above its box`);
      assert.ok(m.lastBottom >= -1, `${project.id}: the last note ends ${-m.lastBottom} px below its box`);
    }
    assert.equal(checked, 4, 'the four projects that have notes were checked');
    await whenSettled(page);
    assert.deepEqual(page.errors, []);
  });
}

test('desktop stage height is the same for every project', async () => {
  for (const width of DESKTOP) {
    const page = await open({ width });
    await showTeardown(page);
    const { afterClick, everyFrame, tabs } = await stageHeightsAcrossTabs(page);
    assert.equal(tabs, fixture.projects.length);
    assert.equal(Object.keys(afterClick).length, 2 * fixture.projects.length);
    assert.equal(new Set(Object.values(afterClick)).size, 1, `at ${width} the stage is one height after every click: ${JSON.stringify(afterClick)}`);
    assert.equal(everyFrame.length, 1, `at ${width} the stage never changes height from one frame to the next: ${everyFrame}`);
    await whenSettled(page);
    assert.deepEqual(page.errors, []);
    await page.context().close();
    opened.splice(opened.indexOf(page), 1);
  }
});

test('stage grows past 610 px only because the notes need it', async () => {
  for (const width of DESKTOP) {
    const page = await open({ width });
    await showTeardown(page);
    const needs = [];
    let m;
    for (const project of fixture.projects.filter((p) => (p.layers || []).length)) {
      await showPartsNow(page, project.id);
      m = await measureNotes(page);
      needs.push({ id: project.id, needed: m.needed });
    }
    const tallest = Math.max(...needs.map((n) => n.needed));
    const room = 610 - m.stageChrome; // what the notes get while the stage is its approved height
    assert.ok(tallest > room, `at ${width} the longest set of notes (${tallest} px) really does not fit in ${room} px`);
    assert.ok(m.stageHeight > 610, `at ${width} the stage grew past 610 (it is ${m.stageHeight})`);
    // Grown to fit the tallest set, and no more than a few pixels beyond it
    assert.ok(m.boxHeight >= tallest - 1, `at ${width} the notes box (${m.boxHeight}) holds the tallest set (${tallest})`);
    assert.ok(m.boxHeight <= tallest + 3, `at ${width} the stage grew by what the notes need and no more (box ${m.boxHeight}, needed ${tallest})`);
    await whenSettled(page);
    assert.deepEqual(page.errors, []);
    await page.context().close();
    opened.splice(opened.indexOf(page), 1);
  }
});

test('no slider and no slider label on a project with no parts', async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  const control = () => page.evaluate((selector) => {
    const el = document.querySelector(`${selector} .td-control`);
    const label = document.querySelector('#work .sh .label');
    return {
      hidden: el.hidden,
      display: getComputedStyle(el).display,
      sliderBox: document.querySelector(`${selector} input[type=range]`).getBoundingClientRect().width,
      label: getComputedStyle(label).visibility,
    };
  }, ROOT);

  const start = await control();
  assert.equal(start.hidden, false, 'the first project has a slider');
  assert.equal(start.display, 'flex');
  assert.ok(start.sliderBox > 0);
  assert.equal(start.label, 'visible');
  for (const none of ['empty', 'missing']) {
    await quickTab(page, at(none));
    const c = await control();
    assert.equal(c.hidden, true, `${none}: the slider's row is hidden`);
    assert.equal(c.display, 'none', `${none}: and takes no room`);
    assert.equal(c.sliderBox, 0, `${none}: the slider has no box`);
    assert.equal(c.label, 'hidden', `${none}: the "drag the slider" label is hidden`);
    assert.equal(await page.locator(`${ROOT} .td-note`).count(), 0, `${none}: there are no notes`);
    assert.equal(await visibleCount(page, `${ROOT} .td-end`), 0, `${none}: the captions are gone`);

    await quickTab(page, at('many'));
    const back = await control();
    assert.equal(back.hidden, false, `after ${none}, the next project has its slider back`);
    assert.equal(back.display, 'flex');
    assert.ok(back.sliderBox > 0);
    assert.equal(back.label, 'visible', `after ${none}, the label is back`);
  }
  await whenSettled(page);
  assert.deepEqual(page.errors, []);
});

test('seven plates still animate', async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  await pickTab(page, at('many'));
  await page.evaluate((selector) => {
    const sampler = { frames: [], running: true };
    const sample = () => {
      if (!sampler.running) return;
      sampler.frames.push(Array.from(document.querySelectorAll(`${selector} .td-stack:not(.td-tossed) > .td-layer`))
        .map((n) => `${n.style.transform} ${n.style.opacity}`));
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    window.plateSampler = sampler;
  }, ROOT);
  await setView(page, 'parts');
  const frames = await page.evaluate(() => {
    window.plateSampler.running = false;
    return window.plateSampler.frames;
  });

  const z = (transform) => Number(/translate3d\([^,]+,\s*[^,]+,\s*([^)]+?)px\)/.exec(transform)[1]);
  assert.ok(frames.length >= 20, `plates were sampled across the whole motion (${frames.length} frames)`);
  assert.ok(frames.every((frame) => frame.length === 8), 'the card and seven plates are there in every frame');
  assert.deepEqual(frames.flat().filter((s) => /NaN|Infinity/.test(s)), [], 'no plate ever has an impossible transform or opacity');
  // A browser throws away a transform with NaN in it, so a plate with a broken spring would not show NaN: it would sit
  // frozen where it was and then jump to its place when the motion ends. Every plate has to travel there in steps.
  for (let plate = 0; plate < 8; plate++) {
    const path = frames.map((frame) => z(frame[plate]));
    const travel = Math.abs(path[path.length - 1] - path[0]);
    let biggestStep = 0;
    for (let i = 1; i < path.length; i++) biggestStep = Math.max(biggestStep, Math.abs(path[i] - path[i - 1]));
    assert.ok(travel > 10, `plate ${plate} moved (${travel.toFixed(1)} px)`);
    assert.ok(new Set(path).size > 10, `plate ${plate} was seen in more than ten different places (${new Set(path).size})`);
    assert.ok(biggestStep < travel / 2, `plate ${plate} did not jump: its biggest single-frame move was ${biggestStep.toFixed(1)} of ${travel.toFixed(1)} px`);
  }

  const spread = (frame) => z(frame[0]) - z(frame[7]);
  const final = frames[frames.length - 1].map(z);
  assert.ok(spread(frames[0]) < 10, `the plates started stacked (${spread(frames[0]).toFixed(1)} px apart)`);
  assert.ok(spread(frames[frames.length - 1]) > 200, `and ended spread out (${spread(frames[frames.length - 1]).toFixed(1)} px apart)`);
  for (let i = 1; i < final.length; i++) assert.ok(final[i - 1] - final[i] > 20, `plate ${i} sits clearly below plate ${i - 1} (${final})`);

  const notes = await measureNotes(page);
  assert.equal(notes.count, 7);
  assert.deepEqual(notes.opacities.filter((o) => o !== '1'), [], 'all seven notes are fully visible once the plates are apart');
  assert.deepEqual(page.errors, []);
});

test('an unknown kind shows its title on a plain plate', async () => {
  const page = await open({ width: 1176 });
  await pickTab(page, at('many'));
  const plates = await page.evaluate((selector) => Array.from(document.querySelectorAll(`${selector} .td-stack > .td-layer`)).map((n) => ({
    plain: n.querySelector('.td-plain')?.textContent ?? null,
    drawn: n.querySelector('svg') !== null,
    text: n.textContent,
  })), ROOT);
  assert.equal(plates.length, 8);
  assert.deepEqual(plates.filter((p) => p.plain !== null).map((p) => p.plain), ['Sixth layer', 'Seventh layer'], 'the two kinds with no drawing show their titles');
  assert.ok(plates.filter((p) => p.plain !== null).every((p) => !p.drawn), 'and have no drawing');
  assert.equal(plates.filter((p) => p.drawn).length, 5, 'the five known kinds are drawn');
  assert.ok(plates.every((p) => !/function|native code/.test(p.text)), 'no plate shows JavaScript');
  assert.deepEqual(page.errors, []);
});

test('a project that is only its card still takes apart', async () => {
  const page = await open({ width: 1176 });
  await showTeardown(page);
  await showParts(page, 'face');
  const state = await page.evaluate((selector) => ({
    plates: document.querySelectorAll(`${selector} .td-stack > .td-layer`).length,
    transform: document.querySelector(`${selector} .td-stack > .td-layer`).style.transform,
  }), ROOT);
  assert.equal(state.plates, 1, 'the card is the only plate');
  assert.ok(!/NaN/.test(state.transform), state.transform);
  assert.equal(await page.getAttribute(`${ROOT} input[type=range]`, 'aria-valuetext'), 'The Parts');
  const m = await measureNotes(page);
  assert.equal(m.count, 1, 'its one note is there');
  assert.deepEqual(m.opacities, ['1']);
  assert.ok(m.scrollHeight <= m.clientHeight + 1);
  assert.deepEqual(page.errors, []);
});

test('phone: long notes stay readable', async () => {
  const page = await open({ width: 360 });
  let checked = 0;
  for (const project of fixture.projects) {
    const rows = (project.layers || []).length;
    if (!rows) continue;
    await showParts(page, project.id);
    const m = await measureNotes(page);
    checked++;
    assert.equal(m.count, rows);
    assert.ok(m.lastBottomEdge <= m.stageBottom, `${project.id}: the last note ends at ${m.lastBottomEdge}, inside the stage that ends at ${m.stageBottom}`);
    assert.ok(m.lastBottom >= -1, `${project.id}: the last note ends ${-m.lastBottom} px below the notes box`);
    assert.ok(m.scrollHeight <= m.clientHeight + 1, `${project.id}: the notes box scrolls (${m.scrollHeight} of ${m.clientHeight})`);
    assert.ok(m.lastRight <= m.stageRight, `${project.id}: the notes run ${m.lastRight - m.stageRight} px past the stage's right edge`);
    assert.deepEqual(m.opacities.filter((o) => o !== '1'), [], `${project.id}: every note is fully visible`);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(wide <= 0, `${project.id}: the page scrolls sideways by ${wide} px`);
  }
  assert.equal(checked, 4);
  assert.deepEqual(page.errors, []);
});
