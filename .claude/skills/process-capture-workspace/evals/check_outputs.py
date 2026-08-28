#!/usr/bin/env python3
"""Deterministic checks over a run's outputs dir. Prints JSON facts for the grader.

Usage: python3 check_outputs.py <outputs_dir>
Facts reported (grader interprets them against the eval's assertions):
  - files present (with sizes)
  - markdown/docx docs found; numbered-step count in each .md
  - image references in each .md and whether each resolves to an existing file
  - presence of key strings (case-insensitive) relevant to the three evals
"""
import json
import re
import sys
from pathlib import Path

KEY_STRINGS = [
    "kate", "1,000", "1000", "sunshine cafe", "450", "inv-2043", "friday",
    "usual folder", "confirm", "butterfly!23", "butterfly", "priya",
    "new members aug", "welcome email", "rotate", "sticky", "password",
    "snipping", "quicktime", "cmd+shift+5", "shift+cmd+5", "zoom", "teams",
    "narrat", "payroll", "interview",
]


def main(outputs_dir):
    out = Path(outputs_dir)
    facts = {"outputs_dir": str(out), "files": [], "docs": []}
    if not out.is_dir():
        print(json.dumps({"error": f"missing dir {out}"}))
        return
    for f in sorted(out.rglob("*")):
        if f.is_file():
            facts["files"].append({"path": str(f.relative_to(out)),
                                   "bytes": f.stat().st_size})
    for md in sorted(out.rglob("*.md")):
        text = md.read_text(errors="replace")
        low = text.lower()
        steps = re.findall(r"^\s{0,3}\d+[.)]\s+\S", text, re.M)
        imgs = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", text)
        img_status = [{"ref": i, "resolves": (md.parent / i).exists()} for i in imgs]
        facts["docs"].append({
            "file": str(md.relative_to(out)),
            "chars": len(text),
            "numbered_steps": len(steps),
            "image_refs": img_status,
            "key_strings": {k: (k in low) for k in KEY_STRINGS},
        })
    docx = [str(f.relative_to(out)) for f in out.rglob("*.docx")]
    facts["docx_files"] = docx
    print(json.dumps(facts, indent=2))


if __name__ == "__main__":
    main(sys.argv[1])
