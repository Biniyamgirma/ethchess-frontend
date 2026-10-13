"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { CalendarDays, Trophy } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvents } from "@/lib/api/events";
import { useQuery } from "@tanstack/react-query";
import type { ClubEvent } from "@/types/api";

const column = createColumnHelper<ClubEvent>();

export default function EventsPage() {
  const events = useQuery({ queryKey: ["events"], queryFn: getEvents });
  const columns = useMemo(
    () => [
      column.accessor("name", {
        header: "Event",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),
      column.accessor("venue", { header: "Venue" }),
      column.accessor("date", { header: "Date" }),
      column.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge
            tone={
              getValue() === "Upcoming"
                ? "success"
                : getValue() === "Draft"
                  ? "danger"
                  : "neutral"
            }
          >
            {getValue()}
          </StatusBadge>
        ),
      }),
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Events & tournaments"
        description="Big games, great energy, and a reason to come back."
      />
      <div className="mb-5 flex gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
        <Trophy className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
        <p>
          Events are sample content for now. The backend does not yet provide
          event or tournament endpoints, so changes aren’t saved.
        </p>
      </div>
      {events.isPending ? (
        <Skeleton className="h-80" />
      ) : events.isError ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          {events.error.message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={events.data}
          searchPlaceholder="Search events..."
          emptyTitle="No events on the board yet."
          emptyDescription="When the club lines up its next tournament, you'll see it here."
        />
      )}
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" /> Event creation and editing need a
        backend API first.
      </div>
    </div>
  );
}
