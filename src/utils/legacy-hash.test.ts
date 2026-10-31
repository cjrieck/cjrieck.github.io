import { applyLegacyHash, resolveLegacyHash, scrollToCurrentHash } from './legacy-hash';

test.each([
  ['#/expertise', '#process'],
  ['#/projects', '#work'],
  ['#/apps/potpourri/privacy', '#top'],
  ['#/nope', '#top'],
  ['#/', '#top'],
])('%s goes to %s', (from, to) => expect(resolveLegacyHash(from)).toBe(to));

test.each(['', '#', '#work', '#process', '#top', '#nope'])('%s is left alone', (hash) =>
  expect(resolveLegacyHash(hash)).toBeNull());

test('applyLegacyHash rewrites the URL without adding history', () => {
  window.location.hash = '#/projects';
  const before = window.history.length;
  applyLegacyHash();
  expect(window.location.hash).toBe('#work');
  expect(window.history.length).toBe(before);
});

test('scrollToCurrentHash scrolls to the matching section', () => {
  const section = document.createElement('section');
  section.id = 'work';
  section.scrollIntoView = jest.fn();
  document.body.append(section);
  window.location.hash = '#work';
  scrollToCurrentHash();
  expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  section.remove();
});

test('scrollToCurrentHash ignores a hash with no matching element', () => {
  window.location.hash = '#nope';
  expect(() => scrollToCurrentHash()).not.toThrow();
});
