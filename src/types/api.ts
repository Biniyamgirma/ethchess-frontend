export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AdminUser {
  id: number;
  role: "admin";
  f_name: string;
  l_name?: string | null;
}

export interface Member {
  id: string;
  f_name?: string | null;
  l_name?: string | null;
  phone?: string | null;
  eth_chess_rating?: number | null;
  status?: number | null;
  is_deleted?: number | null;
  createdAt?: string | null;
}

export interface VenueOwner {
  id: number;
  f_name?: string | null;
  l_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  venue_id?: number | null;
}

export interface Venue {
  id: number;
  name: string;
  address?: string | null;
  status?: number | null;
  vendor_id?: number | null;
}

export interface AdminRole {
  id: number;
  name: string;
  status?: string | null;
}

export interface DashboardSummary {
  members: number;
  venueOwners: number;
  venues: number;
  upcomingEvents: number;
  activeMembers: number;
  memberChange: number;
  recentMembers: Pick<Member, "id" | "f_name" | "l_name" | "createdAt">[];
  activity: { label: string; value: number }[];
}

export interface ClubEvent {
  id: string;
  name: string;
  venue: string;
  date: string;
  status: "Upcoming" | "Completed" | "Draft";
}

export interface ClubBooking {
  id: string;
  member: string;
  venue: string;
  date: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}
