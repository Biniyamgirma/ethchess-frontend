import { apiClient } from "@/lib/api/client";
import type { ApiResponse, VenueOwner } from "@/types/api";

const demoOwners: VenueOwner[] = [
  {
    id: 1,
    f_name: "Hana",
    l_name: "Bekele",
    email: "hana@example.com",
    venue_id: 1,
  },
  {
    id: 2,
    f_name: "Dawit",
    l_name: "Alemu",
    email: "dawit@example.com",
    venue_id: 2,
  },
  {
    id: 3,
    f_name: "Mekdes",
    l_name: "Tadesse",
    email: "mekdes@example.com",
    venue_id: 3,
  },
];
let ownerCache = [...demoOwners];

export async function getVenueOwners(): Promise<VenueOwner[]> {
  // TODO: confirm endpoint. The backend currently has no venue-owner list route.
  return [...ownerCache];
}

export async function createVenueOwner(
  input: Pick<
    VenueOwner,
    "f_name" | "l_name" | "email" | "phone_number" | "venue_id"
  > & {
    password: string;
  },
) {
  const response = await apiClient.post<ApiResponse<VenueOwner>>(
    "/api/vendors",
    input,
  );
  ownerCache = [...ownerCache, response.data.data];
  return response.data.data;
}

export async function updateVenueOwner(
  id: number,
  input: Partial<VenueOwner> & { password?: string },
) {
  const response = await apiClient.patch<ApiResponse<VenueOwner>>(
    `/api/vendors/${id}`,
    input,
  );
  ownerCache = ownerCache.map((owner) =>
    owner.id === id ? response.data.data : owner,
  );
  return response.data.data;
}
