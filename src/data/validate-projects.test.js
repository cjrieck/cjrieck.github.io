const fs = require('fs');
const path = require('path');
const { validateProjects, findPlaceholderNotes } = require('./validate-projects.cjs');

const good = () => ({ projects: [{ id: 'a', title: 'A', summary: 'S', image: 'a.webp', imageAlt: 'Alt',
  layers: [{ kind: 'app', title: 'The app', note: 'Words.' }] }] });
const ok = () => true;

test('a good file has no problems', () => expect(validateProjects(good(), ok)).toEqual([]));

test('layers may be empty or missing', () => {
  const d = good(); d.projects[0].layers = [];
  expect(validateProjects(d, ok)).toEqual([]);
  delete d.projects[0].layers;
  expect(validateProjects(d, ok)).toEqual([]);
});

test.each([
  ['a missing title', (d) => delete d.projects[0].title, /"a".*title/],
  ['a missing id', (d) => delete d.projects[0].id, /id/],
  ['a layer with no note', (d) => delete d.projects[0].layers[0].note, /"a".*note/],
  ['a layer with no kind', (d) => delete d.projects[0].layers[0].kind, /"a".*kind/],
  ['layers that is not a list', (d) => { d.projects[0].layers = 'app'; }, /"a".*layers/],
  ['a duplicate id', (d) => d.projects.push({ ...d.projects[0] }), /"a".*more than once/],
])('flags %s', (_name, breakIt, message) => {
  const d = good(); breakIt(d);
  expect(validateProjects(d, ok).join('\n')).toMatch(message);
});

test('flags an image file that does not exist', () => {
  expect(validateProjects(good(), () => false).join('\n')).toMatch(/a\.webp/);
});

test('flags a missing summary, a layer with no title, and a missing projects list', () => {
  const d = good(); delete d.projects[0].summary; delete d.projects[0].layers[0].title;
  const text = validateProjects(d, ok).join('\n');
  expect(text).toMatch(/"a".*summary/);
  expect(text).toMatch(/"a".*layer 1.*title/);
  expect(validateProjects({}, ok).join('\n')).toMatch(/projects/);
});

test('a project with no image or no image description is fine', () => {
  const d = good(); delete d.projects[0].image; delete d.projects[0].imageAlt;
  expect(validateProjects(d, () => false)).toEqual([]);
});

test('messages are plain words, with no stack trace or path syntax', () => {
  const d = good(); delete d.projects[0].title; d.projects[0].layers = 'app';
  const text = validateProjects(d, ok).join('\n');
  expect(text).not.toMatch(/\bat \w+.*:\d+|\[\d+\]|\$\./);
});

test('lists every placeholder note by project and part', () => {
  const d = good(); d.projects[0].layers[0].note = '[placeholder] Your words here.';
  expect(findPlaceholderNotes(d)).toEqual(['A: The app']);
});

test('finds the marker anywhere in a note, and ignores finished notes', () => {
  const d = good();
  d.projects[0].layers.push({ kind: 'services', title: 'The services', note: 'Half done [placeholder] still' });
  expect(findPlaceholderNotes(d)).toEqual(['A: The services']);
});

test('the real projects.json is valid', () => {
  const real = require('./projects.json');
  const exists = (f) => fs.existsSync(path.join(process.cwd(), 'public/projects', f));
  expect(validateProjects(real, exists)).toEqual([]);
});
