# Delivery 2 Correction 01 — restore an active Friends Room during bootstrap

Apply one focused correction to the existing deployed **Blind Karaoke** app.

Source finding: `D2-WB-D1-01` in `deliveries/D02-meetup-planner/qa/REPORT.md`.

Do not rebuild the app. Preserve all passing D1 behavior and any implemented D2 Meetup Planner behavior. Do not begin Delivery 3.

## Actual Browser finding

An authenticated user created Friends Room `ZR6ZL`, added Shallow and made it the current song. Reloading from the active room rendered the generic Home screen. Selecting bottom navigation `Room` then recovered the exact same room, participant and current song.

The room data is not lost. Bootstrap fails to select the active room even though the existing Room navigation resolver can find it.

## Exact reproduction

1. Create or use a valid profile.
2. From Home select `Mit Freunden singen`.
3. Create a Friends Room.
4. Add Shallow and select `Singen starten`.
5. Verify the room code, participant and current Shallow.
6. Reload the page while the room is active.
7. Observe Home.
8. Select `Room` and observe that the same room is still available.

## Expected result

- Reload returns directly to the active Friends Room.
- The room ID/code, participants, invite URL, current song and queue are identical.
- No Room-tab click or saved invite URL is required.
- No duplicate room, participant or queue record is created.
- Once `Abend beenden` genuinely ends the room, reload must no longer restore it.

## Required correction

1. Reuse one server-backed active-room resolver for both application bootstrap and bottom `Room` navigation.
2. Run the resolver only after Firebase anonymous-auth initialization has produced the current UID.
3. If the UID participates in a genuinely active room, set the initial application state to that exact room before rendering Home, no-match or Match fallback states.
4. Restore the existing room document and listener; do not create a new room during restore.
5. Preserve the exact room code, participant display names, invite URL, current song and queue.
6. If legacy data exposes multiple rooms, select the newest genuinely active membership deterministically.
7. Ensure `Abend beenden` marks/clears the room so the resolver no longer selects it.
8. Preserve the verified same-UID invite guard: opening one's own invite must continue to show `Du bist bereits in diesem Room` without changing nickname or participants.
9. Do not alter D1 matching, confirmation, queue, Duett Roulette, feedback or Karaoke-Friend behavior except for the minimal bootstrap integration.
10. Do not change unverified D2 proposal, meetup, route, ICS, status or cancellation semantics except where necessary to avoid deleting or corrupting their state.

## Focused regression tests

1. **Friends Room bootstrap:** create room → add Shallow → make it current → reload → verify automatic direct room restoration.
2. **State fidelity:** compare room id/code, participant, invite URL, current Shallow and queue before/after reload.
3. **Room navigation:** from another app surface, select `Room`; verify the same resolver opens the same room.
4. **Same-UID guard:** open the creator invite in a same-auth tab; verify the existing-membership state, no join form, no rename and no duplicate.
5. **End room:** use the real confirmation flow for `Abend beenden`; reload and verify the ended room is not restored.
6. **Conflict state:** with an outstanding Blind Match plus active Friends Room, reload and verify the active room has priority while it remains active.
7. **D1 queue:** add one song per valid independent participant and verify realtime synchronization remains intact.
8. **D2 preservation:** when a real confirmed Match/Meetup is available, verify this correction does not delete or duplicate meetup state and normal Meetup navigation remains usable.
9. **Console:** no relevant app-origin warning, Firestore permission error or failed write on the corrected paths.
10. **Responsive:** verify the restored room at 390 × 844 and desktop width without clipped actions or horizontal overflow.

## Definition of Done

- `D2-WB-D1-01` is no longer reproducible on the real deployment.
- Bootstrap and `Room` navigation use the same server-backed active-room selection.
- Active room state restores exactly and idempotently after cold reload.
- Ending a room prevents later restoration.
- The same-UID invite guard remains fixed.
- Passing D1 behavior and any existing D2 behavior remain unchanged.
- Full D2 Browser QA is rerun with independent A/B sessions before D2 acceptance.
- Delivery 3 is not started.
