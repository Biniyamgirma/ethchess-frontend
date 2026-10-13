"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, MoveRight, Trophy } from "lucide-react";
import { MemberHero } from "@/components/layout/member-shell";
import { VenueCard } from "@/components/member/venue-card";
import {
  MemberEmpty,
  MemberError,
  MemberLoading,
} from "@/components/shared/member-states";
import { Button } from "@/components/ui/button";
import {
  useBrilliantMoves,
  useMemberProfile,
  useMemberVenues,
} from "@/hooks/use-member-data";

export default function MemberHomePage() {
  const profile = useMemberProfile();
  const venues = useMemberVenues();
  const moves = useBrilliantMoves();
  const name = profile.data?.f_name || "friend";

  return (
    <>
      <MemberHero
        eyebrow="PLAY. ENJOY. REPEAT."
        title={`Your move, ${name}.`}
        description="The board is open, the community is here. Find a place to play and make today a good game."
        action={
          <Button
            size="lg"
            className="h-12"
            render={<Link href="/member/venues" />}
          >
            Find a board <ArrowUpRight />
          </Button>
        }
      />

      {profile.isError ? <MemberError message={profile.error.message} /> : null}

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Get out there
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold">
              Find your next board
            </h2>
          </div>
          <Link
            href="/member/venues"
            className="inline-flex min-h-11 items-center gap-1 font-heading text-sm font-bold text-primary"
          >
            All venues <MoveRight className="size-4" />
          </Link>
        </div>
        {venues.isLoading ? (
          <MemberLoading label="Finding places to play..." />
        ) : null}
        {venues.isError ? <MemberError message={venues.error.message} /> : null}
        {venues.data?.length === 0 ? (
          <MemberEmpty
            title="No venues are showing right now."
            description="Check back soon. The next great game could be around the corner."
          />
        ) : null}
        {venues.data && venues.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.data.slice(0, 3).map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#E2725B]">
                The community board
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                Got a brilliant move?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Share it with the crew, check out what others are playing, and
                drop a vote.
              </p>
            </div>
            <Trophy className="size-7 shrink-0 text-[#E2725B]" />
          </div>
          {moves.isLoading ? (
            <MemberLoading label="Checking the community board..." />
          ) : null}
          {moves.isError ? <MemberError message={moves.error.message} /> : null}
          {moves.data ? (
            <p className="mt-5 font-heading text-sm font-semibold">
              {moves.data.length} {moves.data.length === 1 ? "move" : "moves"}{" "}
              shared
              <span className="ml-1 font-sans font-normal text-muted-foreground">
                by the community
              </span>
            </p>
          ) : null}
          <Button
            variant="outline"
            className="mt-5 min-h-11"
            render={<Link href="/member/brilliant-moves" />}
          >
            See brilliant moves <ArrowUpRight />
          </Button>
        </div>

        <div className="flex flex-col justify-between rounded-3xl bg-primary p-6 text-white sm:p-8">
          <div>
            <MapPin className="size-7" />
            <h2 className="mt-5 font-heading text-2xl font-bold">
              A game is better together.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/85">
              Find active venues and see which tables are ready for a player.
            </p>
          </div>
          <Link
            href="/member/venues"
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-heading text-sm font-bold"
          >
            See available tables <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
