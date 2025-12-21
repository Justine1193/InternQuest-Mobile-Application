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

// Get the current admin's role
export const getAdminRole = () => {
  const session = getAdminSession();
  return session?.role || null;
};

// Check if admin has a specific role
export const hasRole = (role) => {
  const currentRole = getAdminRole();
  return currentRole === role;
};

// Check if admin has one of the specified roles
export const hasAnyRole = (roles) => {
  const currentRole = getAdminRole();
  return roles.includes(currentRole);
};

// Role hierarchy: super_admin > coordinator > adviser
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COORDINATOR: 'coordinator',
  ADVISER: 'adviser',
};

// Check if admin can create accounts (super_admin and coordinator)
export const canCreateAccounts = () => {
  return hasAnyRole([ROLES.SUPER_ADMIN, ROLES.COORDINATOR]);
};

// Check if admin can create coordinator accounts (only super_admin)
export const canCreateCoordinator = () => {
  return hasRole(ROLES.SUPER_ADMIN);
};

// Check if admin can view full dashboard (super_admin and coordinator)
export const canViewDashboard = () => {
  return hasAnyRole([ROLES.SUPER_ADMIN, ROLES.COORDINATOR]);
};

// Check if admin can only view student dashboard (adviser)
export const isAdviserOnly = () => {
  return hasRole(ROLES.ADVISER);
};

// Get the current admin's college code
export const getAdminCollegeCode = () => {
  const session = getAdminSession();
  return session?.college_code || null;
};

// Get the current admin's sections
export const getAdminSections = () => {
  const session = getAdminSession();
  const sections = session?.sections || session?.section;
  if (Array.isArray(sections)) {
    return sections;
  }
  if (typeof sections === "string" && sections.trim()) {
    return [sections.trim()];
  }
  return [];
};

