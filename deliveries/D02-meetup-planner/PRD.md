# Delivery 2 PRD — Meetup Planner

## 1. Goal

Delivery 2 adds one focused capability to the accepted D1 product:

> After a mutual Blind Karaoke match, the two participants can agree on **when and where they will actually meet**.

D2 must not redesign or rebuild the D1 matching/Karaoke system.

---

## 2. User-visible outcome

After both users confirm a Blind Match, they can:

1. open **Treffen planen**
2. propose:
   - date
   - time
   - meetup/venue name
   - optional address
   - optional short note
3. the partner receives the proposal realtime
4. the partner can:
   - accept
   - send a counterproposal
   - decline/cancel meetup planning
5. once the current proposal is accepted, both see the same **confirmed Meetup Card**
6. from that card they can:
   - open a route in Google Maps via normal URL
   - download an `.ics` calendar file
   - update realtime status
   - cancel the meetup
   - open the existing Karaoke Room

The product should now support:

**Blind Match → mutual confirmation → Meetup Planner → confirmed meetup → Karaoke Room**

---

## 3. Entry point

D1's mutually confirmed Match screen remains valid.

Add:

### Primary action
**Treffen planen**

### Secondary action
**Zum Karaoke Room**

The Meetup Planner must not block access to the existing D1 Karaoke Room.

If a meetup already exists for this Match, the primary action becomes:

**Treffen anzeigen**

---

## 4. Proposal form

Keep it intentionally small.

Fields:

### Date
Required.

HTML/native date input is acceptable.

Do not allow an invalid/empty date.

### Time
Required.

Use local wall-clock time.

### Treffpunkt / Karaoke-Bar
Required text field.

Examples:
- Karaoke Bar XYZ
- Sing Sing Karaoke
- Nachbarschaftszentrum

### Adresse
Optional text field.

Example:
`Bahnhofstraße 12, Göttingen`

### Notiz
Optional.

Maximum 160 characters.

This is **not chat**. It is only one note attached to the current proposal.

Example:
`Ich reserviere einen Tisch.`

Button:

**Vorschlag senden**

---

## 5. One current proposal only

D2 should avoid conversation-thread complexity.

For each confirmed Match there is at most **one active meetup proposal**.

The active proposal contains:
- proposer
- date
- time
- venue name
- address
- note
- proposal version
- status

When the other participant sends a counterproposal:

- replace the active proposal with the new version
- previous proposal is no longer actionable
- proposer becomes the counterproposer
- other participant must accept the new current proposal

No proposal history UI is required in D2.

---

## 6. Proposal received

The receiving participant sees a realtime card:

### Vorschlag von {partner}

- date
- time
- venue
- address if provided
- note if provided

Actions:

### Vorschlag annehmen

Confirms the current proposal.

### Anderen Termin vorschlagen

Opens the same proposal form prefilled with current values.

Submitting creates a new proposal version.

### Treffen nicht planen / Absagen

Cancels meetup planning for this Match.

Use a confirmation step before destructive cancellation.

---

## 7. Confirmation semantics

A proposal is mutually confirmed when:

- participant A created the current proposal, and
- participant B explicitly accepted it

or vice versa.

The proposer is implicitly agreeing to their own proposal.

Do not require the proposer to click a second redundant confirmation button.

Use a proposal version / updated timestamp check so a late acceptance cannot accidentally accept a superseded proposal.

---

## 8. Confirmed Meetup Card

After confirmation both users see the same card.

Example:

### Karaoke mit Alex

**Freitag, 5. September · 20:00**

**Karaoke Bar XYZ**  
Bahnhofstraße 12, Göttingen

Optional note.

Actions:

- **Route öffnen**
- **In Kalender speichern**
- **Zum Karaoke Room**
- **Treffen ändern**
- **Treffen absagen**

Status area:

- Du: …
- Alex: …

All relevant changes appear realtime.

---

