"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BrilliantMoveCard } from "@/components/brilliant-moves/brilliant-move-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  announceCurrentWeekWinner,
  getAdminThisWeeksBrilliantMoves,
  getAllBrilliantMoves,
  getThisWeeksBrilliantMoves,
  getWeeklyBrilliantMoveWinners,
  setAdminFeaturedBrilliantMove,
  setBrilliantMoveVote,
  type BrilliantMoveSort,
  type PaginatedBrilliantMoves,
} from "@/lib/api/brilliant-moves";
import { getCurrentAdminAccess } from "@/lib/api/admin";
import type { BrilliantMove } from "@/types/member";

const queryKeys = {
  root: ["admin-brilliant-moves"] as const,
  thisWeek: ["admin-brilliant-moves", "this-week"] as const,
  adminThisWeek: ["admin-brilliant-moves", "admin-this-week"] as const,
  all: (page: number, sort: BrilliantMoveSort) =>
    ["admin-brilliant-moves", "all", page, sort] as const,
  winners: ["admin-brilliant-moves", "winners"] as const,
};

type MoveCache = BrilliantMove[] | PaginatedBrilliantMoves;

export default function BrilliantMovesPage() {
  const [tab, setTab] = useState("this-week");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<BrilliantMoveSort>("newest");
  const queryClient = useQueryClient();
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
  });
  const canManageWeeklyMoves = (adminAccess.data?.admin_level ?? 0) > 5;

  const thisWeek = useQuery({
    queryKey: queryKeys.thisWeek,
    queryFn: getThisWeeksBrilliantMoves,
    enabled: tab === "this-week" && !canManageWeeklyMoves,
  });
  const adminThisWeek = useQuery({
    queryKey: queryKeys.adminThisWeek,
    queryFn: getAdminThisWeeksBrilliantMoves,
    enabled: tab === "this-week" && canManageWeeklyMoves,
  });
  const allMoves = useQuery({
    queryKey: queryKeys.all(page, sort),
    queryFn: () => getAllBrilliantMoves({ page, sort }),
    enabled: tab === "all",
  });
  const winners = useQuery({
    queryKey: queryKeys.winners,
    queryFn: getWeeklyBrilliantMoveWinners,
    enabled: tab === "winners",
  });

  const setFeatured = useMutation({
    mutationFn: ({
      id,
      isFeatured,
    }: {
      id: number;
      isFeatured: boolean;
    }) => setAdminFeaturedBrilliantMove(id, isFeatured),
    onSuccess: async (_move, variables) => {
      toast.success(
        variables.isFeatured
          ? "This move is now featured for the week."
          : "The featured move was removed.",
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminThisWeek });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const announceWinner = useMutation({
    mutationFn: announceCurrentWeekWinner,
    onSuccess: async (winner) => {
      toast.success(`Winner announced for the week of ${winner.week_start}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminThisWeek }),
        queryClient.invalidateQueries({ queryKey: queryKeys.winners }),
        queryClient.invalidateQueries({
          queryKey: ["admin-brilliant-moves", "latest-winner"],
        }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const vote = useMutation({
    mutationFn: ({
      id,
      hasVoted,
    }: {
      id: number;
      hasVoted: boolean;
    }) => setBrilliantMoveVote(id, !hasVoted),
    onMutate: async ({ id, hasVoted }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.root });
      const snapshots = queryClient.getQueriesData<MoveCache>({
        queryKey: queryKeys.root,
      });
      for (const [key, cached] of snapshots) {
        if (!cached || key[1] === "winners") continue;
        const updateMove = (move: BrilliantMove) =>
          move.id === id
            ? {
                ...move,
                total_votes: Math.max(0, move.total_votes + (hasVoted ? -1 : 1)),
                vote_count: Math.max(0, move.total_votes + (hasVoted ? -1 : 1)),
                admin_votes: Math.max(0, move.admin_votes + (hasVoted ? -1 : 1)),
                current_user_voted: !hasVoted,
              }
            : move;
        queryClient.setQueryData<MoveCache>(key, (current) => {
          if (Array.isArray(current)) return current.map(updateMove);
          return current
            ? { ...current, items: current.items.map(updateMove) }
            : current;
        });
      }
      return { snapshots };
    },
    onError: (error: Error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error.message);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.thisWeek }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminThisWeek }),
        queryClient.invalidateQueries({ queryKey: ["admin-brilliant-moves", "all"] }),
      ]);
    },
  });

  return (
    <div>
      <PageHeader
        title="Brilliant Move"
        description="Celebrate the best moves shared by the EthChess community."
      />
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value) setTab(value);
        }}
        className="gap-5"
      >
        <TabsList
          aria-label="Brilliant Move submission lists"
          className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-fit"
        >
          <TabsTrigger value="this-week" aria-label="This Week's Submissions">
            This Week&apos;s Submissions
          </TabsTrigger>
          <TabsTrigger value="all" aria-label="All Submissions">
            All Submissions
          </TabsTrigger>
          <TabsTrigger value="winners" aria-label="Weekly Winners">
            Weekly Winners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="this-week">
          <div className="space-y-4">
            {canManageWeeklyMoves ? (
              <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading font-semibold">
                    Weekly winner controls
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Feature one move or announce this week&apos;s winner.
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={
                    announceWinner.isPending ||
                    !adminThisWeek.data?.length ||
                    adminThisWeek.data.some((move) => move.is_winner)
                  }
                  onClick={() => announceWinner.mutate()}
                >
                  {announceWinner.isPending
                    ? "Announcing..."
                    : adminThisWeek.data?.some((move) => move.is_winner)
                      ? "Winner announced"
                      : "Announce winner"}
                </Button>
              </section>
            ) : null}
            <MoveList
              isPending={
                canManageWeeklyMoves
                  ? adminThisWeek.isPending
                  : thisWeek.isPending
              }
              error={
                canManageWeeklyMoves ? adminThisWeek.error : thisWeek.error
              }
              moves={
                canManageWeeklyMoves
                  ? adminThisWeek.data
                  : thisWeek.data
              }
              empty="No moves have been submitted this week yet."
              votePending={vote.isPending}
              onVote={(move) =>
                vote.mutate({ id: move.id, hasVoted: move.current_user_voted })
              }
              onFeature={
                canManageWeeklyMoves
                  ? (move) =>
                      setFeatured.mutate({
                        id: move.id,
                        isFeatured: !move.is_featured,
                      })
                  : undefined
              }
              featurePendingId={
                setFeatured.isPending ? setFeatured.variables?.id ?? null : null
              }
              featureDisabled={
                adminThisWeek.data?.some((move) => move.is_winner) ?? false
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {allMoves.data
                ? `${allMoves.data.total} submissions`
                : "Browse every community submission"}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span>Sort by</span>
              <select
                aria-label="Sort submissions"
                className="h-10 rounded-md border bg-background px-3"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as BrilliantMoveSort);
                  setPage(1);
                }}
              >
                <option value="newest">Newest</option>
                <option value="most_votes">Most votes</option>
              </select>
            </label>
          </div>
          <MoveList
            isPending={allMoves.isPending}
            error={allMoves.error}
            moves={allMoves.data?.items}
            empty="No moves have been submitted yet."
            votePending={vote.isPending}
            onVote={(move) =>
              vote.mutate({ id: move.id, hasVoted: move.current_user_voted })
            }
          />
          {allMoves.data && allMoves.data.total_pages > 1 ? (
            <nav
              aria-label="All submissions pages"
              className="flex items-center justify-between gap-3"
            >
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span aria-live="polite" className="text-sm text-muted-foreground">
                Page {allMoves.data.page} of {allMoves.data.total_pages}
              </span>
              <Button
                variant="outline"
                disabled={page >= allMoves.data.total_pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </TabsContent>

        <TabsContent value="winners">
          <MoveList
            isPending={winners.isPending}
            error={winners.error}
            moves={winners.data}
            empty="Weekly winners will appear here after a week is finalized."
            votePending={vote.isPending}
            onVote={(move) =>
              vote.mutate({ id: move.id, hasVoted: move.current_user_voted })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MoveList({
  isPending,
  error,
  moves,
  empty,
  votePending,
  onVote,
  onFeature,
  featurePendingId = null,
  featureDisabled = false,
}: {
  isPending: boolean;
  error: Error | null;
  moves: BrilliantMove[] | undefined;
  empty: string;
  votePending: boolean;
  onVote: (move: BrilliantMove) => void;
  onFeature?: (move: BrilliantMove) => void;
  featurePendingId?: number | null;
  featureDisabled?: boolean;
}) {
  if (isPending) {
    return (
      <div className="grid gap-3" aria-label="Loading moves">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-destructive/40 p-5 text-sm">
        Could not load moves: {error.message}
      </p>
    );
  }
  if (!moves?.length) {
    return (
      <p className="rounded-xl border p-5 text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }
  return (
    <div className="grid gap-3">
      {moves.map((move) => (
        <div key={`${move.id}-${move.week_start ?? "move"}`} className="space-y-2">
          <BrilliantMoveCard
            move={move}
            isPending={votePending}
            onVote={() => onVote(move)}
          />
          {onFeature ? (
            <Button
              type="button"
              variant={move.is_featured ? "secondary" : "outline"}
              disabled={
                featureDisabled ||
                (featurePendingId !== null && featurePendingId !== undefined)
              }
              onClick={() => onFeature(move)}
            >
              {featurePendingId === move.id
                ? "Saving..."
                : move.is_featured
                  ? "Remove this week's brilliant move"
                  : "Make this week's brilliant move"}
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
