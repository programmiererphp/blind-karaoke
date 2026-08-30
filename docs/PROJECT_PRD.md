# Blind Karaoke — Project PRD

## 1. Product vision
Blind Karaoke helps two people in the same city meet around a concrete shared activity: a karaoke evening. It is designed for new friendships, social connection and potentially stronger personal chemistry without requiring a public dating-style profile browser.

## 2. MVP principle
The first version must be buildable and testable quickly and must work in real life with two phones/browsers. The interesting experience should come from the complete loop rather than from feature count.

## 3. Main modes
### Blind Karaoke
One-person-at-a-time matching. The app searches for one suitable duo partner based primarily on practical compatibility and mutual preferences.

### Karaoke with Friends
Create a two-person room immediately and share a link/code. This makes the app useful from day one.

## 4. Matching inputs
- nickname
- age
- gender
- city and stored radius
- date/time availability
- venue preference: Café/Bar, home, flexible
- preferred partner gender
- preferred age range
- up to 3 music styles
- up to 3 favorite songs

## 5. Matching philosophy
Hard filters: same normalized city in D1, overlapping time, mutual partner preference, mutual age compatibility, not already in another active match.

Soft score: shared styles, shared songs and venue compatibility. Music incompatibility must never by itself prevent a match.

## 6. Blind match reveal
Before mutual confirmation show only limited data such as age, city, styles, common songs, availability and venue preference. Nickname and optional contact field appear only after both users accept.

## 7. Karaoke Room
Exactly two participants in D1. Realtime Firestore queue, current song, add song, external Karaoke link, Duet Roulette.

## 8. Duet Roulette
Local deterministic/random suggestion logic. Prefer common favorite duet songs, then shared styles, then a demo duet song. No AI needed.

## 9. Post-session relationship loop
Each person privately chooses “sing together again” or “not this time”. Only mutual positive feedback creates a Karaoke Friend relationship. Karaoke Friends can start another room together.

## 10. UX
Mobile-first, white/very light gray background, pink primary actions, restrained purple accent, large touch targets, rounded cards, compact forms, minimal navigation.

## 11. Germany baseline
Impressum, Datenschutz, data deletion, clear explanation of Firebase-stored profile/match/room/contact/feedback data.

## 12. Success criteria for D1
Two separate sessions can genuinely match, mutually confirm, open the same room, see queue changes in realtime, use a friends-room link, run Duet Roulette and create a Karaoke Friend only after mutual positive feedback.
