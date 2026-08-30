# Delivery 1 Retest 02A — 2026-08-30

## Deployment
https://blind-karaoke-663424522262.us-west1.run.app

## Primary browser evidence

Full two-browser + room retest:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33329295213

Targeted Friends Room join retest:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33329487358

Tests used real Chromium/Playwright against the public Cloud Run deployment with independent browser contexts.

---

# Executive result

**Correction 02A successfully repaired the Blind Match core.**

The product now completes the main path through:

`NO_MATCH → MATCH_PROPOSED → one-sided waiting → mutual confirmation → Karaoke Room → realtime queue`.

Delivery 1 is **not yet fully accepted** because the feedback/Karaoke-Friend write is rejected by Firestore permissions and the active room is not automatically restored as the current screen after reload.

---

# Acceptance status

| Area | Result | Evidence |
|---|---|---|
| App loads / HTTP 200 | PASS | deployed browser run |
| Honest no-match state | PASS | first user gets “Kein Duo gefunden” |
| Waiting user remains matchable | PASS | second compatible user later matches first |
| Both users see same proposal | PASS | both reach “DUO GEFUNDEN” |
| One-sided accept waits | PASS | first accepter gets waiting state |
| Mutual confirmation | PASS | both get “Duett-Partner gefunden” |
| Both enter same Karaoke Room | PASS | both show active duo session |
| Duett Roulette | PASS | challenge/recommendation appears |
| Add song | PASS | Shallow added |
| Realtime queue sync | PASS | Shallow appears in second browser without reload |
| Set current song | PASS | DOM shows “JETZT DRAN — Shallow” |
| External Karaoke target | PASS | “Karaoke starten” is a real anchor to a YouTube karaoke-search URL |
| Friends Room create | PASS | invite URL created |
| Friends Room join | PASS | targeted test: second browser joins and creator sees joiner |
| Form labels | PASS | fresh browser: Nickname/Alter labels resolve programmatically |
| One-sided feedback privacy | BLOCKED | feedback write itself is denied |
| Mutual Karaoke Friend | FAIL | Firestore feedback writes denied |
| Room data survives reload | PASS/PARTIAL | Match/room can be recovered via “Zum Karaoke Room” |
| Active room screen restores automatically after reload | FAIL | reload lands on confirmed-match screen, not ROOM_ACTIVE |
| Console health | FAIL during feedback only | FirebaseError: Missing or insufficient permissions |

---

# Important QA-harness false negatives clarified

The deep harness initially reported `currentSongSet: false` and `karaokeExternalTarget: false`.

Inspection of the captured DOM state shows these are **test-harness false negatives**, not app defects:

- “JETZT DRAN” contains **Shallow**
- the rendered `Karaoke starten` control is an `<a>` with:
  `https://www.youtube.com/results?search_query=Lady+Gaga+Bradley+Cooper+Shallow+karaoke`

Therefore the current-song and external karaoke-link behavior is accepted.

The first generic Friends test was also timing-sensitive around anonymous-auth readiness. A separate targeted run waited for auth/UI readiness and passed all Friends Room checks:

- `creatorCTA: true`
- `inviteCreated: true`
- `joinInput: true`
- `joinButton: true`
- `joinerEntersRoom: true`
- `creatorSeesJoiner: true`
- `sameRoom: true`
- `consoleHealth: true`

---

# Confirmed remaining defects

## HIGH BK-D1-07 — Feedback writes denied by Firestore

After both participants finish the room and reach “Wie war euer Abend?”, pressing the positive feedback action produces:

`Feedback submit failed FirebaseError: Missing or insufficient permissions.`

This happens in both browser contexts.

### Impact
- feedback cannot be persisted
- one-sided feedback semantics cannot be fully validated
- two positive answers cannot create a Karaoke Friend
- console health fails on this path

### Expected
Each authenticated room/match participant can write only their own feedback for that match. The other participant cannot read the raw one-sided response. Mutual-positive evaluation can safely create the Karaoke-Friend relationship.

---

## MEDIUM BK-D1-08 — Feedback screen uses wrong partner name for participant B

Captured state:

- A is asked for feedback about Alex — correct.
- B is also asked for feedback about Alex, although B **is Alex**.

B should be asked for feedback about Mina.

### Expected
Resolve partner by:

`partnerId = participantIds.find(id => id !== currentUid)`

Do not assume userA/userB ordering corresponds to the current viewer.

---

## MEDIUM BK-D1-09 — Active Karaoke Room not restored automatically after reload

Before reload both users are in the active Room.

After reload the app returns to:

`Duett-Partner gefunden → Zum Karaoke Room`

The same room still exists and both users can recover it by pressing **Zum Karaoke Room**.

### Expected
If bootstrap discovers:
- authenticated user
- confirmed active match
- active room belonging to that match/user

then restore the UI directly to `ROOM_ACTIVE` (or preserve the room route) without requiring an extra manual navigation step.

No room data is lost; this is state restoration/navigation, not a room-storage failure.

---

# Not defects after targeted retest

Do not spend the next correction on:

- Blind Match discovery
- NO_MATCH
- one-sided waiting
- mutual confirmation
- room creation
- song queue
- realtime queue sync
- Duett Roulette
- current-song selection
- external karaoke URL
- Friends Room creation/join
- form labels

Those behaviors passed the deployed retest.

---

# Delivery decision

Delivery 1 remains open.

Next correction should be a small **02B finish-D1 pass** limited to:

1. Firestore feedback authorization/data-path correction
2. correct partner resolution on feedback screen
3. automatic restoration of ROOM_ACTIVE after reload

After that, rerun:
- feedback privacy
- mutual-positive Karaoke Friend creation
- room reload persistence
- regression of the already-passing core path

Do not start Delivery 2 before this passes.
