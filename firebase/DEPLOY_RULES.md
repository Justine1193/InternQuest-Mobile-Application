## Deploying Firestore & Storage rules

This project keeps Firestore rules at `firebase/firestore.rules` and Storage rules at `firebase/storage.rules`. To deploy these rules to the Firebase project `neuinternshipdb` you can either use the Firebase Console (manual) or the Firebase CLI (recommended).

1) Manual (Firebase Console)
   - Open Firebase Console -> Firestore -> Rules
   - Copy the contents of `firebase/firestore.rules` in this repo and paste them into the Console editor
   - Click `Publish`
   - Repeat for Storage rules: Console -> Storage -> Rules -> paste `firebase/storage.rules` and Publish
   - Use the Rules Simulator (Firestore) or test uploads (Storage) to validate read/write operations for paths like `/users/<UID>/ojtLogs/<ID>` and `/users/<UID>/hiddenNotifications/<ID>` and Storage paths like `requirements/<UID>/*`, `avatars/<UID>/*` with Auth set to the user's uid.

2) CLI (recommended)
   - Install firebase-tools if missing: `npm install -g firebase-tools`
   - Login and optionally create a CI token:
     - `firebase login`
     - `firebase login:ci` (copy the printed token)
   - Deploy rules locally from project root (both Firestore and Storage rules):
     ```pwsh
     firebase deploy --only firestore:rules,storage:rules --project neuinternshipdb
     ```

3) CI / GitHub Actions
   - This repo includes a GitHub Action that deploys both `firebase/firestore.rules` and `firebase/storage.rules` when you push to `website` branch.
   - Add the `FIREBASE_TOKEN` secret to the repository (Settings → Secrets) with the token from `firebase login:ci`.

Troubleshooting
 - If `firebase deploy` fails, run with `--debug` and paste the output here.
 - Verify `firebase.json` exists and points to `firebase/firestore.rules` and `firebase/storage.rules`.
