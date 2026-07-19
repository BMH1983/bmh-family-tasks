# Waitlist pipeline handoff — 19 July 2026

Session: "Card wait list responses" (cloud, phone-started). Status of the Intensive/Claude Foundations waitlist pipeline as verified this session.

## Verified and done (no action)

- Overnight sign-ups both fully handled: **Alicia Horvath** (alicia.horvath@gmail.com, IG aliciaclaire_79, arrived 19 Jul) and **Odette de Beer** (odette@odettedebeer.com, 18 Jul). Both in MailerLite **Intensive Waitlist** group (ID 192411949910197549) and SA Mums in Business master group; the Intensive Waitlist Welcome automation sent to both within seconds (activity log checked).
- Sam King (sam@skaafs.com.au) reached the list via the website form 15 Jul. Fine.
- Teagan, Sam Thomas, Kelly (source "api" in MailerLite) were manual adds by Sandra, not a broken pipe.
- MailerLite subscriber timestamps are UTC (cross-checked against ManyChat Adelaide times).

## Open loops (action needed)

1. **Emily Jade (IG emilyjadeedit)** commented "Waitlist" on the orange "Wanna learn Claude" post ~6:40am 19 Jul. The ManyChat trigger never fired: no public auto-reply, no ManyChat contact, not in MailerLite. Needs a manual reply/DM with the waitlist link, or a direct MailerLite add once her email is known.
2. **Rebuild ManyChat automation.** Current state: "Waitlist Builder" LIVE but only 2 lifetime runs (Odette + Alicia); "Auto-DM links from comments" STOPPED (21 historical runs). Agreed plan: delete the stopped one, rebuild Waitlist Builder end to end. Why Emily was skipped is unconfirmed; prime suspects are trigger settings (once-per-contact ever / followers-only / top-level-only).
3. **Ally Aoukar — contested, verify before acting.** A sibling session ("Claude Foundations waitlist content", computer-run with Chrome access) flagged her as a stranded DM lead. Sandra says Ally never commented waitlist, so that session's inference is disputed. Fact: no Ally/Aoukar in the Intensive Waitlist group as of 19 Jul. That sibling session also suspected a **Google Sheets "Insert Row" step failing silently** inside the ManyChat flow — worth confirming when the flow is opened.

## Rebuild spec (agreed)

Trigger: any post or reel; keywords `waitlist`, `wait list`; **everyone** (no followers-only); re-trigger **once per contact per post**.
Steps: public reply ("Sent you a DM 📩") → DM using an **email question block** (saves to the email system field) → bridge to MailerLite → confirmation DM → optional 4h Smart Delay nudge if no email.

**Bridge (ManyChat External Request step, Pro):**
- POST `https://connect.mailerlite.com/api/subscribers`
- Headers: `Content-Type: application/json` and `Authorization: Bearer <MailerLite API key>` (generate in MailerLite → Integrations → API)
- Body: `{"email":"{{email}}","fields":{"name":"{{first_name}}"},"groups":["192411949910197549"]}` with the {{ }} values inserted via ManyChat's variable picker.
- Verified this session: an API group-add DOES fire the welcome automation, and MailerLite dedupes by email.

DM copy was drafted and voice-gated this session (Mode 2, awaiting Sandra's edit). The "twenty mums" capacity figure is NOT verified against The Bible — confirm before using numbers in copy.

## Environment notes

- ManyChat upgraded to Pro 19 Jul (page: Business Mums Hub, Adelaide timezone).
- ManyChat API: can read page info, contacts (by email; name search cannot see Instagram contacts), flow list. Cannot create/edit flows and has no flow-content endpoint — flow builds are dashboard-only. An API key was used this session but is not stored here; regenerate in ManyChat Settings → API if wanted.
- Sessions started from the phone run in the cloud (no claude-in-chrome browser control); sessions started on the computer can drive Chrome. Cloud sessions have direct MailerLite/Gmail/API access.
- Foundations Intensive date cross-checked: Friday 18 September 2026 (matches Studio Safari full-day booking confirmation received 19 Jul).
