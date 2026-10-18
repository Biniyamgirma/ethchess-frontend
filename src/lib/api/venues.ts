import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  Venue,
  VenueOverview,
  VenueTable,
} from "@/types/api";

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

export async function getVenueOverview(id: number) {
  const response = await apiClient.get<ApiResponse<VenueOverview>>(
    `/api/venues/${id}/overview`,
  );
  return response.data.data;
}

export async function updateVenueTable(
  id: number,
  input: Partial<Pick<VenueTable, "name" | "status">>,
) {
  const response = await apiClient.patch<ApiResponse<VenueTable>>(
    `/api/venue-tables/${id}`,
    input,
  );
  return response.data.data;
}
