import { apiClient } from "@/lib/api/client";
import type { ApiResponse, BrilliantMove } from "@/types/member";

export type BrilliantMoveSort = "newest" | "most_votes";

export interface BrilliantMoveSubmissionStatus {
  submissions_open: boolean;
  timezone: string;
  reopen_at: string | null;
  message: string | null;
}

export interface PaginatedBrilliantMoves {
  items: BrilliantMove[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  sort: BrilliantMoveSort;
}

export async function getThisWeeksBrilliantMoves() {
  const response = await apiClient.get<ApiResponse<BrilliantMove[]>>(
    "/api/brilliant-moves/this-week",
  );
  return response.data.data;
}

export async function getBrilliantMoveSubmissionStatus() {
  const response = await apiClient.get<ApiResponse<BrilliantMoveSubmissionStatus>>(
    "/api/brilliant-moves/status",
  );
  return response.data.data;
}

export async function getAllBrilliantMoves(input: {
  page: number;
  sort: BrilliantMoveSort;
}) {
  const response = await apiClient.get<ApiResponse<PaginatedBrilliantMoves>>(
    "/api/brilliant-moves/all",
    { params: { page: input.page, sort: input.sort, page_size: 12 } },
  );
  return response.data.data;
}

export async function getWeeklyBrilliantMoveWinners() {
  const response = await apiClient.get<ApiResponse<BrilliantMove[]>>(
    "/api/brilliant-moves/winners",
  );
  return response.data.data;
}

export async function getLatestBrilliantMoveWinner() {
  const response = await apiClient.get<ApiResponse<BrilliantMove | null>>(
    "/api/brilliant-moves/latest-winner",
  );
  return response.data.data;
}

export async function getAdminThisWeeksBrilliantMoves() {
  const response = await apiClient.get<ApiResponse<BrilliantMove[]>>(
    "/api/brilliant-moves/admin/this-week",
  );
  return response.data.data;
}

export async function setAdminFeaturedBrilliantMove(
  id: number,
  isFeatured: boolean,
) {
  const response = await apiClient.patch<ApiResponse<BrilliantMove>>(
    `/api/brilliant-moves/admin/${id}/featured`,
    { is_featured: isFeatured },
  );
  return response.data.data;
}

export async function selectAdminWeeklyWinner(id: number) {
  const response = await apiClient.post<ApiResponse<BrilliantMove>>(
    `/api/brilliant-moves/admin/${id}/select-winner`,
  );
  return response.data.data;
}

export async function announceCurrentWeekWinner() {
  const response = await apiClient.post<ApiResponse<BrilliantMove>>(
    "/api/brilliant-moves/admin/announce-winner",
    {},
  );
  return response.data.data;
}

export async function getBrilliantMoves() {
  const response = await apiClient.get<ApiResponse<BrilliantMove[]>>(
    "/api/brilliant-moves",
  );
  return response.data.data;
}

export async function submitBrilliantMove(input: { move_url: string }) {
  const response = await apiClient.post<ApiResponse<BrilliantMove>>(
    "/api/brilliant-moves/submit",
    input,
  );
  return response.data.data;
}

export async function setBrilliantMoveVote(id: number, shouldVote: boolean) {
  const response = await (shouldVote
    ? apiClient.post<ApiResponse<unknown>>(`/api/brilliant-moves/${id}/vote`)
    : apiClient.delete<ApiResponse<unknown>>(`/api/brilliant-moves/${id}/vote`));
  return response.data.data;
}

export async function voteForBrilliantMove(id: number, hasVoted: boolean) {
  return setBrilliantMoveVote(id, !hasVoted);
}
