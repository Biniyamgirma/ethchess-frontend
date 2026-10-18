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

export interface ManagedAdmin {
  id: number;
  f_name: string;
  l_name?: string | null;
  role: number;
  status?: number | null;
}

export interface AdminAccess {
  admin_level: number;
}

export interface Member {
  id: string;
  f_name?: string | null;
  l_name?: string | null;
  phone?: string | null;
  telegram_username?: string | null;
  trophy?: string | null;
  member_title?: string | null;
  eth_chess_rating?: number | null;
  address?: string | null;
  profile_picture?: string | null;
  district?: number | null;
  district_name?: string | null;
  role?: string | null;
  status?: number | null;
  is_deleted?: number | null;
  is_member?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MemberDetails {
  chess_dot_com_username: string | null;
  lichess_username: string | null;
  chess_dot_com_bullet_rating: number | null;
  chess_dot_com_blitz_rating: number | null;
  chess_dot_com_rapid_rating: number | null;
  lichess_bullet_rating: number | null;
  lichess_blitz_rating: number | null;
  lichess_rapid_rating: number | null;
  lichess_classical_rating: number | null;
  fide_standard_rating: number | null;
  fide_rapid_rating: number | null;
  fide_blitz_rating: number | null;
  chess_dot_com_info: Record<string, unknown> | null;
  lichess_info: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminMemberDetails extends Member {
  district_name: string | null;
  details: MemberDetails | null;
}

export const MEMBER_STATUS = {
  pending: 0,
  active: 1,
  blocked: 2,
} as const;

export interface VenueOwner {
  id: number;
  f_name?: string | null;
  l_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  telegram_username?: string | null;
  whats_up_username?: string | null;
  venue_id?: number | null;
  status?: number | null;
}

export interface Venue {
  id: number;
  name: string;
  address?: string | null;
  commission?: number;
  status?: number | null;
  vendor_id?: number | null;
}

export interface VenueTable {
  id: number;
  venue_id: number;
  name: string | null;
  status: number;
}

export interface VenueOverview {
  venue: Venue;
  totals: {
    matchesPlayed: number;
    commission: number;
    venueEarnings: number;
  };
  tables: VenueTable[];
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

export interface DashboardActivitySummary {
  today: {
    date: string;
    matchesPlayed: number;
    cancelledMatches: number;
    brilliantMovesSubmitted: number;
    commission: number;
  };
  allTime: {
    brilliantMovesSubmitted: number;
  };
  matchesByVenue: {
    venueId: number | null;
    venueName: string;
    matchesPlayed: number;
  }[];
  dailyCommission: {
    date: string;
    label: string;
    amount: number;
  }[];
}

export interface CurrentMatch {
  id: number;
  status: "started" | "awaiting_loser_confirmation";
  started_at: string | null;
  white_player: { id: string; name: string } | null;
  black_player: { id: string; name: string } | null;
  venue_name: string;
  table_name: string;
}
