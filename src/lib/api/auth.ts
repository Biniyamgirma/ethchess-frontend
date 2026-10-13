import { apiClient } from "@/lib/api/client";

export async function logoutAdmin() {
  await apiClient.post("/api/auth/logout", {});
}
