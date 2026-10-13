"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMembers, removeMember, updateMember } from "@/lib/api/members";

export function useMembers() {
  return useQuery({ queryKey: ["members"], queryFn: getMembers });
}

export function useMemberActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: ["members"] });
    toast.success("Member updated.");
  };
  return {
    update: useMutation({
      mutationFn: ({ id, status }: { id: string; status: number }) =>
        updateMember(id, { status }),
      onSuccess,
      onError: (error) => toast.error(error.message),
    }),
    remove: useMutation({
      mutationFn: removeMember,
      onSuccess,
      onError: (error) => toast.error(error.message),
    }),
  };
}
