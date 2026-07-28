# 10th Birthday High Tea — invitation template

`high-tea-invite.html` is the template. `invite-preview.png` shows it with empty photo slots.

## How to use it

1. Put `high-tea-invite.html` in a folder on your computer.
2. Drop the photos of her into the **same folder**.
3. Open the HTML file in a text editor (Notepad works). Everything you edit is at the top, between the two comment lines. Nothing below that needs touching.
4. Fill in the name, age, date, time, venue, address, RSVP and note.
5. For the photos, type the exact file names, including `.jpg` or `.png`:

   ```
   photoMain:  "murphy-1.jpg",
   photoLeft:  "murphy-2.jpg",
   photoRight: "murphy-3.jpg",
   ```

   Leave any of them as `""` and that slot shows a dashed outline instead.
6. Save, then double-click the file to open it in Chrome.

## Getting it out

- **To print:** Ctrl+P, choose "Save as PDF", set margins to None and background graphics ON.
- **To text or post it:** screenshot it, or right-click the card and Save Image.

## Photo tips

The frames are tall ovals, so portrait photos work best. Face roughly centred. The middle slot is the big one, so put the best photo there.

## Colours

Three palettes are listed in the file. Uncomment the one you want, or paste any hex codes into `bg`, `ink`, `accent`, `gold`.

- Rose and cream (currently set)
- Sage and cream
- Lilac and cream

## Wording

The defaults are placeholders. Change any of them. `script` is the small handwritten line above the name, `note` is the handwritten line near the bottom (currently "Frocks and fancy hats encouraged").
