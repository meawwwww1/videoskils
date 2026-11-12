// The whole film's choreography as data + pure functions of the frame.
import { clamp01, ease, lerp, NEUTRAL, P, Part, partWorld, Pose, STAND } from "./rigmath";

export const FPS = 30;
export const DURATION = 1290; // 43 s
export const G = 880; // ground line
export const BALL_R = 20;
export const GOAL = { x0: 1700, x1: 1880, top: G - 250 };

export type Who = "H" | "A" | "B" | "C" | "E";
export const CAST: Who[] = ["A", "B", "C", "E", "H"]; // draw order (hero on top)

// ---------------------------------------------------------------- tracks
type Key = { f: number; p: Partial<Pose> };
type Layer = { kind: "run" | "clap" | "cheer" | "laugh" | "balance"; f0: number; f1: number };
type Track = { base: Pose; keys: Key[]; layers: Layer[] };

const standY = (s: number) => G - STAND * s;
const make = (x: number, facing: 1 | -1, scale: number): Track => ({
  base: { ...NEUTRAL, x, y: standY(scale), facing, scale },
  keys: [],
  layers: [],
});

const T: Record<Who, Track> = {
  H: make(960, 1, 1),
  A: make(330, 1, 0.92),
  B: make(560, 1, 0.92),
  C: make(1420, -1, 0.92),
  E: make(1620, -1, 0.92),
};
const k = (w: Who, f: number, p: Partial<Pose>) => T[w].keys.push({ f, p });
const layer = (w: Who, kind: Layer["kind"], f0: number, f1: number) => T[w].layers.push({ kind, f0, f1 });

const LEG0 = { hipR: 4, kneeR: 0, hipL: -4, kneeL: 0 };
const KICK = { hipR: 55, kneeR: -50 }; // juggling touch with the right foot
const KNEE = { hipR: 85, kneeR: -95 };
const HY = standY(1);

// A touch = neutral → pose → neutral, around frame f.
const touch = (w: Who, f: number, pose: Partial<Pose>, pre = 9, post = 9) => {
  const back: Partial<Pose> = {};
  for (const key of Object.keys(pose) as (keyof Pose)[]) {
    if (key in LEG0) (back as any)[key] = (LEG0 as any)[key];
    else if (key === "rot") back.rot = 0;
    else if (key === "y") back.y = T[w].base.y;
  }
  k(w, f - pre, back);
  k(w, f, pose);
  k(w, f + post, back);
};

// ---- Scene 1: neighborhood juggling (0–330)
const FOOT_TOUCHES = [22, 44, 66, 88, 110, 132];
const KNEE_TOUCHES = [158, 184];
const HEAD_TOUCHES = [214, 244, 272];
layer("H", "balance", 10, 320);
k("H", 6, { hipR: 4 });
k("H", 12, { hipR: 22, kneeR: -10 }); // toe flick from the ground
FOOT_TOUCHES.forEach((f) => touch("H", f, KICK));
KNEE_TOUCHES.forEach((f) => touch("H", f, KNEE, 10, 10));
HEAD_TOUCHES.forEach((f) => {
  k("H", f - 9, { y: HY + 14, hipL: -12, kneeL: 22, hipR: 12, kneeR: -22, headTilt: 0 });
  k("H", f, { y: HY - 8, hipL: -4, kneeL: 0, hipR: 4, kneeR: 0, headTilt: -8 });
  k("H", f + 8, { y: HY, headTilt: 0 });
});
touch("H", 298, KICK);
k("H", 312, { ...LEG0, rot: 0 });
k("H", 322, { hipR: 78, kneeR: -8, rot: -10, shL: -60, shR: 40 }); // volley pass
k("H", 334, { ...LEG0, rot: 0, shL: -12, shR: 12 });

// friends watch, then clap / cheer
layer("A", "clap", 96, 300);
layer("C", "clap", 110, 300);
layer("B", "clap", 160, 300);
layer("E", "cheer", 214, 290);

