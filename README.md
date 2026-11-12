# videoskils — Motion Studio plugin for Claude Code

פלאגין ליצירת סרטונים, אנימציות ותמונות מפרומפט — עם שאלות הכנה, בחירת מנוע אוטומטית,
תמיכה מלאה בעברית/ערבית (RTL) ובכל שפה, ובדיקת איכות אוטומטית שמתקנת לפני מסירה.

A Claude Code plugin that turns a prompt into a finished video, animation or image.

## Install

```
/plugin marketplace add meawwwww1/videoskils
/plugin install motion-studio@videoskils
/video-setup
```

## Commands

| command | what it does |
|---------|--------------|
| `/video <prompt>` | 8 briefing questions → storyboard → build → render → auto-QA & fix |
| `/edit-video <file> <instructions>` | trim, join, 16:9→9:16, subtitles (any language), music, logo, speed, compress, GIF |
| `/image <prompt>` | thumbnails, posters, stories, posts, banners |
| `/video-setup` | checks and installs FFmpeg, Node, Manim, LaTeX, fonts |

Skills also trigger on their own ("תכין לי סרטון על…", "make a reel about…").

## How it works

```
prompt ─► video-director ─► 8 questions (type, format, length, style, language, text, pacing, colors)
                         ─► engine routing
                              ├─ remotion-video   motion graphics, social, kinetic text, RTL, images
                              ├─ manim-video      math & technical explainers (LaTeX)
                              └─ video-editing    FFmpeg on existing footage
                         ─► render (9:16 / 16:9 / 1:1 / GIF / WebM)
                         ─► video-qa: specs, black/frozen frames, contact sheet,
                             10-point visual checklist ─► fix ─► re-render (≤3 loops)
```

Videos are silent by default; drop in any audio file (voice-over or music) and the
skills mux it in.

## Layout

```
.claude-plugin/marketplace.json
plugins/motion-studio/
  .claude-plugin/plugin.json
  commands/            video, edit-video, image, video-setup
  skills/
    video-director/    brief, routing, storyboard, delivery
    remotion-video/    + references: animation-patterns, multilingual, style-presets
    manim-video/       + references: manim-cheatsheet
    video-editing/     FFmpeg recipes
    image-design/      stills, thumbnails, posters
    video-qa/          QA checklist and fix loop
  scripts/             check_env, new_remotion_project, render_remotion, qa_video.py, to_gif, to_webm
  templates/
    remotion-starter/  React/Remotion project: 3 formats, kinetic RTL-safe text, captions, transitions, stills
    manim-starter/     Manim scene with portrait fix, Hebrew text, equation morphing
```

## Requirements

FFmpeg, Node 18+, Python 3.10+. Manim and LaTeX only for math videos. Run `/video-setup`.
