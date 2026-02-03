Help Desk Files migration: migrate embedded Firestore files into Cloud Storage

What this does

This folder contains a Node.js script that scans the `helpDeskFiles` Firestore collection for documents that include embedded file data (`fileData` data URLs or `contentBase64`) and migrates the binary into Cloud Storage. After uploading, it updates the Firestore document to include `path` and `url` and clears the old embedded fields.

Prerequisites

- Node.js installed.
- A Firebase service account JSON with Storage/Firestore Admin access.
- Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` (or `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH`) to the path of your service account key file.
- Optionally set `FIREBASE_STORAGE_BUCKET` if you use a non-default bucket name.

How to run

1. Install dependencies:

```bash
# from project root
npm install uuid firebase-admin
```

2. Run the script:

```bash
# example (Windows pwsh)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
node tools/migrations/migrate_helpdesk_files_to_storage.js
```

Safety notes

- Always run this script in a staging/test environment first.
- Review the documents before/after migration.
- The script sets a long-lived download token to make the new storage URL usable from client apps. Consider whether you prefer signed URLs or public ACLs for your data.

Client-side support

The mobile app `ResourceManagementScreen.tsx` (formerly HelpDeskScreen) was updated to fetch files only from Cloud Storage using `path`/`url`. It also includes an admin UI button for migrating individual documents from the client.

If you prefer an alternative migration strategy (signed URLs, changing storage rules, or server-side conversion), I can prepare that as well.
