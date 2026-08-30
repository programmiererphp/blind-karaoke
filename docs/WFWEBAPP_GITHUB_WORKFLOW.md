# Internal wfwebapp GitHub Workflow

> Internal project-creation workflow only. The term **wfwebapp** must never be used as visible product branding, UI text, app title, logo, marketing copy, or end-user-facing content unless explicitly requested.

## Purpose

GitHub is the persistent source of truth for every webapp created with this workflow.

Important project artifacts must not exist only inside a ChatGPT conversation. They must be committed to the project's GitHub repository in a clear, versioned structure.

---

# 1. Repository is created at the beginning

For every new webapp:

1. Create or select a GitHub repository.
2. Use public/private visibility according to the user's request.
3. Connect all later design, PRD, implementation, QA, correction, and roadmap work to that repository.
4. Keep the repository usable by ChatGPT Work, AI Studio Build, coding agents, and human developers.

The repository is the canonical record of:
- product concept
- current specification
- PRDs
- architecture
- design references
- implementation prompts
- testing prompts
- QA reports
- screenshots
- correction prompts
- roadmap / delivery status
- issues discovered during real deployment testing

---

# 2. Standard repository structure

Use a structure approximately like:

```text
/
├── README.md
├── SPEC.md
├── ROADMAP.md
├── AGENTS.md
├── SECURITY.md
│
├── docs/
│   ├── PROJECT_CONCEPT.md
│   ├── PROJECT_PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   └── deliveries/
│       ├── DELIVERY_1.md
│       ├── DELIVERY_2.md
│       └── ...
│
├── prompts/
│   ├── DELIVERY_1_BUILD.md
│   ├── DELIVERY_1_BROWSER_QA.md
│   ├── DELIVERY_1_CORRECTION_01.md
│   ├── DELIVERY_2_BUILD.md
│   ├── DELIVERY_2_BROWSER_QA.md
│   └── ...
│
├── design/
│   ├── delivery-1/
│   │   ├── mockups/
│   │   └── screenshots/
│   ├── delivery-2/
│   │   ├── mockups/
│   │   └── screenshots/
│   └── ...
│
└── qa/
    ├── ACCEPTANCE_MATRIX.md
    ├── BROWSER_QA_PLAN.md
    ├── TEST_DATA.md
    └── reports/
        ├── DELIVERY_1_BROWSER_QA.md
        ├── DELIVERY_1_RETEST_01.md
        ├── DELIVERY_2_BROWSER_QA.md
        └── ...
```

Existing projects do not need to be destructively reorganized only to match this exact tree. Preserve working repository structure when it already contains equivalent files.

---

# 3. Concept phase

Before implementation:

1. Develop the webapp concept and strongest user flow.
2. Record the approved concept in GitHub, normally as:
   - `docs/PROJECT_CONCEPT.md`
   - `SPEC.md`
3. Record the larger future vision in `ROADMAP.md`.
4. Keep the first delivery small, demonstrable, and reliably implementable.
5. Explicitly document what is postponed.

The concept file should contain:
- problem / purpose
- primary users
- unique differentiator
- main user journey
- MVP boundaries
- larger future direction

---

# 4. UI/UX mockups before each major delivery where useful

Before the first PRD, and again when a later delivery materially changes the UI:

1. Generate visual mockups.
2. Prefer the established wfwebapp pattern:
   - Graphic 1: Master User Flow
   - Graphics 2–5: focused UI/state references
3. Ask the user to confirm the preferred direction when a new visual direction is being introduced.
4. Store the accepted graphics in GitHub under the appropriate delivery folder.
5. Store only relevant/current references; rejected mockups should not silently become implementation references.

Mockups are design references, not proof that functionality exists.

---

# 5. PRD for each delivery

Each delivery gets its own PRD/specification file.

Example:

`docs/deliveries/DELIVERY_2.md`

Every delivery PRD must include:

- goal
- user-visible outcome
- exact scope
- explicitly postponed scope
- UI states / user flow
- components/modules
- component contracts when useful
- data-model changes
- security/privacy implications
- acceptance criteria
- regression criteria
- implementation-size discipline

Delivery size should normally remain small enough for reliable AI implementation, typically about 1,000–2,000 changed lines unless there is a strong reason otherwise.

---

# 6. Build prompt for every delivery

Before implementation, create and commit a copy-ready implementation prompt, e.g.:

`prompts/DELIVERY_2_BUILD.md`

The prompt must:

- reference repository specification files
- implement only the current delivery
- preserve previous passing behavior
- define exact technical and UI requirements
- contain acceptance tests
- contain regression tests
- prohibit unrelated feature expansion
- require a concise completion report

The build prompt is intended for AI Studio Build or the chosen implementation agent.

---

# 7. Browser QA prompt is mandatory for every delivery

Every delivery must also have a separate **real deployed-app Browser QA prompt**, created before or together with the build prompt.

Example:

`prompts/DELIVERY_2_BROWSER_QA.md`

This QA prompt must instruct ChatGPT Work to:

1. Read the repository PRD/spec/acceptance criteria.
2. Open the **real deployed URL using Work's built-in Browser / Cloud Browser**.
3. Treat the deployed application as the actual state.
4. Exercise the real user flows.
5. Use independent sessions where multi-user behavior is relevant.
6. Inspect relevant console/runtime errors.
7. Test mobile and desktop layouts where relevant.
8. Capture screenshots of important states.
9. Write the observed QA result back into the repository.
10. Update ROADMAP / issue state.
11. Generate the correction prompt from actual defects only.

Source code, PRD, old screenshots, or earlier automated tests must never be used as substitutes for the real browser test.

---

# 8. Deployment testing cycle

