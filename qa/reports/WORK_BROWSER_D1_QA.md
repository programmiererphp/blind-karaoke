# Work Browser Delivery 1 QA

## Deployment

- URL: https://blind-karaoke-663424522262.us-west1.run.app
- Test date/time: 2026-08-30, approximately 19:46–19:57 UTC (21:46–21:57 CEST)

## Browser environment

- ChatGPT Work mode
- Built-in Browser / Cloud Browser (Chrome/CDP)
- Available viewport: 1363 × 936 px
- Three normal tabs were exercised. They shared the same Firebase anonymous-auth state after app interaction.
- The Browser exposed no independent/private context and no viewport-resize capability.
- A sandboxed isolated-session attempt was rejected by the Cloud Browser URL security policy. No alternate browser surface was substituted.

## Final status

**FAIL**

One real medium-severity product defect was observed (`WORK-D1-01`). In addition, the required independent two-user and mobile-width acceptance checks could not be completed in this Browser environment. This run therefore cannot accept Delivery 1, even though all valid single-session checks passed and no app-origin console error was seen.

## Acceptance table

| Area / criterion | Result | Browser observation |
|---|---|---|
| Deployment opens, correct title/product | PASS | HTTPS deployment opened; title and UI identify Blind Karaoke. |
| Non-blank render / no framework overlay | PASS | Meaningful home UI rendered; no runtime overlay or broken main asset. |
| Primary CTA | PASS | `Blind Karaoke starten` opened the real preference form. |
| Desktop layout | PASS | At the available 1363 × 936 viewport there was no horizontal overflow or clipped primary content. |
| Mobile 360 / 390 / 430 px | NOT TESTED | Cloud Browser did not expose viewport resizing or device emulation. |
| Profile form and labels | PASS | User A data could be entered through programmatic labels and controls. |
| SEARCHING-equivalent progression | PASS | Submit became disabled and visibly showed `Suche vorbereiten...`. |
| A14 — honest NO_MATCH | PASS | `Kein Duo gefunden` appeared; no fake candidate was shown. |
| A1 — compatible users share one match | NOT TESTED | No second independent Firebase-auth context was available. |
| A2 — music remains a soft criterion | NOT TESTED | Requires independent compatible users. |
| A3 — incompatible preference exclusion | NOT TESTED | Requires independent users. |
| A4 — one-sided confirmation privacy | NOT TESTED | No valid two-user proposal could be created. |
| A5 — mutual confirmation / same room | NOT TESTED | No valid two-user proposal could be created. |
| A6 — cross-user realtime queue | NOT TESTED | Realtime propagation was observed across two same-auth tabs, but this is not proof for two users. |
| A7 — external Karaoke target | PASS | `Karaoke starten` linked to a valid YouTube search URL for Shallow and used `_blank`. |
| A8 — Duett Roulette | NOT TESTED | It was unavailable in the one-participant Friends Room; matched-room creation was blocked. |
| Friends Room creation and invite | PASS | A real room and code/link `OX2A3` were created and the copy control returned the same URL. |
| A9 — independent invitee joins same room | NOT TESTED | The available second tab shared the creator's Firebase identity. The fallback exposed `WORK-D1-01`. |
| Same-UID self-invite identity guard | FAIL | Self-join changed the displayed creator nickname in both tabs instead of remaining idempotent. |
| Max-two-person semantics | NOT TESTED | A second distinct user could not be supplied. |
| Room queue and current song | PASS | Shallow became current; Perfect and Dancing Queen appeared in the queue. |
| A12 — reload persistence across Match/Room/Friends | NOT TESTED | The Friends Room subcase passed: invite code, current Shallow, queue and Karaoke link survived reload. Match/Friends subcases were not tested. |
| A10 — mutual positive creates friend | NOT TESTED | Requires two independent feedback writers. |
| A11 — one-sided positive stays private | NOT TESTED | Requires two independent feedback writers. |
| Feedback names the other participant | NOT TESTED | Only a one-participant/shared-auth fallback reached feedback and showed generic `dein Duo`. |
| Karaoke Friends result | NOT TESTED | Mutual feedback could not be validly exercised. |
| A15 — concurrent matching atomicity | NOT TESTED | Requires independent concurrent users. |
| Start / Match / Room / Freunde navigation | PASS | Each tested tab opened the expected current surface. |
| Impressum / Datenschutz | PASS | Both modal pages opened and closed; Datenschutz exposed the data-deletion control. |
| Data deletion execution | NOT TESTED | The destructive deletion action was not submitted during this QA run. |
| App console health | PASS | No warning/error from the deployment origin was recorded. Repeated `chrome-extension://...` metadata errors were Browser-extension noise and excluded. |

