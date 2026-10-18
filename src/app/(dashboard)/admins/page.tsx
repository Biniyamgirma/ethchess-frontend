"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Plus, ShieldCheck, UserRoundPen } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdmin,
  getAdminRoles,
  getAdmins,
  getCurrentAdminAccess,
  updateAdmin,
} from "@/lib/api/admin";
import { useAuth } from "@/hooks/use-auth";
import type { AdminRole, ManagedAdmin } from "@/types/api";

const ADMIN_STATUS = { active: 1, blocked: 2 } as const;
const column = createColumnHelper<ManagedAdmin>();

type AdminFormValues = {
  f_name: string;
  l_name: string;
  password: string;
  role: string;
};

export default function AdminsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<ManagedAdmin | null>(null);
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
  });
  const canManageAdmins = (adminAccess.data?.admin_level ?? 0) > 5;
  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
    enabled: canManageAdmins,
  });
  const roles = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAdminRoles,
    enabled: canManageAdmins,
  });
  const formSchema = useMemo(
    () =>
      z
        .object({
          f_name: z.string().trim().min(1, "Enter a first name."),
          l_name: z.string().trim(),
          password: z.string(),
          role: z.string().min(1, "Choose a role."),
        })
        .superRefine((values, context) => {
          if (!editingAdmin && values.password.length < 8) {
            context.addIssue({
              code: "custom",
              path: ["password"],
              message: "Use at least 8 characters for the password.",
            });
          } else if (values.password && values.password.length < 8) {
            context.addIssue({
              code: "custom",
              path: ["password"],
              message: "Use at least 8 characters for the password.",
            });
          }
        }),
    [editingAdmin],
  );
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { f_name: "", l_name: "", password: "", role: "" },
  });

  const refreshAdmins = () => {
    void queryClient.invalidateQueries({ queryKey: ["admins"] });
  };
  const saveAdmin = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: AdminFormValues }) => {
      const input = {
        f_name: values.f_name.trim(),
        l_name: values.l_name.trim() || undefined,
        role: Number(values.role),
        ...(values.password ? { password: values.password } : {}),
      };
      return id === undefined
        ? createAdmin({ ...input, password: values.password })
        : updateAdmin(id, input);
    },
    onSuccess: () => {
      refreshAdmins();
      toast.success(editingAdmin ? "Admin updated." : "Admin added.");
      setDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const setBlocked = useMutation({
    mutationFn: ({
      admin,
      isBlocked,
    }: {
      admin: ManagedAdmin;
      isBlocked: boolean;
    }) =>
      updateAdmin(admin.id, {
        status: isBlocked ? ADMIN_STATUS.blocked : ADMIN_STATUS.active,
      }),
    onSuccess: (_admin, variables) => {
      refreshAdmins();
      toast.success(
        variables.isBlocked ? "Admin blocked." : "Admin unblocked.",
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const columns = useMemo(() => {
    const roleNames = new Map<number, AdminRole>(
      (roles.data ?? []).map((role) => [role.id, role]),
    );
    return [
      column.accessor(
        (admin) => `${admin.f_name} ${admin.l_name ?? ""}`.trim(),
        {
          id: "name",
          header: "Admin",
          cell: ({ getValue, row }) => (
            <div>
              <p className="font-medium">{getValue()}</p>
              <p className="text-xs text-muted-foreground">
                Admin #{row.original.id}
              </p>
            </div>
          ),
        },
      ),
      column.accessor(
        (admin) => roleNames.get(admin.role)?.name ?? `Role ${admin.role}`,
        {
          id: "role",
          header: "Role",
        },
      ),
      column.accessor(
        (admin) =>
          admin.status === ADMIN_STATUS.blocked ? "Blocked" : "Active",
        {
          id: "status",
          header: "Status",
          cell: ({ getValue }) => (
            <StatusBadge tone={getValue() === "Blocked" ? "danger" : "success"}>
              {getValue()}
            </StatusBadge>
          ),
        },
      ),
      column.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const admin = row.original;
          const isBlocked = admin.status === ADMIN_STATUS.blocked;
          const isSelf = admin.id === user?.id;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingAdmin(admin);
                  form.reset({
                    f_name: admin.f_name,
                    l_name: admin.l_name ?? "",
                    password: "",
                    role: String(admin.role),
                  });
                  setDialogOpen(true);
                }}
              >
                <UserRoundPen /> Edit
              </Button>
              <Button
                variant={isBlocked ? "outline" : "destructive"}
                size="sm"
                disabled={isSelf || setBlocked.isPending}
                title={
                  isSelf ? "You cannot block your own account." : undefined
                }
                onClick={() => {
                  const action = isBlocked ? "unblock" : "block";
                  if (
                    !window.confirm(
                      `Are you sure you want to ${action} ${admin.f_name} ${admin.l_name ?? ""}?`,
                    )
                  ) {
                    return;
                  }
                  setBlocked.mutate({ admin, isBlocked: !isBlocked });
                }}
              >
                <Ban /> {isBlocked ? "Unblock" : "Block"}
              </Button>
            </div>
          );
        },
      }),
    ];
  }, [form, roles.data, setBlocked, user?.id]);

  function openCreateDialog() {
    setEditingAdmin(null);
    form.reset({ f_name: "", l_name: "", password: "", role: "" });
    setDialogOpen(true);
  }

  if (adminAccess.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (adminAccess.isError) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/40 p-5 text-sm"
      >
        Admin permissions could not be checked: {adminAccess.error.message}
      </p>
    );
  }

  if (!canManageAdmins) {
    return (
      <p role="alert" className="rounded-xl border p-5 text-sm">
        Admin management is available only to admins above role 5.
      </p>
    );
  }

  if (admins.isPending || roles.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (admins.isError) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/40 p-5 text-sm"
      >
        Could not load admins: {admins.error.message}
      </p>
    );
  }

  if (roles.isError) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/40 p-5 text-sm"
      >
        Could not load admin roles: {roles.error.message}
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin management"
        description="Create admin accounts, update their details, and manage access."
        action={
          <Button onClick={openCreateDialog} disabled={roles.data.length === 0}>
            <Plus /> Add admin
          </Button>
        }
      />
      {roles.data.length === 0 ? (
        <p className="mb-5 rounded-xl border p-4 text-sm text-muted-foreground">
          Create an active admin role in Settings before adding admins.
        </p>
      ) : null}
      <div className="mb-5 flex items-center gap-3 rounded-xl border bg-card p-4">
        <ShieldCheck className="size-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Blocking an admin immediately revokes access, including existing
          sessions. You cannot block your own account.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={admins.data}
        searchPlaceholder="Search admins..."
        emptyTitle="No admins found."
        emptyDescription="Add an admin account to get started."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingAdmin(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Edit admin" : "Add admin"}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin
                ? "Update this administrator's details and role."
                : "Create an administrator account for the club."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) =>
              saveAdmin.mutate({ id: editingAdmin?.id, values }),
            )}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="admin-first-name">First name</Label>
                <Input
                  id="admin-first-name"
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
                <Label htmlFor="admin-last-name">Last name</Label>
                <Input
                  id="admin-last-name"
                  autoComplete="family-name"
                  {...form.register("l_name")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">
                {editingAdmin ? "New password (optional)" : "Password"}
              </Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-accent-foreground">
                  {form.formState.errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Passwords must be at least 8 characters.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-role">Role</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger id="admin-role" className="w-full">
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.data.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name ?? `Role ${role.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role ? (
                <p className="text-xs text-accent-foreground">
                  {form.formState.errors.role.message}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveAdmin.isPending}>
                {saveAdmin.isPending
                  ? "Saving..."
                  : editingAdmin
                    ? "Save changes"
                    : "Create admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
