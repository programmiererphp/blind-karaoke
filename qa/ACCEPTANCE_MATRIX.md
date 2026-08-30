# Delivery 1 Acceptance Matrix

| ID | Scenario | Expected result |
|---|---|---|
| A1 | Two compatible users in separate browser sessions | One shared Match record is created |
| A2 | Pop user vs Rock user with otherwise compatible requirements | Match still possible; music is soft |
| A3 | Incompatible partner preference | Users are not matched |
| A4 | Only A accepts | B identity/contact remains hidden; A waits |
| A5 | B also accepts | Match becomes confirmed and same Room is created for both |
| A6 | A adds song | B sees it realtime without reload |
| A7 | Karaoke start | Valid external karaoke/search target opens |
| A8 | Duet Roulette | Suitable suggestion appears and can be added to queue |
| A9 | Friends Room shared link opened in second browser | Second user can join same room |
| A10 | Both choose “sing again” | Karaoke Friend is created |
| A11 | Only one chooses “sing again” | No friendship; positive response stays private |
| A12 | Reload on Match/Room/Friends screens | State persists |
| A13 | 360/390/430 px | No horizontal scroll or obscured controls |
| A14 | No compatible user exists | Honest no-match state, never fake profile |
| A15 | Concurrent matching attempts | No user ends up in two active matches |
