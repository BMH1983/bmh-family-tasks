#!/usr/bin/env python3
"""Build BMH carousel slides -> 1080x1350 PNGs using headless Chromium."""
import json, os, subprocess, sys, html

OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
SLIDES_JSON = sys.argv[2] if len(sys.argv) > 2 else "slides.json"

TOMATO, APRICOT, CHARTREUSE, VISTA, INK = "#F06038", "#FCD9BE", "#D6F74C", "#8C9EFF", "#2A1A12"

CSS = """
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1350px; overflow:hidden; }
.slide {
  width:1080px; height:1350px; position:relative;
  display:flex; flex-direction:column; justify-content:center;
  padding:96px 88px; overflow:hidden;
}
.kicker {
  font-family:'Space Grotesk',sans-serif; font-weight:700;
  font-size:30px; letter-spacing:.20em; text-transform:uppercase;
  margin-bottom:40px;
}
h1 { font-family:'Bowlby One',sans-serif; line-height:.94; letter-spacing:-.01em; }
.h-xl { font-size:150px; }
.h-lg { font-size:112px; }
.h-md { font-size:86px; }
.h-sm { font-size:68px; }
.fraunces { font-family:'Fraunces',serif; font-style:italic; font-weight:900;
  line-height:1.0; letter-spacing:-.02em; }
p { font-family:'Space Grotesk',sans-serif; font-weight:400;
  font-size:40px; line-height:1.42; margin-top:44px; }
p.tight { margin-top:30px; }
p b, p strong { font-weight:700; }
ul { list-style:none; margin-top:46px; }
li { font-family:'Space Grotesk',sans-serif; font-weight:400;
  font-size:38px; line-height:1.32; margin-bottom:34px;
  padding-left:60px; position:relative; }
li:before { content:""; position:absolute; left:0; top:16px;
  width:26px; height:26px; border-radius:50%; background:currentColor; opacity:.85; }
.caveat { font-family:'Caveat',cursive; font-weight:600; font-size:64px; }
.footer {
  position:absolute; left:88px; right:88px; bottom:66px;
  font-family:'Space Grotesk',sans-serif; font-weight:700;
  font-size:26px; letter-spacing:.20em; text-transform:uppercase;
  display:flex; justify-content:space-between; opacity:.72;
}
.blob { position:absolute; border-radius:50%; opacity:.30; }
.b1 { width:620px; height:620px; right:-230px; top:-190px; }
.b2 { width:440px; height:440px; left:-190px; bottom:-150px; }
.stat { display:flex; align-items:baseline; gap:26px; margin-top:14px; }
.strike { text-decoration:line-through; opacity:.55; }
.box { border:8px solid currentColor; border-radius:34px; padding:44px 48px; margin-top:52px; }
.box p { margin-top:0; }
"""

def render(s, idx, total):
    bg, fg = s["bg"], s["fg"]
    accent = s.get("accent", fg)
    parts = [f'<div class="blob b1" style="background:{accent}"></div>',
             f'<div class="blob b2" style="background:{accent}"></div>']
    body = []
    if s.get("kicker"):
        body.append(f'<div class="kicker">{s["kicker"]}</div>')
    if s.get("h"):
        cls = s.get("hclass", "h-lg")
        font = "fraunces" if s.get("font") == "fraunces" else ""
        body.append(f'<h1 class="{cls} {font}">{s["h"]}</h1>')
    for para in s.get("p", []):
        body.append(f'<p>{para}</p>')
    if s.get("list"):
        body.append("<ul>" + "".join(f"<li>{i}</li>" for i in s["list"]) + "</ul>")
    if s.get("box"):
        body.append('<div class="box">' + "".join(f'<p>{b}</p>' for b in s["box"]) + '</div>')
    if s.get("caveat"):
        body.append(f'<p class="caveat">{s["caveat"]}</p>')
    foot = f'<div class="footer"><span>Business Mums Hub</span><span>{idx}/{total}</span></div>'
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>
<body><div class="slide" style="background:{bg};color:{fg}">
{''.join(parts)}{''.join(body)}{foot}
</div></body></html>"""

def main():
    slides = json.load(open(SLIDES_JSON))
    os.makedirs(OUT, exist_ok=True)
    total = len(slides)
    chrome = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
    for i, s in enumerate(slides, 1):
        hp = os.path.join(OUT, f"_slide{i:02d}.html")
        open(hp, "w").write(render(s, i, total))
        png = os.path.join(OUT, f"slide-{i:02d}.png")
        subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu",
                        "--hide-scrollbars", "--force-device-scale-factor=1",
                        "--window-size=1080,1500", f"--screenshot={png}",
                        f"file://{os.path.abspath(hp)}"],
                       check=True, capture_output=True)
        from PIL import Image
        Image.open(png).crop((0, 0, 1080, 1350)).save(png)
        os.remove(hp)
        print(f"built {png}")

main()
