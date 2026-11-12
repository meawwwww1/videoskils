// Fonts are bundled from npm (@fontsource) so rendering works offline.
// Each family covers a script group. Add more with: npm i @fontsource/<family>
import "@fontsource/inter/400.css";
import "@fontsource/inter/800.css";
import "@fontsource/heebo/400.css";
import "@fontsource/heebo/800.css";
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/800.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/800.css";

export type Lang = "he" | "en" | "ar" | "ja" | "mixed";

// Font stack per language. The first family that has the glyph wins, so mixed
// Hebrew + English text renders Latin in Heebo/Inter and Hebrew in Heebo.
export const fontStack: Record<Lang, string> = {
  he: "'Heebo', 'Inter', sans-serif",
  en: "'Inter', 'Heebo', sans-serif",
  ar: "'Noto Sans Arabic', 'Inter', sans-serif",
  ja: "'Noto Sans JP', 'Inter', sans-serif",
  mixed: "'Inter', 'Heebo', 'Noto Sans Arabic', 'Noto Sans JP', sans-serif",
};

export const isRtl = (lang: Lang) => lang === "he" || lang === "ar";

// Detects direction from the text itself — use for user-provided strings.
export const detectDir = (text: string): "rtl" | "ltr" =>
  /[֐-ࣿיִ-﷿ﹰ-﻿]/.test(text) ? "rtl" : "ltr";
