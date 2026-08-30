# Blind Karaoke — Current Spec

## Product goal
Create a very small but genuinely usable social karaoke webapp that matches two people locally for a real karaoke evening and then supports the shared karaoke session.

## Core differentiator
Instead of browsing many public profiles, a user asks for **one Blind Karaoke duo match**. Matching is tolerant: time, location and mutual partner/age preferences matter most; song/style overlap improves the score but is not mandatory.

## Delivery 1 user journey
1. Anonymous sign-in.
2. Enter nickname, age, gender, city, radius, availability, venue preference, partner preference, preferred age range, up to three music styles and up to three favorite songs.
3. Search for one compatible candidate.
4. Show a partially anonymous match card.
5. Each person accepts independently.
6. Only after mutual acceptance reveal nicknames/contact field and create one shared Karaoke Room.
7. Both users see a realtime song queue and can add songs.
8. Duet Roulette proposes a duet without using AI.
9. Karaoke button opens an external karaoke/search link; the app hosts no protected music/lyrics.
10. After the session each person privately chooses whether to sing together again.
11. Only mutual positive feedback creates a Karaoke Friend relationship.

## Friends mode
A user can create a Karaoke Room directly and share a short room link/code with an existing friend. This ensures the MVP is usable even before the blind-match user base grows.

## Out of scope for Delivery 1
Public profile search, swipe UI, in-app chat, profile photos, GPS/maps, AI/LLM features, pitch detection, recording, hosted lyrics/audio, groups >2, payments, push notifications, large admin CMS, social feed.

## UI
Mostly white/very light gray; pink primary CTA; restrained purple secondary accent; dark readable typography; large mobile controls; no dark/neon/esoteric visual theme.

## Legal baseline (Germany)
Impressum and Datenschutz pages with configurable placeholders, Firebase data disclosure, contact visibility rules and a user-data deletion action.

## Design reference
Primary visual reference: `design/01-master-flow.webp` (original GenID: `39051671-d178-4a15-ab4b-81e526020a03`).
