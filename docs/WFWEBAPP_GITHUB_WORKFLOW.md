# Internal wfwebapp GitHub Workflow — Artifact Lifecycle v2

> Internal webapp-creation workflow only. The term **wfwebapp** must never be used as product branding, UI text, app title, logo, public copy, or marketing unless explicitly requested.

## Core principle

GitHub is the persistent project record and source of truth for every webapp.

But **not every artifact is recreated for every Delivery**.

wfwebapp separates repository artifacts into three lifecycle classes:

1. **Create once** — stable product foundation; normally written once for the whole webapp.
2. **Living project documents** — exactly one canonical file for the whole webapp; updated as accepted Deliveries change the product.
3. **Per-Delivery immutable history** — new files for every Delivery and every correction/retest.

This avoids both:
- losing important work inside ChatGPT conversations, and
- polluting GitHub with repeated copies of the same concept/architecture.

---

# 1. Artifact lifecycle matrix

| Artifact | Lifecycle | Rule |
|---|---|---|
| Product concept / vision | **CREATE ONCE** | One canonical concept for the whole webapp. Change only for a real product pivot. |
| Initial product problem / target users / differentiator | **CREATE ONCE** | Belongs in the concept, not repeated in every Delivery PRD. |
| Initial research / references, if important | **CREATE ONCE** | Keep once; append only if genuinely new foundational research is added. |
| README | **LIVING** | One project README. Keep current. |
| Current product spec | **LIVING** | One canonical current-state spec updated after accepted Deliveries. |
| Roadmap | **LIVING** | One roadmap updated after every implementation / QA / acceptance step. |
| Architecture | **LIVING** | One current architecture document. Update only when architecture actually changes. |
| Data model | **LIVING** | One canonical data model, optionally inside Architecture. |
| Design system | **LIVING** | One current visual language / tokens / reusable UX rules. |
| Security / privacy baseline | **LIVING** | One current project-wide security document. |
| Legal/data handling baseline | **LIVING** | One current file if relevant; update as product/data use changes. |
| Deployment/runtime notes | **LIVING** | One canonical deployment/runtime document. |
| Global QA strategy | **LIVING** | One test strategy for cross-delivery rules. |
| AGENTS.md | **LIVING** | One current agent instruction file. |
| CHANGELOG / accepted-delivery history | **LIVING / APPEND-ONLY** | Append accepted changes; do not rewrite history. |
| Delivery PRD | **PER DELIVERY** | New file for every Delivery. |
| Delivery mockups / master flow | **PER DELIVERY** | New accepted visual references for the Delivery when the UI/flow changes. |
| Delivery build prompt | **PER DELIVERY** | Mandatory. |
| Delivery Browser QA prompt | **PER DELIVERY** | Mandatory. |
| Implementation result / notes | **PER DELIVERY** | Save the implementation agent’s meaningful completion result and deployed URL. |
| Browser screenshots | **PER DELIVERY / PER TEST RUN** | Real screenshots only from the deployed app. |
| Browser QA report | **PER DELIVERY / PER TEST RUN** | Mandatory deployed-state report. |
| Correction prompt | **PER CORRECTION** | Generated only from defects actually observed. |
| Retest report | **PER CORRECTION** | Mandatory after redeploy. |
| Final Delivery acceptance record | **PER DELIVERY** | Immutable final PASS/accepted summary. |
| Accepted Git tag/release marker | **PER DELIVERY** | Recommended after final Browser PASS. |

---

# 2. CREATE ONCE — whole-webapp artifacts

These describe **what the product fundamentally is**, not what one incremental Delivery adds.

## Mandatory

### `docs/product/CONCEPT.md`

Create once near the beginning of the project.

It should contain:

- product purpose
- problem being solved
- primary users
- unique differentiator
- central user journey
- product principles
- major non-goals
- long-term vision
- why this webapp should exist

Do **not** recreate this document for D1, D2, D3, etc.

Do **not** rewrite it merely because a Delivery added a feature.

Update only when the user makes a genuine product-level pivot.

If a pivot occurs, preserve history through Git and document the reason in a decision/changelog entry.

