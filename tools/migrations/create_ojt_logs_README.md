Create sample OJT logs migration

Purpose
- Create a sample OJT log document under users/{uid}/ojtLogs for an individual user or for ALL users. This is useful if you want the collection present in Firestore for UI testing or migration.

Safety notes
- This script uses the Firebase Admin SDK and must be run from a trusted environment with a service account key.
- Prefer passing a specific --user <UID> when testing. Use --all only if you intend to create a sample doc for every user.

Usage
1. Install deps (if not already installed in tools/migrations):

```pwsh
npm install firebase-admin minimist
```

2. Run the script with a service account JSON.

- Using environment variable:

```pwsh
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
node create_ojt_logs_for_users.js --user <UID>
```

- Passing key directly:

```pwsh
node create_ojt_logs_for_users.js --key C:\path\to\serviceAccountKey.json --user <UID>
```

- To create one sample log per user (careful):

```pwsh
node create_ojt_logs_for_users.js --key C:\path\to\serviceAccountKey.json --all
```

Verify results
- Check the Firestore UI for `users/{UID}/ojtLogs` after running.

Rollback
- Script is non-destructive. If you want to remove the sample docs afterwards, run a targeted delete via the Firebase Console or write a clean-up script.
