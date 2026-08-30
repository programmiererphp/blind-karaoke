# Delivery 1 Work Browser Correction — self-invite identity guard

Apply one small Delivery 1 correction to the existing deployed **Blind Karaoke** app.

Do **not** rebuild the app from scratch. Preserve all currently passing Delivery 1 behavior. Do **not** start or plan Delivery 2.

Source finding: `WORK-D1-01` in `qa/reports/WORK_BROWSER_D1_QA.md`.

## Observed defect — WORK-D1-01 (MEDIUM)

A Friends Room creator can open their own invite URL in another tab of the same browser/Firebase anonymous-auth session, enter a different nickname, and submit `Room beitreten`. The app then overwrites the creator identity shown in both tabs instead of treating this as an idempotent self-join. The room remains a one-participant room and queue provenance can show mixed old/new names.

## Exact reproduction

1. Create a user named `MinaSelfJoinQA`.
2. Choose `Mit Freunden singen` and create a Friends Room.
3. Add one or more songs so participant attribution is visible.
4. Copy the generated invite URL.
5. Open the URL in a second tab of the same browser profile, so it has the same authenticated Firebase UID.
6. Enter `AlexSelfJoinQA` and click `Room beitreten`.
7. Observe both tabs.

Current result: the participant identity changes from Mina to Alex, the room still waits for a partner, and existing/new queue entries can carry inconsistent names.

## Required correction

Make Friends Room joining idempotent and UID-safe:

1. Before rendering or submitting the invite join form, read the authenticated UID and the room's participant IDs.
2. If that UID is already the room owner or a participant:
   - do not create another participant;
   - do not update the user's nickname/profile from the join form;
   - do not overwrite any room participant display name;
   - route directly to the existing room, or show a clear `Du bist bereits in diesem Room` state with a button to open it.
3. Enforce the same check in the Firestore join transaction/service, not only in the UI, so repeated/concurrent submissions stay idempotent.
4. Keep the normal path unchanged for a genuinely different anonymous-auth UID: it may enter a nickname and join as participant two.
5. Preserve the D1 maximum of two distinct participant UIDs and reject a third distinct UID without changing existing room state.
6. Do not change matching, confirmation, queue, current-song, feedback, Karaoke Friends, legal pages or visual design except where strictly necessary for this guard.

## Exact expected result

- Reopening one's own invite never changes the existing profile or room participant name.
- The same UID appears at most once in the room.
- Existing queue/current-song state and attribution remain unchanged.
- A second independent UID can still join normally and both users then see the same two-person room.
- A third distinct UID cannot join a full room.
- No Firestore permission error or app-origin console error occurs.

## Regression tests

1. **Same-UID self-invite:** create a room, add a song, open the invite in another same-profile tab, attempt to join with another nickname. Verify no rename, no duplicate participant, no queue attribution change and direct/idempotent room access.
2. **Independent invitee:** create the room in a normal context and join from a truly independent/private context. Verify two distinct UIDs, two nicknames, same room and realtime participant update.
3. **Full room:** attempt a join from a third independent UID. Verify a clear full-room state and no mutation.
4. **Queue regression:** add a song from each valid participant and verify realtime sync without reload.
5. **Reload regression:** reload both valid participants and verify same room, participants, queue and current song.
6. **Blind Match regression:** rerun compatible two-user matching, one-sided acceptance and mutual confirmation; ensure this Friends Room guard does not affect it.
7. **Feedback regression:** verify one-sided privacy and mutual Karaoke-Friend creation still work.
8. **Console:** no relevant warning/error on the happy paths.

## Definition of Done

- `WORK-D1-01` is no longer reproducible.
- Same-UID invite handling is idempotent at UI and service/transaction levels.
- A real second UID still joins successfully; a third cannot.
- All listed regressions pass on the real deployed app.
- The complete Work Browser QA is rerun with two independent contexts and 360/390/430 plus desktop viewports.
- No Delivery 2 feature is added.