// ---- Scene 2: street game (330–570)
k("C", 340, { rot: 0 });
k("C", 352, { rot: 12, shL: -45, shR: 45 }); // chest trap
k("C", 362, { rot: 0, shL: -12, shR: 12 });
touch("C", 372, { hipR: 72, kneeR: -28, rot: -8 }, 8, 10); // lob
k("B", 404, { y: standY(0.92) });
k("B", 412, { y: standY(0.92) + 16, kneeL: 25, kneeR: -25 });
k("B", 420, { y: standY(0.92) - 60, kneeL: 0, kneeR: 0, headTilt: 10, shL: -60, shR: 60 }); // header
k("B", 432, { y: standY(0.92), headTilt: 0, shL: -12, shR: 12 });
touch("A", 444, { hipR: 30, kneeR: -22 }, 8, 6); // control
touch("A", 458, { hipR: 50, kneeR: -15 }, 8, 10); // ground pass
k("H", 436, { facing: 1 });
k("H", 440, { facing: -1 }); // turns toward A
touch("H", 500, { hipR: 26, kneeR: -26 }, 8, 6); // stop the ball
touch("H", 516, { hipR: -48, kneeR: -55, rot: 6 }, 8, 10); // back-heel pass
touch("E", 556, { hipR: 26, kneeR: -24 }, 8, 6);
touch("E", 570, { hipR: 66, kneeR: -36, rot: -8 }, 8, 12); // big lob

// ---- Scene 3: transformation while the ball hangs (570–645)
k("H", 586, { facing: -1 });
k("H", 590, { facing: 1 }); // turns to face the ball
layer("A", "cheer", 600, 640);
layer("C", "cheer", 606, 640);

// ---- Scene 4: trick + bicycle kick (645–960)
k("H", 636, { rot: 0, shL: -12, shR: 12 });
k("H", 645, { rot: -14, shL: -55, shR: 55 }); // chest
k("H", 656, { rot: 0, shL: -30, shR: 30 });
touch("H", 668, KICK);
touch("H", 690, KICK);
touch("H", 708, { hipR: 70, kneeR: -20 }, 9, 10); // high flick
k("H", 724, { facing: 1 });
k("H", 727, { facing: -1 }); // back to goal
// friends repositioned on the pitch during the transformation
k("A", 590, { x: 330 }); k("A", 640, { x: 420 });
k("B", 590, { x: 560 }); k("B", 640, { x: 640 });
k("C", 590, { x: 1420 }); k("C", 640, { x: 1380 });
k("E", 590, { x: 1620 }); k("E", 640, { x: 1540 });
layer("A", "run", 592, 640); layer("B", "run", 592, 640);
layer("C", "run", 592, 640); layer("E", "run", 592, 640);

const BK = 790; // bicycle-kick contact frame
k("H", 734, { ...LEG0, y: HY, rot: 0, shL: -12, elL: 8, shR: 12, elR: 8 });
k("H", 748, { y: HY + 34, hipL: 30, kneeL: -70, hipR: 30, kneeR: -70, shL: 40, shR: 40 }); // crouch
k("H", 760, { y: HY - 70, rot: 35, hipL: 25, kneeL: -40, hipR: 70, kneeR: -30, shL: -70, shR: -40 }); // take-off
k("H", 776, { y: HY - 165, rot: 80, hipL: 10, kneeL: -60, hipR: 35, kneeR: -50, shL: -100, shR: 80 });
k("H", BK, { y: HY - 185, rot: 112, hipL: -25, kneeL: -40, hipR: 85, kneeR: -5, shL: -110, elL: 20, shR: 100, elR: 20 }); // contact: foot above the body
k("H", 804, { y: HY - 150, rot: 122, hipR: 115, kneeR: -10, hipL: 10, kneeL: -50 });
k("H", 826, { y: G - 46, rot: 90, hipL: 15, kneeL: -10, hipR: 25, kneeR: -15, shL: -150, elL: 0, shR: 150, elR: 0, mouth: 1 }); // lands on back
k("H", 856, { y: G - 46, rot: 90 });
k("H", 872, { y: G - 120, rot: 30, hipL: 70, kneeL: -110, hipR: 40, kneeR: -80, shL: 20, shR: -20 });
k("H", 888, { y: HY, rot: 0, ...LEG0, shL: -12, shR: 12, mouth: 1 });
k("H", 890, { facing: -1 });
k("H", 892, { facing: 1, x: 960 });
k("H", 948, { x: 1180 });
layer("H", "run", 892, 948);
// knee slide
k("H", 950, { y: HY, rot: 0 });
k("H", 962, { x: 1250, y: G - 120, rot: -14, hipL: 0, kneeL: -95, hipR: 10, kneeR: -95, shL: -165, shR: 165, elL: 0, elR: 0 });
k("H", 1000, { x: 1262, y: G - 120, rot: -10 });
layer("H", "cheer", 962, 1012);