## 9. Route öffnen

No Maps API.

If address exists, generate an external Google Maps search/navigation URL from the address.

If address is empty, use venue + city when available.

Open in a new tab/window.

D2 must not:
- request GPS
- calculate routes itself
- embed a Google Map
- use a Places API key

---

## 10. Calendar export

Generate an `.ics` file client-side.

Minimum fields:

- DTSTART
- DTEND
- SUMMARY
- LOCATION
- DESCRIPTION

Default duration:

**3 hours**

Example summary:

`Blind Karaoke mit Alex`

Use a calendar-safe local datetime representation.

No Google Calendar API integration is required.

Button:

**In Kalender speichern**

must download/open a valid `.ics` file.

---

## 11. Realtime meetup status

After the meetup is confirmed, each participant can set only their own status.

D2 statuses:

- `PLANNED` — default
- `ON_WAY` — Ich bin unterwegs
- `ARRIVING_15` — Bin in 15 Minuten da
- `ARRIVED` — Bin da

Optional UI action:

**Status ändern**

Show the choices compactly.

The partner sees the status update realtime without reload.

Store:
- status
- updatedAt

Do not implement continuous GPS/location tracking.

---

## 12. Cancellation

Either participant can cancel a confirmed or proposed meetup.

Require confirmation:

> Treffen wirklich absagen?

After cancellation:

- both users see **Treffen abgesagt**
- proposal/meeting controls become non-active
- existing D1 Match and Karaoke-Friend data are not deleted
- existing Karaoke Room data is not destroyed merely because the meetup was cancelled

Allow:

**Neues Treffen vorschlagen**

which starts a fresh proposal for the same confirmed Match.

---

## 13. Change meeting

On a confirmed meetup:

**Treffen ändern**

opens the proposal form with existing values.

Submitting a change:

- creates a new proposal version
- status returns to proposal/pending
- other participant must accept the changed proposal

This prevents one participant from silently changing an agreed date/location.

---

## 14. Data model delta

Prefer one meetup document per Match:

### `meetups/{matchId}`

Example:

```ts
{
  matchId: string,
  participantIds: [uidA, uidB],

  state:
    | "PROPOSED"
    | "CONFIRMED"
    | "CANCELLED",

  proposalVersion: number,
  proposerUid: string,

  proposal: {
    dateISO: "2026-09-05",
    time: "20:00",
    venueName: "Karaoke Bar XYZ",
    address: "Bahnhofstraße 12, Göttingen",
    note: "Ich reserviere einen Tisch."
  },

  acceptedByUid: string | null,

  participantStatus: {
    [uidA]: {
      status: "PLANNED" | "ON_WAY" | "ARRIVING_15" | "ARRIVED",
      updatedAt: Timestamp
    },
    [uidB]: {
      status: "...",
      updatedAt: Timestamp
    }
  },

  createdAt: Timestamp,
  updatedAt: Timestamp,
  confirmedAt: Timestamp | null,
  cancelledAt: Timestamp | null,
  cancelledByUid: string | null
}
```

No new collection is required beyond `meetups` unless the existing implementation strongly benefits from another shape.

---

## 15. Security delta

Firestore rules for `meetups/{matchId}` must enforce:

- authenticated anonymous Firebase user required
- only the two participants of the underlying confirmed Match can read
- only those participants can create/update
- `participantIds` cannot be changed to arbitrary users
- user may update only their own participant status
- proposer/accept/cancel actions must correspond to an actual participant
- unrelated users cannot read meetup details/address/note

Do not loosen existing D1 Match/Room/Feedback rules.

---

## 16. Realtime behavior

Use Firestore `onSnapshot` or the existing realtime pattern for the Meetup document.

Both participants must see without reload:

- new proposal
- counterproposal
- acceptance
- confirmation
- cancellation
- participant status updates

Avoid polling.

---

## 17. Components / module delta

Add small focused components:

