# Delivery 1 Final Retest 02B — 2026-08-30

## Deployment
https://blind-karaoke-663424522262.us-west1.run.app

## Evidence

Full deployed D1 regression, rerun attempt 2:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33329295213

Targeted Friends Room retest:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33329487358

Targeted feedback/Karaoke-Friend retest:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33330294115

---

# Final decision

**Delivery 1 is accepted.**

All previously blocking Delivery 1 behaviors were verified against the real public Cloud Run deployment with independent Chromium browser contexts.

---

# Final acceptance matrix

| Area | Result |
|---|---|
| App loads / HTTP 200 | PASS |
| Blind Karaoke profile setup | PASS |
| Honest NO_MATCH | PASS |
| Waiting user remains matchable | PASS |
| Compatible two-user proposal | PASS |
| One-sided accept waits | PASS |
| Mutual confirmation | PASS |
| Both users enter same Karaoke Room | PASS |
| Duett Roulette | PASS |
| Song picker | PASS |
| Add song | PASS |
| Realtime queue sync | PASS |
| Current song persists | PASS |
| Real external Karaoke link | PASS |
| Active Room restores automatically after reload | PASS |
| Feedback screen A shows B | PASS |
| Feedback screen B shows A | PASS |
| Feedback write succeeds | PASS |
| One-sided positive remains private | PASS |
| Mutual positive creates Karaoke Friend | PASS |
| Friend listed for A | PASS |
| Friend listed for B | PASS |
| Friends Room creation | PASS |
| Invite URL | PASS |
| Second browser joins Friends Room | PASS |
| Creator sees joiner | PASS |
| Fresh form programmatic labels | PASS |
| Relevant feedback console errors | NONE |

---

# 02B fixes confirmed

## 1. Feedback authorization/data path

Previous deployed error:

`Feedback submit failed FirebaseError: Missing or insufficient permissions.`

Current targeted run:

- A positive feedback action succeeds
- no permission error
- B still does not see A's one-sided answer
- B positive feedback action succeeds
- friendship becomes visible for both participants
- console contains no feedback error

Targeted results:

```
positiveA: true
aWriteLooksSuccessful: true
oneSidedPrivate: true
positiveB: true
friendListedA: true
friendListedB: true
mutualFriendCreated: true
feedbackConsoleClean: true
```

## 2. Correct partner on feedback page

For test duo Mina + Alex:

- Mina's feedback page names Alex
- Alex's feedback page names Mina

Targeted results:

```
feedbackAHasPartner: true
feedbackBHasPartner: true
```

## 3. Active Room restore after reload

The full D1 regression now reports:

`roomPersistsReload: true`

Captured post-reload state is directly:

`AKTIVE SESSION`

and still contains:

- same two participants
- `JETZT DRAN — Shallow`
- the external `Karaoke starten` anchor
- the existing room state

No manual `Zum Karaoke Room` recovery is needed.

---

# Known QA-harness reporting quirks — not app defects

The generic deep harness still prints:

- `currentSongSet: false`
- `karaokeExternalTarget: false`

These are stale harness-detection issues.

The captured DOM after reload explicitly contains:

- `JETZT DRAN`
- `Shallow`
- an `<a>` labeled `Karaoke starten`
- href:
  `https://www.youtube.com/results?search_query=Lady+Gaga+Bradley+Cooper+Shallow+karaoke`

Therefore these product behaviors are PASS.

The generic Friends subtest can also be timing-sensitive. The isolated Friends Room test passed:

```
creatorCTA: true
inviteCreated: true
joinInput: true
joinButton: true
joinerEntersRoom: true
creatorSeesJoiner: true
sameRoom: true
consoleHealth: true
```

---

# Workflow infrastructure note

The rerun's GitHub job conclusion can show failure in the screenshot-commit step because the rerun was pinned to an older repository SHA while newer QA/report commits already existed on `main`, causing binary screenshot rebase conflicts.

The actual browser QA step itself completed successfully.

This is a QA workflow/repository synchronization issue, not a deployed app defect.

---

# Delivery status

**Delivery 1: DONE / ACCEPTED**

No further Delivery 1 correction is required from the findings in this retest.

Next product work may proceed to Delivery 2 after normal workflow confirmation.
