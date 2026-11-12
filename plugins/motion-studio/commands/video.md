---
description: Create a video or animation from a prompt — 8-question brief, engine choice (Remotion / Manim / FFmpeg), storyboard, render, auto-QA and fix
argument-hint: "<what the video should be about>"
---

Make a video for this request: $ARGUMENTS

Use the `video-director` skill and follow all five stages in order:
1. Brief — ask the 8 questions with AskUserQuestion (two calls × 4 questions, 4 options each,
   recommended option first, in the language of the request). If the request above is empty,
   first ask in one line what the video is about.
2. Plan — pick the engine, write `storyboard.md`.
3. Build — with `remotion-video` and/or `manim-video`.
4. Render — every format chosen in the brief.
5. QA — run `video-qa`, fix and re-render until it passes (max 3 loops).

Deliver the file paths and a short report in the user's language.
