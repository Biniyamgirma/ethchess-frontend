"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVenueOwner, getVenueOwners } from "@/lib/api/venue-owners";

export function useVenueOwners() {
  return useQuery({ queryKey: ["venue-owners"], queryFn: getVenueOwners });
}

export function useVenueOwnerActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVenueOwner,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["venue-owners"] });
      toast.success("Venue owner added.");
    },
    onError: (error) => toast.error(error.message),
  });
}
