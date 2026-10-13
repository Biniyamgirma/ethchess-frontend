"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getCurrentMember,
  linkChessAccounts,
  loginMember,
  logoutMember,
  registerMember,
  updateCurrentMember,
} from "@/lib/api/member";
import {
  getBrilliantMoves,
  submitBrilliantMove,
  voteForBrilliantMove,
} from "@/lib/api/brilliant-moves";
import {
  getMemberVenues,
  getVenueTables,
  joinVenueTable,
  leaveVenueTable,
} from "@/lib/api/member-venues";
import {
  clearMemberSession,
  saveMemberSession,
} from "@/lib/auth/member-storage";

export const memberKeys = {
  profile: ["member", "profile"] as const,
  venues: ["member", "venues"] as const,
  tables: (venueId: number) => ["member", "venues", venueId, "tables"] as const,
  brilliantMoves: ["member", "brilliant-moves"] as const,
};

export function useMemberProfile() {
  return useQuery({ queryKey: memberKeys.profile, queryFn: getCurrentMember });
}

export function useMemberVenues() {
  return useQuery({ queryKey: memberKeys.venues, queryFn: getMemberVenues });
}

export function useVenueTables(venueId: number) {
  return useQuery({
    queryKey: memberKeys.tables(venueId),
    queryFn: () => getVenueTables(venueId),
    enabled: Number.isInteger(venueId) && venueId > 0,
  });
}

export function useBrilliantMoves() {
  return useQuery({
    queryKey: memberKeys.brilliantMoves,
    queryFn: getBrilliantMoves,
  });
}

export function useMemberLogin() {
  return useMutation({
    mutationFn: loginMember,
    onSuccess: (user) => {
      saveMemberSession({ id: user.id, role: "member", name: user.name });
      toast.success(`Welcome back, ${user.name}.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMemberRegistration() {
  return useMutation({
    mutationFn: registerMember,
    onSuccess: () =>
      toast.success("Your next move starts here. Sign in to play."),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurrentMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.profile });
      toast.success("Profile updated. Keep making moves.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLinkChessAccounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkChessAccounts,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.profile });
      toast.success("Chess account linked. Nice move.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useJoinVenueTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinVenueTable,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["member", "venues"] });
      toast.success(result.message || "You're at the board. Make your move.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLeaveVenueTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveVenueTable,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member", "venues"] });
      toast.success("All good. Your table is free again.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSubmitBrilliantMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitBrilliantMove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: memberKeys.brilliantMoves,
      });
      toast.success("Move submitted. Let the community see it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useVoteForBrilliantMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: voteForBrilliantMove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: memberKeys.brilliantMoves,
      });
      toast.success("Vote locked in. Good eye.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMemberLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logoutMember,
    onSettled: async () => {
      clearMemberSession();
      await queryClient.clear();
      router.replace("/member/login");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
