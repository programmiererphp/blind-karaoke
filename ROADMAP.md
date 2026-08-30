# Roadmap

| Delivery | Scope | Status |
|---|---|---|
| D1 | Blind matching + mutual confirmation + duo Karaoke Room + Friends Room + Duet Roulette + private feedback | **Deployed — correction required** |
| D1 QA | Test real deployed app against all D1 criteria and issue correction prompt | **QA run completed; QA Fix 01 prepared** |
| D1 Fix 01 | Repair matching/no-match state, Friends Room CTA, labels, bottom-nav overlap and desktop width | **Retested — partial only; labels fixed, core flow still blocked** |
| D1 Retest 01 | Repeat real two-browser deployed QA after Fix 01 | **Completed — failed core acceptance** |\n| D1 Fix 02A | Blind Match core only: SEARCHING → NO_MATCH / MATCH_PROPOSED | **Implemented and deployed — PASS** |\n| D1 Retest 02A | Retest two-user path through MATCH_PROPOSED and D1 downstream flows | **Completed — core/room/queue/friends PASS; feedback + room restore remain** |
| D1 Fix 02B | Finish D1: feedback permissions/privacy, correct partner, automatic active-Room restore | **Implemented and deployed — PASS** |
| D1 Retest 02B | Final D1 regression and acceptance retest | **Completed — PASS / D1 accepted** |
| D2 | To be defined only after D1 deployment passes QA | Not planned yet |

## Workflow rule
Do not start the next delivery immediately after implementation. First test the real public deployment against the acceptance criteria, document actual defects, create a correction-only prompt, retest, then plan the next delivery.
