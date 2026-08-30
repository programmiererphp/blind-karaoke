# Delivery 2 Meetup Planner — Work Browser QA

## Retest follow-up

Correction 01 passed its focused deployed retest on 2026-08-30. The original active-room bootstrap defect is resolved. Full Delivery 2 acceptance remains blocked by the single shared-auth Browser environment. See [`RETEST_01.md`](RETEST_01.md).

## Deployment

- URL: https://blind-karaoke-663424522262.us-west1.run.app
- Test completed: 2026-08-30 22:25 UTC / 2026-08-31 00:25 CEST
- Repository baseline: `da3bcd5cb9e20678d731321fd4ff17ab5f0d110e`
- Test type: real deployed-product validation, not code review

## Final result

**FAIL — acceptance incomplete**

The Work Browser provided only one Chrome/CDP browser and one shared Firebase anonymous-auth context. A second independent participant and third security context could not be created, so the required confirmed D1 Match and every D2 acceptance flow remained unreachable.

This is not evidence that D2 itself is defective. No D2 product defect is claimed without reaching a real D2 state. One actual Delivery 1 regression was reproduced during the mandatory D1 checks: an active Friends Room is not restored automatically after reload.

Delivery 2 is **not accepted**.

## Work Browser environment

- ChatGPT Work built-in Browser / Cloud Browser
- Browser: Chrome via CDP
- Available browsers: one
- Available viewport: 1363 × 936 px initially; 1348 px content width after the scrollbar appeared
- Viewport resizing/device emulation: unavailable
- Tabs used: two normal tabs sharing the same Firebase anonymous identity
- Unique test profile: `MinaD2QA-20260830-2218`
- Unique no-match city: `D2QA2218`
- Friends Room code: `ZR6ZL`

## D2 acceptance table

| Criterion | Result | Work Browser evidence |
|---|---|---|
| D2-A1 — proposal | BLOCKED | A mutually confirmed two-user D1 Match could not be established with one auth context. |
| D2-A2 — accept | BLOCKED | No real proposal receiver B was available. |
| D2-A3 — counterproposal | BLOCKED | No independent B session; stale-version semantics could not be exercised. |
| D2-A4 — change confirmed meetup | BLOCKED | No confirmed meetup was reachable. |
| D2-A5 — route | BLOCKED | The confirmed Meetup Card was unreachable. |
| D2-A6 — ICS | BLOCKED | The calendar control and generated file were unreachable. |
| D2-A7 — realtime status | BLOCKED | Independent A/B status writers were unavailable. |
| D2-A8 — cancellation | BLOCKED | No meetup existed to cancel. |
| D2-A9 — restart after cancellation | BLOCKED | Cancellation prerequisite was unreachable. |
| D2-A10 — security | BLOCKED | No unrelated third authenticated context was available. |
| D2-A11 — reload | BLOCKED | No proposal/confirmed meetup/status state could be created. |

Table ID: `D02-WORK-BROWSER-ACCEPTANCE-20260830`

## D1 regression table

| D1 area | Result | Observation |
|---|---|---|
| Deployment identity / nonblank render | PASS | Correct HTTPS URL, `Blind Karaoke` title and meaningful UI; no framework overlay. |
| Profile form / accessible labels | PASS | Labeled controls accepted the unique Mina profile. |
| Honest no-match | PASS | Unique city search rendered `Kein Duo gefunden`; no fake candidate. |
| Compatible two-user Blind Match | BLOCKED | Only one Firebase identity was available. |
| One-sided waiting / mutual confirmation | BLOCKED | Requires independent A/B sessions. |
| Friends Room creation | PASS | Room `ZR6ZL` and its invite URL were created. |
| Queue / current song | PASS | Shallow was added and became `Jetzt dran`. |
| External Karaoke link | PASS | `Karaoke starten` linked to the expected YouTube search URL. |
| Independent realtime queue | BLOCKED | Second tab shared the creator UID. |
| Same-UID invite guard | PASS | Invite route showed `Du bist bereits in diesem Room`; identity remained Mina and no join form appeared. |
| Automatic active-room restore after reload | FAIL | Reload displayed Home instead of room `ZR6ZL`. |
| Room navigation recovery | PASS | Selecting `Room` recovered the same room, code, participant and current Shallow. |
| Duett Roulette | BLOCKED | Unavailable in the one-participant Friends Room. |
| Feedback / Karaoke Friend | BLOCKED | Requires two independent participants. |
| Desktop horizontal overflow | PASS | `clientWidth` and `scrollWidth` were both 1348 px on the room screen. |
| Mobile 390 × 844 | NOT TESTED | Browser exposed no viewport controls. |
| App-origin console health | PASS | No deployment-origin warning/error; only repeated Cloud Browser extension metadata noise. |

