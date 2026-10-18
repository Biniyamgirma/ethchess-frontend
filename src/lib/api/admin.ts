import { apiClient } from "@/lib/api/client";
import type {
  AdminAccess,
  AdminRole,
  AdminUser,
  ApiResponse,
  ManagedAdmin,
} from "@/types/api";

export async function loginAdmin(input: { f_name: string; password: string }) {
  const response = await apiClient.post<ApiResponse<{ user: AdminUser }>>(
    "/api/admins/login",
    input,
  );
  return response.data.data.user;
}

export async function getCurrentAdminAccess() {
  const response =
    await apiClient.get<ApiResponse<AdminAccess>>("/api/admins/me");
  return response.data.data;
}

export async function getAdmins() {
  const response =
    await apiClient.get<ApiResponse<ManagedAdmin[]>>("/api/admins");
  return response.data.data;
}

export async function createAdmin(input: {
  f_name: string;
  l_name?: string;
  password: string;
  role: number;
}) {
  const response = await apiClient.post<ApiResponse<ManagedAdmin>>(
    "/api/admins/register",
    input,
  );
  return response.data.data;
}

export async function updateAdmin(
  id: number,
  input: {
    f_name?: string;
    l_name?: string | null;
    password?: string;
    role?: number;
    status?: number | null;
  },
) {
  const response = await apiClient.patch<ApiResponse<ManagedAdmin>>(
    `/api/admins/${id}`,
    input,
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
