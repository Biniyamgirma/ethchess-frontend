"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { navSections } from "@/config/nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { logoutAdmin } from "@/lib/api/auth";
import { getCurrentAdminAccess } from "@/lib/api/admin";
import { ThemeMenuAction } from "@/components/layout/theme-toggle";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { user, clearUser } = useAuth();
  const adminAccess = useQuery({
    queryKey: ["current-admin-access"],
    queryFn: getCurrentAdminAccess,
    enabled: Boolean(user),
  });
  const visibleNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.href !== "/venue-owners" ||
          (adminAccess.data?.admin_level ?? 0) > 2,
      ),
    }))
    .filter((section) => section.items.length > 0);
  const name = user
    ? `${user.f_name} ${user.l_name ?? ""}`.trim()
    : "Club admin";

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

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex h-10 items-center">
          {state === "collapsed" ? (
            <Image
              src="/brand/logo-icon-white.svg"
              alt="EthChess"
              width={34}
              height={34}
              priority
            />
          ) : (
            <Image
              src="/brand/logo-white.svg"
              alt="EthChess™"
              width={160}
              height={32}
              priority
            />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        {visibleNavSections.map((section) => (
          <SidebarGroup key={section.title} className="py-1">
            <SidebarGroupLabel className="px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        tooltip={item.title}
                        className="h-10 px-3 text-sidebar-foreground/75 data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-white hover:text-white"
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-12 hover:bg-sidebar-accent"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-bold text-white">
                    {user?.f_name?.slice(0, 1) ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col items-start">
                  <span className="max-w-36 truncate text-sm font-semibold">
                    {name}
                  </span>
                  <span className="text-xs text-sidebar-foreground/55">
                    Admin
                  </span>
                </span>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{name}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings /> Profile & settings
            </DropdownMenuItem>
            <ThemeMenuAction />
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
