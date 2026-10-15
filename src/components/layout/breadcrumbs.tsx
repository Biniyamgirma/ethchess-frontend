"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  members: "Members",
  "venue-owners": "Venue owners",
  venues: "Venues",
  "brilliant-moves": "Brilliant Move",
  bookings: "Bookings",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const path = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  const label = labels[path] ?? path;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/dashboard" />}>
            Club admin
          </BreadcrumbLink>
        </BreadcrumbItem>
        {path !== "dashboard" ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