// everyone cheers the goal, then runs and piles on
(["A", "B", "C", "E"] as Who[]).forEach((w, i) => layer(w, "cheer", 806 + i * 4, 890 + i * 6));
const PILE: { w: Who; land: number; startX: number; x: number; y: number; rot: number; facing: 1 | -1 }[] = [
  { w: "A", land: 1022, startX: 420, x: 1236, y: G - 84, rot: 82, facing: 1 },
  { w: "C", land: 1040, startX: 1380, x: 1290, y: G - 128, rot: 76, facing: -1 },
  { w: "B", land: 1056, startX: 640, x: 1222, y: G - 168, rot: 98, facing: 1 },
  { w: "E", land: 1072, startX: 1540, x: 1282, y: G - 206, rot: 70, facing: -1 },
];
PILE.forEach(({ w, land, startX, x, y, rot, facing }) => {
  const s = T[w].base.scale;
  const runStart = 900 + (land - 1022) / 2;
  const jumpAt = land - 22;
  const fromX = lerp(startX, x, 0.45);
  k(w, runStart - 4, { x: startX });
  k(w, runStart, { facing });
  k(w, jumpAt, { x: fromX, y: standY(s), rot: 0, ...LEG0, shL: -12, shR: 12 });
  k(w, jumpAt + 6, { y: standY(s) + 22, hipL: 30, kneeL: -60, hipR: 30, kneeR: -60 });
  k(w, land - 8, { x: (fromX + x) / 2, y: y - 150, rot: rot * 0.6, hipL: 10, kneeL: -40, hipR: 40, kneeR: -30, shL: 150, shR: 150, elL: 0, elR: 0 });
  k(w, land, { x, y, rot, hipL: 15, kneeL: -30, hipR: 30, kneeR: -20, shL: 120, shR: 100, mouth: 1 });
  layer(w, "run", runStart, jumpAt);
  layer(w, "laugh", land, DURATION);
});
// hero knocked flat by the first friend
k("H", 1012, { x: 1262, y: G - 120, rot: -10 });
k("H", 1024, { x: 1250, y: G - 46, rot: -90, hipL: 20, kneeL: -30, hipR: 35, kneeR: -40, shL: 160, shR: -150, elL: 0, elR: 0 });
layer("H", "laugh", 1024, DURATION);

// mouths: relaxed smiles, tense "ooh" during the slow-mo kick, laughs only after the goal
(["A", "B", "C", "E"] as Who[]).forEach((w) => {
  k(w, 0, { mouth: 0.35 });
  k(w, 736, { mouth: 0.4 });
  k(w, 790, { mouth: 0.6 });
  k(w, 1000, { mouth: 0.7 });
});
k("H", 0, { mouth: 0.4 });
k("H", 760, { mouth: 0.5 });

// pre-sort keys
Object.values(T).forEach((t) => t.keys.sort((a, b) => a.f - b.f));

// ---------------------------------------------------------------- pose eval
const FIELDS = Object.keys(NEUTRAL).concat(["x", "y"]) as (keyof Pose)[];
const weight = (f: number, f0: number, f1: number, ramp = 6) =>
  clamp01(Math.min((f - f0) / ramp + 1, (f1 - f) / ramp + 1));

