"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink, ImageOff, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BrilliantMove } from "@/types/member";

export function BrilliantMoveCard({
  move,
  isPending,
  onVote,
}: {
  move: BrilliantMove;
  isPending: boolean;
  onVote: () => void;
}) {
  const gameUrl = safeHttpUrl(move.move_url);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const isRemoved = move.is_deleted === 1;
  const disabled = move.is_own || isRemoved || isPending;

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-5">
        {gameUrl && !previewFailed ? (
          <a
            href={gameUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block aspect-video max-h-[28rem] min-h-44 overflow-hidden rounded-xl border bg-muted"
            aria-label={`Open ${move.platform || "brilliant move"} game`}
          >
            {!previewLoaded ? (
              <Skeleton className="absolute inset-0 z-10 h-full min-h-44 w-full rounded-none" />
            ) : null}
            <Image
              src={`/api/brilliant-moves/${move.id}/preview`}
              alt={`${move.platform || "Brilliant move"} preview`}
              fill
              unoptimized
              loading="lazy"
              referrerPolicy="no-referrer"
              sizes="(max-width: 768px) 100vw, 768px"
              onLoad={() => setPreviewLoaded(true)}
              onError={() => setPreviewFailed(true)}
              className={`max-h-[28rem] min-h-44 w-full object-contain transition-opacity ${
                previewLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {previewLoaded ? (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                Open game <ExternalLink className="size-3" />
              </span>
            ) : null}
          </a>
        ) : gameUrl ? (
          <div className="flex min-h-16 items-center gap-3 rounded-xl border border-dashed bg-muted/40 px-4 text-sm text-muted-foreground">
            <ImageOff className="size-4 shrink-0" />
            Preview image unavailable
          </div>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-bold">
                {move.platform || "Community move"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted{" "}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(move.createdAt))}
              </p>
              <p className="mt-2 text-sm font-medium">
                <span>{move.total_votes} total votes</span>
                <span className="mx-2 text-muted-foreground" aria-hidden="true">
                  ·
                </span>
                <span>{move.admin_votes} Admin votes</span>
              </p>
              {move.week_start ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Week of {move.week_start}
                  {move.week_end ? ` – ${move.week_end}` : ""}
                </p>
              ) : null}
              {gameUrl ? (
                <a
                  href={gameUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open the game
                  <ExternalLink
                    aria-hidden="true"
                    className="size-3.5 shrink-0"
                  />
                </a>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant={
              move.current_user_voted || move.is_own ? "secondary" : "outline"
            }
            className="min-h-11 shrink-0"
            disabled={disabled}
            aria-label={
              move.is_own
                ? "You cannot vote on your own move"
                : isRemoved
                  ? "Voting is unavailable for a removed move"
                  : move.current_user_voted
                    ? `Remove your vote from ${move.platform || "this move"}`
                    : `Vote for ${move.platform || "this move"}`
            }
            aria-pressed={move.current_user_voted}
            onClick={onVote}
          >
            {move.is_own
              ? "Your move"
              : isRemoved
                ? "Removed"
                : move.current_user_voted
                  ? "Remove vote"
                  : "Vote"}
          </Button>
        </div>
      </CardContent>
    </Card>
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
