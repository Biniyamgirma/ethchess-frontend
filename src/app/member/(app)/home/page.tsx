"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  MoveRight,
  Swords,
  Table2,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { MemberHero } from "@/components/layout/member-shell";
import { VenueCard } from "@/components/member/venue-card";
import {
  MemberEmpty,
  MemberError,
  MemberLoading,
} from "@/components/shared/member-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBrilliantMoves,
  useCancelMemberMatch,
  useLeaveVenueTable,
  useMemberProfile,
  useMemberVenues,
  useMemberActivity,
  useRequestMemberMatchEnd,
} from "@/hooks/use-member-data";

export default function MemberHomePage() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [endMatchDialogOpen, setEndMatchDialogOpen] = useState(false);
  const profile = useMemberProfile();
  const venues = useMemberVenues();
  const moves = useBrilliantMoves();
  const activity = useMemberActivity();
  const leaveTable = useLeaveVenueTable();
  const cancelMatch = useCancelMemberMatch();
  const endMatch = useRequestMemberMatchEnd();
  const name = profile.data?.f_name || "friend";
  const joinedTable =
    activity.data?.type === "waiting_table" ? activity.data : null;
  const activeMatch =
    activity.data?.type === "active_match" ? activity.data : null;

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

      {activity.isError ? (
        <MemberError message={activity.error.message} />
      ) : null}
      {activeMatch ? (
        <section
          aria-label="Your active match"
          className="mb-8 rounded-3xl border border-[#E2725B]/30 bg-[#E2725B]/5 p-5 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#E2725B]">
                <Swords className="size-4" /> Match in progress
              </p>
              <h2 className="mt-2 font-heading text-xl font-bold">
                {activeMatch.white_player?.name ?? "Player"} vs{" "}
                {activeMatch.black_player?.name ?? "Player"}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {activeMatch.venue_name || "Venue"}
                {activeMatch.table_name ? ` · ${activeMatch.table_name}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Started{" "}
                {activeMatch.started_at
                  ? new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(activeMatch.started_at))
                  : "recently"}
              </p>
              {activeMatch.status === "awaiting_loser_confirmation" ? (
                <p className="mt-2 text-sm font-medium text-[#E2725B]">
                  Waiting for{" "}
                  {activeMatch.pending_loser_name ?? "the selected player"} to
                  confirm the loss in Telegram.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeMatch.status !== "awaiting_loser_confirmation" ? (
                <Button
                  className="min-h-11"
                  disabled={endMatch.isPending}
                  onClick={() => setEndMatchDialogOpen(true)}
                >
                  <Swords />
                  End match
                </Button>
              ) : null}
              <Button
                variant="destructive"
                className="min-h-11"
                disabled={cancelMatch.isPending}
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle />
                Cancel match
              </Button>
            </div>
          </div>
        </section>
      ) : null}
      {joinedTable ? (
        <section
          aria-label="Your joined table"
          className="mb-8 rounded-3xl border border-primary/25 bg-primary/5 p-5 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-primary">
                You joined this table
              </p>
              <h2 className="mt-2 font-heading text-xl font-bold">
                {joinedTable.table_name || `Table ${joinedTable.table_id}`}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {joinedTable.venue_name || "Venue"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                render={
                  <Link href={`/member/venues/${joinedTable.venue_id}`} />
                }
              >
                <Table2 /> View table
              </Button>
              <Button
                variant="destructive"
                className="min-h-11"
                disabled={leaveTable.isPending}
                onClick={() => leaveTable.mutate(joinedTable.table_id)}
              >
                {leaveTable.isPending ? "Leaving..." : "Leave this table"}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <Dialog open={endMatchDialogOpen} onOpenChange={setEndMatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who lost the match?</DialogTitle>
            <DialogDescription>
              Choose the player who lost. If you select yourself, the result is
              recorded now. If you select your opponent, they must confirm the
              result using the Telegram notification.
            </DialogDescription>
          </DialogHeader>
          {activeMatch ? (
            <div className="grid gap-2">
              {[activeMatch.white_player, activeMatch.black_player].map(
                (player) =>
                  player ? (
                    <Button
                      key={player.id}
                      variant="outline"
                      className="min-h-12 justify-start"
                      disabled={endMatch.isPending}
                      onClick={() => {
                        endMatch.mutate(
                          {
                            matchId: activeMatch.match_id,
                            loserUserId: player.id,
                          },
                          {
                            onSuccess: () => setEndMatchDialogOpen(false),
                          },
                        );
                      }}
                    >
                      {player.name}
                      {player.id === profile.data?.id ? " (You)" : ""}
                    </Button>
                  ) : null,
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={endMatch.isPending}
              onClick={() => setEndMatchDialogOpen(false)}
            >
              Keep playing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this match?</DialogTitle>
            <DialogDescription>
              This will end the current match without recording a winner and
              free the table so other members can play.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={cancelMatch.isPending}
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep playing
            </Button>
            <Button
              variant="destructive"
              disabled={!activeMatch || cancelMatch.isPending}
              onClick={() => {
                if (!activeMatch) return;
                cancelMatch.mutate(activeMatch.match_id, {
                  onSuccess: () => setCancelDialogOpen(false),
                });
              }}
            >
              {cancelMatch.isPending ? "Canceling..." : "Cancel match"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
