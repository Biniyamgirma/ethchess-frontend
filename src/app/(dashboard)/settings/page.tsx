"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Moon, Plus, ShieldCheck, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRoles,
  updateAdminRole,
} from "@/lib/api/admin";
import type { AdminRole } from "@/types/api";

const roleSchema = z.object({
  name: z.string().trim().min(1, "Add a role name."),
});
type RoleForm = z.infer<typeof roleSchema>;
const column = createColumnHelper<AdminRole>();

export default function SettingsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const roles = useQuery({ queryKey: ["admin-roles"], queryFn: getAdminRoles });
  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "" },
  });
  const createRole = useMutation({
    mutationFn: createAdminRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role added.");
      form.reset();
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const columns = useMemo(
    () => [
      column.accessor("name", {
        header: "Role",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),
      column.accessor(
        (role) =>
          role.status === "1" || role.status === "active"
            ? "Active"
            : (role.status ?? "Not set"),
        {
          id: "status",
          header: "Status",
          cell: ({ getValue }) => (
            <StatusBadge tone={getValue() === "Active" ? "success" : "neutral"}>
              {getValue()}
            </StatusBadge>
          ),
        },
      ),
      column.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = window.prompt(
                  "Rename this role",
                  row.original.name,
                );
                if (name?.trim()) {
                  updateAdminRole(row.original.id, { name: name.trim() })
                    .then(() => {
                      void queryClient.invalidateQueries({
                        queryKey: ["admin-roles"],
                      });
                      toast.success("Role renamed.");
                    })
                    .catch((error: unknown) =>
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Could not rename role.",
                      ),
                    );
                }
              }}
            >
              Rename
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!window.confirm(`Delete the "${row.original.name}" role?`))
                  return;
                deleteAdminRole(row.original.id)
                  .then(() => {
                    void queryClient.invalidateQueries({
                      queryKey: ["admin-roles"],
                    });
                    toast.success("Role removed.");
                  })
                  .catch((error: unknown) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not delete role.",
                    ),
                  );
              }}
            >
              Delete
            </Button>
          </div>
        ),
      }),
    ],
    [queryClient],
  );

  return (
    <div>
      <PageHeader
        title="Settings"
        description="A few house rules for keeping the club in good shape."
      />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="size-4 text-primary" /> Look & feel
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Dark mode</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the board that feels right.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {resolvedTheme === "dark" ? (
                <Moon className="size-4 text-muted-foreground" />
              ) : (
                <Sun className="size-4 text-muted-foreground" />
              )}
              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Admin roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Roles keep the right people in the right seats.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button size="sm" />}>
                  <Plus /> Add role
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a role</DialogTitle>
                    <DialogDescription>
                      Name a new admin role for the club.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={form.handleSubmit((values) =>
                      createRole.mutate(values),
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="role-name">Role name</Label>
                      <Input id="role-name" {...form.register("name")} />
                      {form.formState.errors.name ? (
                        <p className="text-xs text-accent-foreground">
                          {form.formState.errors.name.message}
                        </p>
                      ) : null}
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createRole.isPending}>
                        {createRole.isPending ? "Saving..." : "Create role"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {roles.isPending ? (
              <div className="h-28 animate-pulse rounded-lg bg-muted" />
            ) : roles.isError ? (
              <p className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
                {roles.error.message}
              </p>
            ) : (
              <DataTable
                columns={columns}
                data={roles.data}
                searchPlaceholder="Find a role..."
                emptyTitle="No roles on file."
                emptyDescription="Add a role to help organize the admin team."
              />
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Role changes require a high-level admin account. The server
              enforces permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
