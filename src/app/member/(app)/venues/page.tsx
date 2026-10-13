"use client";

import { MapPin } from "lucide-react";
import { MemberHero } from "@/components/layout/member-shell";
import { VenueCard } from "@/components/member/venue-card";
import {
  MemberEmpty,
  MemberError,
  MemberLoading,
} from "@/components/shared/member-states";
import { useMemberVenues } from "@/hooks/use-member-data";

export default function MemberVenuesPage() {
  const venues = useMemberVenues();

  return (
    <>
      <MemberHero
        eyebrow="Find your people"
        title="The next game is out there."
        description="Explore active EthChess venues and see what tables are ready for a player."
      />
      {venues.isLoading ? (
        <MemberLoading label="Finding the places to play..." />
      ) : null}
      {venues.isError ? <MemberError message={venues.error.message} /> : null}
      {venues.data?.length === 0 ? (
        <MemberEmpty
          title="Nothing here yet. Go make some moves."
          description="No venues are showing right now. Check back soon for a spot to play."
        />
      ) : null}
      {venues.data && venues.data.length > 0 ? (
        <section
          aria-label="Active venues"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {venues.data.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </section>
      ) : null}
      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-4" />
        Venue information comes from EthChess. Confirm directions with the venue
        before you head out.
      </p>
    </>
  );
}
