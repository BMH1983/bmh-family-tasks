#!/usr/bin/env python3
"""Record the two fixture videos with Playwright and log real step timestamps."""
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

FIX = Path(__file__).parent
OUT = FIX


def record(pw, html_file, actions, out_name):
    browser = pw.chromium.launch(
        headless=True, executable_path="/opt/pw-browsers/chromium"
    )
    ctx = browser.new_context(
        viewport={"width": 1280, "height": 720},
        record_video_dir=str(FIX / "_vid_tmp"),
        record_video_size={"width": 1280, "height": 720},
    )
    page = ctx.new_page()
    t0 = time.monotonic()
    log = []

    def mark(label):
        log.append({"t": round(time.monotonic() - t0, 1), "step": label})

    page.goto((FIX / html_file).as_uri())
    mark("page loaded")
    actions(page, mark)
    video = page.video
    ctx.close()
    path = Path(video.path())
    dest = OUT / out_name
    if dest.exists():
        dest.unlink()
    path.rename(dest)
    browser.close()
    (OUT / (out_name + ".steps.json")).write_text(json.dumps(log, indent=2))
    return log


def invoice_actions(page, mark):
    page.wait_for_timeout(6000)
    page.click("#newInvoiceBtn"); mark("clicked New Invoice")
    page.wait_for_timeout(2500)
    page.type("#client", "Sunshine Cafe", delay=110); mark("typed client")
    page.wait_for_timeout(1500)
    page.type("#amount", "450.00", delay=110); mark("typed amount")
    page.wait_for_timeout(1500)
    page.type("#due", "04/09/2026", delay=100); mark("typed due date")
    page.wait_for_timeout(1500)
    page.type("#desc", "Weekly social media package", delay=70); mark("typed description")
    page.wait_for_timeout(2500)
    page.click("#saveInvoice"); mark("clicked Save -> confirmation")
    page.wait_for_timeout(5000)
    page.click("#backToList"); mark("back to invoice list")
    page.wait_for_timeout(3000)
    page.click("#markSent"); mark("marked as sent")
    page.wait_for_timeout(4000)
    page.click("#exportPdf"); mark("clicked Export PDF (toast)")
    page.wait_for_timeout(5000)
    mark("end")


def member_actions(page, mark):
    page.wait_for_timeout(5000)
    page.click("#openSubs"); mark("opened Subscribers")
    page.wait_for_timeout(5000)
    page.click("#addSub"); mark("clicked Add subscriber")
    page.wait_for_timeout(2000)
    page.type("#subName", "Priya Nair", delay=110); mark("typed name")
    page.wait_for_timeout(1200)
    page.type("#subEmail", "priya.nair@example.com", delay=90); mark("typed email")
    page.wait_for_timeout(1200)
    page.select_option("#subGroup", "New Members Aug"); mark("chose group")
    page.wait_for_timeout(2000)
    page.click("#saveSub"); mark("saved -> back on list")
    page.wait_for_timeout(3500)
    page.check("#welcomeToggle"); mark("queued welcome email")
    page.wait_for_timeout(4000)
    mark("end")


with sync_playwright() as pw:
    log1 = record(pw, "quillbook.html", invoice_actions, "weekly-invoice-run.webm")
    log2 = record(pw, "pigeonloft.html", member_actions, "add-new-member.webm")

print(json.dumps({"invoice": log1, "member": log2}, indent=2))