---

## Optional create-once documents

Only create when useful:

### `docs/product/FOUNDATIONAL_RESEARCH.md`

For important research, competitor analysis, scientific grounding, regulatory research, etc.

### `docs/product/DECISIONS.md`

Append-only list of major product decisions that affect multiple Deliveries.

Example:

- no public profile browser
- Firebase chosen for realtime
- anonymous auth for MVP

Do not record every minor UI choice here.

---

# 3. LIVING PROJECT DOCUMENTS — one canonical current version

These files exist **once per webapp** and evolve as the webapp evolves.

They must not be copied into every Delivery folder.

## `README.md`

Current project overview:

- what the app is
- current deployment
- current accepted Delivery
- technology stack
- important repository links
- current status

---

## `SPEC.md` or `docs/product/CURRENT_SPEC.md`

Canonical **current accepted product state**.

After Delivery N passes final Browser QA:

- merge the accepted behavior into this current spec
- remove obsolete intended behavior if superseded
- do not include failed/unimplemented ideas as if they exist

This answers:

> What does the product currently do?

It is not historical.

---

## `ROADMAP.md`

Canonical delivery/status ledger.

Update throughout the cycle:

```text
D1 PRD
D1 implemented
D1 Browser QA FAIL
D1 Correction 01
D1 Retest PASS
D1 ACCEPTED
D2 planned
...
```

Roadmap status must reflect **real deployed QA**, not the implementation agent’s claim.

---

## `docs/ARCHITECTURE.md`

Canonical current architecture.

Update only when a Delivery really changes:

- components/modules
- services
- APIs
- persistence
- auth
- realtime flow
- external integrations
- module boundaries

Do not create a second full architecture document per Delivery.

The Delivery PRD describes only the **architecture delta**.

---

## `docs/DATA_MODEL.md`

Optional separate file when the model is large.

Otherwise keep the model inside `ARCHITECTURE.md`.

This is the canonical current schema.

Delivery PRDs describe only added/changed entities and migrations.

---

## `docs/DESIGN_SYSTEM.md`

One current design system:

- typography
- spacing
- colors
- cards/buttons
- responsive conventions
- navigation conventions
- accessibility rules
- shared UX language

A Delivery mockup may introduce a new pattern.

Once the Delivery is accepted, durable reusable patterns are merged into this file.

Do not copy the full design system into every Delivery PRD.

---

## `SECURITY.md`

One current baseline:

- auth model
- authorization principles
- secrets
- Firestore/database access
- user-data visibility
- deletion
- abuse/security assumptions

Delivery PRDs contain only the **security delta**.

---

## `docs/LEGAL_DATA.md`

Create if relevant.

One current overview of:

- stored personal data
- third-party processors
- deletion/export behavior
- legal-page requirements
- Impressum / Datenschutz placeholders
- tracking/cookies if any

Do not duplicate complete legal notes per Delivery.

---

## `docs/DEPLOYMENT.md`

One current operational reference:

- deployed URL(s)
- deployment platform
- environment names
- branch/deployment relationship
- required configuration names, never secret values
- rollback/basic recovery notes

Never store secrets/API keys.

---

## `qa/TEST_STRATEGY.md`

One global QA policy:

- Browser QA is the final truth for deployed behavior
- mobile/desktop widths
- multi-session tests
- persistence
- security boundaries
- console errors
- regression philosophy
- screenshot requirements

Delivery QA prompts reference this file and add only Delivery-specific checks.

---

## `AGENTS.md`

One current set of repo-level coding/agent instructions.

---

## `CHANGELOG.md`

Recommended.

Append only **accepted** user-visible Deliveries and important fixes.

Example:

```text
## D2 accepted — Meetup Planner
- meeting proposal/counterproposal
- confirmed meeting card
- realtime arrival status
- .ics export
```

Failed experiments do not belong in the changelog; they remain in the Delivery QA history.

---

# 4. PER DELIVERY — one self-contained historical folder

Every Delivery gets a dedicated folder.

Recommended structure for new projects:

