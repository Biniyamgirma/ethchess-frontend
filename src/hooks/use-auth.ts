"use client";

import { useSyncExternalStore } from "react";
import {
  clearAdminUser,
  getAdminUser,
  subscribeToAdminUser,
} from "@/lib/auth/storage";

export function useAuth() {
  const user = useSyncExternalStore(
    subscribeToAdminUser,
    getAdminUser,
    () => null,
  );

  return {
    user,
    clearUser: clearAdminUser,
  };
}
