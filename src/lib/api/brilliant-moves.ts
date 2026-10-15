import { apiClient } from "@/lib/api/client";
import type { ApiResponse, BrilliantMove } from "@/types/member";

export type BrilliantMoveSort = "newest" | "most_votes";

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