```text
deliveries/
└── D02-meetup-planner/
    ├── DELIVERY.md
    ├── PRD.md
    ├── prompts/
    │   ├── BUILD.md
    │   └── BROWSER_QA.md
    ├── design/
    │   └── mockups/
    │       ├── 01-master-flow.png
    │       ├── 02-....png
    │       └── ...
    ├── implementation/
    │   └── RESULT.md
    ├── qa/
    │   ├── REPORT.md
    │   └── screenshots/
    │       ├── 01-home.png
    │       ├── 02-flow.png
    │       └── ...
    ├── corrections/
    │   ├── CORRECTION_01.md
    │   ├── RETEST_01.md
    │   ├── screenshots-retest-01/
    │   └── ...
    └── ACCEPTANCE.md
```

Existing projects do not need destructive reorganization if equivalent files already exist elsewhere.

For existing repositories, prefer consistency over moving every historical file.

---

# 5. `DELIVERY.md` — small Delivery manifest

Every Delivery should have one compact manifest/status file.

It contains:

- Delivery number
- title
- goal in 1–3 sentences
- parent accepted Delivery
- status
- PRD link
- Build prompt link
- Browser QA prompt link
- deployment URL tested
- QA report link
- correction/retest links
- final acceptance status
- accepted commit/tag if available

Example status progression:

```text
PLANNED
PRD_APPROVED
IMPLEMENTED
DEPLOYED
QA_FAILED
CORRECTION_PENDING
RETEST_PENDING
ACCEPTED
```

This avoids hunting across the repository to understand one Delivery.

---

# 6. Delivery PRD — mandatory

Every Delivery gets exactly one canonical PRD.

### `PRD.md`

It should describe only the **increment** from the previous accepted state.

Include:

- goal
- user-visible outcome
- entry point from previous product state
- exact new scope
- exact changed behavior
- explicitly postponed scope
- user flow/states
- module/component additions or changes
- component contracts where useful
- data-model delta
- security/privacy delta
- design-system delta
- migration/backward compatibility if relevant
- acceptance criteria
- regression criteria
- estimated implementation size / complexity budget

Do **not** repeat the whole project concept.

Do **not** paste the complete architecture or design system.

Reference the living files instead.

---

# 7. Delivery mockups — mandatory when behavior/UI changes

For each Delivery that adds or materially changes UI/UX, save accepted visual references.

Standard wfwebapp pattern:

1. **Master User Flow** — mandatory
2. Focused screens/states — usually 2–5 additional graphics depending complexity

Mockups should show:

- entry state
- main interaction
- success state
- important empty/error/pending state where relevant
- mobile-first UI
- desktop if materially different

Do not regenerate five graphics mechanically when the Delivery has almost no visual change.

The rule is:

> enough mockups to specify the Delivery clearly, not an arbitrary image count.

Rejected mockups should normally not be committed as implementation references.

If retained for history, put them under:

`design/rejected/`

and mark them clearly.

---

# 8. Build prompt — mandatory per Delivery

### `prompts/BUILD.md`

Copy-ready prompt for AI Studio Build / coding agent.

Must:

- link to the current project-wide living documents
- link to this Delivery PRD
- implement only this Delivery
- preserve already accepted Deliveries
- define exact components/data changes
- include acceptance tests
- include regression tests
- prohibit scope creep
- require a concise implementation result

Do not make one giant prompt that re-specifies the whole webapp.

---

# 9. Browser QA prompt — mandatory per Delivery

### `prompts/BROWSER_QA.md`

This exists **before deployment testing**, normally created with the PRD/build prompt.

It must instruct Work mode / Browser to:

1. read the current spec + Delivery PRD
2. open the real deployed URL
3. treat deployed behavior as the actual state
4. test every Delivery acceptance criterion
5. test central previous-Delivery regressions
6. use independent sessions when relevant
7. inspect console/runtime failures
8. test responsive layouts
9. capture real screenshots
10. write QA result into this Delivery folder
11. create correction prompt(s) only from real defects
12. update Delivery manifest + ROADMAP
13. never begin the next Delivery automatically

Source code and implementation-agent reports are not substitutes for Browser testing.

