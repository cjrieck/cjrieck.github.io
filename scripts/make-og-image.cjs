// Renders the top of the built page into public/og-image.png, the link preview image (1200x630).
// Run `npm run og`, which builds first.
const path = require('node:path');
const { serveBuild, launchBrowser, openPage } = require('./verify/helpers.cjs');

const OUT = path.join(__dirname, '..', 'public', 'og-image.png');
// The nav bar stays out of the picture and the hero fills the frame exactly
const FRAME_CSS = '.navwrap { display: none } .hero { padding: 32px 0; min-height: 630px }';

async function main() {
  const site = await serveBuild();
  const browser = await launchBrowser();
  try {
    const page = await openPage(browser, site.url, { width: 1200, height: 630 });
    await page.addStyleTag({ content: FRAME_CSS });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((img) => (img.complete ? null : new Promise((done) => {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }))));
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    });
    await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    await page.context().close();
    console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
  } finally {
    await browser.close();
    await site.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
