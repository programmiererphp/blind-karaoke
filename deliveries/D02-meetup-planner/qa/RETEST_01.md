# Delivery 2 Work Browser Retest 01 — Correction 01

## Deployment

- URL: https://blind-karaoke-663424522262.us-west1.run.app
- Test completed: 2026-08-30 22:47 UTC / 2026-08-31 00:47 CEST
- Repository baseline before this report: `3d40a8fdedd7126418f4311ab69ff9962bd807f5`
- Test type: real deployed-product validation in ChatGPT Work Browser
- Target: `deliveries/D02-meetup-planner/corrections/CORRECTION_01.md`, followed by every realistically reachable D2 Browser QA check

## Final result

**CORRECTION 01 TARGETED PASS**

The original finding `D2-WB-D1-01` is no longer reproducible. Both the previously active Friends Room `ZR6ZL` and a fresh Friends Room `HB02J` restored automatically after reload. The fresh room retained the same participant, invite code, current Shallow, empty queue and external Karaoke target. `Room` navigation resolved the existing room, the same-UID invite guard remained idempotent, and an ended room was no longer restored.

**DELIVERY 2 REMAINS NOT ACCEPTED**

The Work Browser still exposed one Chrome browser and one shared Firebase anonymous-auth identity. Independent participants A/B and unrelated User C could not be created, so the D1 confirmed-Match prerequisite and D2-A1…D2-A11 remained unreachable. Mobile viewport emulation was also unavailable. These are test-environment blockers, not verified D2 product failures.

No new correction prompt was created because this retest found no new verified product defect in the reachable scope.

## Flow under test

The flow under test is: active Friends Room → current Shallow and preserved room state → cold reload → the identical active room renders automatically before Home/no-match/Match fallback.

## Work Browser environment

- Browser availability: available; Chrome via CDP
- Available browsers: one
- Tabs: multiple normal tabs sharing one Firebase anonymous-auth UID
- Desktop viewport: 1348 × 926 px content capture; `clientWidth = scrollWidth = 1348` on the room screen
- Requested mobile viewport around 390 × 844: unavailable
- Existing profile: `MinaD2QA-20260830-2218`
- Previously active room: `ZR6ZL`
- Fresh retest room: `HB02J`

## Correction 01 acceptance

| Check | Result | Real deployment evidence |
|---|---|---|
| Existing active-room bootstrap | PASS | Opening the deployment in a fresh tab immediately rendered room `ZR6ZL`, Mina and current Shallow instead of Home. |
| Existing room reload | PASS | Reload again rendered `ZR6ZL` automatically with the same participant, invite URL text, current Shallow and queue count. |
| Fresh room creation | PASS | A new Friends Room `HB02J` was created from the real UI. |
| Fresh current song | PASS | Shallow was added through the real song picker and selected with `Singen starten`. |
| Fresh room bootstrap after reload | PASS | Reload returned directly to `HB02J`; no `Room` click or invite URL was needed. |
| State fidelity / idempotence | PASS | The complete visible body state and width metrics compared identical before/after reload; room code, Mina, Shallow and `Song-Warteschlange (0)` were all present both times. |
| Room navigation resolver | PASS | `Start` opened Home; selecting `Room` recovered `ZR6ZL` with the same participant and current Shallow. |
| Same-UID invite guard | PASS | `/room/HB02J` showed `Du bist bereits in diesem Room`, preserved Mina, exposed no join/nickname form and created no visible duplicate. |
| Ended room is not restored | PASS | Ending `ZR6ZL` entered the existing D1 feedback flow; after reload, `Room` showed `Kein aktiver Raum`. |
| Newest of multiple concurrently active legacy rooms | NOT TESTED | No safe supported UI path exposed a controlled legacy multiple-active-room state. |
| Active room versus outstanding Blind Match | NOT TESTED | The current profile had no controlled outstanding Match, and a second independent auth context was unavailable. |
| Independent participant queue sync | BLOCKED | Every normal tab shared the creator UID. |
| D2 Meetup preservation | BLOCKED | No valid two-user confirmed Match/Meetup could be created. |
| App-origin console health | PASS | No app-origin warning, Firestore permission error or failed write; only Cloud Browser extension metadata noise appeared. |
| Desktop overflow | PASS | `clientWidth` and `scrollWidth` were both 1348 px. |
| Mobile 390 × 844 | NOT TESTED | Work Browser exposed no viewport resize/device-emulation control. |

Table ID: `D02-CORRECTION-01-RETEST-20260830`

## Required rendered-app checks

| Check | Result | Observation |
|---|---|---|
| Page identity | PASS | HTTPS deployment URL and title `Blind Karaoke`. |
| Nonblank render | PASS | Meaningful Home, Room, feedback and self-invite states rendered. |
| Framework overlay | PASS | No Vite/React/framework error overlay observed. |
| Interaction proof | PASS | Created room, added Shallow, started it, reloaded, navigated Home → Room, exercised self-invite guard and verified ended-room handling. |
| Screenshot evidence | PASS | Before/after, self-invite and ended-room screenshots were captured from the real deployment. |
| Console health | PASS | No relevant deployment-origin warning/error. |

