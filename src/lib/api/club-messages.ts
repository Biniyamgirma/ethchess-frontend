import { apiClient } from "@/lib/api/client";
import type { ApiResponse, ClubMessageBroadcast } from "@/types/api";

export async function getClubMessageRecipientCount() {
  const response = await apiClient.get<
    ApiResponse<{ recipient_count: number }>
  >("/api/club-messages/recipient-count");
  return response.data.data.recipient_count;
}

export async function getClubMessageBroadcasts() {
  const response = await apiClient.get<ApiResponse<ClubMessageBroadcast[]>>(
    "/api/club-messages",
  );
  return response.data.data;
}

export async function broadcastClubMessage(content: string) {
  const response = await apiClient.post<
    ApiResponse<{
      id: number;
      status: string;
      recipient_count: number;
    }>
  >("/api/club-messages/broadcast", { content });
  return response.data.data;
}
