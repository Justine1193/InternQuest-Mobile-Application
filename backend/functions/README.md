# Firebase Cloud Functions - Delete User

This Cloud Function allows you to delete Firebase Authentication users from the client-side application.

## Setup Instructions

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase Functions (if not already done)
```bash
firebase init functions
```

### 3. Install Dependencies
Navigate to the `functions` directory and install required packages:
```bash
cd functions
npm install firebase-admin firebase-functions
```

### 4. Deploy the Function
Deploy the `deleteUser` function:
```bash
firebase deploy --only functions:deleteUser
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

## Function Details

The `deleteUser` Cloud Function:
- Accepts either `uid` or `email` as parameters
- Uses Firebase Admin SDK to delete the user from Firebase Authentication
- Requires the caller to be authenticated
- Returns success/error status

## Usage

The function is automatically called when:
- An admin account is deleted in the Admin Management page
- A student account is deleted in the Student Dashboard

The client-side code will attempt to delete the Firebase Auth user, and if the Cloud Function is not deployed, it will log a warning but still proceed with Firestore deletion.

## Security Note

Currently, the function allows any authenticated user to delete users. You should add role-based access control to restrict this to admins only. Update the function in `deleteUser.js` to check the user's role before allowing deletion.

