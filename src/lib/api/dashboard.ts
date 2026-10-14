import { apiClient } from "@/lib/api/client";
import type { DashboardSummary } from "@/types/api";
import type { ApiResponse } from "@/types/api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiResponse<DashboardSummary>>(
    "/api/admins/dashboard-summary",
  );
  return response.data.data;
}
