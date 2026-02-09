# Blocked Student – Mobile App Handling

This document describes how the **mobile app** should handle **blocked students** so that blocked users cannot use the app and see a clear message instead.

## Backend behavior (already implemented)

- **Firestore:** Each student is stored in the `users` collection. When an admin blocks a student, the document is updated with `is_blocked: true` (no data is deleted).
- **Firestore Security Rules:**  
  - Blocked students **can still read** their own `users/{uid}` document (so the app can read `is_blocked` and show the message).  
  - Blocked students **cannot** read or write:
    - Their own subcollections: `users/{uid}/weeklyReports`, `users/{uid}/ojtLogs`, `users/{uid}/requirements`, etc.
    - Their own `requirement_approvals/{uid}` document.
    - Their own applications (read/update denied when `resource.data.userId == request.auth.uid`).
  - Any request that would allow a blocked user to access protected data returns **permission-denied** (effectively like **HTTP 403** for that operation).

So **all protected API requests** (Firestore reads/writes that touch the student’s data) will fail for blocked users once the rules are applied.

## What the mobile app must do

### 1. Check block status after login / on app load

- After successful Firebase Auth sign-in (or when restoring session), read the current user’s document:
  - Path: `users/{currentUser.uid}`
- If the document has `is_blocked === true`:
  - Do **not** proceed to the main app.
  - Show a **blocked screen** with a clear message, for example:
    - **“Your account has been blocked. Please contact your adviser or coordinator.”**
  - Optionally sign the user out (e.g. `signOut()`) so they cannot retry without going through this check again.

### 2. Treat permission-denied as “blocked” when appropriate

- If the app tries to load data (e.g. requirements, applications, profile) and gets a **permission-denied** error from Firestore, it may be because the user was blocked after they logged in.
- In that case:
  - Show the same message: **“Your account has been blocked. Please contact your adviser or coordinator.”**
  - Optionally force logout and redirect to the blocked / login screen.

### 3. Do not rely only on “first read” of `users/{uid}`

- Re-check `is_blocked` when the app comes to foreground or on a critical navigation (e.g. before loading sensitive data), or handle permission-denied globally so that any 403-like failure can show the blocked message.

### 4. Force logout (optional but recommended)

- When you detect `is_blocked === true` or a permission-denied that indicates blocking:
  - Call Firebase Auth `signOut()` so the user is logged out across the app.
  - This ensures they cannot keep using cached data and must go through the block check again on next login.

## Summary

- **Backend:** Blocking is implemented via `is_blocked` on `users` and Firestore rules that deny access to protected data for blocked students; no student data is deleted.
- **Mobile:** Read `users/{uid}.is_blocked` after login and on app load; if true (or if you get permission-denied on protected requests), show **“Your account has been blocked. Please contact your adviser or coordinator.”** and optionally force logout. Treat permission-denied on protected APIs as equivalent to 403 for blocked users.
