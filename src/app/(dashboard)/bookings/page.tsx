"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CircleDot,
  Flag,
  MapPin,
  Table2,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentAdminAccess } from "@/lib/api/admin";
import {
  adminCancelMatch,
  adminEndMatch,
  getCurrentMatches,
} from "@/lib/api/bookings";
import type { CurrentMatch } from "@/types/api";

type MatchAction = { match: CurrentMatch; action: "end" | "cancel" } | null;

export default function BookingsPage() {
  const [matchAction, setMatchAction] = useState<MatchAction>(null);
  const [loserId, setLoserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
  });
  const canManageMatches = (adminAccess.data?.admin_level ?? 0) > 3;
  const matches = useQuery({
    queryKey: ["current-matches"],
    queryFn: getCurrentMatches,
    enabled: canManageMatches,
    refetchInterval: 15_000,
  });

  const finishAction = () => {
    setMatchAction(null);
    setLoserId(null);
    void queryClient.invalidateQueries({ queryKey: ["current-matches"] });
  };

  const endMatch = useMutation({
    mutationFn: ({ id, loserUserId }: { id: number; loserUserId: string }) =>
      adminEndMatch(id, loserUserId),
    onSuccess: () => {
      toast.success("Match ended and result recorded.");
      finishAction();
    },
    onError: (error) => toast.error(error.message),
  });

  const cancelMatch = useMutation({
    mutationFn: adminCancelMatch,
    onSuccess: () => {
      toast.success("Match canceled.");
      finishAction();
    },
    onError: (error) => toast.error(error.message),
  });

  if (adminAccess.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (adminAccess.isError) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/40 p-5 text-sm"
      >
        Could not verify match-management permissions:{" "}
        {adminAccess.error.message}
      </p>
    );
  }

  if (!canManageMatches) {
    return (
      <div>
        <PageHeader
          title="Current matches"
          description="See games currently being played across the club."
        />
        <p role="alert" className="rounded-xl border p-5 text-sm">
          Current matches and match controls are available to administrators
          with a role level above 3.
        </p>
      </div>
    );
  }

  const activeMatch = matchAction?.match;

  return (
    <div>
      <PageHeader
        title="Current matches"
        description="See who is playing, where the match is happening, and manage ongoing games."
      />

      {matches.isPending ? (
        <div className="grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : matches.isError ? (
        <p
          role="alert"
          className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm"
        >
          Could not load current matches: {matches.error.message}
        </p>
      ) : matches.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CalendarClock className="size-6" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-bold">
            No matches in progress
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ongoing games will appear here as soon as players start a match.
          </p>
        </div>
      ) : (
        <section className="space-y-4" aria-label="Ongoing matches">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleDot className="size-4 text-primary" />
            {matches.data.length}{" "}
            {matches.data.length === 1 ? "match" : "matches"} currently in
            progress
          </div>
          <div className="grid gap-4">
            {matches.data.map((match) => (
              <article
                key={match.id}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
                  <div>
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Match #{match.id}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarClock className="size-4" />
                      {match.started_at
                        ? `Started ${new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(match.started_at))}`
                        : "Start time unavailable"}
                    </p>
                  </div>
                  <StatusBadge tone="success">
                    {match.status === "awaiting_loser_confirmation"
                      ? "Awaiting result confirmation"
                      : "In progress"}
                  </StatusBadge>
                </div>

                <div className="grid gap-5 px-5 py-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <PlayerPanel
                    color="White"
                    name={match.white_player?.name ?? "Player unavailable"}
                  />
                  <span className="justify-self-center rounded-full bg-muted px-3 py-1 font-heading text-xs font-bold tracking-widest text-muted-foreground">
                    VS
                  </span>
                  <PlayerPanel
                    color="Black"
                    name={match.black_player?.name ?? "Player unavailable"}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      {match.venue_name}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Table2 className="size-4 text-primary" />
                      {match.table_name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMatchAction({ match, action: "cancel" });
                        setLoserId(null);
                      }}
                    >
                      <XCircle /> Cancel match
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMatchAction({ match, action: "end" });
                        setLoserId(null);
                      }}
                    >
                      <Flag /> End match
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            This list refreshes automatically every 15 seconds.
          </p>
        </section>
      )}

      <Dialog
        open={matchAction !== null}
        onOpenChange={(open) => {
          if (!open && !endMatch.isPending && !cancelMatch.isPending) {
            setMatchAction(null);
            setLoserId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Match #{activeMatch?.id}
            </p>
            <DialogTitle>
              {matchAction?.action === "end"
                ? "Record match result"
                : "Cancel this match?"}
            </DialogTitle>
            <DialogDescription>
              {matchAction?.action === "end"
                ? "Choose the player who lost. The other player will be recorded as the winner."
                : "This will cancel the ongoing match and release its table without recording a winner."}
            </DialogDescription>
          </DialogHeader>

          {matchAction?.action === "end" && activeMatch ? (
            <div className="space-y-2">
              {[activeMatch.white_player, activeMatch.black_player]
                .filter(
                  (player): player is NonNullable<typeof player> =>
                    player !== null,
                )
                .map((player, index) => (
                  <button
                    key={player.id}
                    type="button"
                    aria-pressed={loserId === player.id}
                    onClick={() => setLoserId(player.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                      loserId === player.id
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>
                      <span className="block text-xs text-muted-foreground">
                        {index === 0 ? "White" : "Black"} pieces
                      </span>
                      <span className="mt-1 block font-medium">
                        {player.name}
                      </span>
                    </span>
                    {loserId === player.id ? (
                      <Trophy className="size-5 text-primary" />
                    ) : null}
                  </button>
                ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={endMatch.isPending || cancelMatch.isPending}
              onClick={() => setMatchAction(null)}
            >
              Keep match
            </Button>
            {matchAction?.action === "cancel" && activeMatch ? (
              <Button
                variant="destructive"
                disabled={cancelMatch.isPending}
                onClick={() => cancelMatch.mutate(activeMatch.id)}
              >
                {cancelMatch.isPending
                  ? "Canceling..."
                  : "Confirm cancellation"}
              </Button>
            ) : matchAction?.action === "end" && activeMatch ? (
              <Button
                disabled={!loserId || endMatch.isPending}
                onClick={() => {
                  if (loserId) {
                    endMatch.mutate({
                      id: activeMatch.id,
                      loserUserId: loserId,
                    });
                  }
                }}
              >
                {endMatch.isPending ? "Recording..." : "Record result"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlayerPanel({
  color,
  name,
}: {
  color: "White" | "Black";
  name: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl border font-heading text-sm font-bold ${
          color === "White"
            ? "bg-[#FFFCF1] text-[#080808]"
            : "bg-[#080808] text-[#FFFCF1]"
        }`}
        aria-hidden="true"
      >
        {color === "White" ? "W" : "B"}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{color} player</p>
        <p className="truncate font-heading font-semibold">{name}</p>
      </div>
    </div>
  );
}
