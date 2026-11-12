#!/usr/bin/env bash
# Reports which video tools are installed. Exit 0 always; read the table.
# Usage: check_env.sh            (human table)
ok()   { printf "  \033[32m✔\033[0m %-14s %s\n" "$1" "$2"; }
miss() { printf "  \033[31m✘\033[0m %-14s %s\n" "$1" "$2"; }
ver()  { "$@" 2>/dev/null | head -1; }

echo "motion-studio environment check"
echo "Core (needed for everything):"
command -v ffmpeg  >/dev/null && ok ffmpeg  "$(ver ffmpeg -version | cut -d' ' -f1-3)"  || miss ffmpeg  "install: apt install ffmpeg | brew install ffmpeg | winget install ffmpeg"
command -v ffprobe >/dev/null && ok ffprobe "found" || miss ffprobe "ships with ffmpeg"
command -v python3 >/dev/null && ok python3 "$(ver python3 --version)" || miss python3 "install Python 3.10+"

echo "Remotion (motion graphics, social, images):"
if command -v node >/dev/null; then
  major=$(node -v | sed 's/v\([0-9]*\).*/\1/')
  [ "$major" -ge 18 ] && ok node "$(node -v)" || miss node "$(node -v) — need Node 18+"
else miss node "install Node.js 18+ (https://nodejs.org)"; fi
command -v npx >/dev/null && ok npx "found" || miss npx "ships with Node.js"

echo "Manim (math / technical explainers):"
MANIM="${MANIM_BIN:-}"
[ -z "$MANIM" ] && command -v manim >/dev/null && MANIM=$(command -v manim)
[ -z "$MANIM" ] && [ -x "$HOME/.venvs/manim/bin/manim" ] && MANIM="$HOME/.venvs/manim/bin/manim"
[ -n "$MANIM" ] && ok manim "$MANIM ($("$MANIM" --version 2>/dev/null | head -1))" || miss manim "see /video-setup (python venv + pip install manim)"
command -v latex   >/dev/null && ok latex   "found (MathTex works)" || miss latex "needed only for MathTex/Tex formulas"
command -v dvisvgm >/dev/null && ok dvisvgm "found" || miss dvisvgm "ships with TeX Live"
pkg-config --exists pangocairo 2>/dev/null && ok pangocairo "found" || echo "  ·  pangocairo     (only needed to build manim from source; skip if manim is installed)"

echo "Fonts for multilingual text (Manim/FFmpeg use system fonts; Remotion bundles its own):"
for f in "Noto Sans Hebrew" "Noto Sans Arabic" "Noto Sans CJK" "DejaVu Sans"; do
  fc-list 2>/dev/null | grep -qi "$f" && ok "${f// /_}" "installed" || miss "${f// /_}" "install Noto fonts: apt install fonts-noto-core fonts-noto-cjk (Linux) or fonts.google.com/noto"
done

echo "Browser for Remotion: Remotion downloads its own headless shell on first render."
for b in "${REMOTION_BROWSER:-}" /opt/pw-browsers/chromium /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome; do
  [ -n "$b" ] && [ -x "$b" ] && { ok browser "fallback available: $b"; break; }
done
exit 0