export const poseOf = (w: Who, f: number): Pose => {
  const t = T[w];
  const p: Pose = { ...t.base };
  for (const field of FIELDS) {
    let prev: Key | null = null;
    let next: Key | null = null;
    for (const key of t.keys) {
      if (!(field in key.p)) continue;
      if (key.f <= f) prev = key;
      else { next = key; break; }
    }
    const pv = prev ? (prev.p[field] as number) : (t.base[field] as number);
    if (!next) (p as any)[field] = pv;
    else {
      const f0 = prev ? prev.f : 0;
      const nv = next.p[field] as number;
      (p as any)[field] = lerp(pv, nv, ease(clamp01((f - f0) / (next.f - f0))));
    }
  }
  let facing = t.base.facing;
  for (const key of t.keys) if (key.f <= f && key.p.facing !== undefined) facing = key.p.facing;
  p.facing = facing;

  const phase = (CAST.indexOf(w) + 1) * 1.7;
  p.y += Math.sin(f * 0.11 + phase) * 1.6; // breathing
  for (const L of t.layers) {
    const wgt = weight(f, L.f0, L.f1);
    if (wgt <= 0) continue;
    const mix = (field: keyof Pose, v: number) => ((p as any)[field] = lerp(p[field] as number, v, wgt));
    if (L.kind === "run") {
      const ph = f * 0.5 + phase;
      mix("hipL", 38 * Math.sin(ph)); mix("hipR", -38 * Math.sin(ph));
      mix("kneeL", -15 - 45 * Math.max(0, Math.sin(ph + 1.7)));
      mix("kneeR", -15 - 45 * Math.max(0, Math.sin(ph + 1.7 + Math.PI)));
      mix("shL", -32 * Math.sin(ph)); mix("shR", 32 * Math.sin(ph));
      mix("elL", 75); mix("elR", 75);
      mix("rot", 8 * (p.facing === 1 ? 1 : -1));
      p.y -= Math.abs(Math.sin(ph)) * 10 * wgt;
      mix("mouth", 0.7);
    } else if (L.kind === "clap") {
      const s = 0.5 + 0.5 * Math.sin(f * 0.55 + phase);
      mix("shL", -150 - 22 * s); mix("shR", 150 + 22 * s); mix("elL", -10); mix("elR", 10);
      mix("mouth", 0.6);
    } else if (L.kind === "cheer") {
      const s = Math.sin(f * 0.35 + phase);
      mix("shL", -160 + 14 * s); mix("shR", 160 - 14 * s); mix("elL", 0); mix("elR", 0);
      mix("mouth", 1);
      p.y -= Math.abs(Math.sin(f * 0.3 + phase)) * 34 * wgt;
    } else if (L.kind === "laugh") {
      mix("mouth", 0.85 + 0.15 * Math.sin(f * 0.9 + phase));
      p.y += Math.sin(f * 0.8 + phase) * 2.5 * wgt;
      mix("headTilt", Math.sin(f * 0.4 + phase) * 8);
    } else if (L.kind === "balance") {
      mix("shL", lerp(p.shL, -38 + 6 * Math.sin(f * 0.2), 0.8));
      mix("shR", lerp(p.shR, 34 - 6 * Math.sin(f * 0.2), 0.8));
    }
  }
  return p;
};

// ---------------------------------------------------------------- ball
type Target = P | { who: Who; part: Part; dx?: number; dy?: number };
type Seg = { f0: number; f1: number; kind: "rest" | "arc" | "line" | "roll"; from: Target; to: Target; h?: number; sfx?: Sfx };
export type Sfx = "tap" | "touch" | "kick" | "header" | "chest" | "bigkick";

const top = (who: Who, part: Part): Target => ({ who, part, dy: -(BALL_R + 6) });
const at = (t: Target, f: number): P => {
  if ("x" in t) return t;
  const q = partWorld(poseOf(t.who, f), t.part);
  return { x: q.x + (t.dx ?? 0), y: q.y + (t.dy ?? 0) };
};

