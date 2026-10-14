import type { MemberSession } from "@/types/member";

const MEMBER_KEY = "ethchess-member-session";
const MEMBER_ROUTE_COOKIE = "ethchess_member";
let cachedRaw: string | null | undefined;
let cachedSession: MemberSession | null = null;
const listeners = new Set<() => void>();

export function getMemberSession(): MemberSession | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem(MEMBER_KEY) ??
    window.sessionStorage.getItem(MEMBER_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  cachedSession = null;
  if (!raw) return cachedSession;

  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      typeof value.id === "string" &&
      "name" in value &&
      typeof value.name === "string"
    ) {
      cachedSession = { id: value.id, name: value.name, role: "member" };
      window.localStorage.setItem(MEMBER_KEY, raw);
      window.sessionStorage.removeItem(MEMBER_KEY);
      return cachedSession;
    }
    window.localStorage.removeItem(MEMBER_KEY);
    window.sessionStorage.removeItem(MEMBER_KEY);
    cachedRaw = null;
    document.cookie = `${MEMBER_ROUTE_COOKIE}=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    return cachedSession;
  } catch {
    window.localStorage.removeItem(MEMBER_KEY);
    window.sessionStorage.removeItem(MEMBER_KEY);
    cachedRaw = null;
    document.cookie = `${MEMBER_ROUTE_COOKIE}=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    return cachedSession;
  }
}

export function saveMemberSession(session: MemberSession) {
  cachedRaw = JSON.stringify(session);
  cachedSession = session;
  window.localStorage.setItem(MEMBER_KEY, cachedRaw);
  window.localStorage.removeItem("ethchess-admin-user");
  window.sessionStorage.removeItem("ethchess-admin-user");
  document.cookie = `ethchess_admin=; Path=/; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  document.cookie = `${MEMBER_ROUTE_COOKIE}=1; Path=/member; Max-Age=604800; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  listeners.forEach((listener) => listener());
}

export function clearMemberSession() {
  cachedRaw = null;
  cachedSession = null;
  window.localStorage.removeItem(MEMBER_KEY);
  window.sessionStorage.removeItem(MEMBER_KEY);
  window.localStorage.removeItem("ethchess-admin-user");
  window.sessionStorage.removeItem("ethchess-admin-user");
  document.cookie = `ethchess_admin=; Path=/; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  document.cookie = `${MEMBER_ROUTE_COOKIE}=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  listeners.forEach((listener) => listener());
}

export function subscribeToMemberSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
