# Murphy's 10th — High Tea invitation

## The files

| File | What it is |
|---|---|
| `murphy-high-tea-a5.pdf` | **Print-ready A5, 148 x 210mm. Send this one to the printer.** |
| `murphy-invite-preview.png` | High-res picture of it, for texting or posting |
| `murphy-high-tea-a5.html` | The editable original. Open in Chrome, Ctrl+P, Save as PDF |
| `high-tea-invite.html` | The earlier photo-based template, kept in case you want it |

## What's on it

- Sunday 16 August, 2pm to 5pm, Prices Fresh Hillcrest
- Purple throughout, Murphy's colour
- Illustrated girl with Murphy's colouring: ginger hair up in a bun, sparkly headband, blue eyes, freckles
- Cupcake and a chocolate chip cookie, like the inspo

## Still needed

The RSVP line currently reads **"RSVP TO SANDRA ON 0400 000 000 BY SUNDAY 9 AUGUST"**. Both the number and the cut-off date are placeholders.

## To change anything

Open `murphy-high-tea-a5.html` in a text editor. Everything editable is in the block at the very top:

```
name:    "MURPHY",
age:     "10th",
day:     "SUNDAY",
dayNum:  "16th",
month:   "AUGUST",
time:    "2PM - 5PM",
venue:   "PRICES FRESH, HILLCREST",
rsvp:    "RSVP TO SANDRA ON 0400 000 000 BY SUNDAY 9 AUGUST",
bleed:   false,
```

Save, open in Chrome to check, then Ctrl+P and Save as PDF.

## For the printer

- The PDF is already true A5 and fully vector, so it stays sharp at any size.
- If the printer asks for **bleed**, set `bleed: true` in the file and re-save the PDF. That makes it 154 x 216mm, which is A5 plus 3mm all round, so the purple background runs off the edge with nothing white showing after trimming.
- Ask for **A5, double sided: no, on 300gsm or heavier**. Matte or satin both suit this design.
- When printing from Chrome: set Margins to **None** and turn **Background graphics ON**, or the purple wash disappears.
