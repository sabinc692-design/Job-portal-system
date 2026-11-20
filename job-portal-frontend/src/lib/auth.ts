export type AuthRole = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const AUTH_SESSION_EVENT = "job-portal-auth-session";

function notifySessionChange() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  localStorage.removeItem("token");
  notifySessionChange();
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  notifySessionChange();
}

export function getDashboardPath(role: AuthRole) {
  switch (role) {
    case "JOB_SEEKER": return "/dashboard/job-seeker";
    case "EMPLOYER": return "/dashboard/employer";
    case "ADMIN": return "/dashboard/admin";
  }
}

export function readAuthUser(): AuthUser | null {
  return parseAuthUser(localStorage.getItem(USER_KEY));
}

export function parseAuthUser(serialized: string | null): AuthUser | null {
  if (!serialized) return null;
  try {
    const user = JSON.parse(serialized) as AuthUser;
    if (typeof user.id !== "string" || typeof user.name !== "string" ||
        typeof user.email !== "string" || !["JOB_SEEKER", "EMPLOYER", "ADMIN"].includes(user.role)) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function subscribeAuthSession(onChange: () => void) {
  window.addEventListener(AUTH_SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getAuthSessionSnapshot() {
  return localStorage.getItem(USER_KEY);
}
export async function refreshAuthSession() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    clearAuthSession();
    return null;
  }
  try {
    const session = await apiPost<AuthSession>("/auth/refresh", { refreshToken });
    saveAuthSession(session);
    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}
import { apiPost } from "@/lib/api";