Table ID: `WORK-BROWSER-D1-ACCEPTANCE-20260830`

## Findings

### WORK-D1-01

### Severity

MEDIUM

### User-visible behavior

Opening a Friends Room creator's own invitation URL in another tab of the same browser profile, entering a different nickname and clicking `Room beitreten` overwrites the displayed creator identity in both tabs. The room still contains one participant and continues to say `Warte auf Beitritt des Partners...`; existing queue items then show a confusing mixture of the old and new submitter names.

### Exact reproduction steps

1. Create profile `MinaWorkQA-20260830-1947`.
2. From Home, select `Mit Freunden singen`.
3. Add Shallow as current song and Perfect to the queue.
4. Copy the generated room link (`.../room/OX2A3`).
5. Open that link in a second normal tab of the same Cloud Browser. This tab shares the same anonymous Firebase identity.
6. Enter `AlexWorkQA-20260830-1947` and click `Room beitreten`.
7. Inspect both tabs without reloading.

### Expected behavior

If the authenticated UID already owns or participates in the room, opening its invitation must be idempotent: preserve the existing participant identity and route to the existing room (or clearly state that the user is already in it). It must not run the new-participant nickname write.

### Actual behavior

Both tabs changed the visible participant from Mina to Alex. The room remained a one-participant room waiting for a partner. Queue provenance retained earlier Mina entries while a later entry was attributed to Alex.

### Browser evidence

- Before self-join: `10-friends-room-creator-20260830.jpg` shows Mina as the creator.
- After the shared-auth join submission, fresh DOM snapshots in both tabs showed Alex as the only participant and `Warte auf Beitritt des Partners...`.
- No app-origin console error accompanied the incorrect state transition.

### Likely area

Friends invite join guard / room participant transaction. The join path needs an authenticated-UID membership check before changing nickname/profile or participant data.

## Passed flows

- Home → preference form → valid User A input → submit progression → honest NO_MATCH.
- Home → Friends Room creation → visible/copyable invite link.
- Song picker → add Shallow → set current → valid external Karaoke link.
- Add Perfect; reload; preserve the same room, current song and queue.
- Add Dancing Queen in a second same-auth tab; the first tab received the queue change without reload (partial realtime evidence only).
- Start, Match, Room and Freunde navigation.
- Impressum and Datenschutz modals.
- Page identity, non-blank render, no framework overlay and clean app-origin console.

## Screenshot evidence

- [`01-home-desktop-20260830.jpg`](../../design/screenshots/work-browser/01-home-desktop-20260830.jpg) — deployed desktop home.
- [`02-preferences-filled-A-20260830.jpg`](../../design/screenshots/work-browser/02-preferences-filled-A-20260830.jpg) — filled User A preference form.
- [`03-no-match-A-20260830.jpg`](../../design/screenshots/work-browser/03-no-match-A-20260830.jpg) — honest NO_MATCH state.
- [`10-friends-room-creator-20260830.jpg`](../../design/screenshots/work-browser/10-friends-room-creator-20260830.jpg) — Friends Room before self-join, with Mina and invite link.
- [`07-current-song-20260830.jpg`](../../design/screenshots/work-browser/07-current-song-20260830.jpg) — Shallow as current song and external Karaoke control.
- [`06-room-queue-persisted-20260830.jpg`](../../design/screenshots/work-browser/06-room-queue-persisted-20260830.jpg) — current song and Perfect queue retained after reload.
- [`08-feedback-shared-session-limit-20260830.jpg`](../../design/screenshots/work-browser/08-feedback-shared-session-limit-20260830.jpg) — feedback surface reached only through the one-participant/shared-auth fallback; not evidence for valid partner feedback.

Required match-proposal, one-sided-confirmation, mutual-confirmation, Duett Roulette, mutual-feedback, resulting-friends and independent-join screenshots were not fabricated because those states could not be validly reached in this Browser run.

## Untested / limitations

- Only one Chrome browser/context was exposed. New tabs shared Firebase anonymous-auth state after interaction.
- Browser viewport was fixed at 1363 × 936; 360, 390, 430 and requested 1440 × 900 could not be selected.
- Consequently, the core two-user Blind Match, confirmation, matched-room realtime, Duett Roulette, feedback privacy, mutual friendship and independent Friends Room join remain NOT TESTED here.
- The shared-auth second-tab queue observation is supporting evidence only and is not counted as a two-user acceptance pass.
- The data-deletion control was visible but was not executed because it is destructive.

## Decision

Delivery 1 is **not accepted by this Work Browser run**. Correct `WORK-D1-01`, then rerun the complete matrix in a Browser environment that provides two independent/private contexts and responsive viewport control. The prior Playwright-based acceptance history remains recorded separately and was not used as a substitute for this result.
