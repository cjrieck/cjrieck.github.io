export const STICKERS_ON_TOUCH: boolean = true;
export const LIFT = 1.12, TILT = 16, HOLD = 400, TOUCH_DELAY = 70, HOME = 70;

export type Box = { left: number; top: number; width: number; height: number };

export function canPeel(pointerType: string, onTouch: boolean): boolean {
  return pointerType === 'mouse' || onTouch;
}

export function isNearHome(x: number, y: number, home: Box): boolean {
  return Math.hypot(x - (home.left + home.width / 2), y - (home.top + home.height / 2)) < HOME;
}

export function placementPercent(
  x: number,
  y: number,
  host: { left: number; top: number; clientLeft: number; clientTop: number; clientWidth: number; clientHeight: number },
): { left: number; top: number } {
  return {
    left: (x - host.left - host.clientLeft) / host.clientWidth * 100,
    top: (y - host.top - host.clientTop) / host.clientHeight * 100,
  };
}

export function surfaceIndexAt(y: number, surfaces: { top: number; bottom: number }[]): number {
  const i = surfaces.findIndex((s) => y >= s.top && y < s.bottom);
  return i < 0 ? surfaces.length - 1 : i;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function aimPoint(px: number, py: number, ox: number, oy: number, floatUp: number, w: number, h: number, vw: number, vh: number): [number, number] {
  const mx = w * .35, my = h * .35;
  return [clamp(px - ox, mx, vw - mx), clamp(py - oy - floatUp * 30, my, vh - my)];
}

export function edgeScrollAmount(py: number, vh: number, dt: number): number {
  const edge = Math.min(96, vh * .16);
  const over = py < edge ? py - edge : py > vh - edge ? py - vh + edge : 0;
  if (!over) return 0;
  const f = over / edge;
  return Math.sign(f) * f * f * 900 * dt;
}
