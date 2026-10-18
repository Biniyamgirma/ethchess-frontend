"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVenue, getVenues, updateVenue } from "@/lib/api/venues";
import type { Venue } from "@/types/api";

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
      mutationFn: ({ id, input }: { id: number; input: Partial<Venue> }) =>
        updateVenue(id, input),
      onSuccess: (_venue, variables) => {
        refresh();
        toast.success(
          typeof variables.input.status === "number"
            ? variables.input.status === 1
              ? "Venue activated."
              : "Venue deactivated."
            : "Venue updated.",
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  };
}
