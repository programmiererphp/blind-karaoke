# Browser QA Plan — after deployment

Test the **real deployed app**, not only source code.

## Environments
- normal browser session + incognito/private session
- mobile widths 360, 390, 430 px
- desktop widths 1024 and 1440 px

## Flow 1 — Blind match
Create two compatible profiles, search, verify same match, test one-sided accept, then mutual accept and room creation.

## Flow 2 — Realtime room
Add songs from each browser, verify queue updates on the other device without reload, run Duet Roulette, open karaoke target.

## Flow 3 — Friends mode
Create room, copy invite link/code, join from second session, verify both share the room.

## Flow 4 — Feedback privacy
Test mutual positive result and one-sided positive result separately.

## Regression / technical checks
- reload persistence
- broken buttons
- console errors
- failed network/Firebase behavior
- loading and retry states
- bottom-nav overlap
- horizontal scroll
- Firestore authorization boundaries
- data deletion flow
- Impressum/Datenschutz links

After QA, write a correction-only prompt containing only defects actually observed. Do not start Delivery 2 until corrections are retested.
