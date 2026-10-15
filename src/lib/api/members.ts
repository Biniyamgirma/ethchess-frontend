import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Member } from "@/types/api";

export async function getMembers() {
  const response = await apiClient.get<ApiResponse<Member[]>>("/api/members");
  return response.data.data;
}

export async function updateMember(id: string, input: Partial<Member>) {
  const response = await apiClient.patch<ApiResponse<Member>>(
    `/api/members/${encodeURIComponent(id)}`,
    input,
  );
  return response.data.data;
}

export async function setMemberBlocked(id: string, isBlocked: boolean) {
  const response = await apiClient.patch<ApiResponse<Member>>(
    `/api/members/${encodeURIComponent(id)}/block`,
    { is_blocked: isBlocked },
  );
  return response.data.data;
}

export async function approveOfficialMember(id: string) {
  const response = await apiClient.post<ApiResponse<Member>>(
    `/api/members/${encodeURIComponent(id)}/approve-official`,
  );
  return response.data.data;
}

export async function removeMember(id: string) {
  const response = await apiClient.delete<ApiResponse<Member>>(
    `/api/members/${encodeURIComponent(id)}`,
  );
  return response.data.data;
}
