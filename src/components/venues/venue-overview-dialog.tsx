"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getVenueOverview, updateVenueTable } from "@/lib/api/venues";
import type { VenueTable } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const numberFormat = new Intl.NumberFormat();

export function VenueOverviewDialog({
  venueId,
  open,
  onOpenChange,
}: {
  venueId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [editingTable, setEditingTable] = useState<VenueTable | null>(null);
  const [tableName, setTableName] = useState("");
  const overview = useQuery({
    queryKey: ["venue-overview", venueId],
    queryFn: () => getVenueOverview(venueId!),
    enabled: open && venueId !== null,
  });

  const tableUpdate = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<Pick<VenueTable, "name" | "status">>;
    }) => updateVenueTable(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["venue-overview", venueId],
      });
      toast.success("Venue table updated.");
      setEditingTable(null);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90svh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Venue overview
            </p>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Store className="size-5 text-primary" />
              {overview.data?.venue.name ?? "Venue details"}
            </DialogTitle>
            <DialogDescription>
              Match activity, venue revenue, and table management.
            </DialogDescription>
          </DialogHeader>

          {overview.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : overview.isError ? (
            <p
              role="alert"
              className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm"
            >
              Could not load venue details: {overview.error.message}
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Matches played"
                  value={numberFormat.format(
                    overview.data.totals.matchesPlayed,
                  )}
                />
                <Metric
                  label="Commission earned"
                  value={numberFormat.format(overview.data.totals.commission)}
                />
                <Metric
                  label="Venue earnings"
                  value={numberFormat.format(
                    overview.data.totals.venueEarnings,
                  )}
                />
              </div>
              <p className="-mt-4 text-xs text-muted-foreground">
                Venue earnings are match fees after deducting commission.
              </p>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-semibold">Venue tables</h3>
                    <p className="text-xs text-muted-foreground">
                      Edit table names or toggle table availability.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {overview.data.tables.length}{" "}
                    {overview.data.tables.length === 1 ? "table" : "tables"}
                  </span>
                </div>

                {overview.data.tables.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                    No tables have been added to this venue.
                  </p>
                ) : (
                  <div className="divide-y rounded-xl border">
                    {overview.data.tables.map((table) => {
                      const active = table.status === 1;
                      return (
                        <div
                          key={table.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {table.name || `Table #${table.id}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {active ? "Active" : "Inactive"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Switch
                                checked={active}
                                disabled={tableUpdate.isPending}
                                aria-label={`${active ? "Deactivate" : "Activate"} ${table.name || `table ${table.id}`}`}
                                onCheckedChange={(checked) =>
                                  tableUpdate.mutate({
                                    id: table.id,
                                    input: { status: checked ? 1 : 0 },
                                  })
                                }
                              />
                              {active ? "Active" : "Inactive"}
                            </label>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={tableUpdate.isPending}
                              onClick={() => {
                                setEditingTable(table);
                                setTableName(table.name ?? "");
                              }}
                            >
                              <Pencil /> Edit
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingTable !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditingTable(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit venue table</DialogTitle>
            <DialogDescription>
              Update the name shown for this table.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!editingTable || !tableName.trim()) return;
              tableUpdate.mutate({
                id: editingTable.id,
                input: { name: tableName.trim() },
              });
            }}
          >
            <Input
              value={tableName}
              onChange={(event) => setTableName(event.target.value)}
              aria-label="Venue table name"
              required
              maxLength={100}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTable(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!tableName.trim() || tableUpdate.isPending}
              >
                {tableUpdate.isPending ? "Saving..." : "Save table"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
