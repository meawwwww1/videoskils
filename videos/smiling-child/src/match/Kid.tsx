import React from "react";
import { random } from "remotion";
import { D, dir, joints, P, Pose, toWorld } from "./rigmath";
import { G } from "./choreo";

export type Look = {
  skin: string;
  skinShadow: string;
  hair: "coily" | "shaved" | "puffs" | "flat" | "band";
  jersey: [string, string];
};

export const LOOKS: Record<string, Look> = {
  H: { skin: "#7b4a2d", skinShadow: "#5a321c", hair: "coily", jersey: ["#f6b733", "#e07a2a"] },
  A: { skin: "#4e2c1a", skinShadow: "#38200f", hair: "shaved", jersey: ["#f2ad2e", "#d96f26"] },
  B: { skin: "#8d5a3a", skinShadow: "#6a3f25", hair: "puffs", jersey: ["#f8c040", "#e5862f"] },
  C: { skin: "#63391f", skinShadow: "#472814", hair: "flat", jersey: ["#f0a92c", "#d26a24"] },
  E: { skin: "#a06a45", skinShadow: "#7a4d2e", hair: "band", jersey: ["#f7bb3a", "#e2802c"] },
};

const SHORTS = "#1f7f78";
const HAIR = "#1c120d";
const RIM = "#ffc46b";

const Line: React.FC<{ a: P; b: P; w: number; c: string }> = ({ a, b, w, c }) => (
  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c} strokeWidth={w} strokeLinecap="round" />
);
const along = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const curlRing = Array.from({ length: 28 }, (_, i) => {
  const a = Math.PI * (1.0 + (i / 27) * 1.0);
  return { x: Math.cos(a) * (50 + random(`c${i}`) * 6), y: -8 + Math.sin(a) * (60 + random(`d${i}`) * 6), r: 8 + random(`e${i}`) * 4 };
});

const Hair: React.FC<{ style: Look["hair"] }> = ({ style }) => {
  const cap = "M-52 4 C-60 -52 -30 -74 0 -74 C30 -74 60 -52 52 4 C44 -22 30 -34 0 -35 C-30 -34 -44 -22 -52 4 Z";
  if (style === "shaved") return <path d={cap} fill={HAIR} opacity={0.6} transform="translate(0 4) scale(0.98 0.9)" />;
  if (style === "flat")
    return <path d="M-52 2 L-55 -58 Q-50 -86 0 -88 Q50 -86 55 -58 L52 2 C44 -24 30 -36 0 -37 C-30 -36 -44 -24 -52 2 Z" fill={HAIR} />;
  return (
    <g>
      {style === "puffs" && (
        <>
          <circle cx={-38} cy={-62} r={26} fill={HAIR} />
          <circle cx={38} cy={-62} r={26} fill={HAIR} />
        </>
      )}
      <path d={cap} fill={HAIR} />
      {style !== "puffs" && curlRing.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={i % 5 === 0 ? "#33221a" : HAIR} />)}
      {style === "band" && <path d="M-50 -24 C-30 -40 30 -40 50 -24" stroke="#fff6e6" strokeWidth={10} fill="none" />}
    </g>
  );
};

