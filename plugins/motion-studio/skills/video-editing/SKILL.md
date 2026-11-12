---
name: video-editing
description: Edit existing video and audio files with FFmpeg — trim, cut, join/concatenate, reframe 16:9 to 9:16, resize, change speed, burn in multilingual subtitles (RTL-safe via libass), add/replace/duck music, add logo/watermark overlays, fades, freeze frames, picture-in-picture, extract audio or frames, compress for WhatsApp/Instagram/web, and convert to GIF/WebM. Use when the user supplies footage ("ערוך לי את הסרטון", "cut this clip", "make this vertical") or to post-process renders from Remotion/Manim.
---

# Video editing (FFmpeg)

## Workflow

1. **Inspect first** — never edit blind:
   ```bash
   ffprobe -v error -show_entries format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate,pix_fmt,channels -of compact input.mp4
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/qa_video.py" input.mp4 --outdir /tmp/look   # contact sheet of the source
   ```
   Look at the contact sheet to understand content (where the subject is, where cuts belong).
2. Ask the 8-question brief only when creating something new from the footage
   (e.g. "make a reel from this"). For a precise instruction ("cut 0:10–0:20") just do it.
3. **Never overwrite the input.** Write to `out/<name>_<edit>.mp4`.
4. Re-encode with `-c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart`
   unless the recipe says stream copy (`-c copy`, lossless but cuts only on keyframes).
5. Run `video-qa` on the result.

## Recipes

```bash
# Trim (frame-accurate; -ss after -i is exact, before -i is fast)
ffmpeg -i in.mp4 -ss 00:00:10 -to 00:00:20 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4
# Trim losslessly (snaps to keyframes)
ffmpeg -ss 10 -i in.mp4 -t 10 -c copy out.mp4

# Concatenate clips with identical codecs/size/fps
printf "file '%s'\n" a.mp4 b.mp4 c.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
# Concatenate different sources (normalize first)
ffmpeg -i a.mp4 -i b.mp4 -filter_complex \
 "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];\
  [1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1];\
  [v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4
# Crossfade between two clips (offset = duration of first clip − fade)
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5,format=yuv420p" -an out.mp4

# 16:9 → 9:16, center crop
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out.mp4
# 16:9 → 9:16, blurred background fill (keeps the whole frame)
ffmpeg -i in.mp4 -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:2[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p" -c:a copy out.mp4

# Speed: 2x (video + audio), 0.5x slow motion
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" out.mp4
ffmpeg -i in.mp4 -vf "setpts=2.0*PTS,minterpolate=fps=30" -an out.mp4

# Fade in/out (video + audio). st = start second
ffmpeg -i in.mp4 -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=9.5:d=0.5" -af "afade=t=in:d=0.5,afade=t=out:st=9.5:d=0.5" out.mp4

# Logo / watermark, top-right, 15% of video width (scale2ref sizes the logo relative to the video)
ffmpeg -i in.mp4 -i logo.png -filter_complex "[1][0]scale2ref=w=main_w*0.15:h=ow/mdar[l][v];[v][l]overlay=W-w-W*0.04:H*0.04" -c:a copy out.mp4
# (fixed width) -filter_complex "[1]scale=200:-1[l];[0][l]overlay=W-w-40:40"
# Picture-in-picture
ffmpeg -i main.mp4 -i cam.mp4 -filter_complex "[1]scale=iw/4:-1[p];[0][p]overlay=W-w-40:H-h-40" out.mp4

# Subtitles burned in (any language, RTL-safe — libass shapes Hebrew/Arabic)
ffmpeg -i in.mp4 -vf "subtitles=subs.srt:force_style='FontName=Noto Sans Hebrew,FontSize=14,Bold=1,Outline=2,Shadow=0,MarginV=60,Alignment=2'" -c:a copy out.mp4
# Soft subtitles (toggleable track, no re-encode)
ffmpeg -i in.mp4 -i subs.srt -c copy -c:s mov_text -metadata:s:s:0 language=heb out.mp4

# Audio: add music under silent video, trimmed to video length, fade out
ffmpeg -i video.mp4 -i music.mp3 -filter_complex "[1:a]afade=t=out:st=9:d=1[m]" -map 0:v -map "[m]" -c:v copy -c:a aac -shortest out.mp4
# Audio: voice-over + music ducked under the voice
ffmpeg -i video.mp4 -i voice.wav -i music.mp3 -filter_complex \
 "[2:a]volume=0.35[m];[m][1:a]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[duck];[duck][1:a]amix=inputs=2:duration=first[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac out.mp4
# Normalize loudness to -14 LUFS (social platforms)
ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy out.mp4
# Remove audio / extract audio
ffmpeg -i in.mp4 -an -c:v copy silent.mp4
ffmpeg -i in.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3

# Freeze last frame for 2 s (end card hold)
ffmpeg -i in.mp4 -vf "tpad=stop_mode=clone:stop_duration=2" -af "apad=pad_dur=2" out.mp4
# Extract frames: one per second / a single frame
ffmpeg -i in.mp4 -vf fps=1 frames/%04d.png
ffmpeg -ss 3.5 -i in.mp4 -frames:v 1 frame.png
# Image sequence → video
ffmpeg -framerate 30 -i frames/%04d.png -c:v libx264 -pix_fmt yuv420p out.mp4

# Compress: WhatsApp/Telegram friendly (~720p) / web
ffmpeg -i in.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart small.mp4
# Two-pass to a target size (e.g. 8 MB for a 30 s clip → ~2100 kbps video)
```

GIF / WebM: `bash ${CLAUDE_PLUGIN_ROOT}/scripts/to_gif.sh in.mp4 out.gif 720 15`, `bash ${CLAUDE_PLUGIN_ROOT}/scripts/to_webm.sh in.mp4 out.webm`.

## Smart edits that need looking

- **Scene/cut detection**: `ffmpeg -i in.mp4 -vf "select='gt(scene,0.35)',showinfo" -f null - 2>&1 | grep pts_time`
- **Silence detection** (to cut dead air): `ffmpeg -i in.mp4 -af silencedetect=n=-35dB:d=0.6 -f null - 2>&1 | grep silence_`
- **Subject position for reframing**: look at the contact sheet; if the subject is off-center,
  shift the crop `x` (e.g. `crop=ih*9/16:ih:iw*0.6-ih*9/32:0`) or keyframe it per segment.

## Subtitles file format

SRT, UTF-8, short chunks (≤ 42 chars, ≤ 2 lines, 1–3 s each):
```
1
00:00:00,000 --> 00:00:02,200
ככה עושים סרטון

2
00:00:02,200 --> 00:00:04,000
בשלושה צעדים
```
For styled/animated captions (word highlight, pop), build them in Remotion over the
footage with `<OffthreadVideo>` + `Captions` instead.
