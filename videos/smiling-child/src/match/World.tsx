import React from "react";
import { random } from "remotion";
import { excitement, FLOODLIGHTS, G, GOAL, GOAL_F, netBulge, worldP } from "./choreo";
import { clamp01, lerp } from "./rigmath";

const HORIZON = 760;

// ---------------------------------------------------------------- street
const HOUSES = Array.from({ length: 11 }, (_, i) => ({
  x: -320 + i * 240 + random(`hx${i}`) * 60,
  w: 170 + random(`hw${i}`) * 90,
  h: 110 + random(`hh${i}`) * 120,
  roof: random(`hr${i}`) > 0.5,
  c: ["#4a2228", "#55262a", "#3f1d25"][i % 3],
}));

const Street: React.FC<{ f: number; p: number }> = ({ f, p }) => (
  <g opacity={1 - p} transform={`translate(0 ${p * 380})`}>
    <path d="M-400 720 C 0 680 400 705 800 690 C 1200 675 1600 700 2400 680 L2400 800 L-400 800 Z" fill="#7a3530" opacity={0.5} />
    {HOUSES.map((h, i) => (
      <g key={i}>
        <rect x={h.x} y={HORIZON - h.h} width={h.w} height={h.h} fill={h.c} />
        {h.roof ? (
          <path d={`M${h.x - 12} ${HORIZON - h.h} L${h.x + h.w / 2} ${HORIZON - h.h - 50} L${h.x + h.w + 12} ${HORIZON - h.h} Z`} fill="#3a1a20" />
        ) : (
          <rect x={h.x - 8} y={HORIZON - h.h - 10} width={h.w + 16} height={12} fill="#3a1a20" />
        )}
        {[0.25, 0.65].map((wx, k) => (
          <rect key={k} x={h.x + h.w * wx - 14} y={HORIZON - h.h + 30} width={28} height={24} rx={3} fill="#ffcf7a"
            opacity={0.55 + 0.3 * Math.sin(f * 0.05 + i * 2 + k)} />
        ))}
        <rect x={h.x + h.w * 0.45} y={HORIZON - 52} width={24} height={52} fill="#2a1216" />
      </g>
    ))}
    {[180, 1140, 2050].map((x, i) => (
      <g key={i}>
        <rect x={x} y={HORIZON - 380} width={10} height={380} fill="#2a1216" />
        <rect x={x - 30} y={HORIZON - 370} width={70} height={7} fill="#2a1216" />
      </g>
    ))}
    <path d="M190 400 Q 665 470 1150 400 Q 1600 470 2060 400" stroke="#2a1216" strokeWidth={2} fill="none" />
    <path d="M190 412 Q 665 490 1150 412 Q 1600 490 2060 412" stroke="#2a1216" strokeWidth={2} fill="none" />
    {/* stones marking the street goal */}
    <ellipse cx={GOAL.x0} cy={G - 6} rx={24} ry={14} fill="#5b4a44" />
    <ellipse cx={GOAL.x1} cy={G - 6} rx={24} ry={14} fill="#5b4a44" />
  </g>
);

// ---------------------------------------------------------------- stadium
const CROWD = (() => {
  const out: { x: number; y: number; c: string; ph: number; s: number }[] = [];
  const colors = ["#f6b733", "#e07a2a", "#fff3d6", "#1f7f78", "#c9473b", "#f8d27a"];
  for (let row = 0; row < 17; row++) {
    const y = 210 + row * 31;
    const s = 0.6 + row * 0.03;
    for (let x = -300 + (row % 2) * 12; x < 2250; x += 25) {
      const i = out.length;
      out.push({ x: x + random(`cx${i}`) * 8, y: y + random(`cy${i}`) * 6, c: colors[Math.floor(random(`cc${i}`) * colors.length)], ph: random(`cp${i}`) * 6.28, s });
    }
  }
  return out;
})();

const Floodlight: React.FC<{ x: number; on: number; f: number }> = ({ x, on, f }) => (
  <g>
    <rect x={x - 7} y={70} width={14} height={HORIZON - 70} fill="#1a0c12" />
    <rect x={x - 80} y={20} width={160} height={70} rx={6} fill="#1a0c12" />
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={x - 60 + (i % 6) * 24} cy={40 + Math.floor(i / 6) * 28} r={9} fill={on > 0 ? "#fffbe8" : "#3a2a2a"} />
    ))}
    {on > 0 && (
      <>
        <circle cx={x} cy={55} r={190} fill="url(#floodGlow)" opacity={on * (0.85 + 0.05 * Math.sin(f * 0.7))} />
        <path d={`M${x - 70} 80 L${x - 520} ${G + 40} L${x + 520} ${G + 40} L${x + 70} 80 Z`} fill="#fff4cf" opacity={0.07 * on} />
      </>
    )}
  </g>
);

