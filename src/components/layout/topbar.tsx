"use client";

import { LogOut, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { logoutAdmin } from "@/lib/api/auth";

export function Topbar() {
  const router = useRouter();
  const { user, clearUser } = useAuth();

  async function handleLogout() {
    try {
      await logoutAdmin();
      clearUser();
      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not log out.",
      );
    }
  }

  const name = user
    ? `${user.f_name} ${user.l_name ?? ""}`.trim()
    : "Club admin";

  return (
    <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger aria-label="Toggle navigation" />
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            className="hidden h-9 w-52 justify-start gap-2 px-3 text-muted-foreground md:inline-flex"
            aria-label="Search (coming soon)"
          >
            <Search className="size-4" />
            <span className="font-sans font-normal">Search anything...</span>
            <kbd className="ml-auto rounded border px-1.5 py-0.5 text-[10px]">
              ⌘ K
            </kbd>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {user?.f_name?.slice(0, 1) ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm sm:block">
                    {name}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <UserRound /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
