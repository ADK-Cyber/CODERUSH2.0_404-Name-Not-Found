Team name - 404 Name Not Found
Coderush 2.0
SDG track
PS1-
Build a multilingual, privacy-aware civic redressal system that turns resident complaints into deduplicated, prioritized, accountable workflows with transparent status, escalation, and measurable service-level outcomes.

## Firebase setup

This app can store complaint text, GPS/location info, image evidence, and video evidence in Firebase.

1. Create a Firebase project at https://console.firebase.google.com/.
2. Add a web app and copy the SDK config values into `js/firebase-config.js`.
3. Enable Firestore Database in Firebase Console.
4. Enable Storage in Firebase Console.
5. For phone OTP login, enable Authentication > Sign-in method > Phone.

Complaint records are written to the Firestore collection `complaints`.
Uploaded files are written to Firebase Storage under `complaint-media/{reportId}/`.

During local demos, the app still falls back to `database.json` and `localStorage` if Firebase is not configured or unavailable.
