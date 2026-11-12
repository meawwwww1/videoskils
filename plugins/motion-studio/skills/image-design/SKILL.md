---
name: image-design
description: Create still images — YouTube thumbnails, posters, social posts and stories, covers, banners, quote cards, infographics, title cards and video frames — rendered as PNG/JPG with Remotion stills (React + CSS, full multilingual/RTL support) or Manim for math diagrams. Use when the user asks for an image, תמונה, thumbnail, poster, פוסט or cover, or needs a matching thumbnail for a video made with this plugin.
---

# Image design

Images use the same engines as video, so a thumbnail matches its video exactly.

## Brief (4 questions)

Ask **one** `AskUserQuestion` call with 4 questions, 4 options each, recommended
option first (infer from the prompt), in the user's language:

| header | question | options |
|--------|----------|---------|
| Format | Which size? (multiSelect) | YouTube thumbnail 1280×720 · Story / poster 1080×1920 · Square post 1080×1080 · Wide banner 1500×500 |
| Style | Visual style? | Clean modern · Bold colorful · Dark cinematic · Playful |
| Language | Text language? | Hebrew (RTL) · English · Arabic (RTL) · Mixed / other |
| Colors | Colors? | Auto from style · My brand colors · Monochrome + accent · Neon / high contrast |

If the image belongs to a video made in this conversation, skip the questions and
reuse that video's brief and theme.

## Build

**Remotion (default)** — use the video's project or create one with
`scripts/new_remotion_project.sh`. Add a `<Still id=... width height component defaultProps>`
in `Root.tsx` (the template has `Thumb-16x9`, `Poster-9x16`, `Post-1x1` using
`Thumbnail.tsx`). Write a dedicated component per design; reuse `theme`, `fonts`,
`useLayout()`.

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/render_remotion.sh" videos/<slug> Thumb-16x9 out/<slug>_thumb.png
# from a video frame instead:
bash "${CLAUDE_PLUGIN_ROOT}/scripts/render_remotion.sh" videos/<slug> Video-16x9 out/<slug>_frame.png --frame=120
# JPG for upload limits
npx remotion still src/index.ts Thumb-16x9 out/thumb.jpg --image-format=jpeg --jpeg-quality=90
```

**Manim** for math diagrams: `manim -qh -s scene.py Diagram` saves the last frame as PNG.

**Photos/assets**: put user images in `public/` and use `<Img src={staticFile(...)}/>`
with `objectFit: "cover"`.

## Design rules

- **Thumbnail**: ≤ 5 words, text ≥ 12% of image height, one focal subject, high contrast,
  no important content in the bottom-right (YouTube timestamp). Must read at 320px wide.
- **Story / poster**: keep text inside the 9:16 safe zones (top 12%, bottom 20%).
- **Square post**: one message; text inside the central 80%.
- **Hierarchy**: one hero element, one supporting line, one CTA/brand mark. Max 3 type sizes.
- **Contrast**: text over photos gets a gradient scrim or solid box.
- **RTL**: see `remotion-video/references/multilingual.md` — the layout mirrors (logo
  top-left becomes top-right) except logos and photos themselves.

## Then

QA with `video-qa` (image section): Read the PNG, check it, view it small, fix, re-render.
