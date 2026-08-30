# AI Studio Build — Delivery 1 Correction 02A — Blind Match Core Only

You are correcting the **existing deployed Blind Karaoke Delivery 1 app**.

This is a deliberately small correction pass.

## Strict scope

Fix **only** the Blind Match core vertical slice:

1. anonymous user is ready
2. profile is persisted
3. user becomes searchable
4. search enters a visible SEARCHING state
5. candidate discovery runs
6. hard compatibility rules are applied
7. exactly one shared Match is created atomically
8. both users observe that same Match
9. both UIs enter MATCH_PROPOSED
10. if no candidate exists, show NO_MATCH while keeping the user searchable

Do **not** work on:
- Friends Room
- Duet Roulette
- song queue
- feedback
- desktop redesign
- new visual design
- Delivery 2
- any new product feature

Do not rebuild the app from scratch.

Preserve all currently working UI and the form-label accessibility fix.

Read:
- `SPEC.md`
- `docs/DELIVERY_1.md`
- `docs/ARCHITECTURE.md`
- `qa/ACCEPTANCE_MATRIX.md`
- `qa/reports/DEPLOYED_D1_RETEST_01_2026-08-30.md`

---

# Observed deployed defect

The live deployment was retested with two independent Chromium sessions.

## User A
- Nickname: MinaQA
- Age: 22
- Gender: Frau
- City: Göttingen
- Partner preference: Mann
- Preferred age: 25–40
- Availability: Wochenende, 18:00–23:00
- Venue: Café / Bar
- Styles: Pop, Balladen
- Songs: Shallow, Perfect, Dancing Queen

## User B
- Nickname: AlexQA
- Age: 32
- Gender: Mann
- City: Göttingen
- Partner preference: Frau
- Preferred age: 20–30
- Availability: Wochenende, 18:00–23:00
- Venue: Café / Bar
- Styles: Pop, 80er / 90er
- Songs: Shallow, Take on Me, Dancing Queen

They satisfy all Delivery 1 hard requirements.

Actual behavior:
both click **Match suchen** and both remain on the preference form. No SEARCHING, NO_MATCH or MATCH_PROPOSED screen appears.

There are no relevant browser console errors.

This means you must inspect the real current implementation and find where the chain stops.

---

# Required implementation

## 1. Make auth readiness explicit

Before enabling **Match suchen**:

- ensure Firebase anonymous auth has completed
- require a real non-empty `uid`
- if auth is still initializing, button is disabled with a small loading state
- if auth fails, show a visible concise error and retry action

Do not silently return from the click handler.

---

## 2. Persist one canonical searchable user document

On Match suchen, upsert:

`users/{uid}`

with at least:

- `uid`
- `nickname`
- `age`
- `gender`
- `city`
- `cityNormalized`
- `partnerPreference`
- `preferredAgeMin`
- `preferredAgeMax`
- `availability`
- `venuePreference`
- `musicStyles`
- `favoriteSongs`
- `searchable: true`
- `activeMatchId: null` unless already matched
- `updatedAt`

Normalize city deterministically, e.g. trim + lowercase + normalize whitespace.

For both literal input values `Göttingen`, `cityNormalized` must be exactly equal.

After write, do not immediately delete or mark the user unsearchable just because no candidate was found.

---

## 3. Implement a very simple D1 candidate discovery path

Avoid over-complicated Firestore querying.

Preferred D1 approach:

1. query a small bounded candidate set where:
   - `searchable == true`
   - same `cityNormalized`
2. exclude own uid
3. perform the remaining hard-condition filtering in the match engine in application code

Hard conditions, exactly:

1. candidate uid != current uid
2. same cityNormalized
3. availability overlaps
4. current user's partner preference accepts candidate gender
5. candidate's partner preference accepts current user's gender
6. candidate age is inside current user's preferred range
7. current user's age is inside candidate's preferred range
8. candidate has no active Match
9. current user has no active Match

Music is **soft only** and must never reject the MinaQA/AlexQA pair.

If a Firestore compound query or index is currently causing candidate discovery to fail, simplify it rather than adding unnecessary query complexity.

If Firestore rejects a query/write/transaction, surface the error visibly instead of returning silently.

---

## 4. Make Match creation atomic

Once a compatible candidate is selected, use one Firestore transaction.

