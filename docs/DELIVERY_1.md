# Delivery 1 — Showcase MVP

## Scope
Implement only the smallest complete Blind Karaoke experience that can be demonstrated with two real devices.

### Included
- Firebase anonymous auth
- compact preference form
- flexible local duo matching
- partially anonymous proposal
- independent accept/decline
- mutual confirmation reveal
- optional contact handle after confirmation
- shared two-person Karaoke Room
- realtime queue
- external karaoke link/search
- Duet Roulette
- direct Friends Room with invite code/link
- private after-karaoke feedback
- Karaoke Friends after mutual positive feedback
- Impressum / Datenschutz
- data deletion
- debug drawer via `?debug=1`

### Excluded
Public profiles, swiping, chat, photos, GPS/maps, AI/LLM, recording, pitch analysis, hosted lyrics/audio, payments, push notifications, groups >2, admin CMS, social feed.

## Match hard conditions
1. candidate is not self
2. same `cityNormalized` in D1
3. overlapping availability
4. A's partner preference accepts B
5. B's partner preference accepts A
6. B's age fits A's preferred age range
7. A's age fits B's preferred age range
8. candidate not in another active match

## Match scoring
- time overlap +40
- same city +30
- mutual partner preference +25
- mutual age preference +20
- shared music style +5 each
- shared favorite song +5 each
- compatible venue preference +5

Music remains a soft criterion.

## Required states
`NEW_USER`, `PROFILE_READY`, `SEARCHING`, `NO_MATCH`, `MATCH_PROPOSED`, `WAITING_FOR_OTHER`, `MATCH_CONFIRMED`, `ROOM_ACTIVE`, `FEEDBACK_PENDING`, `KARAOKE_FRIEND`.

## Definition of Done
- Two real independent browser sessions can match.
- No fake match is generated if there is no candidate.
- Mutual preferences are honored.
- Confirmation is independent and realtime.
- Nickname/contact stays hidden until mutual confirmation.
- Both sessions receive the same room.
- Queue updates appear realtime without reload.
- Friends Room works via shareable link/code.
- Duet Roulette produces an addable suggestion.
- One-sided positive feedback remains private.
- Mutual positive feedback creates a Karaoke Friend.
- State persists across reload.
- Responsive at 360, 390, 430, 1024 and 1440 px.
- No visible dummy buttons and no happy-path console errors.
