# Test Data

## Profile A — Mina
- age: 22
- gender: Frau
- city: Göttingen
- preferred partner: Mann
- preferred age: 25–40
- music: Pop, Balladen
- favorite songs: Shallow, Perfect, Dancing Queen
- availability: Friday 19:00–23:00
- venue: Café / Bar

## Profile B — Alex
- age: 32
- gender: Mann
- city: Göttingen
- preferred partner: Frau
- preferred age: 20–30
- music: Pop, 80er/90er
- favorite songs: Shallow, Take on Me, Dancing Queen
- availability: Friday 18:00–23:00
- venue: Café / Bar

Expected: compatible match.

## Profile C — Rock-only compatibility test
Keep practical/mutual preferences compatible with A but use only Rock and different songs. Expected: match remains possible.

## Profile D — preference exclusion test
Use a gender/partner-preference combination that is not mutually compatible with A. Expected: no match between A and D.
