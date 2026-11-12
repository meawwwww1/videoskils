# Remotion animation patterns

All snippets assume:

```tsx
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
const frame = useCurrentFrame();
const { fps, width, height } = useVideoConfig();
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
```

## Entrances

```tsx
// Spring pop (0 → 1). damping 200 = smooth, 10–14 = bouncy.
const p = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.6 } });
style={{ transform: `scale(${p})`, opacity: p }}

// Slide up + fade with easing
const t = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
style={{ opacity: t, transform: `translateY(${(1 - t) * 60}px)` }}

// Blur-in (cinematic)
const b = interpolate(frame, [0, 25], [20, 0], clamp);
style={{ filter: `blur(${b}px)`, opacity: 1 - b / 20 }}
```

## Text

```tsx
// Typewriter — slice by grapheme so emoji/Hebrew niqqud don't split
const chars = [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
const shown = chars.slice(0, Math.floor(interpolate(frame, [0, chars.length * 2], [0, chars.length], clamp))).join("");
const cursor = Math.floor(frame / 15) % 2 === 0 ? "▍" : "";

// Mask reveal: text rises from behind an invisible line
<div style={{ overflow: "hidden" }}>
  <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{text}</div>
</div>

// Highlight sweep behind a word
const w = interpolate(frame, [10, 25], [0, 100], clamp);
<span style={{ background: `linear-gradient(90deg, ${accent} ${w}%, transparent ${w}%)` }}>{word}</span>
// RTL: use 270deg so the sweep runs right-to-left.
```

## Numbers

```tsx
// Counter with locale formatting (works for he-IL, ar-EG digits, etc.)
const v = interpolate(frame, [0, 45], [0, 12500], { ...clamp, easing: Easing.out(Easing.cubic) });
const label = new Intl.NumberFormat(locale).format(Math.round(v));
// Fixed width to stop jitter while counting:
style={{ fontVariantNumeric: "tabular-nums" }}
```

## Shapes, SVG, logos

```tsx
// Draw an SVG path (logo outline, underline, arrow)
const len = 1000; // or path.getTotalLength() measured once
const draw = interpolate(frame, [0, 40], [len, 0], clamp);
<path d={d} stroke={accent} strokeWidth={8} fill="none" strokeDasharray={len} strokeDashoffset={draw} />

// Logo reveal: outline draws → fill fades in → scale settles
const fill = interpolate(frame, [35, 50], [0, 1], clamp);
const settle = spring({ frame: frame - 35, fps, config: { damping: 12 } });
style={{ transform: `scale(${0.9 + 0.1 * settle})` }}  // fillOpacity={fill}

// Circle wipe transition (clip-path)
const r = interpolate(frame, [0, 20], [0, 150], clamp);
style={{ clipPath: `circle(${r}% at 50% 50%)` }}
```

## Charts

```tsx
// Bars grow with stagger
data.map((d, i) => {
  const g = spring({ frame: frame - i * 4, fps, config: { damping: 200 } });
  return <div key={i} style={{ height: (d.value / max) * chartH * g, width: barW, background: accent }} />;
});

// Line chart drawing: build an SVG path from points, then use the path-draw pattern above.
// Put the value label at the moving tip: interpolate the point index from the same progress.
```

## Camera & energy

```tsx
// Slow push-in (Ken Burns) on an image or the whole scene
const z = interpolate(frame, [0, durationInFrames], [1, 1.12]);
style={{ transform: `scale(${z})` }}

// Zoom punch on a beat at frame `hit`
const punch = 1 + 0.08 * Math.exp(-Math.max(0, frame - hit) / 4) * (frame >= hit ? 1 : 0);

// Camera shake (deterministic)
const s = interpolate(frame, [hit, hit + 10], [12, 0], clamp);
const dx = (random(`x${frame}`) - 0.5) * s, dy = (random(`y${frame}`) - 0.5) * s;

// Parallax: layers move at different speeds
const drift = frame * 0.6;  // background: drift*0.3, mid: drift*0.6, front: drift*1.0

// 3D card flip
const r = interpolate(spring({ frame, fps, config: { damping: 15 } }), [0, 1], [90, 0]);
<div style={{ perspective: 1200 }}><div style={{ transform: `rotateY(${r}deg)`, backfaceVisibility: "hidden" }} /></div>
```

## Overlays

```tsx
// Progress bar for explainers / tutorials (RTL: anchor right)
const prog = frame / durationInFrames;
<div style={{ position: "absolute", bottom: 0, [rtl ? "right" : "left"]: 0, height: u(8), width: `${prog * 100}%`, background: accent }} />

// Film grain (cinematic): a noise PNG in public/ with random offset per frame
style={{ backgroundImage: `url(${staticFile("grain.png")})`, backgroundPosition: `${random(frame) * 100}% ${random(frame + 1) * 100}%`, opacity: 0.08, mixBlendMode: "overlay" }}

// Vignette
style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)" }}
```

## Transitions (@remotion/transitions)

```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";   // direction: from-left | from-right | from-top | from-bottom
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe"; // needs width/height
<TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 } })} />
```
With `springTiming`, get the real length from `timing.getDurationInFrames({ fps })` when computing total duration.

## Common mistakes

- `interpolate` without `clamp` → values overshoot past the range (negative opacity, reversed slides).
- Forgetting `durationFor()` after adding a scene → last scene cut off (QA catches the duration mismatch).
- Animating `width`/`height` of text containers → reflow jitter. Animate `transform` instead.
- Huge `filter: blur()` on full-frame layers → very slow renders. Blur small elements or pre-render.
- Text that fits in 16:9 overflowing in 9:16 → always check a portrait still.