---

# 10. Implementation result — per Delivery

After implementation, save a concise result when useful:

### `implementation/RESULT.md`

Record:

- implementation platform/agent
- date
- deployed URL
- meaningful files/modules changed
- database/rules/config changes
- tests claimed by implementation agent
- known limitations it reported

Important:

This is **not QA proof**.

Label it clearly as implementation-reported status.

If the implementation platform supplies no meaningful result, do not fabricate one merely to fill the file.

---

# 11. Real Browser QA report — mandatory

After deployment:

### `qa/REPORT.md`

Must record the **actual Browser run**:

- deployment URL
- time/date
- Browser environment
- viewport(s)
- test accounts/test data
- acceptance table
- regression table
- screenshots
- console/runtime evidence
- actual findings with severity
- untested limitations
- PASS / PASS WITH MINOR ISSUES / FAIL

A passing build does not equal a passing Delivery.

---

# 12. Real screenshots — mandatory

Store real deployed-state screenshots separately from mockups.

### `qa/screenshots/`

At minimum capture enough to prove:

- entry
- new Delivery interaction
- successful result
- important pending/error/empty state
- mobile
- desktop if relevant

For multi-user features, capture both sides when useful.

Never label generated mockups as real screenshots.

Never reuse an old screenshot as evidence for a new deployment test.

---

# 13. Correction prompts — only after real QA

If Browser QA finds defects:

### `corrections/CORRECTION_01.md`

Must contain only actual observed defects.

For each defect:

- finding ID
- severity
- reproduction
- expected behavior
- actual behavior
- relevant evidence
- smallest coherent fix scope
- regression tests
- Definition of Done

Do not add speculative improvements.

Do not begin the next Delivery.

If the correction is too large:

```text
CORRECTION_01A.md
CORRECTION_01B.md
```

Fix the smallest blocking vertical slice first.

---

# 14. Retest artifacts — every correction cycle

After correction implementation + redeployment:

### `corrections/RETEST_01.md`

and, when useful:

### `corrections/screenshots-retest-01/`

Retest:

- all corrected defects
- nearby affected flows
- core regression flow

If still failing:

`CORRECTION_02.md → RETEST_02.md`

Continue until accepted.

Never overwrite historical QA/retest reports.

---

# 15. Final acceptance record — mandatory

Once the deployed Delivery passes:

### `ACCEPTANCE.md`

This is a short immutable summary:

- Delivery
- deployed URL tested
- final Browser QA report/retest link
- final result: ACCEPTED
- important passed criteria
- known accepted limitations
- acceptance date
- accepted source commit, when known
- optional Git tag/release

This answers:

> What exactly was proven before we started the next Delivery?

---

# 16. Git tag after acceptance — recommended

After a Delivery reaches final PASS, create a tag when source code is available in the repo.

Examples:

```text
d1-accepted
d2-meetup-planner-accepted
```

The tag should point to the accepted deployed source revision when that relationship is known.

Do not tag a generated-but-untested state as accepted.

---

# 17. Update living documents only AFTER acceptance

After Delivery N passes final Browser QA:

Update only the project-wide files actually affected:

- `README.md`
- `SPEC.md`
- `ROADMAP.md`
- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `DESIGN_SYSTEM.md`
- `SECURITY.md`
- `LEGAL_DATA.md`
- `DEPLOYMENT.md`
- `CHANGELOG.md`
- `AGENTS.md`

Do not update a living document merely because the PRD planned a feature.

Update it when the feature is accepted as part of the current product.

This keeps the living documents aligned with reality.

---

# 18. GitHub Issues — defect tracking, not artifact storage

Use Issues to track significant real defects or delivery blockers.

Issues should link to repository artifacts rather than duplicate them.

Example:

- QA report
- finding IDs
- correction prompt
- retest report

Close only after deployed retest confirms resolution.

Do not use Issues as the canonical PRD or QA archive.

---

# 19. What should NOT be saved in GitHub

Do not turn the repository into a raw conversation archive.

Normally do not commit:

