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
  await browser.close();
  await site.close();
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

const ARRIVALS = [
  ['/#/projects', '#work', 'work'],
  ['/#/expertise', '#process', 'process'],
  ['/#work', '#work', 'work'],
  ['/#/apps/potpourri/privacy', '#top', 'top'],
];

for (const [path, hash, id] of ARRIVALS) {
  for (const width of [390, 1176]) {
    test(`arriving at ${path} at ${width} lands on #${id}`, async () => {
      const page = await open(site.url + path, { width });
      await page.waitForTimeout(1000); // fonts loaded
      assert.equal(await page.evaluate(() => window.location.hash), hash);
      const { top, bottom, kids } = await page.evaluate((i) => {
        const r = document.getElementById(i).getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, kids: document.querySelector('main').children.length };
      }, id);
      assert.ok(top < 900 && bottom > 0, 'the section is in view');
      assert.ok(kids > 0, 'the page is not blank');
    });
  }
}
