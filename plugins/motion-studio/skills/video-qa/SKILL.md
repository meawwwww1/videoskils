---
name: video-qa
description: Quality-check a rendered or edited video (or GIF/image) before delivering it, then fix and re-render. Runs automated checks (resolution, fps, duration, codec, pix_fmt, black frames, frozen stretches), builds a timestamped contact sheet and key frames, and walks a visual checklist (text overflow, safe zones, RTL order, tofu glyphs, contrast, timing). Use after every render from video-director, remotion-video, manim-video, video-editing or image-design, and whenever the user asks to check or review a video.
---

# Video QA

A video is not done until it has passed QA. Looking at frames catches problems that
code review never will: text cut off in 9:16, Hebrew words in the wrong order, a
blank first second, a label hidden behind a caption.

## 1. Automated checks

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/qa_video.py" out/<file>.mp4 \
  --width 1080 --height 1920 --fps 30 --duration 15 \
  --at 2.5 6.0 11.2        # storyboard scene midpoints / ends
```

Pass the expected values from the brief. Add `--expect-audio` when the user gave
audio. Use `--at` for the moment each scene is fully on screen (mid-scene) and the
last frame of each scene. Exit code 1 = errors that must be fixed.

The script prints `ERROR` (must fix), `WARN` (judge it), and the paths of the contact
sheet and frames.

- `static picture` warnings: fine for an intended hold (end card, formula on screen
  for reading). Not fine in a social short longer than ~2.5 s — add motion (slow push-in,
  drifting background, pulsing accent). The detector misses small moving areas, so
  check the frames before "fixing" it.
- `black frames` mid-video = a gap between sequences, a missing asset, or a scene that
  ends early. Short fades at the very start/end are allowed.

## 2. Look at the frames (mandatory)

Open the contact sheet and every `frame_*.png` with the Read tool and check each item.
Write the result as a short table (item → ok / problem + timestamp).

| # | check | what goes wrong |
|---|-------|-----------------|
| 1 | **Text fits** | words cut at frame edges, lines overflowing boxes, 9:16 text too wide |
| 2 | **Safe zones** | text in the top 12% / bottom 20% of a 9:16 (covered by app UI) |
| 3 | **Script & glyphs** | □ tofu boxes, wrong font fallback, broken Arabic joining |
| 4 | **RTL order** | Hebrew/Arabic words reversed, English inside Hebrew reversed, punctuation on the wrong side, numbers flipped |
| 5 | **Exact text** | typos, wrong numbers vs the storyboard, leftover template text ("Motion Studio" example) |
| 6 | **Readability** | contrast too low, text smaller than the type-scale minimum, busy background behind text |
| 7 | **Overlap** | elements colliding, captions covering key visuals, labels on top of each other |
| 8 | **Composition** | content squeezed in one band (classic Manim portrait bug), large empty areas, off-center by accident |
| 9 | **Timing** | text visible too briefly to read (≥ 0.3 s per word after it lands), scene cut before its animation finishes, first frame empty for > 0.5 s, last frame not a clean end card |
| 10 | **Brief match** | style, colors, language, pacing and format are what the user chose |

For timing, compare contact-sheet timestamps with `storyboard.md`. When something
looks off between two tiles, render or extract a frame at that exact time.

## 3. Fix loop

For each problem: fix the source (scene code, props, filter), re-render **only what
changed** when possible (single still with `--frame`, single Manim scene, `-ql` draft),
then run the full render and QA again.

- Max **3 loops**. If something still fails, deliver anyway and state exactly what
  is wrong and why it wasn't fixed. Never claim a check passed that you didn't look at.
- Keep the QA folder (`qa_<name>/`) — it is useful for the user and for revisions.

## 4. Report

In the delivery message, one line per output: `✔ launch_9x16.mp4 — 1080×1920, 30fps, 15.0s, all 10 visual checks ok`
or list the remaining issues. Mention fixes you made during QA in one line ("fixed: title
overflow in 9:16, Hebrew/English order in scene 3").

## Images

For stills (`image-design`), skip the script; Read the PNG directly and run checks
1–8 and 10. Also view it at small size for thumbnails:
`ffmpeg -i thumb.png -vf scale=320:-1 /tmp/thumb_small.png` — it must still read.
