# Work Browser Delivery 1 Retest 01

## Deployment

- URL: https://blind-karaoke-663424522262.us-west1.run.app
- Retest completed: 2026-08-30 20:25 UTC / 22:25 CEST
- Purpose: verify the correction for `WORK-D1-01` and rerun all realistically available Delivery 1 regression checks in the built-in Work Browser.

## Browser environment

- ChatGPT Work mode
- Built-in Browser / Cloud Browser (Chrome/CDP)
- Available viewport: 1363 × 936 px
- Two normal tabs were used for the room/self-invite/realtime checks.
- The tabs shared one Firebase anonymous-auth context; the Browser still exposed no independent/private context and no viewport-resize capability.
- Near the end of the run, the Cloud Browser tab-refresh operation timed out repeatedly. Evidence captured before that timeout remains valid; a final dev-log pull and the planned post-abort search check could not be completed.

## Final status

**FAIL**

The previous defect `WORK-D1-01` is fixed and passed its exact reproduction test. One new high-severity Delivery 1 defect was observed: `WORK-D1-R01-01` — an active Friends Room is not restored after reload when the same user also has an active Blind Match state.

## Acceptance table

| Area / criterion | Result | Current Browser observation |
|---|---|---|
| Deployment opens, title/product identity | PASS | Correct HTTPS deployment and `Blind Karaoke` title/UI. |
| Non-blank render / no framework overlay | PASS | Home and all exercised states rendered meaningful UI without an error overlay. |
| Desktop layout | PASS | At 1363 × 936, primary controls and content were usable without horizontal overflow. |
| Mobile 360 / 390 / 430 px | NOT TESTED | Browser still provided no viewport resizing/device emulation. |
| `WORK-D1-01` same-UID self-invite guard | PASS | Own invite showed `Du bist bereits in diesem Room`; no nickname input or join submit was present. |
| Self-invite opens existing room idempotently | PASS | `Raum öffnen` returned to room `72MWC`; Alex identity and Shallow attribution remained unchanged in both tabs. |
| Friends Room creation / invite URL | PASS | Room `72MWC` and a copyable invite URL were created. |
| Room queue / current song | PASS | Shallow became current; Perfect was added to the queue. |
| Same-auth realtime queue propagation | PASS | Perfect appeared in the other tab without reload; this is supporting evidence only and not a two-user acceptance substitute. |
| External Karaoke target | PASS | Shallow retained a clickable `Karaoke starten` YouTube search target. |
| Active Friends Room automatic reload restore | FAIL | Reload showed the active Blind Match proposal instead of returning to the room. |
| Room tab recovery after reload | FAIL | `Room` displayed `Kein aktiver Raum`; it did not find the still-active room. |
| Direct invite recovery after reload | PASS | Opening the saved invite URL again found the membership guard and recovered the same room, Shallow and Perfect; this is a workaround, not valid automatic restoration. |
| Blind Match proposal rendering | PASS | A real partially anonymous proposal rendered without nickname/contact disclosure. |
| One-sided Blind Match confirmation | PASS | `Ich bin dabei` produced `Warten auf das Karaoke-Duo...`; partner identity/contact stayed hidden. |
| Compatible controlled two-user match | NOT TESTED | No second independent Firebase-auth context was available; the proposal used an existing deployment candidate. |
| Mutual confirmation / same matched room | NOT TESTED | Requires the independent candidate session. |
| Duett Roulette in matched room | NOT TESTED | No mutually confirmed matched room was available. |
| Independent Friends Room invitee | NOT TESTED | Both available tabs shared the creator UID. |
| Max-two/third-user semantics | NOT TESTED | Requires distinct independent UIDs. |
| Feedback privacy / mutual Karaoke Friend | NOT TESTED | Requires two independent feedback writers. |
| Start / Match / Room / Freunde navigation | FAIL | Start, Match and Freunde worked; Room failed to rediscover the active room after reload. |
| Impressum / Datenschutz | PASS | Both modals opened/closed and rendered their expected content. |
| Data deletion execution | NOT TESTED | Destructive deletion was not submitted. |
| Final app console health pull | NOT TESTED | Browser CDP tab-refresh timeout prevented the final dev-log query. No visible runtime overlay occurred before the timeout. |

Table ID: `WORK-BROWSER-D1-RETEST-01-ACCEPTANCE-20260830`

## Resolved finding

### WORK-D1-01 — PASS

Exact retest:

1. Open the existing user profile `AlexWorkQA-20260830-1947`.
2. Create Friends Room `72MWC`.
3. Add Shallow and set it current.
4. Open the room's invite URL in a second normal tab sharing the same Firebase UID.

Observed corrected result:

- The invite route displayed `Bereits beigetreten` and `Du bist bereits in diesem Room`.
- It displayed the preserved identity `AlexWorkQA-20260830-1947`.
- No nickname textbox and no `Room beitreten` control existed.
- `Raum öffnen` returned to the same room.
- Both tabs still showed Alex; Shallow attribution remained Alex.
- No duplicate participant was created.

