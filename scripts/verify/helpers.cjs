const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const playwright = require('playwright');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
};

// Serves a finished build over http on a free port. Resolves to { url, close }; `url` has no trailing slash.
function serveBuild(dir = 'build') {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (err, body) => {
      if (err) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((done) => {
          server.closeAllConnections();
          server.close(() => done());
        }),
      });
    });
  });
}

// The browser engine comes from BROWSER (chromium, firefox or webkit) and defaults to chromium.
function launchBrowser() {
  const name = process.env.BROWSER || 'chromium';
  if (!playwright[name] || typeof playwright[name].launch !== 'function') {
    throw new Error(`Unknown BROWSER "${name}", expected chromium, firefox or webkit`);
  }
  return playwright[name].launch();
}

// Opens `url` in a fresh context. `device` names a Playwright device (for example 'iPhone 13');
// its screen size applies unless width or height is passed. Every page error and console error
// lands in `page.errors`. Close the page's context (page.context().close()) when done.
async function openPage(browser, url, { width, height, reducedMotion, device } = {}) {
  const descriptor = device ? playwright.devices[device] : {};
  if (device && !descriptor) throw new Error(`Unknown device "${device}"`);
  const viewport = device && !width && !height
    ? descriptor.viewport
    : { width: width ?? (device ? descriptor.viewport.width : 1176), height: height ?? (device ? descriptor.viewport.height : 900) };
  const context = await browser.newContext({ ...descriptor, viewport, reducedMotion });
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (error) => page.errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') page.errors.push(message.text());
  });
  await page.goto(url);
  await page.waitForSelector('main');
  // Web fonts change the page's height as they arrive, so measure only once they have settled.
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await document.fonts.ready;
  });
  return page;
}

module.exports = { serveBuild, launchBrowser, openPage };
