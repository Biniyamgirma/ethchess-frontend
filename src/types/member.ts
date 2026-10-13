export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type Member = {
  id: string;
  f_name: string | null;
  l_name: string | null;
  phone: string;
  profile_picture: string | null;
  address: string | null;
  district: number | null;
  eth_chess_rating: number | null;
  member_title: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberSession = {
  id: string;
  role: "member";
  name: string;
};

export type Venue = {
  id: number;
  name: string | null;
  address: string | null;
  google_map_link: string | null;
  district: number | null;
  latitude: string | null;
  longtude: string | null;
  status: number | null;
  is_deleted: number | null;
};

export type VenueTable = {
  id: number;
  venue_id: number | null;
  name: string | null;
  ideal_player: string | null;
  ideal_player_color: "white" | "black" | null;
  is_available: boolean;
};

export type Match = {
  id: number;
  started_at: string | null;
  game_end_at: string | null;
  status: string | null;
  venue_id: number | null;
  table_id: number | null;
  winner_id: string | null;
  white_player_id: string | null;
  black_player_id: string | null;
};

export type BrilliantMove = {
  id: number;
  user_id: string | null;
  platform: string | null;
  move_url: string | null;
  createdAt: string;
  updatedAt: string;
  week_number: number | null;
  rank: number | null;
  is_awarded: number | null;
  vote_count: number;
  weighted_vote_count?: number;
  votes?: { user_id: string | null; vote_type: string | null }[];
};

export type MembershipTier = {
  id: number;
  name: string;
  price: number;
  duration_days: number | null;
};

export type District = {
  id: number;
  name: string | null;
  status: number | null;
};