### `MeetupPlannerScreen`
Owns current meetup presentation state.

### `MeetupProposalForm`
Input/validation only.

### `MeetupProposalCard`
Displays partner proposal and actions.

### `MeetupConfirmedCard`
Displays confirmed details + quick actions.

### `MeetupStatusControl`
Updates only current user's status.

### `meetupService`
Owns Firestore create/update/accept/cancel/realtime operations.

### `icsService`
Pure client-side calendar generation/download.

### `mapsLinkService`
Pure URL construction.

Do not put Firestore logic directly in presentation components.

---

## 18. UI/UX

Reuse D1 visual language:

- white background
- very light gray surfaces
- pink primary CTA
- restrained violet accents
- dark readable text
- rounded cards
- large mobile touch targets

No new navigation architecture.

No chat-style message bubbles.

No embedded maps.

Keep each screen focused on one primary decision.

Mockup references are stored under:

`deliveries/D02-meetup-planner/design/mockups/`

Written PRD wins if a mockup conflicts with scope.

---

## 19. D2 state model

Keep simple:

```text
MATCH_CONFIRMED
→ MEETUP_NONE
→ MEETUP_PROPOSED
→ MEETUP_CONFIRMED
→ MEETUP_CANCELLED
```

A counterproposal remains `MEETUP_PROPOSED` with a new `proposalVersion`.

Participant arrival status is independent of meetup state and only active when confirmed.

No state-machine library required.

---

## 20. Explicitly out of scope

Do not implement in D2:

- public profiles
- swipe/search directory
- in-app chat
- arbitrary messaging thread
- Google Places API
- venue search database
- embedded maps
- GPS/live location
- distance tracking
- push notifications
- reservations
- payments
- group meetups
- reviews/ratings
- AI/LLM
- complex recurrence
- timezone selector
- calendar account OAuth

---

## 21. Acceptance criteria

### D2-A1 — proposal
After mutual D1 Match confirmation, A can send date/time/place proposal.

B sees it realtime.

### D2-A2 — accept
B accepts the current proposal.

Both see the same confirmed Meetup Card.

### D2-A3 — counterproposal
B sends a counterproposal.

A sees the replacement proposal realtime.

Old proposal cannot be accepted afterward.

### D2-A4 — changed confirmed meetup
A changes a confirmed meetup.

Meeting returns to pending proposal.

B must accept the new version.

### D2-A5 — route
Route button opens a valid external Google Maps target based on address/venue.

### D2-A6 — ICS
Calendar button produces a valid `.ics` event with date/time/location/summary.

### D2-A7 — realtime status
A sets `ON_WAY`.

B sees it without reload.

B sets `ARRIVED`.

A sees it without reload.

### D2-A8 — cancellation
A cancels.

B sees `Treffen abgesagt` realtime.

No D1 Match/Karaoke Room/Friend data is deleted.

### D2-A9 — restart after cancellation
Either participant can make a fresh meetup proposal after cancellation.

### D2-A10 — security
Unrelated authenticated user cannot read or mutate another Match's meetup.

### D2-A11 — reload
Proposal/confirmed meetup/status survive reload and restore the correct Meetup state.

---

## 22. Mandatory D1 regressions

D2 Browser QA must verify at least:

- Blind Match still works
- one-sided confirmation still waits
- mutual confirmation still works
- Karaoke Room still opens
- queue realtime sync still works
- feedback/Karaoke Friend still works
- Friends Room invite/join still works

D2 must not regress D1.

---

## 23. Definition of Done

D2 is not accepted when code is generated.

It is accepted only after:

1. implementation is deployed
2. real Work Browser QA runs against the deployment
3. D2 acceptance criteria pass
4. mandatory D1 regressions pass
5. real screenshots are stored
6. QA report is stored
7. correction/retest loop is complete
8. `ACCEPTANCE.md` is created
9. only then are living project docs updated
