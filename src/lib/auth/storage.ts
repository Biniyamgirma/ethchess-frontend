import type { AdminUser } from "@/types/api";

const USER_KEY = "ethchess-admin-user";
const ADMIN_ROUTE_COOKIE = "ethchess_admin";

let cachedRaw: string | null | undefined;
let cachedUser: AdminUser | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function readRaw(): string | null {
  try {
    return (
      window.localStorage.getItem(USER_KEY) ??
      window.sessionStorage.getItem(USER_KEY)
    );
  } catch {
    return null;
  }
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;

  const raw = readRaw();
  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function saveAdminUser(user: AdminUser) {
  if (typeof window === "undefined") return;

  const storedUser: AdminUser = {
    id: user.id,
    role: user.role,
    f_name: user.f_name,
    l_name: user.l_name ?? null,
  };
  const raw = JSON.stringify(storedUser);

  window.localStorage.setItem(USER_KEY, raw);
  window.sessionStorage.removeItem(USER_KEY);
  cachedRaw = raw;
  cachedUser = storedUser;

  document.cookie =
    `${ADMIN_ROUTE_COOKIE}=1; Path=/; Max-Age=604800; SameSite=Lax` +
    (window.location.protocol === "https:" ? "; Secure" : "");

  notify();
}

export function clearAdminUser() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  document.cookie =
    `${ADMIN_ROUTE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax` +
    (window.location.protocol === "https:" ? "; Secure" : "");

  cachedRaw = null;
  cachedUser = null;
  notify();
}

export function subscribeToAdminUser(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === USER_KEY || event.key === null) {
      cachedRaw = undefined;
      notify();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}
