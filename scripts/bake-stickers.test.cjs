const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const { assertTransparent, bakeSticker } = require('./bake-stickers.cjs');

let tmp, opaquePath, transparentPath, widePath;

// RGBA pixels from a function (x, y) => [r, g, b, a]
function raw(width, height, pixel) {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data.set(pixel(x, y), (y * width + x) * 4);
  }
  return sharp(data, { raw: { width, height, channels: 4 } });
}

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bake-stickers-'));
  opaquePath = path.join(tmp, 'opaque.png');
  transparentPath = path.join(tmp, 'transparent.png');
  widePath = path.join(tmp, 'wide-source.png');

  await sharp({ create: { width: 50, height: 50, channels: 3, background: { r: 200, g: 50, b: 50 } } })
    .png().toFile(opaquePath);
  await raw(50, 50, (x, y) => [200, 50, 50, y === 0 ? 0 : 255]).png().toFile(transparentPath);
  await raw(200, 100, (x, y) => [x < 10 ? 255 : 0, 0, x < 10 ? 0 : 255, y === 0 ? 0 : 255])
    .png().toFile(widePath);
});

after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('an opaque photo is refused with a plain message', async () => {
  await assert.rejects(assertTransparent(opaquePath), /no transparency/);
});

test('a photo with transparency is accepted', async () => {
  await assertTransparent(transparentPath);
});

test('a sticker comes out square at the requested size', async () => {
  await bakeSticker({ from: transparentPath, out: 'x', css: 112, size: 224 }, tmp);
  const meta = await sharp(path.join(tmp, 'x.webp')).metadata();
  assert.deepEqual([meta.width, meta.height, meta.format], [224, 224, 'webp']);
});

test('a non-square photo is fitted, not cropped', async () => {
  await bakeSticker({ from: widePath, out: 'wide', css: 112, size: 224 }, tmp);
  const { data, info } = await sharp(path.join(tmp, 'wide.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => (y * info.width + x) * 4;
  const i = at(18, Math.floor(info.height / 2)); // inset is 15 px at this size
  assert.ok(data[i] > 180 && data[i + 1] < 90, 'left edge of the source survives');
});
