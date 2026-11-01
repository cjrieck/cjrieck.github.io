// Turns a project screenshot into a web-sized WebP in public/projects.
// Usage: npm run project-image -- <path-to-image> [name]
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const [input, name] = process.argv.slice(2);
  if (!input) throw new Error('Usage: npm run project-image -- <path-to-image> [name]');
  const outDir = path.join(__dirname, '..', 'public', 'projects');
  const out = path.join(outDir, `${name || path.parse(input).name}.webp`);
  fs.mkdirSync(outDir, { recursive: true });
  const info = await sharp(input)
    .resize(700, 700, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 100 })
    .toFile(out);
  console.log(path.relative(process.cwd(), out), info.width, 'x', info.height, Math.round(info.size / 1024), 'KB');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