- complete ChatGPT conversation transcripts
- private chain-of-thought
- duplicate copies of the same concept in every Delivery
- every brainstorming idea
- rejected drafts unless intentionally archived
- temporary debug dumps with no QA value
- disposable screenshots
- local environment noise
- secrets
- API keys
- passwords
- production credentials
- real personal test-user contact information
- implementation-agent claims presented as verified QA

If an artifact has no future value for implementation, QA, maintenance, or decision history, it probably should not be committed.

---

# 20. Recommended new-project repository structure

For new wfwebapp projects:

```text
/
├── README.md
├── SPEC.md
├── ROADMAP.md
├── CHANGELOG.md
├── AGENTS.md
├── SECURITY.md
│
├── docs/
│   ├── product/
│   │   ├── CONCEPT.md                 # create once
│   │   ├── FOUNDATIONAL_RESEARCH.md   # optional, create once
│   │   └── DECISIONS.md               # append-only
│   │
│   ├── ARCHITECTURE.md                # living
│   ├── DATA_MODEL.md                  # living, optional
│   ├── DESIGN_SYSTEM.md               # living
│   ├── LEGAL_DATA.md                  # living, when relevant
│   ├── DEPLOYMENT.md                  # living
│   └── WFWEBAPP_GITHUB_WORKFLOW.md     # internal workflow reference
│
├── qa/
│   └── TEST_STRATEGY.md               # living global QA rules
│
└── deliveries/
    ├── D01-core/
    │   ├── DELIVERY.md
    │   ├── PRD.md
    │   ├── prompts/
    │   │   ├── BUILD.md
    │   │   └── BROWSER_QA.md
    │   ├── design/
    │   │   └── mockups/
    │   ├── implementation/
    │   │   └── RESULT.md
    │   ├── qa/
    │   │   ├── REPORT.md
    │   │   └── screenshots/
    │   ├── corrections/
    │   └── ACCEPTANCE.md
    │
    └── D02-meetup-planner/
        └── ...
```

Existing projects should not be destructively reorganized solely to conform to this tree.

Use equivalent existing locations and adopt the lifecycle rules going forward.

---

# 21. Exact wfwebapp lifecycle

## Once at project start

```text
Create repo
→ product concept
→ foundational research if needed
→ initial living documents
→ roadmap
```

## For every Delivery N

```text
Delivery N idea
→ Delivery mockup/master flow
→ user confirms direction when needed
→ Delivery PRD
→ Build prompt
→ Browser QA prompt
→ implement
→ save implementation result
→ deploy
→ real Work Browser QA
→ save real screenshots
→ QA report
→ if FAIL: correction prompt
→ correction implementation
→ redeploy
→ Browser retest + new evidence
→ repeat until PASS
→ ACCEPTANCE.md
→ optional accepted Git tag
→ merge accepted changes into living project docs
→ only then Delivery N+1
```

---

# 22. Source-of-truth hierarchy

When artifacts disagree:

1. **Real deployed Browser behavior** = actual state
2. **Accepted current SPEC / living project docs** = canonical intended/current state
3. **Current Delivery PRD** = intended incremental change
4. **Accepted Delivery mockups** = visual intent
5. **Build prompt** = implementation instruction
6. **Implementation result** = unverified implementation claim
7. **Older PRDs/reports/prompts** = historical evidence

Never infer production behavior from source code or implementation reports alone.

---

# 23. Delivery completion rule

A Delivery is complete only when all of these are true:

1. Delivery PRD exists
2. Build prompt exists
3. Browser QA prompt exists
4. implementation exists
5. deployment exists
6. real deployed Browser QA has run
7. acceptance criteria pass
8. required regressions pass
9. real screenshots are saved
10. QA/correction/retest history is preserved
11. final `ACCEPTANCE.md` exists
12. ROADMAP is updated
13. affected living project docs reflect the accepted state

Only then proceed to the next Delivery.

---

# 24. Internal-name rule

`wfwebapp` is an internal workflow label only.

It must never appear as visible product branding in:

- app name
- logo
- navigation
- page title
- UI
- public copy
- marketing
- product screenshots as intentional branding

unless the user explicitly asks for it.
