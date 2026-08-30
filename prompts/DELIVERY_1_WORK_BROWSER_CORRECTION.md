# Delivery 1 Work Browser Correction 02 — restore the active Friends Room

Apply one focused Delivery 1 correction to the existing deployed **Blind Karaoke** app.

Do **not** rebuild the app from scratch. Preserve every passing Delivery 1 behavior. Do **not** start or plan Delivery 2.

Source finding: `WORK-D1-R01-01` in `qa/reports/WORK_BROWSER_D1_RETEST_01.md`.

The previous finding `WORK-D1-01` is now verified **PASS**. Preserve its same-UID self-invite guard exactly: an existing participant must continue to see `Du bist bereits in diesem Room`, retain their identity, and open the same room idempotently.

## Observed defect — WORK-D1-R01-01 (HIGH)

When a user has both an active Blind Match state and an active Friends Room, reloading from the room restores the Blind Match proposal instead of the room. The `Room` tab then reports `Kein aktiver Raum`. The room still exists and can be recovered only through its exact saved invite URL.

## Exact reproduction

1. Use a user with an active Blind Match proposal or one-sided waiting match.
2. From Home, select `Mit Freunden singen`.
3. Create a Friends Room.
4. Add Shallow and set it current.
5. Add Perfect to the queue.
6. Confirm the room UI shows its code, participant, current Shallow and queued Perfect.
7. Reload the page while inside the room.
8. Select the bottom `Room` tab.

Current deployed result:

- Reload shows the Blind Match proposal/waiting state.
- `Room` shows `Kein aktiver Raum`.
- Opening the exact room invite URL still finds the existing participant and recovers the full room, proving the active room data was not deleted.

## Required correction

Make active-room restoration server-backed and deterministic:

1. Persist or derive the authenticated user's active room membership from Firestore. Do not rely only on transient React state, a tab-local variable, or an invite-route navigation state.
2. During application bootstrap, resolve states in this order:
   - an active room in which the current UID is a participant;
   - otherwise the current confirmed/proposed/waiting match state;
   - otherwise profile/search/home state.
3. Make the bottom `Room` navigation use the same server-backed active-room resolver. It must find the active room after a cold reload or a newly opened tab.
4. Restore the exact room ID, invite code, participant identities, current song and queue.
5. Preserve the active Blind Match record in the background if appropriate; it may become visible again after the Friends Room is ended. Do not let it override `ROOM_ACTIVE`.
6. When `Abend beenden` genuinely ends the active room, mark/clear that room state so bootstrap no longer restores it.
7. Enforce at most one selected active room per UID in D1. If legacy data exposes more than one, choose the newest genuinely active membership deterministically and do not create another room during restore.
8. Preserve the verified `WORK-D1-01` same-UID invite guard and all passing queue, current-song, external-link, matching, feedback, legal and navigation behavior.

## Exact expected result

- Reload from an active Friends Room returns directly to that room.
- `Room` opens the same active room after reload or in another same-auth tab.
- The room code, participants, Shallow current-song state and Perfect queue remain identical.
- No saved invite URL is required for recovery.
- An outstanding Blind Match does not hide the active room.
- Once the room is ended, it is no longer restored and the appropriate match/feedback/home state may appear.
- No duplicate room, participant or queue record is created.
- No relevant Firestore permission or app-origin console error occurs.

## Regression tests

1. **Conflict state:** create/retain an active Blind Match, then create a Friends Room. Reload from inside the room. Verify direct automatic room restoration.
2. **Room navigation:** after reload and from a fresh same-auth tab, select `Room`; verify the same room opens without the invite URL.
3. **State fidelity:** verify identical room ID/code, participant names, current Shallow, queued Perfect and invite URL before and after reload.
4. **Same-UID guard:** reopen the creator's invite in another same-auth tab. Verify `Du bist bereits in diesem Room`, no nickname write and no duplicate participant.
5. **Independent invitee:** join from a genuinely independent UID and verify both distinct participants share the same room.
6. **Realtime queue:** add one song from each valid participant and verify cross-user updates without reload.
7. **End room:** use `Abend beenden`, reload, and verify the ended room is not restored.
8. **Blind Match regression:** verify proposal privacy, one-sided waiting, mutual confirmation and matched-room creation still work.
9. **Feedback regression:** verify one-sided feedback privacy and mutual Karaoke-Friend creation.
10. **Console:** verify no relevant warning/error on all happy paths.
11. **Responsive:** verify the corrected restore states at 360, 390, 430 and desktop widths.

## Definition of Done

- `WORK-D1-R01-01` is no longer reproducible on the real deployment.
- Active-room lookup is server-backed and shared by bootstrap and `Room` navigation.
- Room state is restored exactly after cold reload and in a newly opened same-auth tab.
- An active match cannot override an active room.
- Ending the room clears restoration correctly.
- `WORK-D1-01` remains fixed.
- All listed regressions pass with two genuinely independent user contexts where required.
- No Delivery 2 feature is added.
