---
name: process-capture
description: Turn screen recordings into finished step-by-step process documents (SOPs) with real screenshots — capture a departing team member's knowledge without interviewing anyone. Use whenever someone mentions a handover, a team member leaving or resigning, documenting how a task is done, turning a Loom/Zoom/Teams/screen recording into a how-to or SOP, or drops a screen-recording video file (.mp4, .mov, .mkv, .webm) and wants the process written up. Also use when someone asks how to capture a process by recording instead of answering questions, or wants to build a process library from recordings.
---

# Process Capture

Screen recordings in, process documents out. The person who knows the task
records themselves doing it while talking out loud; Claude pulls screenshots
and narration from the recording and writes the document. **The recording IS
the interview** — the whole point of this skill is that nobody has to sit
through a question-and-answer session, so never run one.

There are two phases. Phase 1 is human work you help set up; Phase 2 is
yours.

## Phase 1 — Capture (the human records)

Claude cannot record anyone's screen. Every computer already has a recorder
built in, and `assets/recording-brief.md` is a ready-to-forward briefing that
tells the person exactly how to use it: one task per video, narrate out loud,
real examples, never show passwords, name files after tasks.

When someone says a person is leaving or a process needs capturing and no
video exists yet, your move is to hand over that brief (paste it or send the
file) — not to start asking questions about the process yourself. The person
doing the task is the source, and their time is usually the scarce thing.

## Phase 2 — Process (you build the document)

Input: one or more video files, ideally with narration, possibly with a
platform transcript (.vtt/.srt/.txt) beside them, possibly with a task list.

For each video:

### 1. Extract frames and audio

```
python3 scripts/extract_frames.py path/to/video.mp4
```

This writes a `<video>_capture/` folder: timestamped keyframes in `frames/`,
a `frames_index.json`, and `audio.wav`. It auto-detects scene changes and
falls back to fixed intervals; if ffmpeg is missing it prints install
options (`pip install imageio-ffmpeg` needs no admin rights). If a task's
recording is one long screen with subtle changes (lots of typing in one
window), rerun with `--mode interval --interval 5` to get denser coverage.

### 2. Get the narration as text (best effort, never a blocker)

In order of preference:
1. A transcript file already next to the video (Zoom/Teams/Loom exports —
   .vtt, .srt, .txt): read it directly and strip the cue formatting.
2. `python3 scripts/transcribe.py <capture_dir>/audio.wav` — uses
   faster-whisper if installed (first run downloads a model, needs internet).
3. Neither works → continue with frames only. A missing transcript downgrades
   the doc, it does not block it.

### 3. Read the frames and reconstruct the process

Read the frames **in timestamp order** (batch several per Read where
possible), alongside the transcript lines for the same timestamps. For each
visible action work out: which system/app, what was clicked or typed, with
what real values, and what the screen showed as a result. The narration
carries the *why* and the traps — "watch out for", "before Wednesday",
"if this fails" — which are the most valuable lines in the final doc, so
mine it hard.

Frames showing passwords, card numbers or other secrets: never embed them.
Note the exposure so the owner can rotate the credential, and use the
neighbouring frame instead.

### 4. Write the document

Follow `references/sop-template.md` exactly — it defines the structure and
the quality bar. The test: **someone who has never done this task could
follow the document without asking anyone anything.** Every step says where
you are, what you do, and (when it matters) what success looks like, with
the real screenshot embedded via relative path.

When something in the recording is unclear, write the step anyway and mark
it `CONFIRM`, collected in the template's "To confirm" checklist at the end.
That list is the ONLY form questions may take — a two-minute checklist the
task owner ticks off later, not an interrogation during processing. Only
address the user directly if a recording is genuinely unusable (no video
stream, unreadable resolution), and say so in one plain sentence.

### 5. Deliver

- Save `<task-name>.md` inside the capture folder, next to `frames/`, so the
  image links work.
- Also produce a Word (.docx) version with the screenshots embedded —
  handover docs get shared with people who don't read markdown. Use the docx
  skill if available, otherwise pandoc or python-docx; if none of those
  tools exist in the environment, deliver the markdown and say so plainly.
- Multiple videos → one document each, plus a `00-handover-index.md` cover
  page listing every task, its frequency, and any outstanding CONFIRM items,
  so the manager sees the whole handover at a glance.

### 6. Offer the next step (after delivering, not instead of it)

A documented process that runs on a schedule or has fiddly steps is a
candidate to become its own Claude skill, so the replacement can run it with
Claude's help rather than just reading about it. Offer this once, after the
documents are done. If accepted, draft the skill from the SOP — the hard
capture work is already done.

## Troubleshooting

- **Too few frames** (long stretches in one window): `--mode interval
  --interval 5`. **Too many**: raise `--threshold` (e.g. 0.2) or lower
  `--max-frames`.
- **Huge/long video**: process it in halves with ffmpeg's `-ss`/`-t`, or
  just accept interval mode's even sampling; do not skip the video.
- **Recording is silent**: the frames still carry the sequence. Expect more
  CONFIRM items — that is the correct honest outcome, not a failure.
- **Video won't open**: check it finished uploading/copying (partial files
  are the usual cause) before declaring it corrupt.
