#!/usr/bin/env bash
# VP9 WebM for the web (small, loops well). Add --alpha to keep transparency
# when the source is a ProRes 4444 / PNG sequence with alpha.
# Usage: to_webm.sh <in> <out.webm> [--alpha]
set -euo pipefail
in="${1:?input}"; out="${2:?output.webm}"
pix=yuv420p; [ "${3:-}" = "--alpha" ] && pix=yuva420p
ffmpeg -v error -y -i "$in" -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -pix_fmt "$pix" -an "$out"
echo "$out  $(du -h "$out" | cut -f1)"
