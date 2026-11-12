---
description: Check and install everything motion-studio needs (FFmpeg, Node, Remotion, Manim, LaTeX, fonts)
argument-hint: "[remotion|manim|all]"
---

Set up the video toolchain. Scope: $ARGUMENTS (empty means all)

1. Run `bash "${CLAUDE_PLUGIN_ROOT}/scripts/check_env.sh"` and show the user the result.
2. For each missing piece in scope, propose the install command for this OS and run it after the
   user agrees (system package installs change their machine — ask first):

   | need | Linux (Debian/Ubuntu) | macOS (Homebrew) | Windows |
   |------|----------------------|------------------|---------|
   | FFmpeg | `sudo apt install -y ffmpeg` | `brew install ffmpeg` | `winget install Gyan.FFmpeg` |
   | Node 18+ | `nodesource` or `nvm install 22` | `brew install node` | `winget install OpenJS.NodeJS.LTS` |
   | Manim system libs | `sudo apt install -y libcairo2-dev libpango1.0-dev pkg-config python3-dev python3-venv` | `brew install cairo pango pkg-config` | not needed (wheels) |
   | Manim | `python3 -m venv ~/.venvs/manim && ~/.venvs/manim/bin/pip install -U pip setuptools wheel && ~/.venvs/manim/bin/pip install manim` | same | `py -m venv %USERPROFILE%\.venvs\manim` then `...\Scripts\pip install manim` |
   | LaTeX (MathTex) | `sudo apt install -y --no-install-recommends texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-science dvisvgm` | `brew install --cask mactex-no-gui` | MiKTeX |
   | Fonts (Hebrew/Arabic/CJK for Manim & subtitles) | `sudo apt install -y fonts-noto-core fonts-noto-cjk` | `brew install --cask font-noto-sans-hebrew font-noto-sans-arabic font-noto-sans-cjk` | Google Noto installers |

   Use a venv for Manim: system Pythons often refuse `pip install` (PEP 668) or fail building `srt`.
3. Remotion needs no global install: projects install it from the template. Warm the cache once with
   a test render of the template:
   `bash "${CLAUDE_PLUGIN_ROOT}/scripts/new_remotion_project.sh" /tmp/ms-test && bash "${CLAUDE_PLUGIN_ROOT}/scripts/render_remotion.sh" /tmp/ms-test Video-16x9 out/t.png --frame=60`
4. If Manim is in scope, render the template draft: copy `templates/manim-starter/scene.py` to a temp
   folder and run `manim -ql scene.py Explainer`.
5. Re-run `check_env.sh` and report what is ready and what is still missing.
