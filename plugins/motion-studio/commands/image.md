---
description: Create a still image — thumbnail, poster, story, social post, banner — with full Hebrew/Arabic/RTL support
argument-hint: "<what the image should show>"
---

Create an image for: $ARGUMENTS

Use the `image-design` skill: ask its 4 brief questions (one AskUserQuestion call, 4 options each,
recommended first, in the user's language) unless this image belongs to a video already briefed in
this conversation. Render with Remotion stills (or Manim for math diagrams), then QA the PNG by
looking at it at full and thumbnail size, fix, and deliver the file paths.
