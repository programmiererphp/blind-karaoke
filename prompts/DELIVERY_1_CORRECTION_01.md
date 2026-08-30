# AI Studio Build Correction Prompt — Delivery 1 — QA Fix 01

You are correcting the **existing deployed Blind Karaoke Delivery 1 implementation**.

Do **not** rebuild the app from scratch.
Do **not** begin Delivery 2.
Do **not** add new product features.
Preserve working UI, legal pages, Firebase configuration and current light design unless a change below is necessary.

Read and obey the existing project requirements:
- `SPEC.md`
- `docs/DELIVERY_1.md`
- `docs/ARCHITECTURE.md`
- `qa/ACCEPTANCE_MATRIX.md`

The real deployment was tested with Chromium/Playwright. Fix only the actual defects below.

---

## 1. BLOCKER — Blind Match search does not progress

### Reproduction
Use two independent browser sessions.

Profile A:
- nickname MinaQA
- age 22
- gender Frau
- same city as B
- prefers Mann
- preferred age 25–40
- Weekend, 18:00–23:00
- Café / Bar
- Pop + Balladen

Profile B:
- nickname AlexQA
- age 32
- gender Mann
- same city as A
- prefers Frau
- preferred age 20–30
- Weekend, 18:00–23:00
- Café / Bar
- Pop + 80er/90er

Both satisfy all hard matching requirements.

Actual behavior:
After pressing **Match suchen** in both sessions, both remain on **Deine Sucheinstellungen**. No proposal appears.

### Required correction
Trace the complete real code path from:
`Match suchen`
→ form validation
→ profile persistence
→ candidate query
→ hard compatibility filtering
→ score
→ atomic Match creation
→ UI state update / realtime listener.

Do not paper over the bug with a fake/demo Match.

Ensure:

1. Clicking Match suchen persists the current user/profile.
2. A searchable/waiting user remains discoverable by a later compatible user.
3. The second compatible user can atomically create exactly one shared Match.
4. Both users receive/observe the same Match via Firestore.
5. UI transitions from SEARCHING to MATCH_PROPOSED.
6. A user cannot be put into multiple active matches.
7. If matching fails due Firebase/query/transaction error, show a concise visible error and Retry; do not silently remain on the form.
8. Music remains a soft score only; differing music styles cannot block the example pair.
9. Same normalized city, overlapping time, mutual partner preference and mutual age ranges remain hard requirements.

If a Firestore index/rule/query shape prevents this, make the smallest correct fix and document it in the completion summary.

---

## 2. HIGH — Implement the missing NO_MATCH feedback state

Currently a search with no compatible candidate leaves the user on the form with no explanation.

After clicking Match suchen:

- immediately enter SEARCHING
- disable duplicate submissions while searching
- show a compact real loading state
- if candidate found: MATCH_PROPOSED
- if none found: show the required NO_MATCH state

NO_MATCH text:
**„Im Moment ist noch kein passendes Karaoke-Duo verfügbar.“**

Buttons:
- Erneut suchen
- Präferenzen ändern
- Mit Freunden singen

Do not invent a candidate.

A user who received NO_MATCH must remain available/discoverable so a compatible user who searches later can find them.

---

## 3. HIGH — Wire “Mit Freunden singen” to a real Friends Room

### Actual behavior
Home → **Mit Freunden singen** produces no visible UI change.

### Required behavior
Click must:

1. create a real `rooms/{roomId}` Firestore document with `matchId: null`
2. add creator UID to `participantIds`
3. generate a short invite code
4. navigate/show the active room
5. display a copyable invitation URL such as `/room/K7P4X`
6. allow a second anonymous browser to open the link, enter a nickname and join
7. enforce max 2 participants
8. show “room full” for a third participant
9. synchronize room/queue state using the existing realtime approach

Reuse the same Karaoke Room component as Blind Match rooms. Do not create a second parallel room implementation.

Also make the **Mit Freunden** button on the “Kein aktiver Raum” screen call the same working creation flow.

---

## 4. MEDIUM — Add programmatic form labels

Do not redesign the form.

For every form control, connect the visible field label to its control using stable:
- `id`
- `<label htmlFor="...">`

or an equivalent correct accessible name.

At minimum fix:
- Nickname
- Alter
- Geschlecht
- Stadt
- Radius
- Startzeit
- Endzeit
- min/max preferred age
- favorite-song fields

After correction, Playwright queries such as:
`getByLabel(/Nickname/i)`
and
`getByLabel(/^Alter$/i)`
must resolve the intended fields.

---

## 5. MEDIUM — Prevent bottom navigation from covering footer/content

Observed on mobile and desktop:
the fixed bottom nav crowds/overlaps the Impressum/Datenschutz footer region.

Keep the bottom navigation.

Fix layout by:
- reserving sufficient bottom padding/safe area for main + footer content,
- ensuring footer/legal controls can scroll fully above the nav,
- respecting `env(safe-area-inset-bottom)` where appropriate.

Verify at:
- 360 × 800
- 390 × 844
- 430 × 932
- 1440 × 900

No clickable content may be hidden under the nav.

---

## 6. LOW — Improve desktop responsive width without redesign

At 1440 px the entire product remains a narrow phone column with very large empty gutters.

Keep mobile-first behavior but on desktop:
- use a sensible centered max-width wider than phone width,
- allow home/cards/forms to make better use of available space,
- do not introduce a new desktop navigation architecture,
- keep the same visual language and content.

This is a responsive correction only.

---

# Mandatory regression tests

After making the fixes, test the rendered app.

## Test A — no candidate
One user searches alone.

Expected:
SEARCHING → explicit NO_MATCH screen.
The user remains searchable.

## Test B — compatible second user
While A remains available, B with the compatible data above searches.

Expected:
- exactly one shared Match is produced
- both see a match proposal
- no duplicate Match records

## Test C — one-sided confirmation
A clicks **Ich bin dabei**, B does not.

Expected:
- A waits
- identity/contact details remain protected as specified
- room is not prematurely treated as confirmed

## Test D — mutual confirmation
B also clicks **Ich bin dabei**.

Expected:
- Match becomes confirmed
- both see the same Karaoke Room
- allowed identity/contact data is revealed

## Test E — realtime queue
A adds a song.

Expected:
B sees it without reload.

Then B adds a song.

Expected:
A sees it without reload.

## Test F — Duett Roulette
Run it in the confirmed room.

Expected:
A valid suggestion appears and can be added to the shared queue.

## Test G — Friends Room
Fresh session → Home → Mit Freunden singen.

Expected:
- real room created
- invite code/link visible
- second anonymous browser joins same room
- realtime queue works
- third participant rejected as full

## Test H — private feedback
After matched Karaoke:
- first test both choose positive → Karaoke Friend created
- second test only one chooses positive → no friendship and no leak of the one-sided positive response

## Test I — accessibility
Programmatic labels resolve for form inputs; keyboard interaction remains usable.

## Test J — responsive/footer
Check 360, 390, 430 and 1440 widths.
No horizontal scroll and no content/legal link hidden beneath bottom navigation.

## Test K — regression
- Home still loads
- Blind Karaoke starten works
- Impressum works
- Datenschutz works
- no new relevant console errors
- existing light design remains intact

---

# Completion response

When finished, report only:

1. root cause of the Blind Match failure
2. files/components/services changed
3. how the waiting/searchable-user behavior now works
4. how Friends Room creation/join works
5. tests executed and results
6. any remaining Delivery 1 limitations

Do not plan Delivery 2.
