import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Venue, VenueTable } from "@/types/member";

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
