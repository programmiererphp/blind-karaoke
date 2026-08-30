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
