# Security and Privacy Baseline

Delivery 1 uses Firebase Anonymous Authentication and Firestore.

Requirements:
- Never expose one user's contact field to the proposed match before mutual confirmation.
- Private post-karaoke feedback must not reveal a one-sided positive response.
- Firestore security rules must restrict profile/contact/match/room/feedback reads and writes to authorized participants.
- Room invite codes must not grant access to unrelated profile/match data.
- Do not store API keys in client-visible source files.
- No LLM/API credentials are required in Delivery 1.
- Provide a user-facing data deletion action and document stored data in the privacy page.

Before production use, review Firestore rules, abuse controls, retention and German legal/privacy requirements.
