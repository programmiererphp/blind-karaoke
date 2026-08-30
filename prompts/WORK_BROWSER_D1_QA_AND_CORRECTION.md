# Work Mode Prompt — Delivery 1 Browser QA + Repository Report + Correction Prompt

You are validating the **real deployed Blind Karaoke Delivery 1** in ChatGPT **Work mode using the built-in Browser / Cloud Browser**.

This is a browser QA task, not a source-code review.

## Repository

GitHub repository:

https://github.com/programmiererphp/blind-karaoke

## Deployment under test

https://blind-karaoke-663424522262.us-west1.run.app

---

# 1. Read the repository first

Before opening the deployed app, read at minimum:

- `README.md`
- `SPEC.md`
- `ROADMAP.md`
- `AGENTS.md`
- `SECURITY.md`
- `docs/PROJECT_PRD.md`
- `docs/DELIVERY_1.md`
- `docs/ARCHITECTURE.md`
- `qa/ACCEPTANCE_MATRIX.md`
- `qa/BROWSER_QA_PLAN.md`
- `qa/TEST_DATA.md`
- `qa/reports/DEPLOYED_D1_FINAL_RETEST_02B_2026-08-30.md`

Also inspect the existing deployment screenshots under:

- `design/screenshots/`

The repository describes the **expected state**.

The real deployed app in the Browser is the **actual state**.

Do not infer that something works merely because the repository says it should.

---

# 2. Browser requirement

Use the **real built-in Browser / Cloud Browser in Work mode**.

Do not substitute:

- source-code inspection
- static HTML analysis
- GitHub Actions results
- a previous QA report
- screenshots already in the repository
- a text-only web fetch

for the real browser interaction.

The Browser must actually open:

https://blind-karaoke-663424522262.us-west1.run.app

Test with at least:

- one normal browser context/session
- one second independent/private browser context/session if the Browser supports it

If the Browser cannot create two independent sessions, use the closest available isolated-session mechanism and clearly document the limitation.

---

# 3. Main objective

Verify Delivery 1 end-to-end against the real deployed UI.

Primary flow:

**Home → Blind Karaoke preferences → first user waits / NO_MATCH → second compatible user joins → both receive same blind match → one-sided confirmation → mutual confirmation → shared Karaoke Room → add song → realtime sync → Duett Roulette → current song / Karaoke start → reload persistence → end evening → private feedback → mutual positive → Karaoke Friends**

Secondary flow:

**Home → Mit Freunden singen → create invite → second browser joins → shared room**

Do not test or plan Delivery 2.

---

# 4. Test data

Use unique nicknames so the test is distinguishable from previous runs.

Example:

## User A

- nickname: `MinaWorkQA-<timestamp>`
- age: 22
- gender: Frau
- city: Göttingen
- preferred partner: Mann
- preferred age: 25–40
- availability: Wochenende
- start: 18:00
- end: 23:00
- venue: Café / Bar
- styles: Pop, Balladen
- favorite songs:
  - Shallow
  - Perfect
  - Dancing Queen

## User B

- nickname: `AlexWorkQA-<timestamp>`
- age: 32
- gender: Mann
- city: Göttingen
- preferred partner: Frau
- preferred age: 20–30
- availability: Wochenende
- start: 18:00
- end: 23:00
- venue: Café / Bar
- styles: Pop, 80er / 90er
- favorite songs:
  - Shallow
  - Take on Me
  - Dancing Queen

These two users are intentionally compatible.

Do not alter the test data merely to force a match.

---

# 5. Required browser checks

## A. Page identity / basic rendering

Verify:

- deployment opens successfully
- page title/product identity is Blind Karaoke
- screen is not blank
- no framework/runtime-error overlay is visible
- no obvious broken asset or missing main UI
- primary CTA is visible and clickable

Capture a screenshot.

---

## B. Mobile layout

Test at approximately:

- 390 × 844

Check:

- no horizontal scrolling
- primary CTA fully visible
- bottom navigation does not cover interactive content
- footer/legal links remain accessible
- cards and form controls do not clip
- text remains readable

Capture screenshot evidence.

If Browser viewport resizing is available, also test:

- 360 px width
- 430 px width

---

## C. Desktop layout

Test approximately:

- 1440 × 900

Check:

- layout is usable
- content is not clipped
- no horizontal overflow
- desktop presentation is not broken

Do not fail D1 solely because it remains visually narrow if all interactions work; record it as UX observation unless it violates the written D1 acceptance criteria.

Capture screenshot evidence.

---

# 6. Blind Match flow

Use Session A.

1. Open Blind Karaoke.
2. Fill User A.
3. Submit `Match suchen`.