const Stadium: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const ex = excitement(f);
  const rise = (1 - p) * 560;
  return (
    <g opacity={clamp01(p * 1.6)}>
      <g transform={`translate(0 ${rise})`}>
        <path d="M-400 150 Q 960 90 2400 150 L2400 780 L-400 780 Z" fill="#26121c" />
        {CROWD.map((c, i) => {
          const bob = Math.max(0, Math.sin(f * 0.32 + c.ph)) * (2 + ex * 12);
          const armsUp = ex > 0.6 && Math.sin(f * 0.2 + c.ph * 3) > 0.2;
          return (
            <g key={i} transform={`translate(${c.x} ${c.y - bob}) scale(${c.s})`}>
              <rect x={-7} y={0} width={14} height={16} rx={5} fill={c.c} />
              <circle cx={0} cy={-6} r={6} fill="#5a321c" />
              {armsUp && <path d="M-7 4 L-11 -14 M7 4 L11 -14" stroke={c.c} strokeWidth={4} strokeLinecap="round" />}
            </g>
          );
        })}
        {/* camera flashes */}
        {ex > 0.6 && Array.from({ length: 14 }, (_, i) => {
          const r = random(`fl${i}-${Math.floor(f / 3)}`);
          return r > 0.55 ? <circle key={i} cx={random(`fx${i}-${Math.floor(f / 3)}`) * 2200 - 140} cy={220 + random(`fy${i}-${Math.floor(f / 3)}`) * 500} r={5 + r * 6} fill="#fff" opacity={0.8} /> : null;
        })}
        <rect x={-400} y={100} width={2800} height={680} fill="#1a0a14" opacity={0.38} />
        <rect x={-400} y={740} width={2800} height={26} fill="#3b1a24" />
        <rect x={-400} y={740} width={2800} height={6} fill="#f6b733" opacity={0.8} />
      </g>
      {FLOODLIGHTS.map((fl, i) => (
        <Floodlight key={i} x={i === 0 ? 70 : i === 1 ? 1850 : 960} on={f >= fl ? clamp01((f - fl) / 4) : 0} f={f} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- ground + goal
const Ground: React.FC<{ p: number }> = ({ p }) => (
  <g>
    <rect x={-500} y={HORIZON} width={2900} height={700} fill="url(#dirt)" />
    <g opacity={p}>
      <rect x={-500} y={HORIZON} width={2900} height={700} fill="url(#grass)" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-500 + i * 220} y={HORIZON} width={110} height={700} fill="#fff" opacity={0.04} />
      ))}
      <rect x={-500} y={HORIZON + 22} width={2900} height={5} fill="#f4f1e6" opacity={0.75} />
      <path d={`M${GOAL.x0 - 260} ${HORIZON + 24} L${GOAL.x0 - 300} ${G + 60}`} stroke="#f4f1e6" strokeWidth={5} opacity={0.6} />
    </g>
  </g>
);

const Goal: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const b = netBulge(f) * 38;
  const { x0, x1, top } = GOAL;
  const nx = (x: number, y: number) => {
    const d = Math.exp(-(((x - 1812) / 70) ** 2 + ((y - (G - 150)) / 80) ** 2));
    return { x: x + b * d, y: y + b * d * 0.3 };
  };
  const lines: string[] = [];
  for (let gx = x0 + 15; gx < x1; gx += 18) {
    const pts = Array.from({ length: 16 }, (_, i) => nx(gx, top + 8 + i * ((G - top - 8) / 15)));
    lines.push("M" + pts.map((q) => `${q.x} ${q.y}`).join(" L"));
  }
  for (let gy = top + 18; gy < G; gy += 18) {
    const pts = Array.from({ length: 12 }, (_, i) => nx(x0 + 8 + i * ((x1 - x0 - 16) / 11), gy));
    lines.push("M" + pts.map((q) => `${q.x} ${q.y}`).join(" L"));
  }
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 60})`}>
      <rect x={x0} y={top} width={x1 - x0} height={G - top} fill="#fff" opacity={0.06} />
      <path d={lines.join(" ")} stroke="#fff" strokeWidth={1.6} opacity={0.5} fill="none" />
      <rect x={x0 - 7} y={top - 7} width={x1 - x0 + 14} height={12} rx={6} fill="#f7f4ec" />
      <rect x={x0 - 7} y={top - 7} width={12} height={G - top + 7} rx={6} fill="#f7f4ec" />
      <rect x={x1 - 5} y={top - 7} width={12} height={G - top + 7} rx={6} fill="#f7f4ec" />
    </g>
  );
};

export const WorldBack: React.FC<{ f: number }> = ({ f }) => {
  const p = worldP(f);
  return (
    <g>
      <Street f={f} p={p} />
      <Stadium f={f} p={p} />
      <Ground p={p} />
    </g>
  );
};

export const WorldFront: React.FC<{ f: number }> = ({ f }) => <Goal f={f} p={worldP(f)} />;

export const GoalBurst: React.FC<{ f: number }> = ({ f }) => {
  const t = (f - GOAL_F) / 30;
  if (t < 0 || t > 1) return null;
  return (
    <g transform="translate(1812 730)" opacity={1 - t}>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r0 = 40 + t * 200, r1 = 120 + t * 520;
        return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={i % 2 ? "#fff3c4" : "#f6b733"} strokeWidth={10 * (1 - t) + 2} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const Confetti: React.FC<{ f: number }> = ({ f }) => {
  if (f < GOAL_F) return null;
  const t = f - GOAL_F;
  const colors = ["#f6b733", "#e07a2a", "#1f7f78", "#fff3d6", "#c9473b"];
  return (
    <g>
      {Array.from({ length: 170 }, (_, i) => {
        const start = random(`cs${i}`) * 160;
        if (t < start) return null;
        const age = t - start;
        const x = random(`cx${i}`) * 2000 - 40 + Math.sin(age * 0.08 + i) * 40;
        const y = -40 + age * (3 + random(`cv${i}`) * 3);
        if (y > 1120) return null;
        const rot = age * (4 + random(`cr${i}`) * 8);
        return <rect key={i} x={x} y={y} width={14} height={8} fill={colors[i % colors.length]} transform={`rotate(${rot} ${x + 7} ${y + 4})`} opacity={0.9} />;
      })}
    </g>
  );
};

export const skyStops = (f: number) => {
  const p = worldP(f);
  return [lerp(0, 1, p)];
};
export { HORIZON };