After a delivery is implemented and deployed:

## Step A — Real Browser test

Use the Browser QA prompt against the real public deployment.

Test:
- all new delivery acceptance criteria
- central prior-delivery flows
- mobile/desktop UI
- data persistence
- roles/access separation when relevant
- error states
- dead/broken buttons
- browser/console errors
- regressions

## Step B — Save real screenshots

Screenshots from the deployed application should be saved into GitHub, for example:

`design/delivery-2/screenshots/`

Recommended screenshots:
- entry state
- key interaction states
- success state
- error/empty state if important
- mobile
- desktop

These are real deployment screenshots and must be clearly distinguished from mockup graphics.

## Step C — Commit QA report

Create:

`qa/reports/DELIVERY_N_BROWSER_QA.md`

The report must contain:
- deployed URL
- test date
- browser environment
- tested flows
- pass/fail acceptance table
- real findings with severity
- screenshots/evidence
- console/runtime findings
- untested limitations
- final delivery decision

---

# 9. Correction prompt is generated only after Browser QA

After Browser testing, generate:

`prompts/DELIVERY_N_CORRECTION_01.md`

Rules:

- Fix only defects actually observed in the deployed Browser test.
- Do not rebuild working parts.
- Preserve already-passing features.
- Do not start the next delivery.
- Include exact reproduction steps.
- Include expected behavior.
- Include regression tests.
- Include Definition of Done.

If the correction would be too large, split it into small focused vertical corrections:

- `DELIVERY_N_CORRECTION_01A.md`
- `DELIVERY_N_CORRECTION_01B.md`

Prefer the smallest blocking flow first.

---

# 10. Correction → redeploy → retest

The mandatory cycle is:

```text
Delivery N PRD
→ Build prompt
→ implementation
→ deploy
→ real Work Browser QA
→ QA report + screenshots in GitHub
→ correction prompt
→ correction implementation
→ redeploy
→ real Browser retest
→ retest report
→ repeat if necessary
→ Delivery N accepted
→ only then Delivery N+1
```

Never assume a correction works merely because the implementation agent says it works.

The corrected deployment must be tested again.

---

# 11. GitHub issues

Use GitHub Issues for concrete delivery defects when useful.

A delivery QA issue should contain:
- deployed URL
- failing acceptance criteria
- links to QA report
- links to correction prompt
- current status

After retest:
- comment with real results
- close only when the relevant defect is genuinely resolved

Do not create noisy issues for every minor design observation unless they need tracking.

---

# 12. ROADMAP is continuously updated

`ROADMAP.md` must show real delivery status.

Example:

```text
D1 — implemented → Browser QA PASS
D2 — implemented → Browser QA FAIL
D2 Fix 01 — pending
D2 Retest — not started
D3 — not started
```

Never mark a delivery accepted merely because code was generated.

A delivery becomes accepted only after deployed QA passes.

---

# 13. What must always be stored in GitHub

For each webapp, preserve at minimum:

## Project level
- concept
- current spec
- roadmap
- architecture
- agent instructions
- security/privacy notes

## Per delivery
- PRD/spec
- accepted mockup graphics where relevant
- build prompt
- Browser QA prompt
- real Browser QA report
- real deployment screenshots
- correction prompt(s) when defects exist
- retest report(s)
- roadmap status

Important artifacts should not remain only in ChatGPT conversation history.

---

# 14. Testing prompt must exist even when no defects are expected

A Browser QA prompt is mandatory for every delivery.

If testing finds no defects:

- commit the PASS report
- save representative screenshots
- create a small correction-status file or correction prompt stating:
  - no correction is currently required
  - do not change the passing delivery merely for cleanup
  - wait for explicit instruction before the next delivery

Do not invent defects just to produce a correction prompt.

---

# 15. Work Browser preferred

For final deployed UI validation, prefer:

**ChatGPT Work → built-in Browser / Cloud Browser**

because it allows:
- real navigation
- rendered UI inspection
- screenshots
- DOM/state inspection
- console/runtime inspection
- interaction validation

If the Work Browser is unavailable:

- a Playwright test may be used as a temporary fallback,
- clearly label it as a fallback,
- keep the Work Browser QA prompt in the repository,
- do not pretend the fallback is the requested Work Browser test.

---

# 16. Git commit discipline

Commit meaningful artifacts as they are created.

Examples:

- `docs: add Delivery 2 Meetup Planner PRD`
- `design: add Delivery 2 accepted mockups`
- `prompt: add Delivery 2 AI Studio build prompt`
- `qa: add Delivery 2 Work Browser test prompt`
- `qa: document deployed Delivery 2 findings`
- `qa: add Delivery 2 correction prompt`
- `roadmap: mark Delivery 2 accepted`

Avoid giant unrelated commits.

---

# 17. Source-of-truth hierarchy

When sources disagree, use this order:

1. **real deployed Browser behavior** — actual state
2. current delivery PRD / SPEC — intended state
3. accepted design mockups — visual intent
4. implementation prompt — implementation instruction
5. older reports/prompts — historical reference

Never infer production behavior from an old PRD or source file.

---

# 18. Delivery completion rule

A delivery is complete only when:

1. implementation exists
2. deployment exists
3. real deployed Browser QA was run
4. acceptance criteria pass
5. regressions pass
6. screenshots/report are saved in GitHub
7. correction loop is complete
8. ROADMAP reflects PASS

Only then plan/implement the next delivery.

---

# 19. Internal-name rule

`wfwebapp` is an internal workflow label only.

It must not appear in:
- app name
- logo
- UI
- navigation
- public copy
- marketing
- screenshots as product branding
- product PRD branding

unless the user explicitly asks for that term to be visible.
