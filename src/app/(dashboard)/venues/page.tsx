"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { VenueOverviewDialog } from "@/components/venues/venue-overview-dialog";
import { useVenueActions, useVenues } from "@/hooks/use-venues";
import type { Venue } from "@/types/api";

const venueSchema = z.object({
  name: z.string().trim().min(1, "Give the venue a name."),
  address: z.string().optional(),
  commission: z.coerce.number().int().min(0),
});
type VenueForm = z.output<typeof venueSchema>;
const column = createColumnHelper<Venue>();

export default function VenuesPage() {
  const [open, setOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [viewingVenueId, setViewingVenueId] = useState<number | null>(null);
  const venues = useVenues();
  const actions = useVenueActions();
  const form = useForm<z.input<typeof venueSchema>, unknown, VenueForm>({
    resolver: zodResolver(venueSchema),
    defaultValues: { name: "", address: "", commission: 0 },
  });
  const columns = useMemo(
    () => [
      column.accessor("name", {
        header: "Venue",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),
      column.accessor((row) => row.address ?? "—", {
        id: "address",
        header: "Address",
      }),
      column.accessor(
        (row) => (row.vendor_id ? `Owner #${row.vendor_id}` : "Not assigned"),
        { id: "owner", header: "Owner" },
      ),
      column.accessor((row) => row.status !== 0, {
        id: "status",
        header: "Active",
        cell: ({ getValue, row }) => {
          const active = getValue();
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                disabled={actions.update.isPending}
                aria-label={`${active ? "Deactivate" : "Activate"} ${row.original.name}`}
                onCheckedChange={(checked) =>
                  actions.update.mutate({
                    id: row.original.id,
                    input: { status: checked ? 1 : 0 },
                  })
                }
              />
              <StatusBadge tone={active ? "success" : "neutral"}>
                {active ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
          );
        },
      }),
      column.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setViewingVenueId(row.original.id)}
              >
                <Eye /> View venue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingVenue(row.original);
                  form.reset({
                    name: row.original.name,
                    address: row.original.address ?? "",
                    commission: row.original.commission ?? 0,
                  });
                  setOpen(true);
                }}
              >
                <Pencil /> Edit venue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [actions.update, form],
  );

  function submit(values: VenueForm) {
    if (editingVenue) {
      actions.update.mutate(
        {
          id: editingVenue.id,
          input: values,
        },
        {
          onSuccess: () => {
            form.reset({ name: "", address: "", commission: 0 });
            setEditingVenue(null);
            setOpen(false);
          },
        },
      );
      return;
    }
    actions.create.mutate(values, {
      onSuccess: () => {
        form.reset({ name: "", address: "", commission: 0 });
        setEditingVenue(null);
        setOpen(false);
      },
    });
  }

  return (
    <div>
      <PageHeader
        title="Venues"
        description="The places where our community meets over the board."
        action={
          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                setEditingVenue(null);
                form.reset({ name: "", address: "", commission: 0 });
              }
            }}
          >
            <DialogTrigger
              render={
                <Button
                  onClick={() => {
                    setEditingVenue(null);
                    form.reset({ name: "", address: "", commission: 0 });
                  }}
                />
              }
            >
              <Plus /> Add a venue
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVenue ? "Edit venue" : "Add a venue"}
                </DialogTitle>
                <DialogDescription>
                  {editingVenue
                    ? "Update this venue's details."
                    : "Bring another welcoming place to the board."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="venue-name">Venue name</Label>
                  <Input id="venue-name" {...form.register("name")} />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="venue-address">Address</Label>
                  <Input id="venue-address" {...form.register("address")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="venue-commission">Commission</Label>
                  <Input
                    id="venue-commission"
                    type="number"
                    min="0"
                    {...form.register("commission")}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={
                      actions.create.isPending || actions.update.isPending
                    }
                  >
                    {actions.create.isPending || actions.update.isPending
                      ? "Saving..."
                      : editingVenue
                        ? "Save changes"
                        : "Create venue"}{" "}
                    <ArrowUpRight />
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {venues.isPending ? (
        <Skeleton className="h-80" />
      ) : venues.isError ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          {venues.error.message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={venues.data}
          searchPlaceholder="Search venues..."
          emptyTitle="No venues yet. Let's find a board."
          emptyDescription="Create the club's first venue to help players find a place to play."
        />
      )}
      <div className="mt-5 flex items-center gap-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        <MapPin className="size-4 text-primary" /> Every venue makes the game
        easier to find.
      </div>
      <VenueOverviewDialog
        venueId={viewingVenueId}
        open={viewingVenueId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setViewingVenueId(null);
        }}
      />
    </div>
  );
}
