# Open Coffee Oct to Dec 2026: handoff

Written 2 September 2026 (Adelaide) from a Claude Code web session. Everything below is done and live unless marked Pending.

## The three events

| Date | Venue | Stripe product | Price | Payment link | MailerLite group ID |
|---|---|---|---|---|---|
| Wed 14 Oct 2026, 10am to 12pm | Ray's, Burnside Shopping Centre | prod_VBYjclam7BqNdn (price_1UBBcCCGG5LYDoepyZWfdkXs) | $30 AUD incl. GST | https://buy.stripe.com/3cI14m8qX8EKcbk6jld7q0E (plink_1UBBgZCGG5LYDoepC7tAAsUC) | 197495012693378364 |
| Wed 25 Nov 2026, 10am to 12pm | Vintage Chef Co, 18-20 Alexander Avenue, Evanston Park | prod_VBYkBAVGsy9T7L (price_1UBBcgCGG5LYDoepKhWK2RdU) | $30 AUD incl. GST | https://buy.stripe.com/eVqeVcgXtg7c2AKfTVd7q0F (plink_1UBBgtCGG5LYDoepdvkt3o97) | 197495014668896224 |
| Wed 9 Dec 2026, 10am to 12pm | Prices Fresh, 463-465 North East Road, Hillcrest | prod_VBYkYYnCyL1Uc5 (price_1UBBckCGG5LYDoepAGrKKItc) | $30 AUD incl. GST | https://buy.stripe.com/dRm9AS0YvdZ43EOePRd7q0G (plink_1UBBgwCGG5LYDoepbiWpQAbV) | 197495016618198790 |

Stripe account: Business Mums Hub, acct_1JXLweCGG5LYDoep, live mode. Products follow the existing pattern: tax code txcd_20030000, tax inclusive, one-time price, hosted confirmation, no custom fields. Each product has its feed JPG set as the product image, served from this repo at commit e2f57e5cd98af60de03f8efd0029db0f76bacb2b (raw.githubusercontent.com). Do not delete that commit or the checkout images break.

MailerLite groups follow the live convention "Wanna Grab a Coffee? - [Venue] [Date]". Master attendees group is 180890227350439535.

## Why these dates

Last existing Open Coffee is Wed 16 Sept 2026 (Emma and Ivy, Lobethal). Sandra wanted two a month, fortnightly, Wednesdays, none in SA school holidays, through to Christmas. SA spring holidays are 26 Sept to 11 Oct 2026, Term 4 is 12 Oct to 11 Dec 2026. Candidate Wednesdays were 14 Oct, 28 Oct, 11 Nov, 25 Nov, 9 Dec. Sandra picked 14 Oct, 25 Nov and 9 Dec for these venues. 28 Oct and 11 Nov are still open if she wants two more. 30 Sept and 23 Dec were rejected (holidays, Christmas). Calendar check on 2 Sept: nothing clashing on any of those Wednesdays except the recurring 12:30 Lunch block.

## Graphics

Built on Sandra's Open Coffee template: apricot #FCD9BE base, tomato #F06038 top strip and headline, Vista Blue #8C9EFF date block with a tomato offset, chartreuse #D6F74C accents, Ink #2A1A12 text only. Fonts: Bowlby One (headline and day number), Space Grotesk (labels and body), Fraunces italic (month, the "a", suburb, "included"), Caveat ("no ick, just coffee"). Time written "10am – 12pm" as in the template.

- Finished PNGs and web JPGs are in this folder (feed 1600x2000, Facebook event cover 1920x1005).
- `design-source/` holds the Claude Design artboards (`*.dc.html`), `canvas.json` and the three photos. Re-seed with the `design` skill helper to republish. The photos came from businessmumshub.com.au/img/ (table-talk, room-wide, hug-clap). Sandra may want the template's own photo swapped in.
- Live canvas: https://claude.ai/code/artifact/8baa0eaa-8464-49c8-a7c2-81073dc2c027
- A stray Canva copy was created before Sandra redirected to Claude Design. It's called "Yellow Black Bold Simple Marathon Event Landscape Banner (Facebook Post)", created 2 Sept 2026, id DAHUCpi5Ej8. Safe to delete.

## Still to do (Pending)

1. Facebook events. Cannot be created by API (Meta removed it) and the cloud session had no logged-in browser. Do them with Claude in Chrome on the laptop or by hand. Titles: "Wanna grab a coffee? Open Coffee at [Venue], [Suburb]". Description: "A relaxed, in-person catch-up for mums in business. Good coffee, real conversation. Two hours that don't feel like networking. $30, coffee included." Plus the ticket link. Use the fb-cover PNGs.
2. MailerLite automations. Existing ones are named "Open Coffee - [Venue] [Date]" (5 steps, trigger subscriber joins group). None created for the three new events. Known bug to design around: relative delays anchor to join date, not event date.
3. Landing page businessmumshub.com.au/open-coffee/ still lists only 2 Sept and 16 Sept. Needs the three new events, links above.
4. Google Calendar. Existing Open Coffee entries are all-day blocks titled "Open Coffee - [Venue] / [Suburb]" with description "Open Coffee event. 10am-12pm officially, full day blocked." None created yet for the three new dates.
5. Facebook Pages was enabled in Zapier but is not authenticated. Only posts photos and status, no events. Disable it if not wanted.
