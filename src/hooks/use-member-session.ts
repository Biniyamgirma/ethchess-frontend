"use client";

import { useSyncExternalStore } from "react";
import {
  getMemberSession,
  subscribeToMemberSession,
} from "@/lib/auth/member-storage";

export function useMemberSession() {
  return useSyncExternalStore(
    subscribeToMemberSession,
    getMemberSession,
    () => null,
  );
}
