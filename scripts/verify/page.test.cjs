const { test, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { serveBuild, launchBrowser, openPage } = require('./helpers.cjs');

let site;
let browser;
const opened = [];

before(async () => {
  site = await serveBuild();
  browser = await launchBrowser();
});

after(async () => {
  try {
    await browser?.close();
  } finally {
    await site?.close();
  }
});

afterEach(async () => {
  for (const page of opened.splice(0)) await page.context().close();
});

async function open(url, options) {
  const page = await openPage(browser, url, options);
  opened.push(page);
  return page;
}

const WIDTHS = [360, 390, 768, 1024, 1176, 1440];

for (const width of WIDTHS) {
  test(`no sideways scrolling at ${width}`, async () => {
    const page = await open(site.url, { width });
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    assert.ok(sw <= iw);
    assert.deepEqual(page.errors, []);
  });

  test(`section links land below the nav at ${width}`, async () => {
    const page = await open(site.url, { width });
    for (const id of ['philosophy', 'process', 'skills', 'work']) {
      await page.click(`nav a[href="#${id}"]`);
      await page.waitForFunction((i) => Math.abs(document.getElementById(i).getBoundingClientRect().top) < 200, id);
      await page.waitForTimeout(700);
      const { heading, nav } = await page.evaluate((i) => ({
        heading: document.querySelector(`#${i} h2`).getBoundingClientRect().top,
        nav: document.querySelector('nav').getBoundingClientRect().bottom,
      }), id);
      assert.ok(heading >= nav, `${id}: heading at ${heading}, nav ends at ${nav}`);
    }
  });
}

// Resolves once the page has loaded, its fonts are in and the scroll position has held still for
// 400 ms. Gives up after 6 s so a page that never settles still reports its numbers.
function settle(page) {
  return page.evaluate(() => new Promise((resolve) => {
    const start = performance.now();
    let last = window.scrollY;
    let since = start;
    const tick = () => {
      const now = performance.now();
      if (window.scrollY !== last) {
        last = window.scrollY;
        since = now;
      }
      const loaded = document.readyState === 'complete' && document.fonts.status === 'loaded';
      if ((loaded && now - since > 400) || now - start > 6000) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  }));
}

const ARRIVALS = [
  ['/#/projects', '#work', 'work'],
  ['/#/projects/', '#work', 'work'],
  ['/#/expertise', '#process', 'process'],
  ['/#/expertise/', '#process', 'process'],
  ['/#work', '#work', 'work'],
  ['/#philosophy', '#philosophy', 'philosophy'],
  ['/#process', '#process', 'process'],
  ['/#skills', '#skills', 'skills'],
  ['/#clients', '#clients', 'clients'],
  ['/#contact', '#contact', 'contact'],
  ['/#/apps/potpourri/privacy', '#top', 'top'],
  ['/#/nope', '#top', 'top'],
  ['/#/', '#top', 'top'],
];

for (const [path, hash, id] of ARRIVALS) {
  for (const width of [390, 1176]) {
    test(`arriving at ${path} at ${width} lands on #${id}`, async () => {
      const page = await open(site.url + path, { width });
      await settle(page);
      const m = await page.evaluate((i) => {
        const section = document.getElementById(i).getBoundingClientRect();
        const heading = document.querySelector(`#${i} h2`);
        return {
          hash: window.location.hash,
          scrollY: Math.round(window.scrollY),
          viewport: window.innerHeight,
          top: Math.round(section.top),
          bottom: Math.round(section.bottom),
          heading: heading ? Math.round(heading.getBoundingClientRect().top) : null,
          nav: Math.round(document.querySelector('nav').getBoundingClientRect().bottom),
          kids: document.querySelector('main').children.length,
        };
      }, id);
      const numbers = `scrollY ${m.scrollY}, #${id} top ${m.top} bottom ${m.bottom}, heading top ${m.heading}, nav bottom ${m.nav}, viewport ${m.viewport}`;
      assert.equal(m.hash, hash, `the hash is ${hash}: ${numbers}`);
      assert.ok(m.kids > 0, 'the page is not blank');
      if (id === 'top') {
        // #top is the hero, which starts below the nav's 12 px margin, so the page rests at 0 or 12.
        assert.ok(m.scrollY <= 12 && m.top >= -1 && m.top <= 12, `the page is at the top: ${numbers}`);
        return;
      }
      assert.ok(m.top < m.viewport && m.bottom > 0, `the section is in view: ${numbers}`);
      if (m.heading !== null) assert.ok(m.heading >= m.nav, `the heading is below the nav: ${numbers}`);
    });
  }
}
