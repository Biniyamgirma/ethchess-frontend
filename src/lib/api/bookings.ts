import type { ClubBooking } from "@/types/api";

const sampleBookings: ClubBooking[] = [
  {
    id: "b-102",
    member: "Liya T.",
    venue: "Bole Chess House",
    date: "Oct 15, 2026",
    status: "Confirmed",
  },
  {
    id: "b-101",
    member: "Yonas K.",
    venue: "Kazanchis Club",
    date: "Oct 14, 2026",
    status: "Pending",
  },
];

export async function getBookings(): Promise<ClubBooking[]> {
  // TODO: confirm endpoint. The backend currently has no booking list route.
  return sampleBookings;
}
