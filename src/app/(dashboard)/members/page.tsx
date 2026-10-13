"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberActions, useMembers } from "@/hooks/use-members";
import type { Member } from "@/types/api";

const column = createColumnHelper<Member>();

export default function MembersPage() {
  const members = useMembers();
  const actions = useMemberActions();
  const columns = useMemo(
    () => [
      column.accessor(
        (row) => `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim(),
        {
          id: "name",
          header: "Player",
          cell: ({ getValue, row }) => (
            <div>
              <p className="font-medium">{getValue() || "EthChess player"}</p>
              <p className="text-xs text-muted-foreground">{row.original.id}</p>
            </div>
          ),
        },
      ),
      column.accessor((row) => row.phone ?? "—", {
        id: "phone",
        header: "Phone",
      }),
      column.accessor((row) => row.eth_chess_rating ?? "—", {
        id: "rating",
        header: "Rating",
      }),
      column.accessor(
        (row) =>
          row.is_deleted ? "Inactive" : row.status === 0 ? "Pending" : "Active",
        {
          id: "status",
          header: "Status",
          cell: ({ getValue }) => (
            <StatusBadge
              tone={
                getValue() === "Active"
                  ? "success"
                  : getValue() === "Pending"
                    ? "danger"
                    : "neutral"
              }
            >
              {getValue()}
            </StatusBadge>
          ),
        },
      ),
      column.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const member = row.original;
          if (member.is_deleted) {
            return (
              <span className="text-xs text-muted-foreground">Removed</span>
            );
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${member.f_name ?? "member"}`}
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    actions.update.mutate({
                      id: member.id,
                      status: member.status === 0 ? 1 : 0,
                    })
                  }
                >
                  {member.status === 0 ? (
                    <>
                      <ArrowUpRight /> Activate player
                    </>
                  ) : (
                    <>
                      <ArrowDownRight /> Set pending
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remove ${member.f_name ?? "this player"} from the club?`,
                      )
                    ) {
                      actions.remove.mutate(member.id);
                    }
                  }}
                >
                  <Users /> Remove from club
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [actions],
  );

  if (members.isPending)
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  if (members.isError)
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
        {members.error.message}
      </p>
    );

  return (
    <div>
      <PageHeader
        title="Members"
        description="The people who make EthChess what it is. Keep them playing."
      />
      <DataTable
        columns={columns}
        data={members.data}
        searchPlaceholder="Search players..."
        emptyTitle="No members yet. Time to recruit."
        emptyDescription="New members will show up here once they join the club."
      />
    </div>
  );
}
