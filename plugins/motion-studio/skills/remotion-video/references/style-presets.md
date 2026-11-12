# Style presets

Map brief answers → theme. Question 4 picks the preset, question 7 the pacing
row, question 8 may override colors. Copy values into `makeTheme()` (Remotion) or
the constants at the top of the Manim scene.

## Visual style (question 4)

| Preset | bg gradient | fg | accent | muted | type | look |
|--------|-------------|----|--------|-------|------|------|
| **Clean modern** | `#0f172a → #1e293b` (or light: `#f8fafc → #e2e8f0` with fg `#0f172a`) | `#f8fafc` | `#38bdf8` | `#94a3b8` | Inter / Heebo 800 + 400 | lots of space, one accent, thin lines, soft shadows |
| **Bold colorful** | `#7c3aed → #db2777` | `#ffffff` | `#facc15` | `#fde68a` | Rubik / Cairo 900 | big type filling 70% of width, color blocks, shapes, stickers |
| **Dark cinematic** | `#050505 → #1a1410` | `#f5f0e8` | `#e8b04b` (gold) | `#7a7066` | serif headline (Frank Ruhl Libre / Playfair) + sans body | letterbox bars, slow push-ins, film grain overlay, vignette |
| **Playful hand-drawn** | `#fff7ed → #fef3c7` | `#1f2937` | `#f97316` | `#a8a29e` | rounded (Varela Round / Fredoka / Baloo) | wobble (`Math.sin(frame/3)` ±2°), squash-and-stretch springs, doodle SVG strokes |

Additional palettes for "Colors" (question 8):
- **Monochrome + accent**: `#0a0a0a`, `#fafafa`, `#737373`, accent `#ef4444`.
- **Neon / high contrast**: bg `#05010f`, fg `#ffffff`, accents `#22d3ee` + `#f0abfc`, glow via `text-shadow: 0 0 20px <accent>`.
- **Brand colors**: user's primary → `accent`; darkest brand color (or `#0b0b0f`) → `bg`; check fg/bg contrast ≥ 4.5:1.

## Pacing (question 7)

| Pacing | transition frames @30fps | spring damping | stagger (frames/word) | hold after text lands | transitions |
|--------|--------------------------|----------------|-----------------------|-----------------------|-------------|
| Calm & smooth | 20 | 200 (no bounce) | 5 | 1.5 s | fade, gentle slide |
| Energetic & punchy | 8 | 12 (bouncy) | 3 | 0.8 s | slide, wipe, zoom-punch |
| Cinematic slow reveals | 30 | 200, `mass: 2` | 8 | 2 s | fade through black, mask reveal |
| Fast meme-style | 3 (or hard cut) | 8 | 2 | 0.5 s | hard cuts, shake, zoom 1.0→1.15 |

Easing: calm/cinematic `Easing.bezier(0.16, 1, 0.3, 1)` (expo-out), energetic `Easing.bezier(0.34, 1.56, 0.64, 1)` (back-out).

## Type scale (in `u()` units, 1080 short side)

| role | portrait 9:16 | landscape 16:9 | square |
|------|---------------|----------------|--------|
| hero headline | 120–150 | 110–140 | 110–130 |
| headline | 90–110 | 80–100 | 80–100 |
| body / bullet | 56–70 | 48–60 | 50–64 |
| caption | 60–70 | 48–56 | 52–60 |
| minimum anything | 40 | 32 | 36 |

Max ~6 words per line in portrait, ~10 in landscape. Max 2 lines per scene for social.

## Manim equivalents

`BG, FG, ACCENT, ACCENT2, MUTED` constants; transition length → `run_time`
(calm 1.2–1.5, energetic 0.5–0.7, cinematic 2.0); bounce → `rate_func=rate_functions.ease_out_back`.
