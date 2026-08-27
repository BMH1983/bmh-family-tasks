#!/usr/bin/env python3
"""Extract keyframes (with timestamps) and audio from a screen recording.

Usage:
    python3 extract_frames.py VIDEO [--outdir DIR] [--mode auto|scene|interval]
                              [--interval SECONDS] [--threshold 0.10]
                              [--max-frames 80] [--width 1280] [--no-audio]

Outputs (in --outdir, default: <video name>_capture/):
    frames/frame_NNNN_t<seconds>s.png   keyframes, ordered, timestamped
    frames_index.json                   [{file, seconds, timecode}, ...]
    audio.wav                           16 kHz mono audio (for transcription)

Needs ffmpeg. If it isn't installed, falls back to the imageio-ffmpeg
Python package's bundled binary; if neither is present it prints install
instructions and exits.
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


def find_ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    sys.exit(
        "ffmpeg not found. Fix with ONE of:\n"
        "  pip install imageio-ffmpeg     (easiest, no admin rights)\n"
        "  winget install ffmpeg          (Windows)\n"
        "  brew install ffmpeg            (Mac)\n"
        "  sudo apt-get install ffmpeg    (Linux)"
    )


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, errors="replace")


def video_duration(ffmpeg, video):
    """Parse duration from ffmpeg -i output (avoids needing ffprobe)."""
    proc = run([ffmpeg, "-i", str(video)])
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", proc.stderr)
    if not m:
        sys.exit(f"Could not read duration of {video} - is it a valid video file?")
    h, mnt, s = m.groups()
    return int(h) * 3600 + int(mnt) * 60 + float(s)


def timecode(seconds):
    m, s = divmod(int(round(seconds)), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def extract(ffmpeg, video, frames_dir, vf):
    """Run an extraction pass; return list of pts timestamps parsed from showinfo."""
    for old in frames_dir.glob("*.png"):
        old.unlink()
    proc = run([
        ffmpeg, "-hide_banner", "-i", str(video),
        "-vf", vf, "-vsync", "vfr",
        str(frames_dir / "raw_%04d.png"),
    ])
    return [float(t) for t in re.findall(r"pts_time:\s*([0-9.]+)", proc.stderr)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--outdir")
    ap.add_argument("--mode", choices=["auto", "scene", "interval"], default="auto")
    ap.add_argument("--interval", type=float, default=None,
                    help="seconds between frames in interval mode")
    ap.add_argument("--threshold", type=float, default=0.10,
                    help="scene-change sensitivity (lower = more frames)")
    ap.add_argument("--max-frames", type=int, default=80)
    ap.add_argument("--width", type=int, default=1280)
    ap.add_argument("--no-audio", action="store_true")
    args = ap.parse_args()

    video = Path(args.video)
    if not video.exists():
        sys.exit(f"File not found: {video}")

    ffmpeg = find_ffmpeg()
    duration = video_duration(ffmpeg, video)

    outdir = Path(args.outdir) if args.outdir else video.parent / f"{video.stem}_capture"
    frames_dir = outdir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    scale = f"scale='min({args.width},iw)':-2"
    times = []
    mode_used = args.mode

    if args.mode in ("auto", "scene"):
        # Always keep the very first frame plus every scene change.
        threshold = args.threshold
        for attempt in range(3):
            sel = f"select='eq(n,0)+gt(scene,{threshold})',showinfo,{scale}"
            times = extract(ffmpeg, video, frames_dir, sel)
            if len(times) <= args.max_frames:
                break
            threshold = round(threshold * 1.8, 3)
            print(f"{len(times)} frames is too many; retrying with threshold {threshold}")
        mode_used = f"scene (threshold {threshold})"
        if args.mode == "auto" and len(times) < 4:
            print(f"Scene detection found only {len(times)} frame(s); "
                  "falling back to interval mode.")
            times = []

    if args.mode == "interval" or not times:
        interval = args.interval or max(2.0, min(15.0, duration / 40))
        sel = f"fps=1/{interval},showinfo,{scale}"
        times = extract(ffmpeg, video, frames_dir, sel)
        mode_used = f"interval (every {interval:.1f}s)"

    raw = sorted(frames_dir.glob("raw_*.png"))
    if not raw:
        sys.exit("No frames were extracted - the video may be corrupt or empty.")
    # Timestamps come from showinfo in the same order frames were written.
    if len(times) != len(raw):
        print(f"Warning: {len(raw)} frames but {len(times)} timestamps; "
              "timestamps may be approximate.")
        times = (times + [0.0] * len(raw))[: len(raw)]

    # If still over the cap, keep an evenly spaced subset.
    keep = list(range(len(raw)))
    if len(raw) > args.max_frames:
        step = len(raw) / args.max_frames
        keep = sorted({int(i * step) for i in range(args.max_frames)})

    index = []
    for new_n, i in enumerate(keep, start=1):
        t = times[i]
        name = f"frame_{new_n:04d}_t{t:07.1f}s.png"
        raw[i].rename(frames_dir / name)
        index.append({"file": f"frames/{name}", "seconds": round(t, 1),
                      "timecode": timecode(t)})
    for i, f in enumerate(raw):
        if i not in keep and f.exists():
            f.unlink()

    (outdir / "frames_index.json").write_text(json.dumps({
        "video": video.name,
        "duration_seconds": round(duration, 1),
        "mode": mode_used,
        "frame_count": len(index),
        "frames": index,
    }, indent=2))

    audio_note = "skipped"
    if not args.no_audio:
        proc = run([ffmpeg, "-hide_banner", "-y", "-i", str(video),
                    "-vn", "-ac", "1", "-ar", "16000", str(outdir / "audio.wav")])
        if (outdir / "audio.wav").exists() and proc.returncode == 0:
            audio_note = "audio.wav written"
        else:
            audio_note = "no audio track found (silent recording - frames only)"

    print(f"\nDone: {len(index)} frames from {timecode(duration)} of video "
          f"[{mode_used}]")
    print(f"  Frames + index: {outdir / 'frames_index.json'}")
    print(f"  Audio: {audio_note}")


if __name__ == "__main__":
    main()
