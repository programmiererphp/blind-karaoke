# Delivery D02 — Meetup Planner

## Goal
Turn a mutually confirmed Blind Karaoke match into a concrete real-world meetup by letting the pair propose, counter-propose and confirm one date/time/place, then share simple realtime arrival status.

## Parent baseline
Delivery 1 deployed app.

D1 has passed the deployed Playwright acceptance suite. The final Work Browser verification sequence later became infrastructure-blocked; the user explicitly requested proceeding with D2. D2 must therefore preserve all D1 behavior and its Browser QA must include central D1 regressions.

## Status
**READY_FOR_IMPLEMENTATION**

## Scope summary
New:
- meetup proposal after confirmed Blind Match
- counterproposal
- mutual confirmation of the current proposal
- confirmed Meetup Card
- external route link
- client-side .ics calendar export
- realtime participant status: planned / on the way / 15 min / arrived
- cancellation visible to both

Not in D2:
- chat
- Google Places / Maps API
- GPS tracking
- push notifications
- venue database
- reservations/payments
- groups >2
- public profile/search features
- AI features

## Artifacts
- [PRD](PRD.md)
- [Build prompt](prompts/BUILD.md)
- [Work Browser QA prompt](prompts/BROWSER_QA.md)
- [Mockups](design/mockups/README.md)

## Implementation
Not started.

## Deployment
Use the existing Blind Karaoke deployment pipeline. Record the tested deployed URL after implementation.

## QA
Not started.

## Acceptance
Not accepted yet.
