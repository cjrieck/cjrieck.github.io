// Shared by the teardown browser checks (teardown.test.cjs and long-notes.test.cjs).
// This file is not a test: the verify glob only picks up *.test.cjs.

const ROOT = '#work-teardown';
// The live notes and connector lines, not the fading copies a project switch leaves behind for 150 ms
const NOTES = `${ROOT} .td-notes:not(.td-notes-out):not(.td-notes-measure)`;
const LEADERS = `${ROOT} svg.td-leaders`;
const SLIDER = `${ROOT} input[type=range]`;
const TABS = `${ROOT} .td-tab`;

// The stage is taller than the nav, so centring it keeps the tabs and the slider both on screen at desktop widths.
// The page scrolls smoothly by default, so this asks for an instant jump.
async function showTeardown(page) {
  await page.evaluate((selector) => {
    document.querySelector(selector).scrollIntoView({ block: 'center', behavior: 'instant' });
  }, ROOT);
}

// Resolves with the number of milliseconds it took for the teardown to stop changing: nothing inside it
// (a style, a class, an attribute, a node) changed for `quiet` ms. Call it right after the action that starts the motion.
// Rejects if it is still changing after `timeout` ms.
function whenSettled(page, { quiet = 250, timeout = 8000 } = {}) {
  return page.evaluate(({ selector, quiet, timeout }) => new Promise((resolve, reject) => {
    const started = performance.now();
    let timer = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(done, quiet);
    });
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(limit);
      resolve(performance.now() - started - quiet);
    };
    const limit = setTimeout(() => {
      observer.disconnect();
      clearTimeout(timer);
      reject(new Error(`The teardown was still changing after ${timeout} ms`));
    }, timeout);
    observer.observe(document.querySelector(selector), { attributes: true, childList: true, subtree: true, characterData: true });
    timer = setTimeout(done, quiet);
  }), { selector: ROOT, quiet, timeout });
}

// Clicks a project tab the way a visitor would (Playwright scrolls it into view) and waits for the motion to finish
async function pickTab(page, index) {
  await page.locator(TABS).nth(index).click();
  await whenSettled(page);
}

// The slider's two end captions are real buttons: 'parts' takes the project apart, 'product' puts it back together
async function setView(page, view) {
  await page.locator(`${ROOT} .td-end[data-to="${view === 'parts' ? 1 : 0}"]`).click();
  await whenSettled(page);
}

// Lets `count` animation frames go by
function frames(page, count = 2) {
  return page.evaluate((n) => new Promise((resolve) => {
    const step = (left) => (left ? requestAnimationFrame(() => step(left - 1)) : resolve());
    step(n);
  }), count);
}

// Clicks a project tab and lets two frames go by, without waiting for the motion to end.
// For checks of layout, which the motion does not change.
async function quickTab(page, index) {
  await page.locator(TABS).nth(index).click();
  await frames(page);
}

// Clicks through every project in the product view and then in the parts view without waiting for any motion,
// and reports the stage's height straight after each click and on every animation frame in between.
async function stageHeightsAcrossTabs(page) {
  const result = await page.evaluate(async (selector) => {
    const root = document.querySelector(selector);
    const stage = root.querySelector('.td-stage');
    const everyFrame = new Set();
    let running = true;
    const watch = () => {
      if (!running) return;
      everyFrame.add(stage.offsetHeight);
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    const twoFrames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const afterClick = {};
    for (const view of ['product', 'parts']) {
      for (const tab of Array.from(root.querySelectorAll('.td-tab'))) {
        tab.click();
        const control = root.querySelector('.td-control');
        if (!control.hidden) root.querySelector(`.td-end[data-to="${view === 'parts' ? 1 : 0}"]`).click();
        afterClick[`${tab.textContent} (${view})`] = stage.offsetHeight;
        await twoFrames();
      }
    }
    running = false;
    return { afterClick, everyFrame: Array.from(everyFrame), tabs: root.querySelectorAll('.td-tab').length };
  }, ROOT);
  return result;
}

module.exports = { ROOT, NOTES, LEADERS, SLIDER, TABS, showTeardown, whenSettled, pickTab, quickTab, frames, setView, stageHeightsAcrossTabs };
