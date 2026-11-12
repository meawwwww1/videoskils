import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { detectDir } from "../fonts";
import { Theme } from "../theme";
import { useLayout } from "./layout";

export type Caption = { text: string; startMs: number; endMs: number };

// Social-style captions: one short chunk at a time, pops in, sits above the
// bottom safe zone. Feed it timings from storyboard.md (or a transcript later).
export const Captions: React.FC<{ captions: Caption[]; theme: Theme }> = ({ captions, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, safe } = useLayout();
  const ms = (frame / fps) * 1000;
  const cur = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!cur) return null;
  const local = frame - Math.round((cur.startMs / 1000) * fps);
  const p = spring({ frame: local, fps, config: { damping: 14, mass: 0.5 } });
  return (
    <div
      style={{
        position: "absolute",
        left: safe.x,
        right: safe.x,
        bottom: safe.bottom,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        dir={detectDir(cur.text)}
        style={{
          fontFamily: theme.font,
          fontWeight: theme.weightHeavy,
          fontSize: u(64),
          color: theme.fg,
          background: "rgba(0,0,0,0.55)",
          padding: `${u(14)}px ${u(28)}px`,
          borderRadius: u(18),
          textAlign: "center",
          transform: `scale(${0.85 + 0.15 * p})`,
          opacity: p,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};
