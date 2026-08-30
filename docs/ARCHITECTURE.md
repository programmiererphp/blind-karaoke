# Architecture — Delivery 1

## Components
- `AppShell`
- `BottomNavigation`
- `HomeScreen`
- `PreferenceForm`
- `MatchScreen`
- `MatchStatusCard`
- `KaraokeRoomScreen`
- `SongQueue`
- `SongPicker`
- `DuetRoulette`
- `FriendRoomJoin`
- `AfterKaraokeScreen`
- `KaraokeFriendsScreen`
- `DebugDrawer`

## Services
- `authService`
- `userService`
- `matchEngine`
- `matchService`
- `roomService`
- `feedbackService`

Keep matching rules out of UI components.

## Firestore collections
### `users/{uid}`
Nickname, age, gender, normalized city, radius, preferences, music styles, favorite songs, availability, optional contact handle.

### `matches/{matchId}`
`userA`, `userB`, score, reasons, proposal/confirmation/decline flags and status.

### `rooms/{roomId}`
Optional `matchId`, participants, invite code for friends mode, current song, queue and status.

### `feedback/{matchId_uid}`
Private response to “sing together again”.

### `karaokeFriends/{friendshipId}`
Created only after mutual positive feedback.

## Realtime listeners
Use Firestore `onSnapshot` for match status, confirmation, room queue and feedback-derived state.

## Concurrency
Match creation must be atomic/transactional so a user cannot be placed into multiple active matches due to concurrent searches.

## Demo songs
Store a small local `demoSongs.ts` list with title, artist, style tags, duet flag and external karaoke/search URL. No external music API in D1.