Verify:

- button works
- app enters SEARCHING or equivalent visible progression
- if no candidate exists yet, an honest NO_MATCH/waiting state appears
- app does not generate a fake person

Capture screenshot.

Keep Session A open.

Now use Session B.

4. Fill User B.
5. Submit `Match suchen`.

Verify:

- User B receives a match proposal
- User A automatically receives the same proposal without manual reload
- both see compatible anonymized information
- the match does not expose contact details before mutual confirmation

Capture screenshots from both sessions if possible.

---

# 7. Confirmation flow

In Session A:

1. Click `Ich bin dabei`.

Verify:

- A enters waiting state
- B has not yet confirmed
- contact/identity reveal is not prematurely exposed beyond the intended design
- no Karaoke Room is treated as fully confirmed yet

Capture screenshot.

Then in Session B:

2. Click `Ich bin dabei`.

Verify:

- both sessions become mutually confirmed
- both are connected to the same Karaoke Room
- intended nickname/contact reveal becomes available
- no duplicate/parallel rooms are created

Capture screenshots.

---

# 8. Karaoke Room

In the real matched room:

1. Add a song from Session A.
2. Verify it appears in Session B without page reload.
3. Add or select `Shallow`.
4. Verify the same queue/current-song state appears in both sessions.
5. Run `Duett Roulette`.
6. Verify a real suggestion/challenge appears.
7. Add the suggestion if the UI supports it.
8. Set a song as current / `Jetzt dran`.
9. Verify `Karaoke starten` is a real usable external link/control.

Do not judge the app by whether YouTube itself plays successfully if the Browser blocks popups or external media; verify that the app produces the correct clickable external target.

Capture screenshot evidence of:

- queue
- Duett Roulette
- current song

---

# 9. Reload persistence

While both users are inside the same active Karaoke Room:

1. Reload Session A.
2. Reload Session B.

Verify:

- both return automatically to the active Room
- same participants
- same Room
- existing queue is retained
- current song is retained
- no duplicate room is created

If the app falls back to a confirmed-match screen and requires a manual `Zum Karaoke Room` click, record this as a defect because Delivery 1 requires active-room state restoration.

---

# 10. Feedback and Karaoke Friends

End the Karaoke evening in both sessions.

Verify before submitting:

- A's feedback screen names B
- B's feedback screen names A
- neither screen asks the user to rate themselves

Then:

1. A selects `Wieder zusammen singen`.
2. Do not submit B yet.

Verify:

- A's write succeeds
- B cannot see whether A chose positive
- no permission error appears
- no Karaoke Friend is created yet

Then:

3. B selects `Wieder zusammen singen`.

Verify:

- write succeeds
- exactly one mutual Karaoke-Friend relationship results
- both users can see the other person in the Friends/Karaoke-Friends area
- no duplicate friendship entries
- no relevant console/runtime error

Capture screenshots of:

- feedback screen A
- feedback screen B
- resulting Friends list

---

# 11. Friends Room flow

Use fresh independent sessions so this test is not affected by the Blind Match state.

Session C:

1. Home → `Mit Freunden singen`
2. Verify a real Room is created.
3. Verify an invite code/link is visible.
4. Copy/open the invite in independent Session D.

Session D:

5. Enter nickname.
6. Click `Room beitreten`.

Verify:

- D enters the same Room
- C sees D
- max-two-person semantics remain intact
- queue/shared-room UI works
- no console/runtime error

Capture screenshots.

---

# 12. Legal/basic navigation regression

Verify:

- Impressum opens
- Datenschutz opens
- Start tab works
- Match tab works
- Room tab works when relevant
- Freunde tab works when relevant
- no obviously dead buttons in the tested D1 flow

---

# 13. Console / error inspection

Use Browser console/dev-log capability where available.

Record:

- runtime errors
- warnings that clearly affect the tested behavior
- failed Firestore writes/permissions
- broken navigation
- unhandled promise errors

Do not treat expected navigation-aborted network requests as product defects unless they produce actual user-visible failure.

---

# 14. Save browser screenshots

Capture enough Browser screenshots to prove the tested states.

At minimum:

1. Home mobile
2. Preferences filled
3. NO_MATCH / waiting
4. Match proposal
5. One-sided waiting
6. Confirmed/shared Room
7. Queue + Duett
8. Feedback
9. Karaoke Friends
10. Friends Room join
11. Desktop home

If the Work Browser can save/download screenshots, add them to:

`design/screenshots/work-browser/`

Use clear filenames, for example:

