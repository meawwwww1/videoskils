import { Easing } from "remotion";
import { fontStack, Lang } from "./fonts";

// One theme object drives every scene. Generate it from the brief
// (style + pacing + colors). Presets: skills/remotion-video/references/style-presets.md
export type Theme = {
  bg: [string, string]; // gradient stops
  fg: string; // main text
  accent: string;
  muted: string;
  font: string;
  weightHeavy: number;
  radius: number;
  transitionFrames: number; // pacing: calm 20, energetic 8, cinematic 30, meme 4
  ease: (t: number) => number;
  springDamping: number; // 200 = no bounce, 12 = bouncy
};

export const makeTheme = (lang: Lang): Theme => ({
  bg: ["#0f172a", "#1e293b"],
  fg: "#f8fafc",
  accent: "#38bdf8",
  muted: "#94a3b8",
  font: fontStack[lang],
  weightHeavy: 800,
  radius: 28,
  transitionFrames: 15,
  ease: Easing.bezier(0.16, 1, 0.3, 1),
  springDamping: 200,
});
