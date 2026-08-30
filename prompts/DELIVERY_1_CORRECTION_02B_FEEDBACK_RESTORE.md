# AI Studio Build — Delivery 1 Correction 02B — Feedback + Room Restore

Correct the **existing Blind Karaoke Delivery 1 implementation**.

This is a small finishing correction. Do not rebuild the app and do not begin Delivery 2.

Read first:
- `SPEC.md`
- `docs/DELIVERY_1.md`
- `docs/ARCHITECTURE.md`
- `qa/ACCEPTANCE_MATRIX.md`
- `qa/reports/DEPLOYED_D1_RETEST_02A_2026-08-30.md`

## Preserve all behavior that now passes

Do not redesign or rewrite:
- Blind Match candidate discovery
- NO_MATCH
- MATCH_PROPOSED
- one-sided waiting
- mutual confirmation
- shared Karaoke Room creation
- Duett Roulette
- song picker / queue
- realtime queue sync
- current-song selection
- external Karaoke link
- Friends Room creation/join
- accessible form labels

The deployed retest verified these.

---

# Fix 1 — Feedback submission is denied by Firestore

## Actual deployed error

Both users reach the real “Wie war euer Abend?” screen.

When either user submits feedback, browser console reports:

`Feedback submit failed FirebaseError: Missing or insufficient permissions.`

As a result, mutual-positive feedback cannot produce a Karaoke Friend.

## Required correction

Trace the exact current:
- feedback collection/document path
- document shape
- write function in `feedbackService`
- Firestore security rules
- mutual-positive read/evaluation path

Make the smallest coherent correction.

### Required authorization behavior

For a confirmed/completed Match:

1. User A may create/update **only A's own feedback document**.
2. User B may create/update **only B's own feedback document**.
3. An unrelated authenticated user cannot write feedback for that Match.
4. The client must not expose the other participant's raw one-sided answer before mutual-positive resolution.
5. A user must not be able to forge `fromUserId` as another participant.

A simple D1 document scheme is acceptable, for example:

`feedback/{matchId}_{uid}`

with:

```ts
{
  matchId,
  fromUserId: uid,
  wantsToSingAgain: boolean,
  createdAt,
  updatedAt
}
```

Security rules should validate:
- `request.auth != null`
- `request.auth.uid == fromUserId`
- current uid is actually one of the Match participants
- document id/data refer to the same Match/user as appropriate

Use the project's actual schema if it already has an equivalent design. Do not create parallel duplicate feedback models.

### Mutual-positive result

After a participant submits feedback:

- it is okay to show only a neutral state such as “Antwort gespeichert”.
- do not reveal whether the other participant already selected Yes.

When both own-feedback docs exist and both are positive:

create exactly one deterministic Karaoke-Friend relationship.

Use a deterministic friendship ID such as sorted UIDs if compatible with current architecture, so duplicate clicks/races cannot create duplicate friendships.

Both participants may then see:
**„Ihr seid jetzt Karaoke-Freunde.“**

If only one response is positive:
- no Karaoke Friend is created
- the other participant's choice remains private

---

# Fix 2 — Feedback page shows participant B their own name

## Actual deployed state

For test duo Mina + Alex:

- Mina's screen correctly says feedback is about Alex.
- Alex's screen also says feedback is about Alex.

That is wrong.

## Required correction

Determine the partner from the current authenticated uid, not from fixed userA/userB ordering.

Use equivalent logic:

```ts
const partnerId =
  participantIds.find(id => id !== currentUid);
```

or for Match fields:

```ts
const partnerId =
  match.userA === currentUid ? match.userB : match.userA;
```

Then load/display that partner.

Test:
- A sees B's nickname
- B sees A's nickname

Use this same partner resolver anywhere in the feedback result flow where current-user ordering matters.

---

# Fix 3 — Restore the active Room automatically after reload

## Actual deployed behavior

Before reload:
both users are inside the same active Karaoke Room.

After reload:
the Room still exists, but the UI falls back to:

`Duett-Partner gefunden → Zum Karaoke Room`

Pressing **Zum Karaoke Room** successfully recovers the same Room.

Therefore storage is working; bootstrap/UI-state restoration is incomplete.

## Required correction

After Firebase auth becomes ready:

1. load/subscribe to `users/{uid}`
2. resolve the current `activeMatchId` / active confirmed Match
3. resolve that Match's active Room
4. if the user is a room participant and room status is active:
   - set/derive app state `ROOM_ACTIVE`
   - restore the Karaoke Room automatically
   - restore the room route if routing is used

Do not create a new Room on reload.

Do not duplicate queue data.

Do not reset the current song.

Do not clear the confirmed Match.

### Priority rule on bootstrap

Use a deterministic recovery priority approximately like:

1. active Room → `ROOM_ACTIVE`
2. confirmed Match without active Room → `MATCH_CONFIRMED`
3. proposed Match → `MATCH_PROPOSED`
4. searchable waiting profile → `NO_MATCH` / waiting state
5. otherwise normal Home/Profile state

Wait for auth + necessary Firestore bootstrap data before deciding there is no active Room. Avoid a flash/reset caused by rendering Home too early.

---

# Mandatory deployed-style tests before completion

## Test A — Feedback write permissions

Create/complete a real two-user match.

A chooses:
**Wieder zusammen singen**

Expected:
- write succeeds
- no permission error
- A sees neutral stored/pending state
- B does not learn A's answer

## Test B — one-sided privacy

Only A submits positive feedback.

Expected:
- no Karaoke Friend
- B cannot read/see that A chose positive
- no console error

## Test C — correct partner names

On feedback screens:
- A sees B's nickname
- B sees A's nickname

Never show the viewer as the person they are rating.

## Test D — mutual positive

A chooses positive.
B chooses positive.

Expected:
- both writes succeed
- exactly one KaraokeFriend record
- both users eventually see mutual Karaoke-Friend result
- no duplicate friendship documents

## Test E — negative combination

At least one participant chooses “Diesmal nicht”.

Expected:
- no Karaoke Friend
- other user's raw answer remains private

## Test F — reload active Room

Both users enter the shared Room.
Add Shallow and set it as current song.
Reload each browser.

Expected without manual click:
- each returns directly to the same `ROOM_ACTIVE`
- same partner
- same Room
- Shallow remains current
- queue/current-song state is not duplicated/reset

## Test G — regression

Verify quickly:
- first user can reach honest NO_MATCH
- second compatible user causes both to reach proposal
- one-sided confirmation waits
- mutual confirmation works
- room opens
- add song syncs to second browser
- Duett Roulette still works
- Friends Room invite + second-user join still works
- no new relevant console errors

---

# Definition of Done for Correction 02B

Do not claim complete unless:

- feedback permission error is gone
- correct partner is shown to each participant
- one-sided response is private
- mutual positive creates exactly one KaraokeFriend
- active Room restores automatically after reload
- already-passing match/room/friends behavior has not regressed

After implementation, report only:
1. root cause of feedback permission failure
2. security-rule/data-path changes
3. feedback partner-resolution change
4. room bootstrap/restoration change
5. tests performed and results
6. any remaining Delivery 1 failure

Do not plan Delivery 2.