const SEGS: Seg[] = [];
const seg = (s: Seg) => SEGS.push(s);
{
  const H = "H" as Who;
  const groundStart = { x: 1010, y: G - BALL_R };
  seg({ f0: 0, f1: 12, kind: "rest", from: groundStart, to: groundStart });
  seg({ f0: 12, f1: 22, kind: "arc", from: groundStart, to: top(H, "footR"), h: 70, sfx: "tap" });
  const chain: { f: number; t: Target; sfx: Sfx; h: number }[] = [
    ...FOOT_TOUCHES.map((f) => ({ f, t: top(H, "footR"), sfx: "touch" as Sfx, h: 150 })),
    ...KNEE_TOUCHES.map((f) => ({ f, t: top(H, "kneeR"), sfx: "touch" as Sfx, h: 150 })),
    ...HEAD_TOUCHES.map((f) => ({ f, t: { who: H, part: "headTop" as Part, dy: -BALL_R - 2 }, sfx: "header" as Sfx, h: 200 })),
    { f: 298, t: top(H, "footR"), sfx: "touch", h: 120 },
  ];
  for (let i = 0; i < chain.length - 1; i++) {
    seg({ f0: chain[i].f, f1: chain[i + 1].f, kind: "arc", from: chain[i].t, to: chain[i + 1].t, h: chain[i + 1].h, sfx: chain[i].sfx });
  }
  seg({ f0: 298, f1: 322, kind: "arc", from: top(H, "footR"), to: { who: H, part: "footR", dx: 10, dy: -BALL_R - 8 }, h: 110, sfx: "touch" });
  seg({ f0: 322, f1: 352, kind: "arc", from: { who: H, part: "footR", dx: 10, dy: -BALL_R - 8 }, to: { who: "C", part: "chest", dx: 4, dy: 0 }, h: 70, sfx: "kick" });
  seg({ f0: 352, f1: 372, kind: "arc", from: { who: "C", part: "chest", dx: 4 }, to: top("C", "footR"), h: 30, sfx: "chest" });
  seg({ f0: 372, f1: 420, kind: "arc", from: top("C", "footR"), to: { who: "B", part: "headTop", dy: -BALL_R }, h: 330, sfx: "kick" });
  seg({ f0: 420, f1: 444, kind: "arc", from: { who: "B", part: "headTop", dy: -BALL_R }, to: top("A", "footR"), h: 90, sfx: "header" });
  seg({ f0: 444, f1: 458, kind: "arc", from: top("A", "footR"), to: { who: "A", part: "footR", dx: 6, dy: -BALL_R + 4 }, h: 14, sfx: "tap" });
  seg({ f0: 458, f1: 500, kind: "roll", from: { who: "A", part: "footR", dx: 6 }, to: { who: H, part: "footR", dx: -8 }, sfx: "kick" });
  seg({ f0: 500, f1: 516, kind: "rest", from: { who: H, part: "footR", dx: -8 }, to: { who: H, part: "footR", dx: -8 }, sfx: "tap" });
  seg({ f0: 516, f1: 556, kind: "roll", from: { who: H, part: "footR", dx: -8 }, to: { who: "E", part: "footR", dx: -6 }, sfx: "kick" });
  seg({ f0: 556, f1: 570, kind: "rest", from: { who: "E", part: "footR", dx: -6 }, to: { who: "E", part: "footR", dx: -6 }, sfx: "tap" });
  seg({ f0: 570, f1: 645, kind: "arc", from: { who: "E", part: "footR", dx: -6, dy: -BALL_R }, to: { who: H, part: "chest", dx: 6 }, h: 560, sfx: "kick" });
  seg({ f0: 645, f1: 668, kind: "arc", from: { who: H, part: "chest", dx: 6 }, to: top(H, "footR"), h: 50, sfx: "chest" });
  seg({ f0: 668, f1: 690, kind: "arc", from: top(H, "footR"), to: top(H, "footR"), h: 150, sfx: "touch" });
  seg({ f0: 690, f1: 708, kind: "arc", from: top(H, "footR"), to: top(H, "footR"), h: 110, sfx: "touch" });
  const contact: Target = { who: H, part: "footR", dx: 0, dy: -BALL_R - 4 };
  seg({ f0: 708, f1: BK, kind: "arc", from: top(H, "footR"), to: contact, h: 360, sfx: "touch" });
  const net = { x: 1812, y: G - 150 };
  seg({ f0: BK, f1: 806, kind: "line", from: contact, to: net, sfx: "bigkick" });
  seg({ f0: 806, f1: 840, kind: "line", from: net, to: { x: 1800, y: G - BALL_R } });
  seg({ f0: 840, f1: DURATION, kind: "rest", from: { x: 1800, y: G - BALL_R }, to: { x: 1800, y: G - BALL_R } });
}

export const ballAt = (f: number): P & { spin: number; z: number } => {
  const s = SEGS.find((x) => f >= x.f0 && f < x.f1) ?? SEGS[SEGS.length - 1];
  const t = clamp01((f - s.f0) / (s.f1 - s.f0));
  const a = at(s.from, s.f0);
  const b = at(s.to, s.f1);
  let x = lerp(a.x, b.x, t);
  let y = lerp(a.y, b.y, t);
  if (s.kind === "arc") y -= 4 * (s.h ?? 0) * t * (1 - t);
  if (s.kind === "roll") {
    const e = 1 - Math.pow(1 - t, 2);
    x = lerp(a.x, b.x, e);
    y = G - BALL_R;
  }
  if (s.kind === "rest") { x = a.x; y = Math.min(a.y, G - BALL_R); }
  if (s.kind === "line" && s.sfx !== "bigkick") y = lerp(a.y, b.y, t * t); // drops after the net
  return { x, y: Math.min(y, G - BALL_R), spin: x / BALL_R + f * 0.08, z: G - BALL_R - y };
};

