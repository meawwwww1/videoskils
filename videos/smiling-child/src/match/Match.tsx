import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ballAt, BALL_R, cameraAt, CAST, DURATION, GOAL_F, poseOf, worldP } from "./choreo";
import { Kid, Shadow } from "./Kid";
import { Confetti, GoalBurst, WorldBack, WorldFront } from "./World";
import { G } from "./choreo";

const Ball: React.FC<{ f: number }> = ({ f }) => {
  const b = ballAt(f);
  const trail = f >= 790 && f < GOAL_F ? [1, 2, 3, 4, 5].map((k) => ballAt(f - k * 0.6)) : [];
  return (
    <g>
      <ellipse cx={b.x} cy={G + 3} rx={BALL_R * (1 - Math.min(0.6, b.z / 900))} ry={5} fill="#2a0f08" opacity={Math.max(0, 0.35 - b.z / 1200)} />
      {trail.map((t, i) => <circle key={i} cx={t.x} cy={t.y} r={BALL_R * (1 - i * 0.12)} fill="#fff3c4" opacity={0.35 - i * 0.06} />)}
      <g transform={`translate(${b.x} ${b.y}) rotate(${(b.spin * 180) / Math.PI})`}>
        <circle r={BALL_R} fill="#f7f4ec" stroke="#3a2a2a" strokeWidth={1.5} />
        <path d="M0 -7 L6.6 -2.2 L4.1 5.7 L-4.1 5.7 L-6.6 -2.2 Z" fill="#1d1d24" />
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M0 -20 L5 -15 L0 -11 L-5 -15 Z" fill="#1d1d24" transform={`rotate(${a})`} />
        ))}
        <circle r={BALL_R} fill="url(#ballShade)" />
      </g>
    </g>
  );
};

export const Match: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraAt(f);
  const p = worldP(f);
  const poses = CAST.map((w) => ({ w, pose: poseOf(w, f) }));
  const slowmo = interpolate(f, [736, 760, 800, 812], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = f >= GOAL_F ? Math.exp(-(f - GOAL_F) / 6) * 0.7 : 0;
  const fade = interpolate(f, [0, 12, DURATION - 20, DURATION - 1], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#1a0b10" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p > 0.5 ? "#2a1336" : "#3b1d3a"} />
            <stop offset="0.4" stopColor="#a8433a" />
            <stop offset="0.68" stopColor="#ee8a3c" />
            <stop offset="0.85" stopColor="#f9c869" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff4c9" />
            <stop offset="0.3" stopColor="#ffd27a" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ff9a52" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floodGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.25" stopColor="#fff4cf" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff4cf" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b36a3c" />
            <stop offset="0.4" stopColor="#8a4a2a" />
            <stop offset="1" stopColor="#5a2c1b" />
          </linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5f9a3c" />
            <stop offset="1" stopColor="#2d5f26" />
          </linearGradient>
          <radialGradient id="ballShade" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0.4" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#3a1a0a" stopOpacity="0.45" />
          </radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#14060a" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* sky (screen space, slight parallax) */}
        <rect width={1920} height={1080} fill="url(#sky)" />
        <circle cx={1500 - (cam.x - 960) * 0.15} cy={560} r={560} fill="url(#sun)" opacity={1 - p * 0.45} />

        {/* world (camera space) */}
        <g transform={`translate(960 540) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
          <WorldBack f={f} />
          {poses.map(({ w, pose }) => <Shadow key={w} pose={pose} />)}
          {poses.map(({ w, pose }) => <Kid key={w} who={w} pose={pose} />)}
          <WorldFront f={f} />
          <Ball f={f} />
          <GoalBurst f={f} />
        </g>

        {/* grade + overlays (screen space) */}
        <rect width={1920} height={1080} fill="#ff9a40" opacity={0.07} />
        <rect width={1920} height={1080} fill="#0a0410" opacity={slowmo * 0.18} />
        <rect width={1920} height={1080} fill="url(#vig)" opacity={1 + slowmo * 0.6} />
        <Confetti f={f} />
        <rect width={1920} height={1080} fill="#fff8e0" opacity={flash} />
        <rect width={1920} height={1080} fill="#000" opacity={fade} />
      </svg>
    </AbsoluteFill>
  );
};
