import type { Layer, Project } from '../../data/projects';
import { arrivalStiffness, noteSlot, plateSpread, plateStiffness, snapsToParts, splitLayers } from './teardown-logic';

const project = (layers: Layer[]): Project => ({ id: 'x', title: 'X', summary: 'S', layers });

test('a release at 50% or more goes to the parts', () => {
  expect(snapsToParts(0.5)).toBe(true);
  expect(snapsToParts(0.49)).toBe(false);
});
test('stiffness is unchanged up to six plates', () => {
  expect([0, 1, 2, 3, 4, 5].map(plateStiffness)).toEqual([260, 215, 170, 125, 80, 35]);
  expect([0, 1, 2, 3, 4, 5].map(arrivalStiffness)).toEqual([300, 260, 220, 180, 140, 100]);
});
test('stiffness never drops below the floor', () => {
  expect(plateStiffness(6)).toBe(35);
  expect(plateStiffness(20)).toBe(35);
  expect(arrivalStiffness(8)).toBe(35);
});
test('notes keep their approved stagger up to five notes', () => {
  for (let count = 1; count <= 5; count++) expect(Array.from({ length: count }, (_v, i) => noteSlot(i, count))).toEqual(Array.from({ length: count }, (_v, i) => i));
});
test('with more notes the stagger closes up so the last one still finishes', () => {
  for (const count of [6, 7, 8, 12]) {
    const slots = Array.from({ length: count }, (_v, i) => noteSlot(i, count));
    expect(slots[0]).toBe(0);
    expect(slots[count - 1]).toBe(4);
    expect(slots.slice(1).every((slot, i) => slot > slots[i])).toBe(true);
  }
});
test('plates spread by the approved formula', () => {
  expect(plateSpread(1)).toBe(0);
  expect(plateSpread(2)).toBe(120);
  expect(plateSpread(4)).toBe(86);
});
test('an omitted layer closes up the numbering', () => {
  const { rows } = splitLayers(project([{ kind: 'app', title: 'A' }, { kind: 'services', title: 'S' }]), 'Part');
  expect(rows.map((r) => [r.label, r.plate])).toEqual([['Part 01', 1], ['Part 02', 2]]);
});
test('interface labels the top plate and adds no plate of its own', () => {
  const { under, rows } = splitLayers(project([{ kind: 'interface', title: 'I' }, { kind: 'app', title: 'A' }]), 'Part');
  expect(under.map((l) => l.kind)).toEqual(['app']);
  expect(rows.map((r) => [r.label, r.plate])).toEqual([['Part 01', 0], ['Part 02', 1]]);
});
test('missing layers means no parts', () => {
  expect(splitLayers({ id: 'x', title: 'X', summary: 'S' }, 'Part')).toEqual({ under: [], rows: [] });
});
