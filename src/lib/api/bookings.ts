import { apiClient } from "@/lib/api/client";
import type { ApiResponse, CurrentMatch } from "@/types/api";

export async function getCurrentMatches(): Promise<CurrentMatch[]> {
  const response = await apiClient.get<ApiResponse<CurrentMatch[]>>(
    "/api/matches/admin/current",
  );
  return response.data.data;
}

export async function adminEndMatch(id: number, loserUserId: string) {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/api/matches/admin/${id}/end`,
    { loser_user_id: loserUserId },
  );
  return response.data.data;
}

export async function adminCancelMatch(id: number) {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/api/matches/admin/${id}/cancel`,
    {},
  );
  return response.data.data;
}