// ---------------------------------------------------------------- world / camera
export const worldP = (f: number) => ease(clamp01((f - 575) / 65));
export const FLOODLIGHTS = [600, 612, 624];
export const GOAL_F = 806;
export const netBulge = (f: number) => (f < GOAL_F ? 0 : Math.exp(-(f - GOAL_F) / 10) * Math.sin(((f - GOAL_F) / 6) * Math.PI * 0.5 + 0.2));
export const excitement = (f: number) =>
  f < 590 ? 0.05 : f < 645 ? lerp(0.05, 0.45, (f - 590) / 55) : f < GOAL_F ? lerp(0.45, 0.65, (f - 645) / (GOAL_F - 645)) : f < 1170 ? 1 : lerp(1, 0.7, (f - 1170) / 120);

type Cam = { f: number; z: number; x: number; y: number };
const CAM: Cam[] = [
  { f: 0, z: 1.35, x: 960, y: 580 },
  { f: 300, z: 1.0, x: 960, y: 540 },
  { f: 560, z: 1.0, x: 960, y: 540 },
  { f: 610, z: 0.9, x: 960, y: 500 },
  { f: 650, z: 1.0, x: 960, y: 540 },
  { f: 740, z: 1.12, x: 990, y: 520 },
  { f: 786, z: 1.5, x: 1040, y: 470 },
  { f: 796, z: 1.5, x: 1060, y: 470 },
  { f: 810, z: 1.12, x: 1380, y: 560 },
  { f: 860, z: 1.0, x: 1100, y: 540 },
  { f: 960, z: 1.12, x: 1180, y: 600 },
  { f: 1080, z: 1.25, x: 1250, y: 690 },
  { f: 1170, z: 1.3, x: 1255, y: 700 },
  { f: 1290, z: 1.6, x: 1255, y: 720 },
];
export const SHAKES = [{ f: GOAL_F, a: 22 }, ...PILE.map((p) => ({ f: p.land, a: 10 }))];
export const cameraAt = (f: number) => {
  let i = 0;
  while (i < CAM.length - 2 && CAM[i + 1].f <= f) i++;
  const a = CAM[i], b = CAM[i + 1];
  const t = ease(clamp01((f - a.f) / (b.f - a.f)));
  let x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t);
  for (const s of SHAKES) {
    if (f >= s.f && f < s.f + 18) {
      const amp = s.a * (1 - (f - s.f) / 18);
      x += Math.sin(f * 2.1) * amp;
      y += Math.cos(f * 1.7) * amp;
    }
  }
  return { z: lerp(a.z, b.z, t), x, y };
};

// ---------------------------------------------------------------- sound events
export type Ev = { f: number; type: string; gain?: number };
export const soundEvents = (): Ev[] => {
  const ev: Ev[] = [];
  for (const s of SEGS) if (s.sfx && s.kind !== "rest") ev.push({ f: s.f0, type: s.sfx });
  for (const s of SEGS) if (s.kind === "rest" && s.sfx) ev.push({ f: s.f0, type: s.sfx });
  const claps: [Who, number, number][] = [];
  for (const w of CAST) for (const L of T[w].layers) if (L.kind === "clap") claps.push([w, L.f0, L.f1]);
  for (const [w, f0, f1] of claps) {
    const ph = (CAST.indexOf(w) + 1) * 1.7;
    for (let f = f0 + 6; f < f1 - 6; f++) {
      const a = Math.sin(f * 0.55 + ph), b = Math.sin((f + 1) * 0.55 + ph);
      if (a < 1 && b < a && Math.sin((f - 1) * 0.55 + ph) < a) ev.push({ f, type: "clap", gain: 0.5 });
    }
  }
  ev.push({ f: 330, type: "whistle" });
  ev.push({ f: 560, type: "riser" });
  FLOODLIGHTS.forEach((f) => ev.push({ f, type: "flood" }));
  [744, 762, 780].forEach((f) => ev.push({ f, type: "heartbeat" }));
  ev.push({ f: GOAL_F, type: "net" });
  ev.push({ f: GOAL_F, type: "roar" });
  ev.push({ f: GOAL_F + 24, type: "whistle" });
  PILE.forEach((p) => ev.push({ f: p.land, type: "thud" }));
  ev.push({ f: 1024, type: "thud" });
  return ev.sort((a, b) => a.f - b.f);
};
