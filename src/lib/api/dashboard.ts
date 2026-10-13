import type { DashboardSummary } from "@/types/api";

const sampleSummary: DashboardSummary = {
  members: 1248,
  venueOwners: 18,
  venues: 12,
  upcomingEvents: 4,
  activeMembers: 1086,
  memberChange: 12.8,
  recentMembers: [
    { id: "m-1007", f_name: "Liya", l_name: "T.", createdAt: "Today" },
    { id: "m-1006", f_name: "Yonas", l_name: "K.", createdAt: "Yesterday" },
    { id: "m-1005", f_name: "Samrawit", l_name: "A.", createdAt: "Yesterday" },
    { id: "m-1004", f_name: "Nahom", l_name: "M.", createdAt: "2 days ago" },
  ],
  activity: [
    { label: "MON", value: 30 },
    { label: "TUE", value: 52 },
    { label: "WED", value: 39 },
    { label: "THU", value: 74 },
    { label: "FRI", value: 47 },
    { label: "SAT", value: 92 },
    { label: "SUN", value: 63 },
  ],
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // TODO: confirm endpoint. The backend currently has no admin dashboard summary route.
  return sampleSummary;
}
