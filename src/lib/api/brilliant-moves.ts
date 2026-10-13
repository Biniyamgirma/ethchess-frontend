import { apiClient } from "@/lib/api/client";
import type { ApiResponse, BrilliantMove } from "@/types/member";

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

export async function voteForBrilliantMove(id: number) {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/api/brilliant-moves/${id}/vote`,
    { vote_type: "upvote" },
  );
  return response.data.data;
}
