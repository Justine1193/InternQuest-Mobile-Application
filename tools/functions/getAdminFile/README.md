Deploy instructions for `getAdminFile` Cloud Function

1. Install Firebase CLI and login:

```bash
npm install -g firebase-tools
firebase login
```

2. From your project root, initialize functions (if you don't have a `functions` folder already). You can copy this code into your existing `functions/` folder.

3. Deploy the function:

```bash
cd tools/functions/getAdminFile
# ensure package.json exists and has firebase-functions and firebase-admin
npm init -y
npm install firebase-functions firebase-admin
# deploy (you'll need firebase project configured via `firebase use`)
firebase deploy --only functions:getAdminFile
```

4. After deploy, construct the function URL like:

```
https://<region>-<project>.cloudfunctions.net/getAdminFile?docId=<DOCUMENT_ID>
```

Replace `<region>` and `<project>` with your Firebase settings or the CLI output after deploy.

Security: restrict the function with IAM or verify callers inside the function if you don't want it public.