Inside the transaction re-read both user documents and verify:

- both still exist
- both still searchable
- both still have no activeMatchId
- compatibility still holds

Then create exactly one `matches/{matchId}` document containing at least:

- `userA`
- `userB`
- `status: "proposed"`
- `acceptedByA: false`
- `acceptedByB: false`
- score/reasons if already supported
- createdAt

In the same transaction set on both users:

- `activeMatchId: matchId`
- `searchable: false`

This must prevent duplicate active matches.

---

## 5. Use user.activeMatchId as the simple realtime bridge

Do not require a complex OR query such as “matches where userA == me OR userB == me” for D1.

For each signed-in user:

1. subscribe to `users/{uid}`
2. if `activeMatchId` becomes non-null:
   - subscribe/read that match
   - transition UI to MATCH_PROPOSED

This ensures the first waiting user immediately learns that the second user created the Match.

---

## 6. Implement the visible state transition

Pressing **Match suchen** must immediately leave the static form state.

Required sequence:

### SEARCHING
Show a compact state such as:

**„Wir suchen dein Karaoke-Duo …“**

Disable duplicate search submissions.

### If candidate is found
Transition both users to:

`MATCH_PROPOSED`

and show the existing proposal / **Ich bin dabei** UI.

### If no candidate is found
Show:

**„Im Moment ist noch kein passendes Karaoke-Duo verfügbar.“**

Actions:
- Erneut suchen
- Präferenzen ändern

Important:
NO_MATCH does **not** mean the user becomes undiscoverable.

Keep:
`searchable: true`

and keep the user-document realtime subscription active.

If another compatible user later searches and creates a Match with this waiting user, automatically transition the waiting user from NO_MATCH to MATCH_PROPOSED without reload.

---

# Required debug instrumentation

Delivery 1 already specifies a debug drawer via `?debug=1`.

Use it to make this problem diagnosable.

Only in debug mode show non-sensitive technical fields:

- authReady
- uid
- current state
- profileWrite: idle | pending | success | error
- cityNormalized
- searchable
- activeMatchId
- candidateCount
- hardCompatibleCandidateCount
- last candidate rejection reasons
- matchTransaction: idle | pending | success | error
- last Firebase error code/message

Do not expose another user's private/contact data.

Do not show debug information in normal mode.

---

# Mandatory tests before completion

## Test 1 — one user only

Fresh private browser.

Create MinaQA profile above.

Click Match suchen.

Expected:
- UI visibly enters SEARCHING
- profile write succeeds
- if no candidate exists, UI enters NO_MATCH
- user document remains `searchable: true`
- no console error

## Test 2 — compatible second user

Keep MinaQA session open.

Open second independent/private session.

Create AlexQA profile above.

Click Match suchen.

Expected:
- Alex enters SEARCHING
- candidateCount >= 1
- MinaQA is considered hard-compatible
- exactly one Match is created
- both users get the same `activeMatchId`
- both UIs transition to MATCH_PROPOSED without reload

## Test 3 — hard mismatch

Create a third test pair with incompatible partner preference.

Expected:
- no Match
- honest NO_MATCH
- no fake profile

## Test 4 — music mismatch remains soft

Use otherwise compatible users with Pop vs Rock.

Expected:
- they may still Match
- music difference does not eliminate the candidate

## Test 5 — concurrency

Trigger near-simultaneous compatible searches.

Expected:
- no user obtains two active matches
- transaction prevents duplicate claim

## Test 6 — reload

Reload a user while in NO_MATCH:
- searchable state persists

Reload both users after MATCH_PROPOSED:
- same active Match is restored

---

# Do not continue past MATCH_PROPOSED

For this correction pass, once both users reliably reach the same MATCH_PROPOSED state, stop.

Do not repair confirmation, room, queue, Friends Room or feedback yet.

Those will be tested and corrected only after this deployed vertical slice passes.

---

# Completion response

Report only:

1. exact root cause found
2. services/components changed
3. Firestore user fields used for searchable/activeMatchId
4. candidate query shape
5. transaction behavior
6. realtime listener behavior
7. results of Tests 1–6
8. any remaining limitation before mutual-confirmation work

Do not claim success unless you actually verified the two independent sessions reach the same MATCH_PROPOSED state.
