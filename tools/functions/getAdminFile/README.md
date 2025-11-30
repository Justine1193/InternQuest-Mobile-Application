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

## Serving PDFs and other binary types

This function returns the raw binary stored in `admin_files.contentBase64` with the correct
`Content-Type` header (from `admin_files.contentType`). That means the function can be used
to serve PDFs directly to browsers or mobile apps. Example usage:

```
https://<region>-<project>.cloudfunctions.net/getAdminFile?docId=qPAcPOeYdY3qwv hVVh2s
```

If you want the mobile app to automatically open a PDF served by the function, set the
`ADMIN_FILE_FUNCTION_BASE_URL` constant in the app so the client will prefer streaming from the function.

Recommended ways to wire the function URL in your app:

- Expo app.json / eas.json (recommended for managed Expo builds)

	Add the function url to your `app.json` or `eas.json` under `expo.extra`, e.g.: 

	```json
	{
		"expo": {
			"extra": {
				"ADMIN_FILE_FUNCTION_BASE_URL": "https://<region>-<project>.cloudfunctions.net/getAdminFile"
			}
		}
	}
	```

	In your app code we already read this value from expo Constants (or environment variables), so the function will be used automatically.

- Environment variables (CI / EAS build-time): define ADMIN_FILE_FUNCTION_BASE_URL as an environment variable in your build pipeline and it will be used at runtime if present.

When a template or admin_file doc contains an `adminDocId`, the app will open the function URL like:

```
https://<region>-<project>.cloudfunctions.net/getAdminFile?docId=<DOCUMENT_ID>
```

This will stream the binary content with correct Content-Type so the device can preview or download it.

Security note: If the file may be sensitive, protect the function (IAM, callable functions,
or check auth tokens inside the function) so only authorized admin users can download files.
