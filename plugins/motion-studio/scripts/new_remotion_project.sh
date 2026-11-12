#!/usr/bin/env bash
# Creates a new Remotion video project from the bundled template.
# Usage: new_remotion_project.sh <target-dir>
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tpl="$here/../templates/remotion-starter"
target="${1:?usage: new_remotion_project.sh <target-dir>}"
if [ -e "$target/package.json" ]; then
  echo "exists: $target/package.json — not overwriting" >&2; exit 1
fi
mkdir -p "$target"
# Copy everything except build output
(cd "$tpl" && tar --exclude=node_modules --exclude=out -cf - .) | (cd "$target" && tar -xf -)
cd "$target"
npm install --no-audit --no-fund --loglevel=error
npx tsc --noEmit && echo "ready: $target  (edit src/Video.tsx, then render)"