const Face: React.FC<{ look: Look; mouth: number }> = ({ look, mouth }) => {
  const ox = 7; // looks slightly toward facing direction (3/4 feel)
  const happy = mouth > 0.75;
  const h = 6 + 20 * mouth;
  return (
    <g transform={`translate(${ox} 0)`}>
      {[-17, 17].map((x) =>
        happy ? (
          <path key={x} d={`M${x - 9} -4 Q${x} -13 ${x + 9} -4`} stroke="#1a0d07" strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : (
          <g key={x}>
            <ellipse cx={x} cy={-5} rx={8.5} ry={6} fill="#f6ebe0" />
            <circle cx={x + 2} cy={-5} r={4.6} fill="#1a0d07" />
            <circle cx={x + 3.5} cy={-7} r={1.5} fill="#fff" />
          </g>
        ),
      )}
      <path d="M-26 -20 Q-17 -26 -8 -21 M8 -21 Q17 -26 26 -20" stroke={HAIR} strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={3} cy={11} rx={7} ry={4.5} fill={look.skinShadow} />
      <ellipse cx={-22} cy={14} rx={9} ry={6} fill="#c0603a" opacity={0.25} />
      <ellipse cx={24} cy={14} rx={9} ry={6} fill="#c0603a" opacity={0.25} />
      <g transform="translate(1 25)">
        <path d={`M-17 0 C-10 -2 10 -2 17 0 C14 ${h} -14 ${h} -17 0 Z`} fill="#3b1210" />
        {mouth > 0.2 && <path d="M-15 1 C-8 -1 8 -1 15 1 L13 5 C5 6.5 -5 6.5 -13 5 Z" fill="#fbf6ee" />}
        {mouth > 0.5 && <ellipse cx={0} cy={h * 0.62} rx={8} ry={3.2} fill="#c3504d" />}
      </g>
    </g>
  );
};

const Head: React.FC<{ look: Look; pose: Pose }> = ({ look, pose }) => (
  <g transform={`translate(0 ${D.HEADY}) rotate(${pose.headTilt})`}>
    <ellipse cx={-49} cy={4} rx={9} ry={13} fill={look.skinShadow} />
    <ellipse cx={49} cy={4} rx={9} ry={13} fill={look.skin} />
    <ellipse cx={0} cy={0} rx={50} ry={58} fill={look.skin} />
    <ellipse cx={-14} cy={6} rx={36} ry={54} fill={look.skinShadow} opacity={0.35} />
    <path d="M34 -36 C48 -18 52 8 42 34" stroke={RIM} strokeWidth={4} fill="none" opacity={0.55} />
    <Hair style={look.hair} />
    <Face look={look} mouth={pose.mouth} />
  </g>
);

const Leg: React.FC<{ hip: P; knee: P; foot: P; angle: number; look: Look }> = ({ hip, knee, foot, angle, look }) => {
  const ankle = { x: foot.x - dir(angle).x * D.FOOT, y: foot.y - dir(angle).y * D.FOOT };
  const fwd = dir(angle + 90);
  const shoe = { x: foot.x + fwd.x * 7, y: foot.y + fwd.y * 7 };
  const shoeAng = (Math.atan2(fwd.y, fwd.x) * 180) / Math.PI;
  return (
    <g>
      <Line a={hip} b={knee} w={23} c={look.skin} />
      <Line a={knee} b={ankle} w={19} c={look.skin} />
      <Line a={along(knee, ankle, 0.45)} b={ankle} w={21} c="#fff6e6" />
      <Line a={hip} b={along(hip, knee, 0.42)} w={31} c={SHORTS} />
      <ellipse cx={shoe.x} cy={shoe.y} rx={19} ry={10} fill="#1d1d24" transform={`rotate(${shoeAng} ${shoe.x} ${shoe.y})`} />
    </g>
  );
};

const Arm: React.FC<{ sh: P; el: P; hand: P; look: Look }> = ({ sh, el, hand, look }) => (
  <g>
    <Line a={sh} b={el} w={18} c={look.skin} />
    <Line a={el} b={hand} w={16} c={look.skin} />
    <circle cx={hand.x} cy={hand.y} r={10} fill={look.skin} />
    <Line a={sh} b={along(sh, el, 0.42)} w={26} c={look.jersey[0]} />
  </g>
);

export const Shadow: React.FC<{ pose: Pose }> = ({ pose }) => {
  const j = joints(pose);
  const low = Math.max(toWorld(pose, j.footL).y, toWorld(pose, j.footR).y, pose.y + 40);
  const air = Math.max(0, G - low);
  const o = Math.max(0, 0.35 - air / 900);
  return <ellipse cx={pose.x} cy={G + 4} rx={(70 + air * 0.05) * pose.scale} ry={12 * pose.scale} fill="#2a0f08" opacity={o} />;
};

export const Kid: React.FC<{ who: string; pose: Pose }> = ({ who, pose }) => {
  const look = LOOKS[who];
  const j = joints(pose);
  const gid = `jersey-${who}`;
  return (
    <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.rot}) scale(${pose.facing * pose.scale} ${pose.scale})`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={look.jersey[0]} />
          <stop offset="1" stopColor={look.jersey[1]} />
        </linearGradient>
      </defs>
      <Arm sh={j.shL} el={j.elbL} hand={j.handL} look={{ ...look, skin: look.skinShadow }} />
      <Leg hip={j.hipL} knee={j.kneeL} foot={j.footL} angle={pose.hipL + pose.kneeL} look={{ ...look, skin: look.skinShadow }} />
      <Leg hip={j.hipR} knee={j.kneeR} foot={j.footR} angle={pose.hipR + pose.kneeR} look={look} />
      <path d="M-36 -2 L36 -2 L40 40 L5 43 L0 28 L-5 43 L-40 40 Z" fill={SHORTS} />
      <rect x={-11} y={-166} width={22} height={30} rx={8} fill={look.skinShadow} />
      <path d="M-34 -146 Q0 -158 34 -146 L39 -40 Q37 6 31 12 L-31 12 Q-37 6 -39 -40 Z" fill={`url(#${gid})`} />
      <path d="M-34 -146 Q-37 -60 -31 12 L-22 12 Q-28 -60 -24 -148 Z" fill="#000" opacity={0.08} />
      <path d="M-16 -150 Q0 -136 16 -150" stroke="#1f7f78" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M30 -140 L36 -40" stroke={RIM} strokeWidth={4} opacity={0.5} />
      <Head look={look} pose={pose} />
      <Arm sh={j.shR} el={j.elbR} hand={j.handR} look={look} />
    </g>
  );
};
