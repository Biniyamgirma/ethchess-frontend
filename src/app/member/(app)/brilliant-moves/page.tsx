"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowUpRight, ExternalLink, MoveUpRight, Trophy } from "lucide-react";
import { MemberHero } from "@/components/layout/member-shell";
import {
  MemberEmpty,
  MemberError,
  MemberLoading,
} from "@/components/shared/member-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useBrilliantMoves,
  useSubmitBrilliantMove,
  useVoteForBrilliantMove,
} from "@/hooks/use-member-data";
import { useMemberSession } from "@/hooks/use-member-session";

const moveSchema = z.object({
  move_url: z.string().trim().url("Add a valid link to your move."),
});
type MoveValues = z.infer<typeof moveSchema>;

export default function BrilliantMovesPage() {
  const moves = useBrilliantMoves();
  const submit = useSubmitBrilliantMove();
  const vote = useVoteForBrilliantMove();
  const session = useMemberSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MoveValues>({ resolver: zodResolver(moveSchema) });

  function submitMove(values: MoveValues) {
    submit.mutate(values, { onSuccess: () => reset() });
  }

  return (
    <>
      <MemberHero
        eyebrow="The community board"
        title="Show us that move."
        description="Drop a link to your brilliant move, cheer on another player, and keep the community inspired."
      />
      <Card className="mb-8 shadow-none">
        <CardContent className="p-5 sm:p-7">
          <h2 className="font-heading text-lg font-bold">Share a move</h2>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit(submitMove)}
          >
            <div className="flex-1">
              <Input
                type="url"
                className="h-12"
                placeholder="Paste your Chess.com or Lichess game link"
                aria-label="Link to your chess move"
                aria-invalid={Boolean(errors.move_url)}
                {...register("move_url")}
              />
              {errors.move_url ? (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {errors.move_url.message}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="min-h-12"
              disabled={submit.isPending}
            >
              {submit.isPending ? "Sharing..." : "Share your move"}{" "}
              <ArrowUpRight />
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#E2725B]">
            All eyes on the board
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold">
            Moves from the crew
          </h2>
        </div>
        {moves.isLoading ? (
          <MemberLoading label="Loading the community moves..." />
        ) : null}
        {moves.isError ? <MemberError message={moves.error.message} /> : null}
        {moves.data?.length === 0 ? (
          <MemberEmpty
            title="Nothing here yet. Go make some moves."
            description="Be the first to share a link with the community."
          />
        ) : null}
        {moves.data && moves.data.length > 0 ? (
          <div className="grid gap-3">
            {moves.data.map((move) => {
              const isOwnMove = move.user_id === session?.id;
              const hasVoted = move.current_user_voted;
              const url = safeHttpUrl(move.move_url);
              return (
                <Card key={move.id} className="shadow-none">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2725B]/10 text-[#E2725B]">
                        <Trophy className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold">
                          {move.platform || "Community move"}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {move.total_votes} total{" "}
                          {move.total_votes === 1 ? "vote" : "votes"} ·{" "}
                          {move.admin_votes} Admin votes
                          {move.week_number
                            ? ` · Week ${move.week_number}`
                            : ""}
                        </p>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open the game{" "}
                            <ExternalLink className="size-3.5 shrink-0" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      variant={hasVoted || isOwnMove ? "secondary" : "outline"}
                      className="min-h-11 shrink-0"
                      disabled={
                        isOwnMove ||
                        vote.isPending
                      }
                      aria-label={
                        isOwnMove
                          ? "You cannot vote on your own move"
                          : hasVoted
                            ? `Remove your vote from ${move.platform || "this move"}`
                            : `Vote for ${move.platform || "this move"}`
                      }
                      aria-pressed={hasVoted}
                      onClick={() =>
                        vote.mutate({ id: move.id, hasVoted })
                      }
                    >
                      <MoveUpRight />
                      {isOwnMove
                        ? "Your move"
                        : hasVoted
                          ? "Remove vote"
                          : "Vote"}
                    </Button>
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
