"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVenue, getVenues, updateVenue } from "@/lib/api/venues";

export function useVenues() {
  return useQuery({ queryKey: ["venues"], queryFn: getVenues });
}

export function useVenueActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: ["venues"] });
  return {
    create: useMutation({
      mutationFn: createVenue,
      onSuccess: () => {
        refresh();
        toast.success("Venue added.");
      },
      onError: (error) => toast.error(error.message),
    }),
    update: useMutation({
      mutationFn: ({ id, status }: { id: number; status: number }) =>
        updateVenue(id, { status }),
      onSuccess: () => {
        refresh();
        toast.success("Venue updated.");
      },
      onError: (error) => toast.error(error.message),
    }),
  };
}
