#!/usr/bin/env bash
# High-quality GIF via a generated palette (no banding/dither mess).
# Usage: to_gif.sh <in.mp4> <out.gif> [width=720] [fps=15]
set -euo pipefail
in="${1:?input}"; out="${2:?output.gif}"; w="${3:-720}"; fps="${4:-15}"
pal="$(mktemp -t palXXXX).png"
ffmpeg -v error -y -i "$in" -vf "fps=$fps,scale=$w:-1:flags=lanczos,palettegen=stats_mode=diff" "$pal"
ffmpeg -v error -y -i "$in" -i "$pal" -lavfi "fps=$fps,scale=$w:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "$out"
rm -f "$pal"
echo "$out  $(du -h "$out" | cut -f1)"
