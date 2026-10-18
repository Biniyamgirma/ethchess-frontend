import {
  CalendarCheck,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Settings,
  Store,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSection {
  title: string;
  items: { title: string; href: string; icon: LucideIcon }[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "People",
    items: [
      { title: "Members", href: "/members", icon: Users },
      { title: "Venue owners", href: "/venue-owners", icon: Store },
    ],
  },
  {
    title: "Places",
    items: [{ title: "Venues", href: "/venues", icon: MapPin }],
  },
  {
    title: "Club",
    items: [
      { title: "Brilliant Move", href: "/brilliant-moves", icon: Trophy },
      { title: "Bookings", href: "/bookings", icon: CalendarCheck },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Admin management", href: "/admins", icon: ShieldCheck },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
