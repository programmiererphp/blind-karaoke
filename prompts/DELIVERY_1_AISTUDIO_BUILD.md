# AI Studio Build Prompt — Blind Karaoke — Delivery 1

Build a fully functional mobile-first webapp named **Blind Karaoke** using React, TypeScript, Firebase Anonymous Authentication and Firestore. This is a real MVP, not a mockup.

## Non-negotiable scope
Implement only Delivery 1. Do not add public profiles, swiping, social feed, in-app chat, profile photos, maps/GPS, AI/LLM APIs, hosted music/lyrics, pitch detection, recording, payments, push notifications, admin CMS or groups larger than two.

`wfwebapp` is an external workflow name only and must never appear in visible UI, branding, page title or product copy.

## UI
Use a bright, clear interface based on `design/01-master-flow.svg`: mostly white background, very light gray sections, dark readable typography, pink primary CTA, restrained purple accent, rounded cards, soft shadows, large touch targets. Mobile-first for 360–430 px, with centered responsive desktop layouts.

Bottom navigation: Start / Match / Room / Freunde.

## Authentication
Automatically sign in anonymously on first load. Reuse the Firebase auth session after reload. Show retry UI if auth fails.

## Preference form
Store in `users/{uid}`:
- nickname (required, <=30 chars)
- age 18–80
- gender: Frau / Mann / Divers oder andere
- city, default Göttingen; also store lowercase normalized city
- radius: 5/15/25/50 km, default 25 (stored/displayed only; D1 matching uses same normalized city, no map/geocoder)
- availability: Today/Tomorrow/Weekend/date + start/end time; validate end > start
- venue: Café/Bar / Zuhause / Egal
- preferred partner: Egal / Mann / Frau / Divers oder andere
- preferred age min/max, default 18–45
- max 3 music styles: Pop, 80er/90er, Balladen, Rock, Hip-Hop, R&B, K-Pop, Schlager, Andere
- up to 3 favorite songs, free text plus suggestions
- optional contact handle only exposed after mutual confirmation

## Matching module
Put matching rules in `src/services/matchEngine.ts`, not in UI.

Hard exclusions:
1. self
2. different normalized city
3. no availability overlap
4. A partner preference excludes B
5. B partner preference excludes A
6. B age outside A range
7. A age outside B range
8. either already in another active match

Score compatible candidates:
- time overlap +40
- same city +30
- mutual partner preference +25
- mutual age range +20
- shared music style +5 each
- shared favorite song +5 each
- compatible venue +5

Music is always soft; different music styles must not prevent matching.

Use a Firestore transaction/atomic operation to prevent double-booking users during concurrent searches.

If no candidate exists, show an honest no-match screen with Retry / Change preferences / Sing with friends. Never generate a fake profile.

## Match lifecycle
Store `matches/{matchId}` with participants, score/reasons, `acceptedA/B`, `declinedA/B`, status and timestamps.

Before mutual acceptance show only age, city, styles, common songs, availability and venue. Do not reveal nickname or contact.

Buttons: `Ich bin dabei` and `Lieber jemand Neues`.

After both accept: set status confirmed, reveal nicknames/optional contact field and automatically create one shared Karaoke Room.

## Room
Store `rooms/{roomId}` with optional matchId, participantIds (max 2), current song, queue, status, timestamps and invite code for Friends mode.

Use Firestore realtime listeners so both browsers see match/confirmation/queue changes without reload.

Song queue item: id, title, artist, type solo|duet, addedBy, karaokeUrl.

Allow adding songs via a small modal/bottom sheet. No drag/reorder required.

`Karaoke starten` opens the external karaoke URL/search in a new tab. Do not host protected audio or lyrics.

## Demo songs
Create `src/data/demoSongs.ts` with at least 12 songs and fields id/title/artist/styles/isDuet/karaokeUrl. If no specific safe karaoke URL is known, construct a URL-encoded YouTube search URL for `<song> <artist> karaoke`.

## Duet Roulette
On click:
1. prefer common favorite songs that are duets
2. then songs matching shared styles
3. otherwise choose a random duet from demoSongs
Show the proposed challenge and a button to add it to the queue. No AI.

## Friends mode
`Mit Freunden singen` immediately creates a room with a short invite code such as `K7P4X` and route `/room/K7P4X`. A second anonymous user opening the link enters only a nickname and joins. Maximum 2 participants. If full, show a clear full-room message.

## After Karaoke
`Karaoke-Abend beenden` asks privately whether the user wants to sing with this person again. Store feedback in `feedback/{matchId}_{uid}`. Do not reveal one-sided positive feedback.

Only when both responses are positive create `karaokeFriends/{friendshipId}` and show `Ihr seid jetzt Karaoke-Freunde`. Friends screen lists nickname and last karaoke evening; `Neues Karaoke-Treffen` may simply create another shared room in D1.

## Legal/privacy baseline
Provide Impressum and Datenschutz pages with configurable placeholders. Explain anonymous Firebase UID, profile/match/room/contact/feedback storage and deletion. Add a `Meine Daten löschen` action.

## Debug mode
Only for `?debug=1`: show uid, matchId, roomId, last Firestore action/error, max ~100 browser log entries, Copy Debug Log button and test-profile helpers for Mina/Alex from `qa/TEST_DATA.md`. No debug UI in normal mode.

## Required states
NEW_USER, PROFILE_READY, SEARCHING, NO_MATCH, MATCH_PROPOSED, WAITING_FOR_OTHER, MATCH_CONFIRMED, ROOM_ACTIVE, FEEDBACK_PENDING, KARAOKE_FRIEND. No external state-machine library required.

## Required tests
Follow `qa/ACCEPTANCE_MATRIX.md` and `qa/BROWSER_QA_PLAN.md`. At minimum verify two independent browser sessions, mutual confirmation, realtime queue, friends invite, Duet Roulette, feedback privacy, reload persistence and responsive layouts.

## Definition of Done
Do not call the delivery complete until all realistically executable D1 acceptance tests pass, there are no visible dummy buttons, no happy-path console errors and no feature outside Delivery 1 has been added.

At completion provide only:
1. components created
2. Firestore collections used
3. tests passed
4. tests not automatically executable
5. known D1 limitations
6. exact manual two-device test steps

Do not plan Delivery 2.
