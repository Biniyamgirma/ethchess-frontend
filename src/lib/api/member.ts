import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  District,
  Member,
  MemberSession,
} from "@/types/member";

type BackendMember = Member & { password?: string };

function stripSensitiveMember(member: BackendMember): Member {
  return {
    id: member.id,
    f_name: member.f_name,
    l_name: member.l_name,
    phone: member.phone,
    profile_picture: member.profile_picture,
    address: member.address,
    district: member.district,
    eth_chess_rating: member.eth_chess_rating,
    member_title: member.member_title,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export async function loginMember(input: { phone: string; password: string }) {
  const response = await apiClient.post<
    ApiResponse<{ user: MemberSession & { identifier: string } }>
  >("/api/auth/login/phone", input);
  return response.data.data.user;
}

export async function registerMember(input: {
  f_name?: string;
  l_name?: string;
  phone: string;
  password: string;
  address?: string;
  district?: number;
  profile_picture?: string;
}) {
  await apiClient.post("/api/members/register", {
    ...input,
  });
}

export async function logoutMember() {
  await apiClient.post("/api/auth/logout", {});
}

export async function getCurrentMember() {
  const response =
    await apiClient.get<ApiResponse<BackendMember>>("/api/members/me");
  return stripSensitiveMember(response.data.data);
}

export async function updateCurrentMember(input: {
  f_name: string;
  l_name: string;
  phone: string;
  address: string;
}) {
  const response = await apiClient.put<ApiResponse<BackendMember>>(
    "/api/members/me",
    input,
  );
  return stripSensitiveMember(response.data.data);
}

export async function linkChessAccounts(input: {
  chessDotComUsername?: string;
  lichessUsername?: string;
}) {
  const response = await apiClient.patch<ApiResponse<MemberDetails>>(
    "/api/members/me/link-accounts",
    input,
  );
  return response.data.data;
}

export async function getDistricts() {
  const response = await apiClient.get<ApiResponse<District[]>>(
    "/api/lookups/district/active",
  );
  return response.data.data;
}

export type MemberDetails = {
  id: number;
  chess_dot_com_username: string | null;
  lichess_username: string | null;
  chess_dot_com_bullet_rating: number | null;
  chess_dot_com_blitz_rating: number | null;
  chess_dot_com_rapid_rating: number | null;
  lichess_bullet_rating: number | null;
  lichess_blitz_rating: number | null;
  lichess_rapid_rating: number | null;
  lichess_classical_rating: number | null;
};
