"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
import { useVenueOwnerActions, useVenueOwners } from "@/hooks/use-venue-owners";
import { getVenues } from "@/lib/api/venues";
import type { VenueOwner } from "@/types/api";

const ownerSchema = z.object({
  f_name: z.string().trim().min(1, "Add a first name."),
  l_name: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().email("Enter a valid email.")]),
  phone_number: z.string().optional(),
  venue_id: z.string().optional(),
  password: z.string().min(8, "Use at least 8 characters."),
});
type OwnerFormValues = z.infer<typeof ownerSchema>;
const column = createColumnHelper<VenueOwner>();

export default function VenueOwnersPage() {
  const [open, setOpen] = useState(false);
  const owners = useVenueOwners();
  const venues = useQuery({ queryKey: ["venues"], queryFn: getVenues });
  const createOwner = useVenueOwnerActions();
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      f_name: "",
      l_name: "",
      email: "",
      phone_number: "",
      venue_id: "",
      password: "",
    },
  });
  const columns = useMemo(
    () => [
      column.accessor(
        (row) => `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim(),
        {
          id: "name",
          header: "Venue owner",
          cell: ({ getValue }) => (
            <span className="font-medium">{getValue() || "Club partner"}</span>
          ),
        },
      ),
      column.accessor((row) => row.email ?? row.phone_number ?? "—", {
        id: "contact",
        header: "Contact",
      }),
      column.accessor(
        (row) => (row.venue_id ? `Venue #${row.venue_id}` : "Not assigned"),
        {
          id: "venue",
          header: "Venue",
          cell: ({ getValue }) => (
            <StatusBadge
              tone={getValue() === "Not assigned" ? "neutral" : "success"}
            >
              {getValue()}
            </StatusBadge>
          ),
        },
      ),
    ],
    [],
  );

  function submit(values: OwnerFormValues) {
    createOwner.mutate(
      {
        f_name: values.f_name,
        l_name: values.l_name || undefined,
        email: values.email || undefined,
        phone_number: values.phone_number || undefined,
        venue_id: values.venue_id ? Number(values.venue_id) : undefined,
        password: values.password,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Venue owners"
        description="Back the people opening doors for young players."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus /> Add an owner
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a venue owner</DialogTitle>
                <DialogDescription>
                  Create a venue partner account. Backend access requires an
                  admin role above level 6.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-first">First name</Label>
                    <Input id="owner-first" {...form.register("f_name")} />
                    {form.formState.errors.f_name ? (
                      <p className="text-xs text-accent-foreground">
                        {form.formState.errors.f_name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-last">Last name</Label>
                    <Input id="owner-last" {...form.register("l_name")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-email">Email</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-phone">Phone</Label>
                  <Input id="owner-phone" {...form.register("phone_number")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-venue">Venue ID (optional)</Label>
                  <Input
                    id="owner-venue"
                    inputMode="numeric"
                    {...form.register("venue_id")}
                  />
                  {venues.isError ? (
                    <p className="text-xs text-accent-foreground">
                      {venues.error.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-password">Temporary password</Label>
                  <Input
                    id="owner-password"
                    type="password"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createOwner.isPending}>
                    {createOwner.isPending ? "Adding..." : "Create owner"}{" "}
                    <ArrowUpRight />
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Venue partners</p>
          <p className="mt-2 font-heading text-3xl font-bold">
            {owners.data?.length ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            A better place to play
          </p>
          <p className="mt-2 font-heading text-xl font-semibold">
            Local owners make it happen.
          </p>
        </div>
      </div>
      {owners.isPending ? (
        <Skeleton className="h-80" />
      ) : owners.isError ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          {owners.error.message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={owners.data}
          searchPlaceholder="Search owners..."
          emptyTitle="No venue owners yet."
          emptyDescription="Invite a local chess spot to join the club."
        />
      )}
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Store className="size-3.5" /> Owner directory is sample data until the
        backend adds a list endpoint.
      </p>
    </div>
  );
}
