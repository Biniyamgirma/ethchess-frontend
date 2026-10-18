import { apiClient } from "@/lib/api/client";
import type { DashboardActivitySummary, DashboardSummary } from "@/types/api";
import type { ApiResponse } from "@/types/api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiResponse<DashboardSummary>>(
    "/api/admins/dashboard-summary",
  );
  return response.data.data;
}

export async function getDashboardActivitySummary(): Promise<DashboardActivitySummary> {
  const response = await apiClient.get<ApiResponse<DashboardActivitySummary>>(
    "/api/admins/dashboard-activity",
  );
  return response.data.data;
}
