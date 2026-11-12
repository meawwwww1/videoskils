import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { detectDir } from "../fonts";
import { Theme } from "../theme";

type Dir = "rtl" | "ltr";
const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LTR = /[A-Za-z0-9À-ɏͰ-ϿЀ-ӿ぀-ヿ一-鿿]/;

// Split into directional runs so mixed text ("השקנו את Motion Studio 2.0")
// keeps English words and numbers in reading order inside an RTL sentence.
const toRuns = (text: string, base: Dir) => {
  const words = text.split(/\s+/).filter(Boolean);
  const runs: { dir: Dir; words: string[] }[] = [];
  for (const w of words) {
    const d: Dir | null = RTL.test(w) ? "rtl" : LTR.test(w) ? "ltr" : null;
    const last = runs[runs.length - 1];
    if (last && (d === null || d === last.dir)) last.words.push(w);
    else runs.push({ dir: d ?? base, words: [w] });
  }
  return runs;
};

// Word-by-word spring entrance. Works for any language; direction is detected
// from the text unless `dir` is given.
export const KineticText: React.FC<{
  text: string;
  theme: Theme;
  size: number; // px
  delay?: number; // frames before the first word
  stagger?: number; // frames between words
  color?: string;
  highlight?: string[]; // words drawn in the accent color
  dir?: Dir;
  align?: "center" | "start";
}> = ({ text, theme, size, delay = 0, stagger = 4, color, highlight = [], dir, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = dir ?? detectDir(text);
  let i = 0;
  return (
    <div
      dir={base}
      style={{
        fontFamily: theme.font,
        fontWeight: theme.weightHeavy,
        fontSize: size,
        lineHeight: 1.15,
        color: color ?? theme.fg,
        textAlign: align === "center" ? "center" : base === "rtl" ? "right" : "left",
        letterSpacing: base === "rtl" ? 0 : "-0.02em", // never letter-space Arabic/Hebrew
      }}
    >
      {toRuns(text, base).map((run, r) => (
        <span key={r} dir={run.dir} style={{ unicodeBidi: "isolate" }}>
          {run.words.map((w) => {
            const idx = i++;
            const p = spring({
              frame: frame - delay - idx * stagger,
              fps,
              config: { damping: theme.springDamping, mass: 0.6 },
            });
            const hl = highlight.some((h) => w.includes(h));
            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  margin: `0 ${size * 0.13}px`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * size * 0.6}px)`,
                  color: hl ? theme.accent : undefined,
                }}
              >
                {w}
              </span>
            );
          })}{" "}
        </span>
      ))}
    </div>
  );
};
