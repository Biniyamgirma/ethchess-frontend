import type { AdminUser } from "@/types/api";

const USER_KEY = "ethchess-admin-user";
const ADMIN_ROUTE_COOKIE = "ethchess_admin";
let cachedRaw: string | null | undefined;
let cachedUser: AdminUser | null = null;
const listeners = new Set<() => void>();

function setAdminRouteCookie(isAuthenticated: boolean) {
  const value = isAuthenticated ? "1" : "";
  const maxAge = isAuthenticated ? 604800 : 0;
  document.cookie = `${ADMIN_ROUTE_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

export function saveAdminUser(user: AdminUser) {
  cachedRaw = JSON.stringify(user);
  cachedUser = user;
  window.sessionStorage.setItem(USER_KEY, cachedRaw);
  setAdminRouteCookie(true);
  listeners.forEach((listener) => listener());
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(USER_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  cachedUser = null;
  if (!raw) return cachedUser;

  try {
    cachedUser = JSON.parse(raw) as AdminUser;
    return cachedUser;
  } catch {
    window.sessionStorage.removeItem(USER_KEY);
    cachedRaw = null;
    return cachedUser;
  }
}

export function clearAdminUser() {
  cachedRaw = null;
  cachedUser = null;
  window.sessionStorage.removeItem(USER_KEY);
  setAdminRouteCookie(false);
  listeners.forEach((listener) => listener());
}

export function subscribeToAdminUser(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
