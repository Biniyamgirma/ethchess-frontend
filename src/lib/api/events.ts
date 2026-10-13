import type { ClubEvent } from "@/types/api";

const sampleEvents: ClubEvent[] = [
  {
    id: "e-01",
    name: "Saturday Rapid",
    venue: "Bole Chess House",
    date: "Oct 18, 2026",
    status: "Upcoming",
  },
  {
    id: "e-02",
    name: "Junior Open",
    venue: "Kazanchis Club",
    date: "Oct 24, 2026",
    status: "Upcoming",
  },
  {
    id: "e-03",
    name: "October Blitz Night",
    venue: "Bole Chess House",
    date: "Oct 30, 2026",
    status: "Draft",
  },
];

export async function getEvents(): Promise<ClubEvent[]> {
  // TODO: confirm endpoint. The backend currently has no events or tournament routes.
  return sampleEvents;
}
