const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const script = path.join(__dirname, 'check-content.cjs');
let tmp;

// Fixture images point at real files in public/projects/, so the image check passes.
const project = (note) => ({
  id: 'a', title: 'A', summary: 'S', image: 'soundcloud.webp', imageAlt: 'Alt',
  layers: [{ kind: 'app', title: 'The app', note }],
});
const write = (name, text) => {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, text);
  return file;
};
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

before(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-content-'));
});

after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('a good file passes, with and without --launch', () => {
  const file = write('good.json', JSON.stringify({ projects: [project('Words.')] }));
  for (const args of [['--file', file], ['--launch', '--file', file]]) {
    const r = run(...args);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /Project content looks good\./);
  }
});

test('a stray comma gives a plain message', () => {
  const file = write('comma.json', '{ "projects": [ { "id": "a", }, ] }');
  const r = run('--file', file);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /isn't valid JSON/);
  assert.match(r.stderr, /comma/);
  assert.doesNotMatch(r.stderr, /\n\s+at /);
});

test('a file with problems lists them and fails', () => {
  const broken = project('Words.');
  delete broken.title;
  const file = write('broken.json', JSON.stringify({ projects: [broken] }));
  const r = run('--file', file);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /Project "a" is missing its title\./);
});

test('--launch refuses placeholders and names them', () => {
  const file = write('placeholder.json', JSON.stringify({ projects: [project('[placeholder] Your words here.')] }));
  const r = run('--launch', '--file', file);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /Still placeholder text:/);
  assert.ok(r.stderr.includes('A: The app'), r.stderr);
});

test('without --launch placeholders are allowed', () => {
  const file = write('placeholder-ok.json', JSON.stringify({ projects: [project('[placeholder] Your words here.')] }));
  const r = run('--file', file);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /Project content looks good\./);
});
