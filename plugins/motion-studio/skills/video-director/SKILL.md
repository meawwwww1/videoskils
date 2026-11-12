---
name: video-director
description: Orchestrates every video, animation, GIF or motion-graphics request from prompt to finished file. Use whenever the user asks to make, create, generate or animate a video, reel, short, TikTok, explainer, intro, outro, logo animation, kinetic typography, animated chart, math/physics animation or GIF — in any language (e.g. "תכין לי סרטון", "اصنع فيديو"). Runs the 8-question briefing, picks the engine (Remotion, Manim, FFmpeg or a hybrid), writes a storyboard, builds, renders, and hands off to video-qa. For editing existing footage use video-editing; for still images use image-design.
---

# Video Director

You are the director. You never jump straight into code. Every video goes through
five stages, in order:

1. **Brief** — ask the 8 questions (below). Mandatory.
2. **Plan** — choose the engine and write a storyboard.
3. **Build** — hand off to the engine skill (`remotion-video`, `manim-video`, `video-editing`).
4. **Render** — produce the final file(s) in every requested format.
5. **QA & fix** — run the `video-qa` skill; fix and re-render until it passes (max 3 loops).

## Stage 1 — The 8-question brief (mandatory)

Before writing any code, ask exactly 8 questions with the `AskUserQuestion` tool,
in **two calls of 4 questions** (the tool takes at most 4 per call). Every question
has **4 options**. The user can always pick "Other" and type their own answer.

Rules:
- Ask the questions in the user's language (Hebrew prompt → Hebrew questions).
  Keep option labels short (1–5 words) and put details in `description`.
- Read the prompt first and **put the option you infer from it first, marked
  "(Recommended)"**. The user should be able to accept everything with one click per question.
- Ask all 8 even when the prompt seems to answer some of them — the user wants to
  be sure. If the prompt states an answer outright, say so in the option's description
  ("you mentioned 9:16 in your prompt").
- If an answer comes back as free text, read it carefully: it may change the scope.
- Skip the brief only if the user explicitly says so ("no questions", "בלי שאלות",
  "just do it") or if this is a revision of a video already briefed in this conversation.

### Round 1 (one AskUserQuestion call)

| # | header | question | 4 options (adapt wording, keep the intent) |
|---|--------|----------|--------------------------------------------|
| 1 | Type | What kind of video is this? | Motion graphics / promo · Social short (reel/TikTok) · Explainer (math/tech) · Logo / intro / outro |
| 2 | Format | Which format and aspect ratio? (multiSelect: true) | 9:16 vertical 1080×1920 · 16:9 landscape 1920×1080 · 1:1 square 1080×1080 · GIF / WebM loop |
| 3 | Length | How long? | ≤ 10 s · 15–30 s · 30–60 s · 1–3 min |
| 4 | Style | Which visual style? | Clean modern minimal · Bold colorful energetic · Dark cinematic · Playful / hand-drawn |

### Round 2 (one AskUserQuestion call)

| # | header | question | 4 options |
|---|--------|----------|-----------|
| 5 | Language | What language is the on-screen text? | Hebrew (RTL) · English · Arabic (RTL) · Mixed / other |
| 6 | Text | How much on-screen text? | Kinetic captions throughout · Headlines per scene · Minimal (title + end card) · No text |
| 7 | Pacing | What pace and transitions? | Calm & smooth · Energetic & punchy · Cinematic slow reveals · Fast meme-style cuts |
| 8 | Colors | Colors and branding? | Auto palette matching the style · My brand colors (type them) · Monochrome + one accent · Neon / high contrast |

After the answers, write a **one-paragraph brief** back to the user (in their
language) and continue immediately. Don't ask for confirmation again.

## Stage 2 — Plan

### Engine routing

Pick the engine from the brief. State the choice and the reason in one line.

