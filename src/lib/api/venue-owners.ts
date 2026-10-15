import { apiClient } from "@/lib/api/client";
import type { ApiResponse, VenueOwner } from "@/types/api";

export async function getVenueOwners(): Promise<VenueOwner[]> {
  const response =
    await apiClient.get<ApiResponse<VenueOwner[]>>("/api/vendors");
  return response.data.data;
}

export interface CreateVenueOwnerInput {
  f_name: string;
  l_name: string;
  password: string;
  phone_number: string;
  email: string;
  telegram_username: string;
  whats_up_username: string;
}

export type UpdateVenueOwnerInput = Partial<VenueOwner> & { password?: string };

export async function createVenueOwner(input: CreateVenueOwnerInput) {
  const response = await apiClient.post<ApiResponse<VenueOwner>>(
    "/api/vendors",
    input,
  );
  return response.data.data;
}

export async function updateVenueOwner(
  id: number,
  input: UpdateVenueOwnerInput,
) {
  const response = await apiClient.patch<ApiResponse<VenueOwner>>(
    `/api/vendors/${id}`,
    input,
  );
  return response.data.data;
}

export async function setVenueOwnerBlocked(id: number, is_blocked: boolean) {
  const response = await apiClient.patch<ApiResponse<VenueOwner>>(
    `/api/vendors/${id}/status`,
    { is_blocked },
  );
  return response.data.data;
}
