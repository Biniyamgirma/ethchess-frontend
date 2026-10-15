"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createVenueOwner,
  getVenueOwners,
  setVenueOwnerBlocked,
  updateVenueOwner,
  type UpdateVenueOwnerInput,
} from "@/lib/api/venue-owners";

export function useVenueOwners(enabled = true) {
  return useQuery({
    queryKey: ["venue-owners"],
    queryFn: getVenueOwners,
    enabled,
  });
}

export function useVenueOwnerActions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["venue-owners"] });
  };
  const create = useMutation({
    mutationFn: createVenueOwner,
    onSuccess: () => {
      refresh();
      toast.success("Venue owner added.");
    },
    onError: (error) => toast.error(error.message),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateVenueOwnerInput }) =>
      updateVenueOwner(id, input),
    onSuccess: () => {
      refresh();
      toast.success("Venue owner updated.");
    },
    onError: (error) => toast.error(error.message),
  });
  const setBlocked = useMutation({
    mutationFn: ({ id, isBlocked }: { id: number; isBlocked: boolean }) =>
      setVenueOwnerBlocked(id, isBlocked),
    onSuccess: (_owner, variables) => {
      refresh();
      toast.success(
        variables.isBlocked ? "Venue owner blocked." : "Venue owner unblocked.",
      );
    },
    onError: (error) => toast.error(error.message),
  });

  return { create, update, setBlocked };
}
