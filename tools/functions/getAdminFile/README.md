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

Serving PDFs and other binary types
----------------------------------
This function returns the raw binary stored in `admin_files.contentBase64` with the correct
`Content-Type` header (from `admin_files.contentType`). That means the function can be used
to serve PDFs directly to browsers or mobile apps. Example usage:

```
https://<region>-<project>.cloudfunctions.net/getAdminFile?docId=qPAcPOeYdY3qwv hVVh2s
```

If you want the mobile app to automatically open a PDF served by the function, set the
`ADMIN_FILE_FUNCTION_BASE_URL` constant in the app (`screens/RequirementsChecklistScreen.tsx`) to
the function base URL (replace `<region>-<project>`). When users tap an uploaded file that
has an `adminDocId`, the app will open the function URL which streams the PDF with the
proper `Content-Type` so the device can preview or download it.

Security note: If the file may be sensitive, protect the function (IAM, callable functions,
or check auth tokens inside the function) so only authorized admin users can download files.