Decision: the original self-invite identity-overwrite defect is resolved.

## New finding

### WORK-D1-R01-01

### Severity

HIGH

### User-visible behavior

A user can have an active Blind Match state and create/use a Friends Room. While inside that active room, a reload sends the user to the Blind Match proposal instead of restoring the room. Selecting the `Room` tab then says `Kein aktiver Raum`. The room and its queue still exist in Firestore and can only be recovered if the user retained and reopens the exact invite URL.

### Exact reproduction steps

1. Use a profile that currently has an active Blind Match proposal (the retest showed a partially anonymous 25-year-old candidate in Göttingen).
2. From Home, choose `Mit Freunden singen`.
3. Create Friends Room `72MWC`.
4. Add Shallow and set it current.
5. Add Perfect to the queue from the second same-auth tab and verify the first tab receives it without reload.
6. Reload either room tab.
7. Select the bottom navigation `Room` tab.
8. Optionally reopen the exact saved invite URL.

### Expected behavior

- An active room has restore priority over an outstanding match state.
- Reload returns directly to the same active room.
- The `Room` tab also resolves the same room from persistent server-backed membership.
- Room code, participants, current song, queue and invite URL remain intact.
- The outstanding match may remain available after the room is ended, but it must not hide or orphan the active room.

### Actual behavior

- Reload rendered `Dein verdecktes Karaoke-Match`.
- The `Room` tab rendered `Kein aktiver Raum`.
- The app did not provide an in-app path back to room `72MWC`.
- Reopening the exact invite URL displayed the same-UID guard and recovered room `72MWC`, including current Shallow and queued Perfect. This proves the room data remained active while normal restoration lost it.

### Browser evidence

- `04-room-after-self-invite.jpg`: active room immediately before the reload regression.
- `05-queue-realtime-reload.jpg` and `06-reload-shows-match-not-room.jpg`: Blind Match proposal displayed after reload.
- `07-room-manual-recovery.jpg`: `Room` tab says `Kein aktiver Raum`.
- Fresh DOM after direct invite recovery contained room code `72MWC`, current Shallow and queued Perfect.

### Likely area

Startup state arbitration and active-room lookup/persistence. Evidence indicates room data persists, but the app's boot resolver and `Room` navigation do not rediscover the active Friends Room when an active match also exists.

## Passed flows

- Page identity, basic rendering and desktop layout.
- Exact `WORK-D1-01` correction path.
- Friends Room creation and invite link.
- Current song, queue, external Karaoke target and same-auth realtime propagation.
- Direct-invite recovery proves room/queue data survived reload.
- Partially anonymous match proposal and one-sided accept/wait state.
- Start, Match and Freunde navigation.
- Impressum and Datenschutz modals.

## Screenshot evidence

- [`01-home-desktop-retest.jpg`](../../design/screenshots/work-browser-retest-01/01-home-desktop-retest.jpg) — current deployed Home with an active match activity.
- [`02-friends-room-before-self-join.jpg`](../../design/screenshots/work-browser-retest-01/02-friends-room-before-self-join.jpg) — Friends Room before the exact correction retest.
- [`03-self-invite-result.jpg`](../../design/screenshots/work-browser-retest-01/03-self-invite-result.jpg) — fixed `Bereits beigetreten` guard.
- [`04-room-after-self-invite.jpg`](../../design/screenshots/work-browser-retest-01/04-room-after-self-invite.jpg) — preserved identity/current song after `Raum öffnen`.
- [`05-queue-realtime-reload.jpg`](../../design/screenshots/work-browser-retest-01/05-queue-realtime-reload.jpg) — reload unexpectedly returns to the Blind Match proposal.
- [`06-reload-shows-match-not-room.jpg`](../../design/screenshots/work-browser-retest-01/06-reload-shows-match-not-room.jpg) — repeated evidence of the wrong post-reload state.
- [`07-room-manual-recovery.jpg`](../../design/screenshots/work-browser-retest-01/07-room-manual-recovery.jpg) — Room navigation reports no active room.
- [`08-match-accept-result.jpg`](../../design/screenshots/work-browser-retest-01/08-match-accept-result.jpg) — one-sided confirmation waiting state.

## Untested / limitations

- Independent two-user matching, mutual confirmation, cross-user queue, independent Friends Room join, feedback privacy and mutual friendship remain untested because only one Firebase-auth browser context was available.
- 360/390/430 px mobile widths remain untested because the Browser viewport was fixed.
- A final console/dev-log inspection and the post-abort search state were interrupted by a Cloud Browser CDP tab-refresh timeout; no fallback browser was substituted.
- No screenshot or success claim was fabricated for an unreachable state.

## Decision

Delivery 1 remains **not accepted** by this Work Browser retest. `WORK-D1-01` is resolved, but `WORK-D1-R01-01` must be corrected and the real deployment retested before Delivery 2 begins.
