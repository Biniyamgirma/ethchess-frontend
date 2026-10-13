import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Venue } from "@/types/api";

export async function getVenues() {
  const response = await apiClient.get<ApiResponse<Venue[]>>("/api/venues");
  return response.data.data;
}

export async function createVenue(
  input: Partial<Venue> & { commission: number },
) {
  const response = await apiClient.post<ApiResponse<Venue>>(
    "/api/venues",
    input,
  );
  return response.data.data;
}

export async function updateVenue(id: number, input: Partial<Venue>) {
  const response = await apiClient.patch<ApiResponse<Venue>>(
    `/api/venues/${id}`,
    input,
  );
  return response.data.data;
}
