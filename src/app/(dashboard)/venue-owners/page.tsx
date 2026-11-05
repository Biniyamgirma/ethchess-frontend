"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
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
import { useVenueOwnerActions, useVenueOwners } from "@/hooks/use-venue-owners";
import { useVenues } from "@/hooks/use-venues";
import { getCurrentAdminAccess } from "@/lib/api/admin";
import type { VenueOwner } from "@/types/api";

const ownerSchema = z.object({
  f_name: z.string().trim().min(1, "Add a first name."),
  l_name: z.string().trim().min(1, "Add a last name."),
  email: z.string().trim().email("Enter a valid email."),
  phone_number: z.string().trim().min(5, "Enter a valid phone number."),
  telegram_username: z.string().trim().optional().or(z.literal("")),
  whats_up_username: z.string().trim().optional().or(z.literal("")),
  venue_id: z.string().min(1, "Select a venue for this owner."),
  password: z
    .string()
    .refine(
      (password) => password.length === 0 || password.length >= 8,
      "Use at least 8 characters.",
    ),
});
type OwnerFormValues = z.infer<typeof ownerSchema>;
const column = createColumnHelper<VenueOwner>();

export default function VenueOwnersPage() {
  const [open, setOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<VenueOwner | null>(null);
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
  });
  const canManageOwners = (adminAccess.data?.admin_level ?? 0) > 2;
  const owners = useVenueOwners(canManageOwners);
  const venues = useVenues();
  const availableVenues = venues.data?.filter(
    (venue) =>
      venue.status !== 0 &&
      venue.is_deleted !== 1 &&
      venue.vendor_id == null &&
      owners.data?.every((owner) => owner.venue_id !== venue.id),
  );
  const ownerActions = useVenueOwnerActions();
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      f_name: "",
      l_name: "",
      email: "",
      phone_number: "",
      telegram_username: "",
      whats_up_username: "",
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
        (row) =>
          venues.data?.find((venue) => venue.id === row.venue_id)?.name ??
          (row.venue_id ? `Venue #${row.venue_id}` : "—"),
        {
          id: "venue",
          header: "Venue",
        },
      ),
      column.accessor((row) => row.telegram_username ?? "—", {
        id: "telegram",
        header: "Telegram",
      }),
      column.accessor((row) => row.whats_up_username ?? "—", {
        id: "whatsapp",
        header: "WhatsApp",
      }),
      column.accessor((row) => (row.status === 0 ? "Blocked" : "Active"), {
        id: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={
              getValue() === "Blocked"
                ? "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            }
          >
            {getValue()}
          </span>
        ),
      }),
      column.display({
        id: "actions",
        cell: ({ row }) => {
          const owner = row.original;
          const blocked = owner.status === 0;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${owner.f_name ?? "venue owner"} ${owner.l_name ?? ""}`.trim()}
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingOwner(owner);
                    form.reset({
                      f_name: owner.f_name ?? "",
                      l_name: owner.l_name ?? "",
                      email: owner.email ?? "",
                      phone_number: owner.phone_number ?? "",
                      telegram_username: owner.telegram_username ?? "",
                      whats_up_username: owner.whats_up_username ?? "",
                      venue_id: String(owner.venue_id ?? ""),
                      password: "",
                    });
                    setOpen(true);
                  }}
                >
                  <Pencil /> Edit information
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={ownerActions.setBlocked.isPending}
                  onClick={() =>
                    ownerActions.setBlocked.mutate({
                      id: owner.id,
                      isBlocked: !blocked,
                    })
                  }
                >
                  {blocked ? <ShieldCheck /> : <ShieldOff />}
                  {blocked ? "Unblock owner" : "Block owner"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [form, ownerActions.setBlocked, venues.data],
  );

  function submit(values: OwnerFormValues) {
    if (editingOwner) {
      ownerActions.update.mutate(
        {
          id: editingOwner.id,
          input: {
            f_name: values.f_name,
            l_name: values.l_name,
            email: values.email,
            phone_number: values.phone_number,
            telegram_username: values.telegram_username ?? "",
            whats_up_username: values.whats_up_username ?? "",
            ...(values.password ? { password: values.password } : {}),
          },
        },
        {
          onSuccess: () => {
            form.reset();
            setEditingOwner(null);
            setOpen(false);
          },
        },
      );
      return;
    }
    if (values.password.length < 8) {
      form.setError("password", { message: "Use at least 8 characters." });
      return;
    }
    ownerActions.create.mutate(
      {
        f_name: values.f_name,
        l_name: values.l_name,
        email: values.email,
        phone_number: values.phone_number,
        telegram_username: values.telegram_username || "",
        whats_up_username: values.whats_up_username || "",
        venue_id: Number(values.venue_id),
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

  if (adminAccess.isPending) {
    return <Skeleton className="h-80" />;
  }

  if (adminAccess.isError) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/40 p-5 text-sm"
      >
        Could not verify venue-owner permissions: {adminAccess.error.message}
      </p>
    );
  }

  if (!canManageOwners) {
    return (
      <p role="alert" className="rounded-xl border p-5 text-sm">
        Venue owners are available to administrators with a role level above 2.
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title="Venue owners"
        description="Back the people opening doors for young players."
        action={
          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                setEditingOwner(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger
              render={
                <Button
                  onClick={() => {
                    setEditingOwner(null);
                    form.reset();
                  }}
                />
              }
            >
              <Plus /> Add an owner
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingOwner ? "Edit venue owner" : "Add a venue owner"}
                </DialogTitle>
                <DialogDescription>
                  {editingOwner
                    ? "Update contact information. Leave password blank to keep the current password."
                    : "Create an owner account and assign one available venue. Passwords are securely hashed before storage."}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(submit)}
                className="max-h-[75vh] space-y-3 overflow-y-auto pr-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-first">First name</Label>
                    <Input
                      id="owner-first"
                      autoComplete="given-name"
                      {...form.register("f_name")}
                    />
                    {form.formState.errors.f_name ? (
                      <p className="text-xs text-accent-foreground">
                        {form.formState.errors.f_name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-last">Last name</Label>
                    <Input
                      id="owner-last"
                      autoComplete="family-name"
                      {...form.register("l_name")}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-email">Email</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    autoComplete="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-phone">Phone number</Label>
                  <Input
                    id="owner-phone"
                    type="tel"
                    autoComplete="tel"
                    {...form.register("phone_number")}
                  />
                  {form.formState.errors.phone_number ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.phone_number.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-telegram">
                    Telegram username{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="owner-telegram"
                    placeholder="@test"
                    {...form.register("telegram_username")}
                  />
                  {form.formState.errors.telegram_username ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.telegram_username.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-whatsapp">
                    WhatsApp username{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="owner-whatsapp"
                    placeholder="@hello"
                    {...form.register("whats_up_username")}
                  />
                  {form.formState.errors.whats_up_username ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.whats_up_username.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  {!editingOwner ? (
                    <>
                      <Label htmlFor="owner-venue" >Venue</Label>
                      <select
                        id="owner-venue"
                        className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm "
                        {...form.register("venue_id")}
                        disabled={
                          venues.isPending ||
                          venues.isError ||
                          owners.isPending ||
                          owners.isError
                        }
                      >
                        <option value="">Select a venue</option>
                        {availableVenues?.map((venue) => (
                          <option key={venue.id} value={venue.id} className="capitalize text-sm text-muted-foreground border-b border-border bg-card">
                            {venue.name}
                          </option>
                        ))}
                      </select>
                      {venues.isError ? (
                        <p role="alert" className="text-xs text-destructive">
                          Could not load venues: {venues.error.message}
                        </p>
                      ) : null}
                      {owners.isError ? (
                        <p role="alert" className="text-xs text-destructive">
                          Could not check existing venue assignments:{" "}
                          {owners.error.message}
                        </p>
                      ) : null}
                      {!venues.isPending &&
                      !venues.isError &&
                      !owners.isPending &&
                      !owners.isError &&
                      availableVenues?.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          All venues already have an owner.
                        </p>
                      ) : null}
                      {form.formState.errors.venue_id ? (
                        <p className="text-xs text-accent-foreground">
                          {form.formState.errors.venue_id.message}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-password">Password</Label>
                  <Input
                    id="owner-password"
                    type="password"
                    autoComplete="new-password"
                    {...form.register("password")}
                  />
                  {editingOwner ? (
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep the existing password.
                    </p>
                  ) : null}
                  {form.formState.errors.password ? (
                    <p className="text-xs text-accent-foreground">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={
                      ownerActions.create.isPending ||
                      ownerActions.update.isPending ||
                      (!editingOwner &&
                        (venues.isPending ||
                          venues.isError ||
                          owners.isPending ||
                          owners.isError ||
                          availableVenues?.length === 0))
                    }
                  >
                    {ownerActions.create.isPending ||
                    ownerActions.update.isPending
                      ? "Saving..."
                      : editingOwner
                        ? "Save changes"
                        : "Create owner"}{" "}
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
    </div>
  );
}
