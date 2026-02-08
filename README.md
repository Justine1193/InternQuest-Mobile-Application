# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Admin provisioning (create accounts)

This app expects students to log in via **Student ID + password**. Student IDs are mapped to personalized emails via the `users` Firestore collection.

To create accounts (Auth + Firestore) from your machine:

```bash
npm run provision:user -- --help
```

Authentication for the CLI:

- Recommended: set `GOOGLE_APPLICATION_CREDENTIALS` to a Firebase Admin service account JSON (do not commit it)
- Alternative: `gcloud auth application-default login`

## Account blocking (show reason in app)

If an adviser/coordinator blocks a student account, the mobile app will show the block reason on the sign-in screen and will also sign out any existing saved session.

To block/unblock a user from your admin website (Firestore):

- Collection: `users/{uid}` (the user's UID document)
- Field: `accountAccess`
   - `isBlocked`: boolean
   - `blockedReason`: string | null
   - `blockedBy`: string | null (e.g. `adviser`, `coordinator`, `admin`)
   - `blockedAt`: timestamp | null

Example payload:

```js
accountAccess: {
   isBlocked: true,
   blockedReason: 'Incomplete requirements. Please see your adviser.',
   blockedBy: 'coordinator',
   blockedAt: new Date(),
}
```

## Device push notifications (adviser/coordinator messages)

The app shows notifications in-app via the `notifications` collection. For device-level push (shows in the OS notification tray), the backend sends Expo push when a notification document is created.

- Store each device token on the user document: `users/{uid}.expoPushToken` (the app does this automatically on login).
- Create a notification document in `notifications` with either `userId` or `targetStudentId` set to the recipient UID.
- The Cloud Function `pushOnNotificationCreated` will send a push automatically.

Opt-out (per notification): set `sendPush: false` on the notification doc.

Note: broadcast notifications with `targetType: 'all'` are not auto-pushed to avoid spamming.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Export / Build Android APK

This repo is configured to generate an **APK** via EAS Build using the `preview` profile in `eas.json` (it sets `android.buildType` to `apk`).

1. Install deps:

   ```bash
   npm install
   ```

2. Log in to Expo/EAS (one-time per machine):

   ```bash
   npx eas login
   ```

3. Build the APK (cloud build):

   ```bash
   npm run build:apk
   ```

After the build finishes, EAS will print a URL where you can download the `.apk`.

Optional:

- Production Play Store bundle (AAB):

  ```bash
  npm run build:aab
  ```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
