# Prompt Texts

## Current implementation prompt
- `DELIVERY_1_AISTUDIO_BUILD.md` — copy-ready prompt for implementing the Showcase MVP in Google AI Studio Build.

## Workflow
1. Keep `SPEC.md` synchronized with requirement changes.
2. Use the Delivery 1 prompt to implement only the current scope.
3. Deploy the app.
4. Test the real deployment against `qa/ACCEPTANCE_MATRIX.md` and `qa/BROWSER_QA_PLAN.md`.
5. Create a correction-only prompt from defects actually observed.
6. Retest corrections before defining Delivery 2.

Do not pre-write a fictional correction prompt before real browser QA.


## Work Mode / Browser QA
- `WORK_BROWSER_D1_QA_AND_CORRECTION.md` — runs Delivery 1 against the real deployed app using the Work built-in Browser, writes the observed QA result back to GitHub, creates a correction prompt from only real defects, and updates ROADMAP / issue #1. It must not start Delivery 2.


## Delivery 2 — Meetup Planner
- `../deliveries/D02-meetup-planner/prompts/BUILD.md` — implementation prompt for AI Studio Build / coding agent.
- `../deliveries/D02-meetup-planner/prompts/BROWSER_QA.md` — mandatory real deployed Work Browser QA prompt after implementation.
- Correction prompts are intentionally not pre-created; they must be generated only from actual Browser findings.
