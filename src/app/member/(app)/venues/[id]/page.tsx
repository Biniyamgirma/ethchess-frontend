"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import { MemberHero } from "@/components/layout/member-shell";
import {
  MemberEmpty,
  MemberError,
  MemberLoading,
} from "@/components/shared/member-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useJoinVenueTable,
  useLeaveVenueTable,
  useMemberVenues,
  useVenueTables,
} from "@/hooks/use-member-data";
import { useMemberSession } from "@/hooks/use-member-session";

export default function MemberVenueDetailPage() {
  const params = useParams<{ id: string }>();
  const venueId = Number(params.id);
  const venues = useMemberVenues();
  const venue = venues.data?.find((item) => item.id === venueId);
  const tables = useVenueTables(venueId);
  const join = useJoinVenueTable();
  const leave = useLeaveVenueTable();
  const session = useMemberSession();

  if (!Number.isInteger(venueId) || venueId <= 0) {
    return (
      <MemberEmpty
        title="Plot twist: that page doesn't exist."
        description="Let's get you back to the places where the next game could happen."
        href="/member/venues"
        action="Browse venues"
      />
    );
  }

  if (venues.isError) return <MemberError message={venues.error.message} />;
  if (venues.isLoading) return <MemberLoading label="Finding this venue..." />;
  if (!venue) {
    return (
      <MemberEmpty
        title="Plot twist: that page doesn't exist."
        description="This venue isn't available right now. Check out the other places to play."
        href="/member/venues"
        action="Browse venues"
      />
    );
  }

  const address = venue.address?.trim();
  const mapUrl =
    safeHttpUrl(venue.google_map_link) ||
    `https://maps.google.com/?q=${encodeURIComponent(address || venue.name || "EthChess venue")}`;

  return (
    <>
      <Link
        href="/member/venues"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-heading text-sm font-bold text-primary"
      >
        <ArrowUpRight className="size-4 rotate-[-135deg]" />
        All venues
      </Link>
      <MemberHero
        eyebrow="Meet at the board"
        title={venue.name || "Chess venue"}
        description={address || "The venue hasn't added an address yet."}
        action={
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-4 font-heading text-sm font-bold transition-colors hover:bg-white/10"
          >
            Get directions <ExternalLink className="size-4" />
          </a>
        }
      />
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Pull up a chair
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold">
              Tables at this venue
            </h2>
          </div>
          <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
            <MapPin className="size-3" />
            Live availability
          </Badge>
        </div>
        {tables.isLoading ? (
          <MemberLoading label="Checking the tables..." />
        ) : null}
        {tables.isError ? <MemberError message={tables.error.message} /> : null}
        {tables.data?.length === 0 ? (
          <MemberEmpty
            title="No tables are listed here yet."
            description="Try another venue, or check back later."
            href="/member/venues"
            action="Explore venues"
          />
        ) : null}
        {tables.data && tables.data.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {tables.data.map((table) => {
              const isWaiting = table.ideal_player === session?.id;
              const isPending =
                (join.isPending && join.variables === table.id) ||
                (leave.isPending && leave.variables === table.id);
              return (
                <Card key={table.id} className="shadow-none">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-heading text-base font-bold">
                        {table.name || `Table ${table.id}`}
                      </h3>
                      <Badge
                        variant={table.is_available ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {isWaiting
                          ? "You're up next"
                          : table.is_available
                            ? "Open for a game"
                            : "Match in progress"}
                      </Badge>
                    </div>
                    {!session ? (
                      <Button
                        variant="outline"
                        className="min-h-11"
                        render={
                          <Link
                            href={`/member/login?next=${encodeURIComponent(`/member/venues/${venue.id}`)}`}
                          />
                        }
                      >
                        Sign in to join
                      </Button>
                    ) : isWaiting ? (
                      <Button
                        variant="outline"
                        className="min-h-11"
                        disabled={isPending}
                        onClick={() => leave.mutate(table.id)}
                      >
                        {isPending ? "Leaving..." : "Leave the queue"}
                      </Button>
                    ) : (
                      <Button
                        className="min-h-11"
                        disabled={!table.is_available || isPending}
                        onClick={() => join.mutate(table.id)}
                      >
                        {isPending
                          ? "Joining..."
                          : table.is_available
                            ? "Join this table"
                            : "In a game"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
    </>
  );
}

function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}
