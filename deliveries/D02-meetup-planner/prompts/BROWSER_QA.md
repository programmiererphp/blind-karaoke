# Work Browser QA Prompt — Delivery 2 Meetup Planner

Test the **real deployed Blind Karaoke app** after Delivery 2 implementation using ChatGPT Work's built-in Browser / Cloud Browser.

This is a deployed-product test, not a code review.

Repository:
https://github.com/programmiererphp/blind-karaoke

## Read first
- `SPEC.md`
- `ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `SECURITY.md`
- `deliveries/D02-meetup-planner/DELIVERY.md`
- `deliveries/D02-meetup-planner/PRD.md`
- `deliveries/D02-meetup-planner/prompts/BUILD.md`
- D1 final QA/retest reports as regression reference

Use the deployed app as the **actual state**.

Do not infer success from source code or the implementation agent's report.

---

# Required environment

Use:
- real Work Browser
- mobile viewport around 390×844
- desktop around 1440×900 when available
- two independent sessions/contexts for participant A/B
- a third unrelated authenticated context for security test if practical

Use unique test nicknames.

Example:
- `MinaD2QA-<timestamp>`
- `AlexD2QA-<timestamp>`

Use the same compatible D1 profile structure as existing QA data.

---

# Phase 1 — establish a real D1 confirmed Match

Using A and B:

1. create compatible Blind Karaoke profiles
2. A searches/waits
3. B searches
4. both receive the same proposal
5. A accepts
6. verify A waits
7. B accepts
8. verify mutual confirmation

Record D1 regression result.

Do not skip directly to a fabricated confirmed state.

---

# Phase 2 — D2 proposal

From the confirmed Match:

A clicks:
`Treffen planen`

Enter:
- date: choose a future test date
- time: 20:00
- venue: `Karaoke Bar D2 QA`
- address: `Bahnhofstraße 12, Göttingen`
- note: `D2 Browser QA`

Submit.

Verify:
- A sees proposal sent/pending
- B receives the same proposal without reload
- B sees correct proposer/date/time/venue/address/note

Screenshot both sides.

---

# Phase 3 — counterproposal

Before accepting, B chooses:
`Anderen Termin vorschlagen`

Change:
- time to 19:30
- venue to `Karaoke House D2 QA`

Submit.

Verify:
- A receives new proposal realtime
- current proposal now belongs to B
- old proposal is no longer actionable
- proposal version semantics prevent stale acceptance

Screenshot.

---

# Phase 4 — confirmation

A accepts B's current proposal.

Verify:
- both see Meetup CONFIRMED
- both see same date/time/place
- no duplicate meetup docs/cards
- confirmed state persists realtime

Screenshot both.

---

# Phase 5 — change confirmed meeting

From confirmed meetup, A chooses:
`Treffen ändern`

Change time by e.g. 30 minutes.

Submit.

Verify:
- meetup is pending again
- B must explicitly accept the changed version
- old confirmed details are not silently treated as still mutually agreed

Let B accept.

Verify confirmed again.

---

# Phase 6 — route

Click:
`Route öffnen`

Verify:
- it is a real external link/control
- target is a valid Google Maps URL
- query is based on the entered address/venue
- no Maps API dependency/error is required

It is sufficient to verify the correct external target if Work Browser restricts external navigation.

---

# Phase 7 — calendar

Click:
`In Kalender speichern`

Verify a real `.ics` file/download is generated.

If Work can inspect the file, verify:
- DTSTART
- DTEND
- SUMMARY
- LOCATION
- DESCRIPTION

If file inspection is unavailable, verify the download action and record the limitation.

---

# Phase 8 — realtime participant status

With both sessions on the Meetup Card:

A:
`Ich bin unterwegs`

Verify B sees it realtime.

A:
`Bin in 15 Minuten da`

Verify B sees it.

B:
`Bin da`

Verify A sees it.

Verify one user cannot directly change the other user's status through normal UI.

Screenshot.

---

# Phase 9 — reload restore

With confirmed meetup and statuses present:

Reload A.
Reload B.

Verify:
- correct meetup state restored automatically
- same date/time/place
- statuses retained
- no duplicate meetup
- D1 Match remains intact

---

# Phase 10 — cancellation and restart

A cancels the meetup.

Verify:
- confirmation step exists
- B sees `Treffen abgesagt` realtime
- D1 Match is not deleted
- existing Karaoke Room/Friend data is not destroyed

Then B starts:
`Neues Treffen vorschlagen`

Verify a fresh active proposal can be created.

---

# Phase 11 — unauthorized third user

If Work Browser can maintain a third independent session:

- authenticate unrelated User C
- attempt to access another pair's meetup through any visible/direct route available

Expected:
- no meetup details are exposed
- no mutation is possible

If direct low-level Firestore access is not available in Work Browser, test the accessible UI route and mark deeper rule enforcement as not fully browser-testable.

Do not fabricate a security PASS beyond what was actually tested.

---

# Phase 12 — mandatory D1 regressions

Verify at minimum:

- confirmed Match remains usable
- existing Karaoke Room opens
- add one song and verify realtime sync
- Duett Roulette still works
- feedback/Karaoke-Friend flow still works
- Friends Room invite/join still works

Do not rerun every historical edge case unless needed.

---

# Responsive / UI checks

Mobile:
- no horizontal scroll
- meetup proposal form usable
- fixed navigation does not cover actions
- confirmed card readable
- status controls usable

Desktop:
- no broken/clipped layout
- no horizontal overflow

Capture representative screenshots.

---

# Console/runtime

Inspect Work Browser console/dev logs where available.

Record real:
- Firestore permission errors
- uncaught exceptions
- failed writes
- broken navigation
- download/link errors

Do not treat harmless aborted navigation requests as defects without user-visible impact.

---

# Save evidence in GitHub

Store screenshots under:

`deliveries/D02-meetup-planner/qa/screenshots/`

Recommended:
- 01-proposal-A
- 02-proposal-received-B
- 03-counterproposal
- 04-confirmed
- 05-status-realtime
- 06-reload-restored
- 07-cancelled
- 08-fresh-proposal
- 09-karaoke-regression
- 10-mobile
- 11-desktop

Do not mix generated mockups with deployed screenshots.

---

# Write QA report

Create/replace:

`deliveries/D02-meetup-planner/qa/REPORT.md`

Required sections:
- deployment URL
- date/time
- Work Browser environment
- tested sessions/viewports
- D2 acceptance table D2-A1..D2-A11
- D1 regression table
- findings with ID/severity/reproduction/expected/actual/evidence
- screenshots
- console/runtime evidence
- untested limitations
- final result: PASS / PASS WITH MINOR ISSUES / FAIL

---

# Generate correction from actual findings

If there are defects:

Create:

`deliveries/D02-meetup-planner/corrections/CORRECTION_01.md`

It must:
- fix only actual Browser findings
- preserve passing D1/D2 behavior
- avoid rebuilding the app
- contain exact repro and expected result
- contain focused regression tests
- not begin D3

If too large, split into 01A/01B starting with the smallest blocker.

If D2 fully passes:
- do not invent a correction
- create `deliveries/D02-meetup-planner/ACCEPTANCE.md`
- update `DELIVERY.md` to ACCEPTED
- update `ROADMAP.md`
- then update affected living docs (`SPEC.md`, `ARCHITECTURE.md`, etc.) to the accepted D2 state
- do not begin D3 automatically

---

# Final response

Return:
1. D2 Work Browser status
2. actual defects by severity
3. QA report link
4. correction or acceptance link
5. whether D2 is accepted
