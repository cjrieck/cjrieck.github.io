// How long can a project note be before the teardown's stage has to grow past its approved height?
//
// Usage: npm run build, then node scripts/measure-note-length.cjs
//        BROWSER=webkit node scripts/measure-note-length.cjs   (chromium is the default; firefox and webkit also work)
//
// It opens the built page in build/ and, for 1 to 4 parts at each window width, searches for the longest note (ordinary
// English words, every note in the project that long) for which the page's own rule still fits in the stage:
//   chrome + the notes' total height + 14 px per note  <=  the stage's approved height
// Nothing is written to the repo or anywhere else: the notes are laid out in the page and thrown away.
const fs = require('node:fs');
const path = require('node:path');
const { serveBuild, launchBrowser, openPage } = require('./verify/helpers.cjs');
const { projects } = require('../src/data/projects.json');

const BUILD = path.resolve(__dirname, '..', 'build');
const WIDTHS = [1176, 1440];
const PARTS = [1, 2, 3, 4];
const TOP = 1500; // longer than any sensible note: if this still fits the table says so instead of a number
// Must match NOTE_SLACK in src/components/teardown/teardown-engine.ts: the room the stage gives each note beyond its height
const SLACK = 14;
const SENTENCE = 'We built the first version quickly, then spent months making it fast, simple and dependable for the people who used it every single day. ';
// The titles on the notes: the real ones from the data, from the project with the most parts
const TITLES = projects.reduce((best, p) => ((p.layers || []).length > best.length ? p.layers : best), []).map((layer) => layer.title);

// Runs inside the page. Lays out `parts` notes of every length it tries in a hidden list as wide as the real notes column
// (the same way the page's own fitStage does) and returns the longest length that fits, or TOP when even that fits.
function search({ selector, sentence, titles, slack, top, partsList }) {
  const root = document.querySelector(selector);
  const stage = root.querySelector('.td-stage');
  const notesBox = root.querySelector('.td-notes');
  const control = root.querySelector('.td-control');
  // Any project that has notes will do as a model: the page's own markup is copied, so the layout is the real one
  const tabs = Array.from(root.querySelectorAll('.td-tab'));
  for (const tab of tabs) {
    if (root.querySelector('.td-notes .td-note')) break;
    tab.click();
  }
  const model = root.querySelector('.td-notes .td-note');
  if (!model) throw new Error('No project in src/data/projects.json has any notes, so there is nothing to copy the layout from.');

  // The stage at its approved height, counting the slider's row whether or not the project showing has a slider
  const grownTo = stage.style.height;
  const wasHidden = control.hidden;
  stage.style.height = '';
  control.hidden = false;
  const approved = stage.offsetHeight;
  const chrome = approved - notesBox.offsetHeight;
  control.hidden = wasHidden;
  stage.style.height = grownTo;

  const probe = document.createElement('ol');
  probe.className = 'td-notes td-notes-measure';
  probe.style.width = `${notesBox.offsetWidth}px`;
  stage.append(probe);
  const fits = (parts, length) => {
    const text = sentence.repeat(Math.ceil(length / sentence.length)).slice(0, length);
    probe.replaceChildren(...Array.from({ length: parts }, (_, i) => {
      const note = model.cloneNode(true);
      note.removeAttribute('style');
      note.querySelector('.td-note-label').textContent = `Part ${String(i + 1).padStart(2, '0')}`;
      note.querySelector('h3').textContent = titles[i] || 'The layer';
      note.querySelector('p').textContent = text;
      return note;
    }));
    return chrome + probe.offsetHeight + slack * parts <= approved;
  };

  const longest = {};
  for (const parts of partsList) {
    if (!fits(parts, 0)) { longest[parts] = 0; continue; }
    if (fits(parts, top)) { longest[parts] = top; continue; }
    let low = 0; // fits
    let high = top; // does not fit
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (fits(parts, middle)) low = middle; else high = middle;
    }
    longest[parts] = low;
  }
  probe.remove();
  const fonts = Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
  return { longest, approved, chrome, columnWidth: notesBox.offsetWidth, fonts };
}

async function main() {
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    console.error('There is no build yet. Run "npm run build" first, then run this again.');
    process.exitCode = 1;
    return;
  }
  const site = await serveBuild(BUILD);
  let browser;
  try {
    browser = await launchBrowser();
    const results = {};
    for (const width of WIDTHS) {
      const page = await openPage(browser, site.url, { width });
      try {
        results[width] = await page.evaluate(search, { selector: '#work-teardown', sentence: SENTENCE, titles: TITLES, slack: SLACK, top: TOP, partsList: PARTS });
        if (page.errors.length) throw new Error(`The page reported errors:\n${page.errors.join('\n')}`);
      } finally {
        await page.context().close();
      }
    }

    const approved = results[WIDTHS[0]].approved;
    const cell = (n) => (n >= TOP ? `${TOP}+` : String(n)).padStart(6);
    console.log(`Longest note, in characters, that keeps the stage at its approved ${approved} px`);
    console.log('(every note in the project is this long; ordinary English words; each note is allowed 14 px of room as well)');
    console.log('');
    console.log(`${'parts'.padEnd(6)}${WIDTHS.map((w) => String(w).padStart(7)).join('')}`);
    for (const parts of PARTS) console.log(`${String(parts).padEnd(6)} ${WIDTHS.map((w) => cell(results[w].longest[parts])).join(' ')}`);
    console.log('');
    console.log(`Window widths across the top. Notes column ${WIDTHS.map((w) => `${results[w].columnWidth} px at ${w}`).join(', ')}.`);
    const loaded = results[WIDTHS[0]].fonts;
    if (!['DM Sans', 'Bricolage Grotesque'].every((f) => loaded.includes(f))) {
      console.log(`Warning: the page's fonts did not all load here (loaded: ${loaded.join(', ') || 'none'}), so these numbers are only approximate.`);
    }
    if (Object.values(results).some((r) => r.approved !== approved)) console.log('Warning: the approved stage height differs between the two widths.');
  } finally {
    if (browser) await browser.close();
    await site.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
