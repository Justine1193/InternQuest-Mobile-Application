# lookupEmailByStudentId (Cloud Function)

HTTP function to resolve a student's email by Student ID so the mobile app can sign in using Student ID + password without pre-auth Firestore reads.

## Endpoint
- Method: POST
- Body: `{ "studentId": "22-12345-678" }`
- Response: `{ "email": "student@neu.edu.ph" }` or `{ "email": null }`

## Optional security
- Set env var `LOOKUP_EMAIL_API_KEY` and pass header `X-API-Key: <key>` from callers.

## Deploy (Firebase)
1. Ensure Firebase CLI is installed and logged in.
2. Add the function under your Firebase Functions source (or copy this folder into your `functions` codebase).
3. In your functions `index.js`, export the function:
   ```js
   const { lookupEmailByStudentId } = require('./lookupEmailByStudentId');
   exports.lookupEmailByStudentId = lookupEmailByStudentId;
   ```
4. Deploy:
   ```bash
   firebase deploy --only functions:lookupEmailByStudentId
   ```

## Configure the app
- Set the URL (from Firebase console) into the app via one of:
  - Expo `app.json` extra: `LOOKUP_EMAIL_FUNCTION_BASE_URL`
  - Env var `LOOKUP_EMAIL_FUNCTION_BASE_URL`

Example URL: `https://asia-southeast1-<project-id>.cloudfunctions.net/lookupEmailByStudentId`
