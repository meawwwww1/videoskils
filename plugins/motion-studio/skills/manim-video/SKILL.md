---
name: manim-video
description: Build and render math and technical animations with Manim Community (Python) — equations and derivations (LaTeX), geometry, function graphs, coordinate systems, vectors/matrices, algorithms and data structures, physics, proofs; in the style of 3Blue1Brown explainers. Use when a video needs formulas or precise mathematical objects; usually entered from video-director. Covers vertical 9:16 setup, RTL text, rendering and transparent output for compositing in Remotion.
---

# Manim video

## Setup

Run `/video-setup` if `manim` is missing. Manim lives best in its own venv:
`~/.venvs/manim/bin/manim` (the env check finds it there). `MathTex`/`Tex` also need
LaTeX (`latex` + `dvisvgm`); `Text` does not.

Start from the template:

```bash
mkdir -p videos/<slug> && cp "${CLAUDE_PLUGIN_ROOT}/templates/manim-starter/scene.py" videos/<slug>/
```

The template has the theme constants, a `fit_width()` helper, a portrait-frame
fix, and a full example (title → triangle → equation → `TransformMatchingTex` → takeaway).

## Rendering

```bash
cd videos/<slug>
M=${MANIM_BIN:-manim}   # or ~/.venvs/manim/bin/manim
$M -ql scene.py Explainer                       # draft: 480p15, seconds to render — iterate with this
$M -qh scene.py Explainer                       # 1920x1080 @30 (template forces 30fps)
$M -qh -r 1080,1920 scene.py Explainer          # 9:16 vertical  (-r is WIDTH,HEIGHT)
$M -qh -r 1080,1080 scene.py Explainer          # 1:1
$M -qh -t --format=mov scene.py Explainer       # transparent ProRes for Remotion overlay
$M -qh -s scene.py Explainer                    # save last frame as PNG (quick check / thumbnail)
```

Output: `media/videos/scene/<height>p<fps>/Explainer.mp4`. Copy finals to `out/<slug>_<ratio>.mp4`.

## Rules that matter

1. **Portrait needs a frame fix.** `-r 1080,1920` changes pixels but not Manim's
   14.2×8 unit frame, so everything renders tiny in a horizontal band. The template
   re-derives `config.frame_width/height` from the pixel aspect — keep that block.
   In portrait, stack vertically (`arrange(DOWN)`), use `fit_width()` on every wide
   object, and fill the height; don't leave the bottom half empty.
2. **Text vs math.** `Text()` / `MarkupText()` (Pango) for words in any language,
   including Hebrew/Arabic RTL — set `font=`. `MathTex()` for formulas only. Never put
   Hebrew/Arabic inside LaTeX.
3. **Split equations into parts** — `MathTex("a^2", "+", "b^2", "=", "c^2")` — so you
   can color parts (`eq[4].set_color(...)`) and morph with `TransformMatchingTex`.
4. **One idea per scene, hold the result.** `self.wait(1)` after every key reveal; a
   viewer needs time to read the formula.
5. **Keep inside the frame.** After positioning, everything must be within
   `config.frame_width/2 - 0.3` horizontally. QA will show cut-off labels.
6. **30 fps** for anything delivered to social/web (template sets `config.frame_rate = 30`).
7. **Deterministic**: no randomness without a fixed seed (`np.random.seed(0)`).
8. Long videos: one `Scene` class per storyboard scene, render each, then concatenate
   with FFmpeg (`video-editing` → concat recipe). Faster to fix one scene than re-render all.

## Cheat sheet

See `references/manim-cheatsheet.md` for: mobjects (shapes, axes, graphs, number
lines, tables, matrices, code blocks, arrows, braces), animations (Create, Write,
FadeIn/Out, Transform, ReplacementTransform, TransformMatchingTex, Indicate,
Circumscribe, LaggedStart, AnimationGroup), updaters and `ValueTracker`, camera moves
(`MovingCameraScene`), 3D (`ThreeDScene`), and rate functions.

## Compositing with Remotion

For a hybrid video (branded titles + math), render math scenes transparent
(`-t --format=mov`), copy them into the Remotion project's `public/`, and place them
with `<OffthreadVideo>` inside a `Sequence`. Or render on the theme background and
concatenate scenes with FFmpeg.

## Then

Hand every output file to `video-qa`.