- `01-home-mobile.png`
- `02-preferences.png`
- `03-no-match.png`
- `04-match-proposal.png`
- `05-one-sided-wait.png`
- `06-karaoke-room.png`
- `07-duet-queue.png`
- `08-feedback.png`
- `09-karaoke-friends.png`
- `10-friends-room.png`
- `11-home-desktop.png`

If direct screenshot upload to GitHub is not available, still complete the browser QA and clearly state in the report which screenshots were inspected but could not be committed.

---

# 15. Write the actual QA result into GitHub

After testing, create or replace:

`qa/reports/WORK_BROWSER_D1_QA.md`

This report must be based only on what you actually observed in the current Browser test.

Use this structure:

# Work Browser Delivery 1 QA

## Deployment
URL and test date/time.

## Browser environment
- Work mode
- built-in Browser / Cloud Browser
- viewport(s)
- independent sessions used

## Final status
One of:
- PASS
- PASS WITH MINOR ISSUES
- FAIL

## Acceptance table
For every major D1 behavior:
- PASS
- FAIL
- NOT TESTED

## Findings
For every real defect:

### ID
Example: `WORK-D1-01`

### Severity
BLOCKER / HIGH / MEDIUM / LOW

### User-visible behavior

### Exact reproduction steps

### Expected behavior

### Actual behavior

### Browser evidence
Screenshot/state/console evidence.

### Likely area
Only if supported by evidence. Do not guess wildly.

## Passed flows
List the real flows that worked.

## Untested / limitations
Explicitly list anything you could not verify.

## Decision
State whether Delivery 1 is accepted based on this Work Browser run.

Do not copy an older QA report and merely change the date.

---

# 16. Create the correction prompt in GitHub

After the QA report, always create or replace:

`prompts/DELIVERY_1_WORK_BROWSER_CORRECTION.md`

## If defects were found

The file must be a **copy-ready AI Studio Build correction prompt**.

It must:

- cite the exact current Browser findings by ID
- fix only defects actually observed
- preserve all passing D1 behavior
- explicitly say not to rebuild the app from scratch
- explicitly say not to start Delivery 2
- include exact reproduction steps
- include exact expected result
- include regression tests
- include a Definition of Done

Do not include speculative improvements that were not observed as failures.

If there is more than one major independent defect, order them by severity.

If the correction would become too large, split it into small sequential prompts, for example:

- `DELIVERY_1_WORK_BROWSER_CORRECTION_01.md`
- `DELIVERY_1_WORK_BROWSER_CORRECTION_02.md`

and make the first one the smallest blocking vertical slice.

## If NO defects were found

Still create:

`prompts/DELIVERY_1_WORK_BROWSER_CORRECTION.md`

with this meaning:

- Delivery 1 passed the current Work Browser QA
- no correction is currently required
- do not modify D1 merely for cleanup
- proceed only after explicit user instruction
- do not begin Delivery 2 automatically

This avoids inventing a correction when nothing actually failed.

---

# 17. Update ROADMAP

After writing the QA report and correction prompt, update:

`ROADMAP.md`

If QA passes:

- mark Work Browser D1 QA as completed/PASS
- mark D1 as accepted by Work Browser
- leave D2 unstarted

If QA fails:

- mark Work Browser D1 QA as completed/FAIL
- add the correction step as pending
- leave D2 unstarted

Do not remove prior Playwright QA history.

---

# 18. GitHub issue

Update existing Delivery 1 QA issue #1 with a concise comment containing:

- Work Browser QA result
- main defects if any
- link to `qa/reports/WORK_BROWSER_D1_QA.md`
- link to `prompts/DELIVERY_1_WORK_BROWSER_CORRECTION.md`
- whether D1 is accepted or correction is required

Do not close the issue if the Work Browser test still finds a D1 defect.

If the Work Browser test fully passes and issue #1 is specifically the D1 correction issue, it may be closed only if the available GitHub tool supports closing and the report clearly shows PASS.

---

# 19. Critical rules

- The deployed browser state is the truth.
- Do not claim something worked unless you actually exercised it.
- Do not infer browser success from GitHub Actions or source code.
- Do not silently skip failures.
- Do not fabricate screenshots.
- Do not fabricate console results.
- Do not create fake test users inside production code.
- Do not modify the webapp during the test phase.
- First finish the report.
- Only then generate the correction prompt.
- Do not implement the correction in this same task.
- Do not begin Delivery 2.

---

# 20. Final response to the user

At completion, respond concisely with:

1. Work Browser QA status: PASS / PASS WITH MINOR ISSUES / FAIL
2. number and severity of actual defects
3. link to the committed QA report
4. link to the committed correction prompt
5. whether Delivery 1 is accepted or must be corrected first

Do not provide a new Delivery 2 prompt in this task.
