/**
 * Lightweight client-side session helpers for admin routes.
 * Stores a short-lived flag in localStorage so protected pages
 * can verify that the current browser actually logged in.
 */

const SESSION_KEY = "internquest_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

const safeWindow = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const createAdminSession = (payload = {}) => {
  if (!safeWindow()) return;
  const session = {
    ...payload,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearAdminSession = () => {
  if (!safeWindow()) return;
  window.localStorage.removeItem(SESSION_KEY);
};

export const getAdminSession = () => {
  if (!safeWindow()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
      clearAdminSession();
      return null;
    }
    return parsed;
  } catch (error) {
    clearAdminSession();
    return null;
  }
};

export const isAdminAuthenticated = () => Boolean(getAdminSession());


