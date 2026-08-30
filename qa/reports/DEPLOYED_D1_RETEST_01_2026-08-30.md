# Delivery 1 Retest 01 — 2026-08-30

## Deployment
https://blind-karaoke-663424522262.us-west1.run.app

## Test runs
Primary final retest:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33323061814

Additional confirmation using the literal city `Göttingen`:
https://github.com/programmiererphp/blind-karaoke/actions/runs/33322969179

The second retest intentionally replaced the earlier synthetic QA city with the real value `Göttingen` to rule out city normalization/geocoding as the reason for the failed match.

## Result

Delivery 1 is **still not accepted**.

### Fixed since QA Fix 01

| Item | Result |
|---|---|
| Programmatic form labels | **PASS** |
| Deployment HTTP 200 | PASS |
| Page loads without framework overlay | PASS |
| Relevant console errors | PASS — none observed |
| Mobile horizontal overflow | PASS |
| Desktop horizontal overflow | PASS |
| Preference form can be filled | PASS |

The label correction is confirmed: Playwright `getByLabel(/Nickname/i)` and `getByLabel(/^Alter$/i)` now resolve the intended controls.

### Still blocking

#### BLOCKER BK-D1-01 — compatible users still do not match

Two independent browser contexts used:

**A — MinaQA**
- age 22
- gender Frau
- city Göttingen
- prefers Mann
- age range 25–40
- Weekend
- 18:00–23:00
- Café / Bar
- Pop + Balladen
- Shallow / Perfect / Dancing Queen

**B — AlexQA**
- age 32
- gender Mann
- city Göttingen
- prefers Frau
- age range 20–30
- Weekend
- 18:00–23:00
- Café / Bar
- Pop + 80er/90er
- Shallow / Take on Me / Dancing Queen

These satisfy every Delivery 1 hard condition:
- not self
- same `cityNormalized`
- overlapping availability
- mutual partner preference
- mutual age preference
- neither starts in another active match

**Actual result:** after both click **Match suchen**, both remain on the preference form. No proposal appears.

Therefore A1 remains failed and A4–A8/A10–A12 remain blocked downstream.

#### HIGH BK-D1-02 — SEARCHING / NO_MATCH state still absent

A user searching alone receives no explicit SEARCHING state and no honest NO_MATCH state. The screen remains the preference form.

The required state machine is therefore not implemented visibly:
`PROFILE_READY → SEARCHING → NO_MATCH | MATCH_PROPOSED`.

#### HIGH BK-D1-03 — Friends CTA still has no visible effect

Home → **Mit Freunden singen** can be clicked, but the rendered UI/body does not change and no room/invite state appears.

Friends mode remains failed.

#### LOW BK-D1-06 — desktop layout still phone-width

At 1440 × 900 the app remains a narrow centered mobile column with very large side gutters. There is no horizontal overflow, but the responsive desktop-width correction requested in Fix 01 is not visibly implemented.

### Footer / navigation
Current screenshots show footer content above the fixed bottom navigation, so the previously observed overlap appears improved. Keep it under regression testing.

### Legal pages
Datenschutz opened successfully. The automated Impressum check was inconsistent across runs (it passed in the earlier retest, then returned false in later runs) without a console error. Treat this as **needs targeted regression check**, not yet as a confirmed new defect.

## Conclusion
QA Fix 01 was only partially successful. The accessibility-label change landed, but the product's primary value path is still blocked.

Do **not** start Delivery 2.

The next correction should be smaller than Fix 01 and address only the Blind Match vertical slice first. Friends mode and desktop refinements should wait until the core two-user match flow passes a deployed retest.
