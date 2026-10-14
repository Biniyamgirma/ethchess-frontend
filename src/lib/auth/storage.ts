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
  window.localStorage.setItem(USER_KEY, cachedRaw);
  window.localStorage.removeItem("ethchess-member-session");
  window.sessionStorage.removeItem("ethchess-member-session");
  document.cookie = `ethchess_member=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  setAdminRouteCookie(true);
  listeners.forEach((listener) => listener());
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem(USER_KEY) ??
    window.sessionStorage.getItem(USER_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  cachedUser = null;
  if (!raw) return cachedUser;

  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !("id" in value) ||
      typeof value.id !== "number" ||
      !("role" in value) ||
      value.role !== "admin" ||
      !("f_name" in value) ||
      typeof value.f_name !== "string"
    ) {
      throw new Error("Invalid admin session");
    }
    cachedUser = value as AdminUser;
    window.localStorage.setItem(USER_KEY, raw);
    window.sessionStorage.removeItem(USER_KEY);
    return cachedUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.localStorage.removeItem("ethchess-member-session");
    window.sessionStorage.removeItem("ethchess-member-session");
    setAdminRouteCookie(false);
    document.cookie = `ethchess_member=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    cachedRaw = null;
    return cachedUser;
  }
}

export function clearAdminUser() {
  cachedRaw = null;
  cachedUser = null;
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  window.localStorage.removeItem("ethchess-member-session");
  window.sessionStorage.removeItem("ethchess-member-session");
  setAdminRouteCookie(false);
  document.cookie = `ethchess_member=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  listeners.forEach((listener) => listener());
}

export function subscribeToAdminUser(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
