# Delivery D02 — Meetup Planner

## Goal
Turn a mutually confirmed Blind Karaoke match into a concrete real-world meetup by letting the pair propose, counter-propose and confirm one date/time/place, then share simple realtime arrival status.

## Parent baseline
Delivery 1 deployed app.

D1 has passed the deployed Playwright acceptance suite. The final Work Browser verification sequence later became infrastructure-blocked; the user explicitly requested proceeding with D2. D2 must therefore preserve all D1 behavior and its Browser QA must include central D1 regressions.

## Status
**READY_FOR_IMPLEMENTATION — CORRECTION 01 TARGETED RETEST PASS / D2 NOT ACCEPTED**

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
- [Work Browser QA report](qa/REPORT.md)
- [Work Browser Retest 01](qa/RETEST_01.md)
- [Correction 01](corrections/CORRECTION_01.md)

## Implementation
Not started.

## Deployment
Use the existing Blind Karaoke deployment pipeline. Record the tested deployed URL after implementation.

## QA
Attempted against the real deployment on 2026-08-30. The Work Browser exposed only one shared-auth context, so D2-A1…D2-A11 could not be reached. One real D1 regression was reproduced: an active Friends Room returns to Home after reload and requires manual `Room` navigation. See `qa/REPORT.md`.

Correction 01 was retested against the real deployment on 2026-08-30 and passed its focused scope. Existing room `ZR6ZL` and fresh room `HB02J` restored automatically and idempotently; Room navigation, same-UID protection and ended-room exclusion also passed. See `qa/RETEST_01.md`.

## Acceptance
Delivery 2 is not accepted. Correction 01 is accepted for its verified scope, but a complete independent-session D2 retest is still required.
