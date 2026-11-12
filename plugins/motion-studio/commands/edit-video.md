---
description: Edit an existing video — trim, join, reframe to 9:16, subtitles in any language, music, logo, speed, compress, GIF
argument-hint: "<file> <what to do>"
---

Edit video according to: $ARGUMENTS

Use the `video-editing` skill.
- Find the input file(s). If none is given or the path doesn't exist, list video files in the
  working directory and ask which one.
- Inspect it first (ffprobe + contact sheet) and look at the sheet.
- If the request is precise ("cut 0:10–0:20", "make it vertical"), do it directly. If it is
  creative ("make a reel out of this"), ask the brief questions from `video-director` first.
- Never overwrite the source; write to `out/`.
- Run `video-qa` on the result, fix, and report what changed.
