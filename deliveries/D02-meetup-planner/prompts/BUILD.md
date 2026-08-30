# AI Studio Build Prompt — Delivery 2 Meetup Planner

Implement **only Delivery 2 — Meetup Planner** in the existing Blind Karaoke app.

Do not rebuild the application from scratch.

## Read first
Repository:
https://github.com/programmiererphp/blind-karaoke

Read:
- `SPEC.md`
- `docs/ARCHITECTURE.md`
- `SECURITY.md`
- `docs/DESIGN.md`
- `deliveries/D02-meetup-planner/PRD.md`
- `deliveries/D02-meetup-planner/DELIVERY.md`

The D2 PRD is the authoritative incremental scope.

## Preserve Delivery 1
Do not rewrite working D1 matching, Karaoke Room, queue, Friends Room, feedback or Karaoke-Friend behavior unless a tiny integration change is necessary for D2.

No public profiles, chat, GPS, Maps API, AI, push notifications, reservations or payments.

---

# Build exactly this D2 flow

After a **mutually confirmed Blind Match**:

### Primary
`Treffen planen`

### Secondary
`Zum Karaoke Room`

If a meetup already exists:
`Treffen anzeigen`

## Proposal form
Required:
- date
- time
- Treffpunkt / Karaoke-Bar

Optional:
- address
- note <= 160 chars

Button:
`Vorschlag senden`

## Proposal received
Partner sees realtime:
- proposer
- date/time
- venue/address/note

Actions:
- `Vorschlag annehmen`
- `Anderen Termin vorschlagen`
- `Treffen nicht planen` / cancel

A counterproposal replaces the active proposal and increments `proposalVersion`.

A stale proposal version must never be accepted.

## Confirmation
The proposer implicitly accepts their own current proposal.

When the other participant accepts the same current proposal version:
- meetup becomes `CONFIRMED`
- both see the same confirmed Meetup Card

## Confirmed card
Show:
- partner
- date
- time
- venue
- optional address/note
- both participant statuses

Actions:
- Route öffnen
- In Kalender speichern
- Zum Karaoke Room
- Treffen ändern
- Treffen absagen

## Status
Each participant can update only their own:
- PLANNED
- ON_WAY
- ARRIVING_15
- ARRIVED

Partner sees changes realtime.

## Change
Changing a confirmed meetup creates a new pending proposal version requiring partner acceptance.

## Cancel
Either participant can cancel after confirmation dialog.

Cancellation must not delete the D1 Match, Karaoke Room or Karaoke Friend relationship.

Allow a new meetup proposal afterward.

---

# Firestore

Prefer:
`meetups/{matchId}`

Use the exact schema/semantics in the PRD unless the current code requires a clearly equivalent shape.

Use realtime listener for the meetup document.

Use transaction or version-safe update for acceptance/counterproposal where needed.

## Security rules
Only participants of the underlying confirmed Match may read/write the meetup.

An unrelated authenticated user must be denied.

A participant may not modify the other participant's realtime status.

Do not weaken D1 rules.

---

# Route

No Google Maps API.

Construct a normal encoded external Google Maps URL from:
1. address when present
2. otherwise venue + known city

Open externally.

---

# Calendar

Generate a valid `.ics` client-side.

Use:
- DTSTART
- DTEND
- SUMMARY
- LOCATION
- DESCRIPTION

Default event length: 3 hours.

No Google Calendar OAuth/API.

---

# Components

Prefer small additions:
- MeetupPlannerScreen
- MeetupProposalForm
- MeetupProposalCard
- MeetupConfirmedCard
- MeetupStatusControl
- meetupService
- icsService
- mapsLinkService

Keep Firestore logic out of pure UI components.

---

# UI

Continue the accepted D1 visual system:
- bright/white
- restrained pink/violet
- mobile-first
- simple cards
- large touch controls
- no chat UI
- no embedded maps

Reference:
`deliveries/D02-meetup-planner/design/mockups/`

Do not attempt pixel-perfect imitation when it conflicts with functionality or existing D1 components.

---

# Mandatory implementation tests

Before reporting complete, test at least:

1. A sends proposal → B sees realtime
2. B accepts → both confirmed
3. counterproposal replaces current proposal
4. stale version cannot be accepted
5. change confirmed meetup → pending again
6. status A → B realtime
7. status B → A realtime
8. route URL valid
9. ICS file generated
10. cancellation visible realtime
11. reload restores meetup state
12. unrelated auth user cannot read/update meetup
13. D1 Match still works
14. D1 Karaoke Room/queue still works
15. D1 feedback/Karaoke Friends still works
16. Friends Room still works

No fake/mock success states.

---

# After implementation

Do not claim D2 accepted.

Write a concise implementation summary suitable for:

`deliveries/D02-meetup-planner/implementation/RESULT.md`

Include:
1. files/components changed
2. Firestore/rules changes
3. meetup schema actually implemented
4. tests you performed
5. limitations
6. deployed URL if available

Then stop.

Do not start Delivery 3.
