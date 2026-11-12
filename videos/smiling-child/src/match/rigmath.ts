// Pure math for the 2D character rig (no React) — shared by rendering, ball
// choreography and the sound-event export.

export type Pose = {
  x: number; // waist position in world px
  y: number;
  rot: number; // body rotation, degrees, clockwise
  facing: 1 | -1;
  scale: number;
  hipL: number; kneeL: number; hipR: number; kneeR: number; // 0 = straight down, + = forward
  shL: number; elL: number; shR: number; elR: number;
  mouth: number; // 0 closed smile … 1 wide open laugh
  headTilt: number;
};

export const D = {
  HIPX: 18, HIPY: 18, THIGH: 88, SHIN: 86, FOOT: 10,
  SHX: 40, SHY: -138, UPPER: 66, FORE: 60,
  HEADY: -200, HEADR: 56,
};
export const STAND = D.HIPY + D.THIGH + D.SHIN + D.FOOT; // waist height above ground (202)

export type P = { x: number; y: number };
const r = Math.PI / 180;
export const dir = (a: number): P => ({ x: Math.sin(a * r), y: Math.cos(a * r) });
const add = (a: P, b: P, k = 1): P => ({ x: a.x + b.x * k, y: a.y + b.y * k });

// Local-space joints (waist at origin, +x = the way the kid faces).
export const joints = (p: Pose) => {
  const hipL = { x: -D.HIPX * 0.4, y: D.HIPY };
  const hipR = { x: D.HIPX * 0.4, y: D.HIPY };
  const kneeL = add(hipL, dir(p.hipL), D.THIGH);
  const kneeR = add(hipR, dir(p.hipR), D.THIGH);
  const footL = add(kneeL, dir(p.hipL + p.kneeL), D.SHIN + D.FOOT);
  const footR = add(kneeR, dir(p.hipR + p.kneeR), D.SHIN + D.FOOT);
  const shL = { x: -D.SHX * 0.35, y: D.SHY };
  const shR = { x: D.SHX * 0.35, y: D.SHY };
  const elbL = add(shL, dir(p.shL), D.UPPER);
  const elbR = add(shR, dir(p.shR), D.UPPER);
  const handL = add(elbL, dir(p.shL + p.elL), D.FORE);
  const handR = add(elbR, dir(p.shR + p.elR), D.FORE);
  const head = { x: 0, y: D.HEADY };
  return { hipL, hipR, kneeL, kneeR, footL, footR, shL, shR, elbL, elbR, handL, handR, head };
};

export const toWorld = (p: Pose, q: P): P => {
  const sx = p.facing * q.x * p.scale;
  const sy = q.y * p.scale;
  const c = Math.cos(p.rot * r);
  const s = Math.sin(p.rot * r);
  return { x: p.x + sx * c - sy * s, y: p.y + sx * s + sy * c };
};

export type Part = "footL" | "footR" | "kneeL" | "kneeR" | "head" | "headTop" | "chest";
export const partWorld = (p: Pose, part: Part): P => {
  const j = joints(p);
  switch (part) {
    case "headTop": return toWorld(p, { x: 0, y: D.HEADY - D.HEADR });
    case "chest": return toWorld(p, { x: 34, y: -95 });
    case "head": return toWorld(p, j.head);
    default: return toWorld(p, j[part]);
  }
};

export const NEUTRAL: Omit<Pose, "x" | "y" | "facing"> = {
  rot: 0, scale: 1,
  hipL: -4, kneeL: 0, hipR: 4, kneeR: 0,
  shL: -12, elL: 8, shR: 12, elR: 8,
  mouth: 0.35, headTilt: 0,
};

export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
