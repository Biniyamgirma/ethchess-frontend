import type { MemberSession } from "@/types/member";

const MEMBER_KEY = "ethchess-member-session";
const MEMBER_ROUTE_COOKIE = "ethchess_member";
let cachedRaw: string | null | undefined;
let cachedSession: MemberSession | null = null;
const listeners = new Set<() => void>();

export function getMemberSession(): MemberSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(MEMBER_KEY);
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
      return cachedSession;
    }
    window.sessionStorage.removeItem(MEMBER_KEY);
    cachedRaw = null;
    return cachedSession;
  } catch {
    window.sessionStorage.removeItem(MEMBER_KEY);
    cachedRaw = null;
    return cachedSession;
  }
}

export function saveMemberSession(session: MemberSession) {
  cachedRaw = JSON.stringify(session);
  cachedSession = session;
  window.sessionStorage.setItem(MEMBER_KEY, cachedRaw);
  document.cookie = `${MEMBER_ROUTE_COOKIE}=1; Path=/member; Max-Age=604800; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  listeners.forEach((listener) => listener());
}

export function clearMemberSession() {
  cachedRaw = null;
  cachedSession = null;
  window.sessionStorage.removeItem(MEMBER_KEY);
  document.cookie = `${MEMBER_ROUTE_COOKIE}=; Path=/member; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  listeners.forEach((listener) => listener());
}

export function subscribeToMemberSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
