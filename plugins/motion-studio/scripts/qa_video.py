#!/usr/bin/env python3
"""Automated QA for a rendered video. Stdlib only; needs ffmpeg + ffprobe.

Checks technical specs, black frames and frozen stretches, then writes:
  <outdir>/contact_sheet.png   grid of frames with timestamps (look at it!)
  <outdir>/frame_first.png, frame_last.png, frame_<t>.png for --at times
  <outdir>/qa_report.json

Usage:
  qa_video.py out/video_9x16.mp4 --width 1080 --height 1920 --duration 9 --fps 30
  qa_video.py out/clip.mp4 --at 2.5 6.0 --cols 4 --rows 3
Exit code: 0 = pass (warnings allowed), 1 = errors found, 2 = could not run.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(path):
    r = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path])
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or "ffprobe failed")
    return json.loads(r.stdout)


def fraction(s):
    try:
        n, d = s.split("/")
        return float(n) / float(d) if float(d) else 0.0
    except (ValueError, AttributeError):
        return 0.0


def detect(path, vf, pattern):
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vf", vf, "-an", "-f", "null", "-"])
    return re.findall(pattern, r.stderr)


def frame_at(path, t, out, width=None):
    vf = ["-vf", f"scale={width}:-2"] if width else []
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1", *vf, out])
    return os.path.exists(out)


def contact_sheet(path, duration, out, cols, rows, tile_w):
    n = cols * rows
    fps = n / max(duration, 0.1)
    font = next((f for f in FONT_CANDIDATES if os.path.exists(f)), None)
    label = ""
    if font:
        label = (
            f",drawtext=fontfile='{font}':text='%{{pts\\:hms}}':x=8:y=8:fontsize=22:"
            "fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6"
        )
    vf = f"fps={fps:.5f},scale={tile_w}:-2{label},tile={cols}x{rows}:padding=6:margin=6:color=gray"
    r = run(["ffmpeg", "-y", "-v", "error", "-i", path, "-vf", vf, "-frames:v", "1", out])
    return r.returncode == 0 and os.path.exists(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--width", type=int)
    ap.add_argument("--height", type=int)
    ap.add_argument("--duration", type=float, help="expected seconds (±0.5s tolerance)")
    ap.add_argument("--fps", type=float)
    ap.add_argument("--expect-audio", action="store_true", help="error if there is no audio stream")
    ap.add_argument("--at", type=float, nargs="*", default=[], help="extra timestamps to export full frames")
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--rows", type=int, default=3)
    ap.add_argument("--freeze-sec", type=float, default=2.5, help="warn on static stretches longer than this")
    ap.add_argument("--outdir", help="default: <video dir>/qa_<video name>")
    a = ap.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("ffmpeg/ffprobe not found — run /video-setup", file=sys.stderr)
        sys.exit(2)
    if not os.path.exists(a.video):
        print(f"no such file: {a.video}", file=sys.stderr)
        sys.exit(2)

    base = os.path.splitext(os.path.basename(a.video))[0]
    outdir = a.outdir or os.path.join(os.path.dirname(os.path.abspath(a.video)), f"qa_{base}")
    os.makedirs(outdir, exist_ok=True)

    errors, warnings = [], []
    info = probe(a.video)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    audio = [s for s in info["streams"] if s["codec_type"] == "audio"]
    if not v:
        print("no video stream", file=sys.stderr)
        sys.exit(1)

    w, h = int(v["width"]), int(v["height"])
    fps = fraction(v.get("avg_frame_rate") or v.get("r_frame_rate", "0/1"))
    dur = float(info["format"].get("duration") or v.get("duration") or 0)
    codec, pix = v.get("codec_name"), v.get("pix_fmt")
    is_gif = codec == "gif"

    if a.width and w != a.width:
        errors.append(f"width {w} != expected {a.width}")
    if a.height and h != a.height:
        errors.append(f"height {h} != expected {a.height}")
    if a.duration and abs(dur - a.duration) > 0.5:
        errors.append(f"duration {dur:.2f}s != expected {a.duration:.2f}s")
    if a.fps and abs(fps - a.fps) > 0.5:
        errors.append(f"fps {fps:.2f} != expected {a.fps}")
    if w % 2 or h % 2:
        errors.append(f"odd dimensions {w}x{h} (H.264 needs even sizes)")
    if codec == "h264" and pix != "yuv420p":
        errors.append(f"pix_fmt {pix}: use yuv420p or it won't play on phones/QuickTime")
    if a.expect_audio and not audio:
        errors.append("no audio stream but audio was expected")
    if dur < 0.5:
        errors.append(f"video is only {dur:.2f}s long")

    blacks = [] if is_gif else detect(
        a.video, "blackdetect=d=0.3:pix_th=0.08", r"black_start:([\d.]+) black_end:([\d.]+)"
    )
    for s, e in blacks:
        s, e = float(s), float(e)
        msg = f"black frames {s:.2f}s–{e:.2f}s"
        # A short fade at the very start or end is fine; anything else is a bug.
        (warnings if (s < 0.05 and e < 0.6) or (e > dur - 0.6 and e - s < 0.6) else errors).append(msg)

    freezes = [] if is_gif else detect(
        a.video,
        f"freezedetect=n=0.001:d={a.freeze_sec}",
        r"freeze_start: ([\d.]+)[\s\S]*?freeze_end: ([\d.]+)",
    )
    for s, e in freezes:
        warnings.append(f"static picture {float(s):.2f}s–{float(e):.2f}s (intended hold? else add motion)")

    sheet = os.path.join(outdir, "contact_sheet.png")
    tile_w = 360 if h > w else 480
    if not contact_sheet(a.video, dur, sheet, a.cols, a.rows, tile_w):
        warnings.append("could not build contact sheet")

    frames = {}
    for name, t in [("first", 0.05), ("last", max(0, dur - 0.1))] + [(f"{t:g}s", t) for t in a.at]:
        p = os.path.join(outdir, f"frame_{name}.png")
        if frame_at(a.video, t, p, width=min(w, 1080)):
            frames[name] = p

    report = {
        "file": os.path.abspath(a.video),
        "width": w, "height": h, "fps": round(fps, 3), "duration": round(dur, 3),
        "codec": codec, "pix_fmt": pix, "audio_streams": len(audio),
        "size_mb": round(os.path.getsize(a.video) / 1e6, 2),
        "errors": errors, "warnings": warnings,
        "contact_sheet": sheet if os.path.exists(sheet) else None,
        "frames": frames,
        "status": "FAIL" if errors else "PASS",
    }
    with open(os.path.join(outdir, "qa_report.json"), "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"{report['status']}  {os.path.basename(a.video)}  {w}x{h} {fps:.2f}fps {dur:.2f}s {codec}/{pix} "
          f"audio={len(audio)} {report['size_mb']}MB")
    for e in errors:
        print(f"  ERROR   {e}")
    for x in warnings:
        print(f"  WARN    {x}")
    print(f"  sheet   {report['contact_sheet']}")
    for k, p in frames.items():
        print(f"  frame   {k}: {p}")
    print("  NEXT    Read the contact sheet and frames and run the visual checklist (video-qa skill).")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as exc:
        print(f"QA could not run: {exc}", file=sys.stderr)
        sys.exit(2)