Table ID: `D02-RETEST-01-RENDERED-CHECKS-20260830`

## D2 acceptance rerun

| Criterion | Result | Retest evidence |
|---|---|---|
| D2-A1 — proposal | BLOCKED | A mutually confirmed two-user D1 Match could not be established with one auth context. |
| D2-A2 — accept | BLOCKED | No independent proposal receiver B. |
| D2-A3 — counterproposal | BLOCKED | No independent B; stale-version semantics could not be exercised. |
| D2-A4 — change confirmed meetup | BLOCKED | No confirmed Meetup was reachable. |
| D2-A5 — route | BLOCKED | Confirmed Meetup Card was unreachable. |
| D2-A6 — ICS | BLOCKED | Calendar control and generated file were unreachable. |
| D2-A7 — realtime status | BLOCKED | Independent A/B status writers were unavailable. |
| D2-A8 — cancellation | BLOCKED | No Meetup existed to cancel. |
| D2-A9 — restart after cancellation | BLOCKED | Cancellation prerequisite was unreachable. |
| D2-A10 — security | BLOCKED | No unrelated third authenticated context. |
| D2-A11 — reload | BLOCKED | No proposal/confirmed Meetup/status state could be created. |

Table ID: `D02-RETEST-01-D2-ACCEPTANCE-20260830`

## Available D1 regressions

| D1 area | Result | Observation |
|---|---|---|
| Friends Room creation | PASS | Fresh room `HB02J` was created. |
| Song picker / queue | PASS | Shallow was added from the demo catalog. |
| Current song | PASS | `Singen starten` moved Shallow to `Jetzt dran`. |
| External Karaoke target | PASS | `Karaoke starten` retained the expected YouTube search target. |
| Active-room reload restore | PASS | Reproduced successfully with both `ZR6ZL` and fresh `HB02J`. |
| Room navigation recovery | PASS | Home → `Room` reopened the existing room. |
| Same-UID invite guard | PASS | Existing membership was recognized without a join form or identity change. |
| Ended-room exclusion | PASS | Ended `ZR6ZL` did not restore. |
| Independent realtime queue | BLOCKED | Only one Firebase UID was available. |
| Blind Match / mutual confirmation | BLOCKED | Requires independent A/B contexts. |
| Duett Roulette | BLOCKED | Only one participant was available in the Friends Room. |
| Feedback privacy / Karaoke Friend | BLOCKED | Requires two independent feedback writers. |

Table ID: `D02-RETEST-01-D1-REGRESSION-20260830`

## Screenshot evidence

- [`13-retest-active-room-before-reload.jpg`](screenshots/13-retest-active-room-before-reload.jpg) — existing `ZR6ZL` restored automatically at retest start.
  - Evidence ID: `D02-R01-S13-EXISTING-BEFORE`
- [`14-retest-active-room-after-reload.jpg`](screenshots/14-retest-active-room-after-reload.jpg) — identical existing room after explicit reload.
  - Evidence ID: `D02-R01-S14-EXISTING-AFTER`
- [`16-retest-ended-room-not-restored.jpg`](screenshots/16-retest-ended-room-not-restored.jpg) — `Kein aktiver Raum` after ending and reloading `ZR6ZL`.
  - Evidence ID: `D02-R01-S16-ENDED-NOT-RESTORED`
- [`17a-retest-fresh-room-before-reload-top.jpg`](screenshots/17a-retest-fresh-room-before-reload-top.jpg) — fresh `HB02J`, Mina and current Shallow before reload.
  - Evidence ID: `D02-R01-S17A-FRESH-BEFORE`
- [`18-retest-fresh-room-after-reload.jpg`](screenshots/18-retest-fresh-room-after-reload.jpg) — fresh room restored automatically after reload.
  - Evidence ID: `D02-R01-S18-FRESH-AFTER`
- [`19-retest-fresh-self-invite-guard.jpg`](screenshots/19-retest-fresh-self-invite-guard.jpg) — same-UID guard for active `HB02J`.
  - Evidence ID: `D02-R01-S19-FRESH-SELF-INVITE`

Additional captured transition evidence is retained in screenshots `15` and `17`; the evidence list above contains the clearest states used for the decision.

## Console/runtime evidence

- No deployment-origin warning/error was captured across room creation, song selection, reload, Room navigation, end handling or invite guard.
- Repeated `chrome-extension://... Error sending browser metadata to extension` entries were Cloud Browser extension noise and had no user-visible app effect.
- No Firestore permission error or failed write was observed in the exercised paths.

## Decision

- Close `D2-WB-D1-01` as **resolved by targeted deployed retest**.
- Correction 01 is **accepted for its verified active-room bootstrap scope**.
- Do not create Correction 02 from environment-only blockers.
- Delivery 2 remains **not accepted** until the full `BROWSER_QA.md` flow runs with independent A/B sessions, a third context when practical and mobile viewport coverage.
- Do not begin Delivery 3.
