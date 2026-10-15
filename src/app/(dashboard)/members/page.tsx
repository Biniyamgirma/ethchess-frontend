"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  Ban,
  MoreHorizontal,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { getCurrentAdminAccess } from "@/lib/api/admin";
import { MEMBER_STATUS, type Member } from "@/types/api";

const column = createColumnHelper<Member>();

export default function MembersPage() {
  const members = useMembers();
  const actions = useMemberActions();
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
  });
  const canManageMembers = (adminAccess.data?.admin_level ?? 0) > 5;
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
          row.is_deleted
            ? "Deleted"
            : row.status === MEMBER_STATUS.blocked
              ? "Blocked"
              : row.status === MEMBER_STATUS.pending
                ? "Pending"
                : "Active",
        {
          id: "status",
          header: "Status",
          cell: ({ getValue }) => (
            <StatusBadge
              tone={
                getValue() === "Active"
                  ? "success"
                  : getValue() === "Blocked"
                    ? "danger"
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
          if (member.is_deleted || !canManageMembers) {
            return (
              <span className="text-xs text-muted-foreground">
                {member.is_deleted ? "Deleted" : "—"}
              </span>
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
                    actions.block.mutate({
                      id: member.id,
                      isBlocked: member.status !== MEMBER_STATUS.blocked,
                    })
                  }
                >
                  <Ban />
                  {member.status === MEMBER_STATUS.blocked
                    ? "Unblock member"
                    : "Block member"}
                </DropdownMenuItem>
                {member.is_member === 1 ? (
                  <DropdownMenuItem disabled>
                    <UserCheck /> Official member
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      if (
                        window.confirm(
                          `Approve ${member.f_name ?? "this player"} as an official member?`,
                        )
                      ) {
                        actions.approveOfficial.mutate(member.id);
                      }
                    }}
                  >
                    <UserCheck /> Approve to official member
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete ${member.f_name ?? "this player"}? Their account data will be retained.`,
                      )
                    ) {
                      actions.remove.mutate(member.id);
                    }
                  }}
                >
                  <Trash2 /> Delete member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [actions, canManageMembers],
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
      {adminAccess.isError ? (
        <p role="alert" className="mb-5 rounded-xl border border-destructive/40 p-4 text-sm">
          Member action permissions could not be checked: {adminAccess.error.message}
        </p>
      ) : null}
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