Table ID: `D02-WORK-BROWSER-D1-REGRESSION-20260830`

## Finding

### D2-WB-D1-01 — active Friends Room is not restored automatically

- Severity: **MEDIUM**
- Surface: Delivery 1 regression encountered during mandatory D2 QA

### Reproduction

1. Create profile `MinaD2QA-20260830-2218`.
2. From Home select `Mit Freunden singen`.
3. Create Friends Room `ZR6ZL`.
4. Add Shallow and select `Singen starten` so it becomes current.
5. Reload while the active room is open.
6. Observe Home instead of the active room.
7. Select bottom navigation `Room`.

### Expected

Bootstrap resolves the authenticated user's active room and restores that exact room automatically, including room code, participants, current song and queue.

### Actual

Reload rendered the generic Home screen. Selecting `Room` manually recovered room `ZR6ZL`, Mina and current Shallow. This proves the room data persisted and the failure is startup state arbitration/navigation, not data loss.

### Evidence

- `09-karaoke-regression.jpg`: active room with current Shallow before reload.
- `06-reload-not-restored.jpg`: Home displayed immediately after reload.
- Fresh DOM after clicking `Room`: same code `ZR6ZL`, participant Mina and current Shallow restored.

### Likely area

Application bootstrap / active-room resolver. The bottom `Room` navigation can resolve the room, but bootstrap does not apply the same result as the initial screen.

## D2 QA blocker

The Browser exposed one Chrome browser only. New tabs shared Firebase Auth state, as proven by the second-tab self-invite result showing the already-authenticated Mina identity. Therefore an independent Alex session and unrelated User C could not be created.

No D2 proposal, counterproposal, confirmation, route, ICS, participant status, cancellation or security PASS/FAIL was fabricated.

## Console/runtime evidence

- No app-origin warning or error was captured on profile, search, Friends Room, queue, current-song, reload or self-invite paths.
- Repeated `chrome-extension://... Error sending browser metadata to extension` entries were Cloud Browser extension noise and had no user-visible app impact.
- No Firestore permission error or failed write was observed in the exercised paths.

## Screenshot evidence

- [`10-desktop-profile-ready.jpg`](screenshots/10-desktop-profile-ready.jpg) — completed unique D1 regression profile.
  - Evidence ID: `D02-WB-S10-PROFILE-READY`
- [`11-desktop-no-match.jpg`](screenshots/11-desktop-no-match.jpg) — honest unique-city no-match result.
  - Evidence ID: `D02-WB-S11-NO-MATCH`
- [`09-karaoke-regression.jpg`](screenshots/09-karaoke-regression.jpg) — Friends Room with Shallow current and real external Karaoke control.
  - Evidence ID: `D02-WB-S09-KARAOKE-REGRESSION`
- [`06-reload-not-restored.jpg`](screenshots/06-reload-not-restored.jpg) — incorrect Home state immediately after reloading the active room.
  - Evidence ID: `D02-WB-S06-RELOAD-FAIL`
- [`12-self-invite-guard.jpg`](screenshots/12-self-invite-guard.jpg) — passing same-UID membership guard.
  - Evidence ID: `D02-WB-S12-SELF-INVITE-PASS`

D2-specific proposal/confirmation/status/cancellation screenshots were not created because those states were not validly reachable.

## Untested limitations

- Entire D2-A1…D2-A11 matrix.
- Independent two-user D1 Match, realtime confirmation and queue.
- Third-user security enforcement beyond visible single-user routes.
- ICS generation and file content.
- Google Maps target construction.
- D2 reload persistence.
- Feedback privacy and mutual Karaoke-Friend creation.
- Mobile 390 × 844 and requested 1440 × 900 exact viewports.

## Decision

- Delivery 2 remains **not accepted**.
- Create Correction 01 only for actual finding `D2-WB-D1-01`.
- Do not infer that the D2 implementation passes or fails from the unreachable state.
- Rerun the full BROWSER_QA matrix in an environment with two independent Firebase contexts, a third context when practical and mobile viewport support.
- Do not begin Delivery 3.
