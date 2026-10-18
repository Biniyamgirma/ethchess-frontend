"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Ban, Coins, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { getDashboardActivitySummary } from "@/lib/api/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatNumber = (value: number) => value.toLocaleString();
const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "primary" | "accent";
}) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span
            className={
              tone === "accent"
                ? "grid size-9 place-items-center rounded-full bg-accent/15 text-accent"
                : "grid size-9 place-items-center rounded-full bg-primary/10 text-primary"
            }
          >
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-4 font-heading text-3xl font-bold tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function ActivityOverview() {
  const summary = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: getDashboardActivitySummary,
  });

  if (summary.isPending) {
    return (
      <section className="mt-8 space-y-4" aria-label="Club activity overview">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-80 w-full" />
      </section>
    );
  }

  if (summary.isError) {
    return (
      <section className="mt-8" aria-label="Club activity overview">
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          {summary.error.message}
        </p>
      </section>
    );
  }

  const data = summary.data;
  const peakVenueMatches = Math.max(
    1,
    ...data.matchesByVenue.map((venue) => venue.matchesPlayed),
  );
  const peakCommission = Math.max(
    1,
    ...data.dailyCommission.map((day) => day.amount),
  );
  const commissionThisWeek = data.dailyCommission.reduce(
    (total, day) => total + day.amount,
    0,
  );

  return (
    <section className="mt-8 space-y-4" aria-label="Club activity overview">
      <div>
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Admin overview
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold">
          Club activity &amp; performance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily operational totals for {formatDate(data.today.date)}.
        </p>
      </div>

      <Tabs defaultValue="matches" className="gap-5">
        <TabsList
          aria-label="Club activity analytics"
          className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-fit"
        >
          <TabsTrigger value="matches">
            <Activity data-icon="inline-start" />
            Match activity
          </TabsTrigger>
          <TabsTrigger value="moves">
            <Trophy data-icon="inline-start" />
            Brilliant moves
          </TabsTrigger>
          <TabsTrigger value="commission">
            <Coins data-icon="inline-start" />
            Commission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Matches played today"
              value={formatNumber(data.today.matchesPlayed)}
              detail="Completed matches across all venues"
              icon={Activity}
            />
            <MetricCard
              label="Matches canceled today"
              value={formatNumber(data.today.cancelledMatches)}
              detail="Cancellations recorded today"
              icon={Ban}
              tone="accent"
            />
          </div>

          <Card className="shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">Matches played by venue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Completed matches at each venue today
              </p>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {data.matchesByVenue.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No matches have been completed today.
                </p>
              ) : (
                data.matchesByVenue.map((venue) => (
                  <div
                    key={venue.venueId ?? "unrecorded"}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2"
                  >
                    <span className="truncate text-sm font-medium">
                      {venue.venueName}
                    </span>
                    <span className="font-heading text-sm font-semibold">
                      {formatNumber(venue.matchesPlayed)}
                    </span>
                    <div
                      className="col-span-2 h-2 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${venue.venueName}: ${venue.matchesPlayed} matches`}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(venue.matchesPlayed / peakVenueMatches) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moves">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Total brilliant moves submitted"
              value={formatNumber(data.allTime.brilliantMovesSubmitted)}
              detail="All submissions recorded"
              icon={Trophy}
            />
            <MetricCard
              label="Submitted today"
              value={formatNumber(data.today.brilliantMovesSubmitted)}
              detail="New community moves today"
              icon={Trophy}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              nativeButton={false}
              render={<Link href="/brilliant-moves" />}
              variant="outline"
            >
              Review submissions
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="commission">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Commission generated today"
              value={formatNumber(data.today.commission)}
              detail="From matches completed today"
              icon={Coins}
            />
            <MetricCard
              label="Commission generated this week"
              value={formatNumber(commissionThisWeek)}
              detail="Daily totals for the last seven days"
              icon={Coins}
            />
          </div>

          <Card className="mt-5 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">Daily commission</CardTitle>
              <p className="text-sm text-muted-foreground">
                Commission from completed matches, day by day
              </p>
            </CardHeader>
            <CardContent className="p-5">
              <div
                className="flex h-56 items-end justify-between gap-2 border-b pb-3 sm:gap-4"
                role="img"
                aria-label="Daily commission over the last seven days"
              >
                {data.dailyCommission.map((day) => (
                  <div
                    key={day.date}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    title={`${formatDate(day.date)}: ${formatNumber(day.amount)}`}
                  >
                    <span className="max-w-full truncate text-[10px] text-muted-foreground">
                      {formatNumber(day.amount)}
                    </span>
                    <div
                      className="w-full max-w-12 rounded-t-md bg-primary/80"
                      style={{
                        height: `${day.amount === 0 ? 0 : Math.max(4, (day.amount / peakCommission) * 100)}%`,
                      }}
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
