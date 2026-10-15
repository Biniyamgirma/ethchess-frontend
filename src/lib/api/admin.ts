import { apiClient } from "@/lib/api/client";
import type { AdminAccess, AdminRole, AdminUser, ApiResponse } from "@/types/api";

export async function loginAdmin(input: { f_name: string; password: string }) {
  const response = await apiClient.post<ApiResponse<{ user: AdminUser }>>(
    "/api/admins/login",
    input,
  );
  return response.data.data.user;
}

export async function getCurrentAdminAccess() {
  const response = await apiClient.get<ApiResponse<AdminAccess>>(
    "/api/admins/me",
  );
  return response.data.data;
}

export async function getAdminRoles() {
  const response =
    await apiClient.get<ApiResponse<AdminRole[]>>("/api/admins/roles");
  return response.data.data;
}

export async function createAdminRole(input: {
  name: string;
  status?: string;
}) {
  const response = await apiClient.post<ApiResponse<AdminRole>>(
    "/api/admins/roles",
    input,
  );
  return response.data.data;
}

export async function updateAdminRole(
  id: number,
  input: Partial<Pick<AdminRole, "name" | "status">>,
) {
  const response = await apiClient.patch<ApiResponse<AdminRole>>(
    `/api/admins/roles/${id}`,
    input,
  );
  return response.data.data;
}

export async function deleteAdminRole(id: number) {
  await apiClient.delete(`/api/admins/roles/${id}`);
}
