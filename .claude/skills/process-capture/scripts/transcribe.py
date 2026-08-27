#!/usr/bin/env python3
"""Transcribe a recording's narration to timestamped text.

Usage:
    python3 transcribe.py AUDIO_OR_VIDEO [--outdir DIR] [--model base]

Writes transcript.txt as "[mm:ss] text" lines.

Uses faster-whisper if installed (pip install faster-whisper; the first run
downloads a speech model, so it needs internet). If it isn't available this
exits with code 2 and a clear message - the process doc can still be built
from frames alone, so treat a missing transcript as a downgrade, not a
blocker.
"""

import argparse
import sys
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--outdir")
    ap.add_argument("--model", default="base",
                    help="faster-whisper model size (tiny/base/small)")
    args = ap.parse_args()

    src = Path(args.audio)
    if not src.exists():
        sys.exit(f"File not found: {src}")
    outdir = Path(args.outdir) if args.outdir else src.parent
    outdir.mkdir(parents=True, exist_ok=True)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("faster-whisper is not installed, so no transcript this time.\n"
              "To enable narration transcripts: pip install faster-whisper\n"
              "Continuing without one is fine - build the doc from frames "
              "and flag gaps as CONFIRM items.")
        sys.exit(2)

    print(f"Loading model '{args.model}' (first run downloads it)...")
    model = WhisperModel(args.model, compute_type="int8")
    segments, info = model.transcribe(str(src), vad_filter=True)

    lines = []
    for seg in segments:
        m, s = divmod(int(seg.start), 60)
        lines.append(f"[{m:02d}:{s:02d}] {seg.text.strip()}")

    out = outdir / "transcript.txt"
    out.write_text("\n".join(lines) or "(no speech detected)")
    print(f"Done: {len(lines)} segments, language={info.language} -> {out}")


if __name__ == "__main__":
    main()
