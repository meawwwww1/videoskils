#!/usr/bin/env bash
# Renders a Remotion composition, with an automatic browser fallback for offline
# sandboxes where Remotion cannot download its headless shell.
# Usage: render_remotion.sh <project-dir> <CompositionId> <out-file> [extra remotion args...]
#   render_remotion.sh videos/launch Video-9x16 out/launch_9x16.mp4
#   render_remotion.sh videos/launch Video-9x16 out/frame.png --frame=45   (still)
set -uo pipefail
dir="${1:?project dir}"; comp="${2:?composition id}"; out="${3:?output file}"; shift 3
cd "$dir"
cmd=render
case "$out" in *.png|*.jpg|*.jpeg|*.webp) cmd=still ;; esac
if npx remotion "$cmd" src/index.ts "$comp" "$out" "$@"; then exit 0; fi
echo "first attempt failed — retrying with a local Chromium" >&2
for b in "${REMOTION_BROWSER:-}" /opt/pw-browsers/chromium /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
  if [ -n "$b" ] && [ -x "$b" ]; then
    exec npx remotion "$cmd" src/index.ts "$comp" "$out" --browser-executable="$b" "$@"
  fi
done
echo "no usable browser found; set REMOTION_BROWSER=/path/to/chrome" >&2
exit 1
