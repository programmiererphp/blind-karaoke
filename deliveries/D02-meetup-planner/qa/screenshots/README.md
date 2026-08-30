# D2 real deployment screenshots

Store only screenshots captured from the real deployed Delivery 2 Browser QA here. Generated mockups belong under `design/mockups/`.

Current Work Browser evidence:

- `06-reload-not-restored.jpg` — active Friends Room incorrectly returns to Home after reload.
- `09-karaoke-regression.jpg` — current Shallow and external Karaoke control in the real Friends Room.
- `10-desktop-profile-ready.jpg` — unique D1 regression profile before search.
- `11-desktop-no-match.jpg` — honest no-match state for the unique QA city.
- `12-self-invite-guard.jpg` — same-UID invite guard remains fixed.

Correction 01 Retest 01 evidence:

- `13-retest-active-room-before-reload.jpg` — existing room `ZR6ZL` restored automatically at retest start.
- `14-retest-active-room-after-reload.jpg` — existing room preserved after explicit reload.
- `15-retest-self-invite-guard.jpg` — existing-room same-UID guard transition evidence.
- `16-retest-ended-room-not-restored.jpg` — ended room correctly excluded from restoration.
- `17-retest-fresh-room-before-reload.jpg` — fresh-room lower-page state before reload.
- `17a-retest-fresh-room-before-reload-top.jpg` — clearest fresh-room state before reload.
- `18-retest-fresh-room-after-reload.jpg` — fresh room restored automatically after reload.
- `19-retest-fresh-self-invite-guard.jpg` — same-UID guard for fresh room `HB02J`.

D2 proposal/confirmation/status/cancellation screenshots remain absent because the single available Firebase-auth context could not establish a valid two-user confirmed Match.
