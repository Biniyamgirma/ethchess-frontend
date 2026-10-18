"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityOverview } from "@/components/dashboard/activity-overview";
import { getDashboardSummary } from "@/lib/api/dashboard";

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  if (summary.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (summary.isError) {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
        {summary.error.message}
      </p>
    );
  }

  const data = summary.data;
  const maxActivity = Math.max(1, ...data.activity.map((point) => point.value));
  return (
    <div>
      <PageHeader
        title="The club, at a glance"
        description="Here’s what’s happening across the EthChess community."
        action={
          <Button nativeButton={false} render={<Link href="/members" />}>
            Meet your members <ArrowUpRight />
          </Button>
        }
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Club members"
          value={data.members.toLocaleString()}
          detail="Players in the community"
          icon={Users}
          trend={`${data.memberChange >= 0 ? "+" : ""}${data.memberChange}%`}
        />
        <StatCard
          label="Venue owners"
          value={data.venueOwners}
          detail="Partners growing the game"
          icon={Store}
        />
        <StatCard
          label="Club venues"
          value={data.venues}
          detail="Places to play and connect"
          icon={MapPin}
        />
        <StatCard
          label="Upcoming events"
          value={data.upcomingEvents}
          detail="More moves on the calendar"
          icon={CalendarDays}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="shadow-none">
          <CardHeader className="flex-row items-center justify-between border-b py-4">
            <div>
              <CardTitle className="text-lg">New faces, new games</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Member signups this week
              </p>
            </div>
            <Activity className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex h-48 items-end justify-between gap-3 border-b pb-3">
              {data.activity.map((point) => (
                <div
                  key={point.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] text-muted-foreground">
                    {point.value}
                  </span>
                  <div
                    className="w-full max-w-10 rounded-t-md bg-primary/80"
                    style={{
                      height: `${point.value === 0 ? 0 : Math.max(4, (point.value / maxActivity) * 100)}%`,
                    }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active members</span>
              <span className="font-heading font-semibold">
                {data.activeMembers.toLocaleString()} players
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex-row items-center justify-between border-b py-4">
            <div>
              <CardTitle className="text-lg">Just joined</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Say hey to the newest players.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/members" />}
              variant="ghost"
              size="sm"
            >
              All members <ArrowUpRight />
            </Button>
          </CardHeader>
          <CardContent className="divide-y px-5">
            {data.recentMembers.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                No members have joined yet.
              </p>
            ) : (
              data.recentMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 py-4">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-muted font-heading text-xs font-semibold">
                      {member.f_name?.slice(0, 1) ?? "?"}
                      {member.l_name?.slice(0, 1) ?? ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.f_name} {member.l_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.createdAt
                        ? new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                          }).format(new Date(member.createdAt))
                        : "Date unavailable"}
                    </p>
                  </div>
                  <StatusBadge tone="success">New</StatusBadge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ActivityOverview />

      <div className="mt-6 rounded-xl bg-[#080808] p-6 text-[#FFFCF1] sm:flex sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Make the next move
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold">
            Every great club starts with a welcome.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#FFFCF1]/65">
            Bring a new venue or player into the EthChess community.
          </p>
        </div>
        <div className="mt-5 flex gap-3 sm:mt-0">
          <Button
            nativeButton={false}
            render={<Link href="/venue-owners" />}
            variant="outline"
            className="border-white/30 text-white hover:bg-white hover:text-black"
          >
            Add an owner <ArrowUpRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
