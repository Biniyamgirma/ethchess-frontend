"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveOfficialMember,
  getMembers,
  removeMember,
  setMemberBlocked,
} from "@/lib/api/members";

export function useMembers() {
  return useQuery({ queryKey: ["members"], queryFn: getMembers });
}

export function useMemberActions() {
  const queryClient = useQueryClient();
  const refreshMembers = () => {
    void queryClient.invalidateQueries({ queryKey: ["members"] });
  };
  return {
    block: useMutation({
      mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
        setMemberBlocked(id, isBlocked),
      onSuccess: (_member, { isBlocked }) => {
        refreshMembers();
        toast.success(isBlocked ? "Member blocked." : "Member unblocked.");
      },
      onError: (error) => toast.error(error.message),
    }),
    approveOfficial: useMutation({
      mutationFn: approveOfficialMember,
      onSuccess: () => {
        refreshMembers();
        toast.success("Member approved as an official member.");
      },
      onError: (error) => toast.error(error.message),
    }),
    remove: useMutation({
      mutationFn: removeMember,
      onSuccess: () => {
        refreshMembers();
        toast.success("Member deleted.");
      },
      onError: (error) => toast.error(error.message),
    }),
  };
}
