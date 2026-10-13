"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { CalendarCheck } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/api/bookings";
import type { ClubBooking } from "@/types/api";

const column = createColumnHelper<ClubBooking>();

export default function BookingsPage() {
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: getBookings });
  const columns = useMemo(
    () => [
      column.accessor("member", {
        header: "Player",
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
              getValue() === "Confirmed"
                ? "success"
                : getValue() === "Pending"
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
        title="Bookings"
        description="A quick look at players finding their next place to play."
      />
      <div className="mb-5 flex gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
        <CalendarCheck className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
        <p>
          These are sample bookings. The current backend does not expose an
          admin booking list or booking management route.
        </p>
      </div>
      {bookings.isPending ? (
        <Skeleton className="h-80" />
      ) : bookings.isError ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          {bookings.error.message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={bookings.data}
          searchPlaceholder="Search bookings..."
          emptyTitle="No bookings yet."
          emptyDescription="Player bookings will show up here once there's an API for them."
        />
      )}
    </div>
  );
}
