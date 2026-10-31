import type { Layer, Project } from '../../data/projects';

// The approved numbers. Positions run from 0 (the product) to 1 (the parts).
export const SNAP_AT = 0.5;
export const NOTES_FROM = 0.28;
export const REVEAL = 0.7;
export const TOSS = 0.42;
export const TOSS_STAGGER = 0.045;
// The springs lose 45 (or 40) of stiffness per plate; past the sixth plate that would reach zero and turn negative, so they stop here
export const STIFFNESS_FLOOR = 35;

// Letting go at or past halfway sends the control to the parts
export const snapsToParts = (fraction: number): boolean => fraction >= SNAP_AT;

// The loose springs, one per plate: the lower the plate, the later it follows
export const plateStiffness = (i: number): number => Math.max(STIFFNESS_FLOOR, 260 - i * 45);
// The springs that settle a plate into place when its project arrives
export const arrivalStiffness = (i: number): number => Math.max(STIFFNESS_FLOOR, 300 - i * 40);

// How far apart the plates sit when fully taken apart: as much as 120, less when there are many
export const plateSpread = (plateCount: number): number => (plateCount > 1 ? Math.min(120, 258 / (plateCount - 1)) : 0);

export type PartRow = { layer: Layer; plate: number; label: string };

// The top plate is always the project's card. An `interface` layer only labels it and adds no plate;
// every other layer is a plate underneath. Notes are numbered in order, so an omitted layer closes up the numbering.
export function splitLayers(project: Project, partWord: string): { under: Layer[]; rows: PartRow[] } {
  const layers = Array.isArray(project.layers) ? project.layers : [];
  const face = layers.find((l) => l.kind === 'interface');
  const under = layers.filter((l) => l.kind !== 'interface');
  const listed = [...(face ? [{ layer: face, plate: 0 }] : []), ...under.map((layer, i) => ({ layer, plate: i + 1 }))];
  const rows = listed.map(({ layer, plate }, i) => ({ layer, plate, label: `${partWord} ${String(i + 1).padStart(2, '0')}` }));
  return { under, rows };
}