| Content | Engine | Why |
|---------|--------|-----|
| Kinetic typography, social shorts, promos, UI mockups, data/charts, logo reveals, captions, anything layout- or text-heavy | **Remotion** (`remotion-video`) | React + CSS: real web fonts, perfect RTL/complex-script shaping, flexbox layout, springs |
| Equations, geometry, function graphs, proofs, algorithms, physics, vector/matrix transforms | **Manim** (`manim-video`) | LaTeX, precise math objects, `Transform` morphing |
| Cutting, joining, captioning, reframing, speeding up or adding music to existing footage | **FFmpeg** (`video-editing`) | Fast, lossless where possible |
| Explainer with math *and* branded titles/captions | **Hybrid**: Manim renders the math scenes → Remotion composites them with titles, captions and transitions (`<OffthreadVideo>`), or FFmpeg concatenates the clips | Each engine does what it is best at |

When in doubt between Remotion and Manim: if there is a formula on screen, use Manim
for that scene. Otherwise use Remotion.

### Storyboard

Write `storyboard.md` in the project folder before building. One row per scene:

```
| # | time      | on screen                         | motion / transition        | text (exact)        |
|---|-----------|-----------------------------------|----------------------------|---------------------|
| 1 | 0.0–2.5s  | logo centered on gradient         | scale-in spring, glow      | —                   |
| 2 | 2.5–6.0s  | headline, 3 words stagger in      | slide-up 6f stagger        | "בונים את העתיד"    |
```

Timing guide (30 fps):
- Viewers need ~0.3 s per short word to read. A 6-word line needs ≥ 2 s on screen *after* it finishes animating in.
- Social shorts: hook in the first 1.5 s; cut or change something every 1.5–3 s.
- Explainers: one idea per scene; hold the final state ≥ 1 s before transitioning.
- Total of scene durations must equal the requested length (±0.5 s).

### Style tokens

Turn answers 4, 7 and 8 into a `theme` object used by every scene (colors, fonts,
easing, transition length). Presets live in `remotion-video/references/style-presets.md`
(also usable for Manim colors). Use the preset for the chosen style; replace its
colors with the user's brand colors when given.

### Language & fonts

Answer 5 decides fonts and direction. See `remotion-video/references/multilingual.md`.
Never render Hebrew, Arabic, CJK, Thai or Devanagari with a Latin-only font — the
glyphs come out as boxes (tofu). Mixed RTL+LTR lines must keep numbers and Latin
words in the right order.

### Audio

The plugin produces **silent videos by default**. Do not generate TTS or download
music. If the user provides an audio file (voice-over or music), mux it in:
Remotion `<Audio src={staticFile(...)}>` or the FFmpeg recipe in `video-editing`.
Keep scene timing in `storyboard.md` so audio can be added later — the companion
app will plug in any voice API at that point.

## Stage 3 — Build

Project location: create one folder per video, `videos/<slug>/` relative to the
current working directory unless the user says otherwise. Keep `storyboard.md`,
the source code and the renders (`out/`) together so the video can be revised later.

Hand off to the engine skill and follow it:
- Remotion → `remotion-video` (start from the bundled template via `scripts/new_remotion_project.sh`)
- Manim → `manim-video`
- Editing → `video-editing`

## Stage 4 — Render

- Render every format chosen in question 2. Design for each aspect ratio — don't
  just crop. In Remotion, register one `<Composition>` per format and lay out with
  the `useVideoConfig()` width/height.
- Default output: H.264 MP4, `yuv420p`, 30 fps, AAC audio only if there is audio.
- GIF/WebM: render the MP4 first, then convert with `scripts/to_gif.sh` / the WebM recipe.
- Name files `<slug>_<ratio>.mp4`, e.g. `launch_9x16.mp4`.

## Stage 5 — QA & fix

Run the `video-qa` skill on every output file. It runs the automated checks, builds
contact sheets, and has you look at them. Fix every issue it finds, re-render and
re-run QA. Stop after 3 loops and report anything that is still wrong instead of hiding it.

## Delivery

Finish with a short report in the user's language:
- the output file paths (and send them with the file-sending tool if one is available),
- engine used, duration, resolution per file,
- what QA checked and anything it could not fix,
- one line on how to revise ("tell me which scene to change").
