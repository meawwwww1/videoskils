---
name: remotion-video
description: Build and render videos with Remotion (React). Use for motion graphics, kinetic typography, social shorts/reels, promos, logo reveals, animated charts, UI mockups, captions, and any text-heavy or multilingual (Hebrew/Arabic RTL, CJK) video; also for still images via `remotion still`. Normally entered from video-director after the brief; covers project setup, scene code, animation patterns, responsive multi-format layout, fonts and rendering.
---

# Remotion video

Remotion renders React components frame by frame in headless Chromium and encodes
them with FFmpeg. Everything that works in a browser works here: web fonts,
flexbox, SVG, CSS filters, complex-script shaping and bidirectional text.

## Setup

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/new_remotion_project.sh" videos/<slug>
```

This copies `templates/remotion-starter`, installs pinned dependencies and type-checks.
Template layout:

| file | purpose |
|------|---------|
| `src/Root.tsx` | one `<Composition>` per format (`Video-9x16`, `Video-16x9`, `Video-1x1`) + `<Still>`s |
| `src/Video.tsx` | **the video**: props, scene durations, scene components, `TransitionSeries` |
| `src/theme.ts` | `makeTheme()` — colors, font stack, easing, spring damping, transition length |
| `src/fonts.ts` | bundled fonts (Inter, Heebo, Noto Sans Arabic, Noto Sans JP), `detectDir()` |
| `src/components/KineticText.tsx` | word-by-word spring text, bidi-safe for mixed RTL/LTR |
| `src/components/Captions.tsx` | timed caption chunks above the bottom safe zone |
| `src/components/Background.tsx` | drifting gradient + light blob |
| `src/components/layout.ts` | `useLayout()` → `u()` responsive unit, orientation, safe zones |
| `src/Thumbnail.tsx` | static layout for thumbnails/posters |

Work from the template: replace the example scenes in `Video.tsx` with the storyboard
scenes, set the theme from the brief, and keep the helpers. Run `npx tsc --noEmit`
after edits; fix type errors before rendering.

## The rules that matter

1. **Everything is a function of `useCurrentFrame()`.** No `setTimeout`, no CSS
   `transition`/`animation`, no `Math.random()` (use `random("seed")` from remotion).
   Anything not derived from the frame flickers or differs between render workers.
2. **Animate with `spring()` and `interpolate()`**, always with
   `extrapolateLeft/Right: "clamp"` on `interpolate` unless you want overshoot.
3. **Sequences reset time.** Inside `<Sequence from={30}>` or a `TransitionSeries.Sequence`,
   `useCurrentFrame()` starts at 0. Write scenes as if they start at frame 0.
4. **Transitions overlap.** In `TransitionSeries`, total = sum(scenes) − sum(transitions).
   Keep `durationFor()` in `Video.tsx` in sync with the scenes or the end gets cut.
5. **Size with `u()`, never raw px.** `u(96)` is 96px on a 1080-short-side frame and
   scales for every format. Lay out with flexbox; switch layout by `orientation`
   (portrait: stack vertically, larger type; landscape: side-by-side).
6. **Respect safe zones** from `useLayout().safe` — on 9:16, app UI covers the top
   ~12% and bottom ~20%. No important text there.
7. **Assets** go in `public/` and are loaded with `staticFile("name.png")`.
   Use `<Img>`, `<OffthreadVideo>`, `<Audio>` from remotion (they wait for loading);
   plain `<img>`/`<video>` can render blank frames.
8. **Fonts must be loaded** before frames render. The template bundles fonts via
   `@fontsource/*` imports in `fonts.ts` (works offline). To add a family:
   `npm i @fontsource/<family>` and import the weights you use.

## Multilingual & RTL

Read `references/multilingual.md` before any non-English text. Short version:
set `dir` from `detectDir(text)`, use the language's font stack from `fonts.ts`,
never letter-space Arabic/Hebrew, mirror slide directions for RTL, and use
`KineticText` (it splits text into directional runs so English words and numbers
inside a Hebrew sentence keep their order).

## Animation patterns

`references/animation-patterns.md` has copy-ready code for: staggered word/letter
entrances, typewriter, counters, mask/clip reveals, animated SVG path drawing,
logo reveal, bar/line chart growth, progress bar, zoom-punch on beat, parallax,
3D card flip, and camera shake. Style presets (palette, fonts, easing, spring
damping, transition length per style and pacing) are in `references/style-presets.md`.

## Rendering

```bash
# video (repeat per format the brief asked for)
bash "${CLAUDE_PLUGIN_ROOT}/scripts/render_remotion.sh" videos/<slug> Video-9x16 out/<slug>_9x16.mp4
# pass new props without editing code
bash "${CLAUDE_PLUGIN_ROOT}/scripts/render_remotion.sh" videos/<slug> Video-16x9 out/<slug>_16x9.mp4 --props='{"title":"..."}'
# one frame for a quick look while iterating (much faster than a full render)
bash "${CLAUDE_PLUGIN_ROOT}/scripts/render_remotion.sh" videos/<slug> Video-9x16 out/check.png --frame=90
# transparent output for compositing
npx remotion render src/index.ts Video-16x9 out/overlay.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le
```

The wrapper retries with a local Chromium (`--browser-executable`) if Remotion
cannot download its headless shell. Defaults from `remotion.config.ts`: H.264,
CRF 18, yuv420p. Iterate with stills at key frames (scene midpoints and ends)
before doing full renders — it is the fastest feedback loop.

GIF/WebM: render the MP4, then `scripts/to_gif.sh` (keep GIFs ≤ 6 s and ≤ 720px
wide, or they get huge) or `scripts/to_webm.sh`.

## Embedding Manim or footage

Render the Manim scene (transparent `.mov` if it sits over a background), copy it
into `public/`, and place it with `<OffthreadVideo src={staticFile("math.mov")} />`
inside a `Sequence`. Match fps (30) and set the sequence duration to the clip length.

## Audio

Silent by default. If the user supplies audio, put it in `public/` and add
`<Audio src={staticFile("voice.mp3")} />` (optionally `volume={(f) => ...}` for ducking).
Re-check total duration against the audio length.

## Then

Hand every output file to the `video-qa` skill.
