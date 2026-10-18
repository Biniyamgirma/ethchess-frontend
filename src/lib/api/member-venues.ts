import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  MemberActivity,
  MemberMatchHistory,
  Venue,
  VenueTable,
} from "@/types/member";

export async function getMemberVenues() {
  const response = await apiClient.get<ApiResponse<Venue[]>>(
    "/api/matches/venues",
  );
  return response.data.data;
}

export async function getVenueTables(venueId: number) {
  const response = await apiClient.get<ApiResponse<VenueTable[]>>(
    `/api/matches/venues/${venueId}/tables`,
  );
  return response.data.data;
}

export async function getMemberActivity() {
  const response = await apiClient.get<ApiResponse<MemberActivity | null>>(
    "/api/matches/member/activity",
  );
  return response.data.data;
}

export async function getMemberMatchHistory() {
  const response = await apiClient.get<ApiResponse<MemberMatchHistory[]>>(
    "/api/matches/member/history",
  );
  return response.data.data;
}

export async function cancelMemberMatch(matchId: number) {
  const response = await apiClient.post<
    ApiResponse<{ id: number; status: string }>
  >(`/api/matches/member/${matchId}/cancel`, {});
  return response.data.data;
}

export async function requestMemberMatchEnd(
  matchId: number,
  loserUserId: string,
) {
  const response = await apiClient.post<
    ApiResponse<{ state: string; message: string }>
  >(`/api/matches/member/${matchId}/end`, {
    loser_user_id: loserUserId,
  });
  return response.data.data;
}

export async function joinVenueTable(tableId: number) {
  const response = await apiClient.post<
    ApiResponse<{ state: string; message: string }>
  >(`/api/matches/tables/${tableId}/join`, {});
  return response.data.data;
}

export async function leaveVenueTable(tableId: number) {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    `/api/matches/tables/${tableId}/leave`,
    {},
  );
  return response.data.data;
}
