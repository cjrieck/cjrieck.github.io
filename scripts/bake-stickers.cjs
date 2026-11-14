// Renders each die-cut sticker ahead of time (white border, ink outline, hard shadow) as a WebP in public/stickers.
// No browser ever has to draw them. Run it with `npm run bake`.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const INK = { r: 27, g: 22, b: 38 };
const WHITE = { r: 255, g: 255, b: 255 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const STEPS = 48;

// css is the largest size the sticker is shown at; border widths are designed in CSS pixels at that size
const logos = path.join(root, 'src', 'img', 'expertise', 'technology-logos');
const stickers = [
  { from: path.join(root, 'src', 'img', 'personal-photo.png'), out: 'personal-photo', css: 460, size: 1000 },
  ...['swift', 'swiftui', 'react-native', 'typescript', 'python', 'misc'].map((name) => (
    { from: path.join(logos, `${name}.png`), out: name, css: 112, size: 224 }
  )),
];

// The sticker shape comes from the photo's alpha channel, so a photo with its background still in it makes a square.
async function assertTransparent(file) {
  const { isOpaque } = await sharp(file).stats();
  if (isOpaque) throw new Error(`${file} has no transparency. Cut out the background and save it as a PNG.`);
}

async function silhouette(alpha, art, color) {
  return sharp({ create: { width: art, height: art, channels: 3, background: color } })
    .joinChannel(alpha, { raw: { width: art, height: art, channels: 1 } })
    .png().toBuffer();
}

async function bakeSticker({ from, out, css, size }, outDir) {
  const u = size / css, border = 6 * u, outline = 1.5 * u, shadow = Math.round(6 * u);
  const inset = Math.ceil(border + outline), art = size - inset * 2 - shadow;
  const resized = await sharp(from).resize(art, art, { fit: 'contain', background: CLEAR }).ensureAlpha().png().toBuffer();
  const alpha = await sharp(resized).extractChannel('alpha').raw().toBuffer();
  const ink = await silhouette(alpha, art, INK);
  const white = await silhouette(alpha, art, WHITE);
  const ring = (input, r, dx, dy) => Array.from({ length: STEPS }, (_, i) => {
    const a = i / STEPS * Math.PI * 2;
    return { input, left: Math.round(inset + dx + Math.cos(a) * r), top: Math.round(inset + dy + Math.sin(a) * r) };
  });
  const info = await sharp({ create: { width: size, height: size, channels: 4, background: CLEAR } })
    .composite([
      ...ring(ink, border + outline, shadow, shadow),
      ...ring(ink, border + outline, 0, 0),
      ...ring(white, border, 0, 0),
      { input: white, left: inset, top: inset },
      { input: resized, left: inset, top: inset },
    ])
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(path.join(outDir, `${out}.webp`));
  console.log(`${out}.webp`, size, 'px', Math.round(info.size / 1024), 'KB');
}

async function main() {
  for (const s of stickers) await assertTransparent(s.from);
  const outDir = path.join(root, 'public', 'stickers');
  fs.mkdirSync(outDir, { recursive: true });
  for (const s of stickers) await bakeSticker(s, outDir);
}

module.exports = { assertTransparent, bakeSticker };

if (require.main === module) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
