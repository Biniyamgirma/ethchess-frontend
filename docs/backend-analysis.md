# Member app backend analysis

This document is the backend contract for the member experience. The backend was inspected in read-only mode; no backend files were changed.

For the complete inventory of registered backend routes (including admin, vendor, bot, and venue-owner routes), see [backend-routes-reference.md](./backend-routes-reference.md).

## Stack and API setup

- Backend: TypeScript, Express 5, Prisma ORM, PostgreSQL, Zod validation.
- Entry point: `src/server.ts`; routes are mounted under `/api` (or `/api/<resource>`).
- No OpenAPI/Swagger spec, Postman collection, or backend `docs/` directory was present. `README.md` only describes the service generally, so route/controller/validator/service code and the Prisma contract are the source of truth.
- API origin: backend listens on `PORT`, default `4000`. Frontend base URL should be configured with `NEXT_PUBLIC_API_BASE_URL` (origin only, e.g. `http://localhost:4000`); resource calls include `/api/...`.
- CORS reflects the requesting origin and allows credentials. JSON body limit is 1 MB. Rate limit: 200 requests per 15 minutes.
- Dates are stored as timestamps. Most member endpoints return ORM dates directly; one Telegram-profile endpoint formats dates in `Africa/Addis_Ababa`. Display dates in `Africa/Addis_Ababa` where appropriate. Prices and match charges are integer ETB values, although the backend does not enforce a currency code.
- Standard success envelope: `{ success: true, data: ... }`, optionally with `message`. Login instead returns `{ success: true, message, data: { user } }`.
- Standard error envelope: `{ success: false, message, ... }`; validation errors use `{ success: false, message: "Validation failed", errors: <Zod flatten result> }`. Development errors may include `stack`.
- No list endpoint uses pagination, sorting or search/filter query conventions; these collections are returned as complete arrays.

## Authentication

- `POST /api/auth/login` accepts `{ identifier, password, role }`; role must be `member` for this app. Member identifiers are a phone beginning with `09` or an ID beginning with `U`/`ETH` (ID is uppercased before lookup). Password minimum is 8 characters.
- `POST /api/auth/login/phone` accepts `{ phone, password }` and authenticates as a member; password minimum is 8 characters.
- Successful login sets an HttpOnly `token` cookie (JWT, `SameSite=Lax`, seven-day max age; `Secure` in production). The JWT role is `member`. The response includes a small user object, not the token. The backend also accepts `Authorization: Bearer <token>`, but the browser app should use the HttpOnly cookie with credentialed requests.
- `POST /api/auth/logout` clears the `token` cookie. It does not require authentication.
- There is no refresh endpoint, password reset/forgot-password endpoint, email/phone verification endpoint, or profile-image upload endpoint. Session validity is checked on each protected request; expired/invalid tokens produce 401.
- `requireAuth` accepts any valid role; member-specific route authorization is not consistently enforced. Member UI must only call its own member routes and should not treat authentication alone as a member-role check.
- Registration does not automatically create a login session.

## Member-relevant endpoints

| Method | Path                                    | Access        | Request                                                                                                                                                                                                                                                                                                                | Response/data shape and notes                                                                                                                                                                                                                                                   |
| ------ | --------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/members/register`                 | Public        | Body: `phone` (required, min 9), `password` (required, min 8); optional `id` (min 3), `f_name`, `l_name`, `chat_id`, `telegram_username`, `trophy`, `member_title`, `eth_chess_rating` (integer), `address`, `profile_picture` (string URL/value), `district` (string or number), `status` (integer), `role` (string). | 201 `{ success, data: member }`. Service generates a `U...` ID if omitted; defaults role to `member`, `status` to 1, `is_member` to 0 and deletion flag to 0. Response is currently the raw member record and may contain a password hash; do not render or persist that field. |
| POST   | `/api/auth/login`                       | Public        | `{ identifier, password, role: "member" }`                                                                                                                                                                                                                                                                             | 200 `{ success, message, data: { user: { id, role, identifier, name } } }`; sets HttpOnly JWT cookie.                                                                                                                                                                           |
| POST   | `/api/auth/login/phone`                 | Public        | `{ phone, password }`                                                                                                                                                                                                                                                                                                  | Same login response/cookie; role is member.                                                                                                                                                                                                                                     |
| POST   | `/api/auth/logout`                      | Public        | Optional empty object                                                                                                                                                                                                                                                                                                  | 200 `{ success, message }`; clears cookie.                                                                                                                                                                                                                                      |
| POST   | `/api/auth/telegram/link`               | Public        | `{ password, chatId, phone?: string, identifier?: string, telegramUsername?: string }`; exactly one of `phone`/`identifier`, password min 8, numeric Telegram chat ID.                                                                                                                                                 | `{ success, message, data: { member: { id, name } } }`; links Telegram after password verification. Not used in the browser app.                                                                                                                                                |
| GET    | `/api/members/me`                       | Authenticated | None                                                                                                                                                                                                                                                                                                                   | `{ success, data: member }`. Current controller returns the raw member record, including password hash; avoid displaying, logging, or caching the sensitive property.                                                                                                           |
| PUT    | `/api/members/me`                       | Authenticated | Optional fields: `f_name`, `l_name`, `chat_id`, `phone`, `telegram_username`, `trophy`, `member_title`, integer `eth_chess_rating`, password (min 8), `address`, `profile_picture`, `district` (string or number), integer `status`. Schema is passthrough.                                                            | `{ success, data: member }`. Avoid sending administrative/internal properties even though validator is passthrough. No upload is performed; `profile_picture` is a string.                                                                                                      |
| PATCH  | `/api/members/me/link-accounts`         | Authenticated | `{ chessDotComUsername?: string, lichessUsername?: string }`; at least one required, each supplied value min 2.                                                                                                                                                                                                        | `{ success, data: member }`; server fetches external profile details and stores rating/profile data.                                                                                                                                                                            |
| GET    | `/api/members/:id`                      | Authenticated | Path ID (string)                                                                                                                                                                                                                                                                                                       | `{ success, data: member }`; raw member record. Do not use for member directory; not needed by the app.                                                                                                                                                                         |
| GET    | `/api/lookups/:type/active`             | Public        | Path `type`; supported lookup types should be confirmed from lookup service.                                                                                                                                                                                                                                           | `{ success, data: [...] }`. Can supply active districts for registration if the lookup type is supported.                                                                                                                                                                       |
| GET    | `/api/matches/venues`                   | Public        | None                                                                                                                                                                                                                                                                                                                   | `{ success, data: Venue[] }` for active, non-deleted venues; used for in-person match discovery.                                                                                                                                                                                |
| GET    | `/api/matches/venues/:venueId/tables`   | Public        | Positive integer venue ID                                                                                                                                                                                                                                                                                              | `{ success, data: VenueTable[] }`; active tables include `is_available`; not paginated.                                                                                                                                                                                         |
| POST   | `/api/matches/tables/:tableId/join`     | Authenticated | Positive integer table ID; body `{ color?: "white" \| "black" }`                                                                                                                                                                                                                                                       | 200/201 `{ success, data: { state, message, match? } }`. Can create a waiting player or start a match; no event registration.                                                                                                                                                   |
| POST   | `/api/matches/tables/:tableId/start`    | Authenticated | Same schema/behavior as `/join`                                                                                                                                                                                                                                                                                        | Same response as join (route aliases join behavior).                                                                                                                                                                                                                            |
| POST   | `/api/matches/tables/:tableId/leave`    | Authenticated | Positive table ID; empty body                                                                                                                                                                                                                                                                                          | `{ success, data: result }`; leaves a waiting table.                                                                                                                                                                                                                            |
| POST   | `/api/matches/:id/end`                  | Authenticated | Positive match ID; body `{ loser_user_id: string }`                                                                                                                                                                                                                                                                    | `{ success, data: result }`; requests match end.                                                                                                                                                                                                                                |
| POST   | `/api/matches/:id/confirm-loser`        | Authenticated | Positive match ID                                                                                                                                                                                                                                                                                                      | `{ success, data: result }`; confirms a pending match result.                                                                                                                                                                                                                   |
| GET    | `/api/venues`                           | Authenticated | None                                                                                                                                                                                                                                                                                                                   | `{ success, data: Venue[] }`; route requires auth, though it does not require member role.                                                                                                                                                                                      |
| GET    | `/api/brilliant-moves`                  | Authenticated | None                                                                                                                                                                                                                                                                                                                   | `{ success, data: BrilliantMoveSubmission[] }`, each enriched with `vote_count`, `admin_vote_weighted`, `weighted_vote_count`, and votes; complete collection.                                                                                                                  |
| POST   | `/api/brilliant-moves/submit`           | Authenticated | `{ move_url?: valid URL, platform?: string }`; at least one required.                                                                                                                                                                                                                                                  | 201 `{ success, data: submission }`; creates a current-week submission.                                                                                                                                                                                                         |
| PATCH  | `/api/brilliant-moves/:id`              | Authenticated | Positive integer ID; body same as submit                                                                                                                                                                                                                                                                               | `{ success, data: submission }`; service limits editing to the submission owner.                                                                                                                                                                                                |
| POST   | `/api/brilliant-moves/:id/vote`         | Authenticated | Positive integer ID; `{ vote?: string \| number (0..5), vote_type?: "upvote" \| "downvote" \| "star" }`                                                                                                                                                                                                                | `{ success, data: vote }`. Service defaults missing vote type to `upvote`.                                                                                                                                                                                                      |
| GET    | `/api/subscriptions/tiers`              | Authenticated | None                                                                                                                                                                                                                                                                                                                   | `{ success, data: MembershipTier[] }`; membership tiers, not tournament/event entry fees.                                                                                                                                                                                       |
| POST   | `/api/subscriptions/invoices`           | Authenticated | `{ tier_id: numeric-string-or-number, payment_method?: string }`                                                                                                                                                                                                                                                       | 201 `{ success, data: invoice }`; creates a membership invoice.                                                                                                                                                                                                                 |
| PATCH  | `/api/subscriptions/invoices/:id/proof` | Authenticated | Positive numeric-string ID; `{ payment_proof_url: valid URL, paid_in_amount?: positive integer, payment_method?: string }`                                                                                                                                                                                             | `{ success, data: invoice }`; accepts a URL, not a file upload.                                                                                                                                                                                                                 |

Bot-only member endpoints also exist under `/api/members/bot/*`, `/api/matches/bot/*`, and `/api/brilliant-moves/bot/*`. They require `x-ethchess-bot-secret`, and some also require `chat_id`; do not expose the secret or call them from this browser app. They provide Telegram registration/profile/account-link, match/table actions, and brilliant-move submission/voting counterparts.

For completeness, the bot-only route names are `POST /api/members/bot/register` (chat ID, first/last name, phone, password, address, district), `POST /api/members/bot/profile` (chat ID), `POST /api/members/bot/link-chesscom` (chat ID and Chess.com username), `POST /api/matches/bot/account` (chat ID), `POST /api/matches/bot/matches` (chat ID), `POST /api/matches/bot/unlink` (chat ID), `POST /api/matches/bot/venues` (chat ID), `POST /api/matches/bot/venues/:venueId/tables` (chat ID), `POST /api/matches/bot/tables/:tableId/join` (chat ID, optional color), `POST /api/matches/bot/tables/:tableId/leave` (chat ID), `POST /api/matches/bot/:id/start` (chat ID), `POST /api/matches/bot/:id/end` (chat ID and loser choice), `POST /api/matches/bot/:id/confirm-loser` (chat ID and token), `POST /api/brilliant-moves/bot/submit` (chat ID and move URL), `POST /api/brilliant-moves/bot/week` (chat ID), and `POST /api/brilliant-moves/bot/:id/vote` (chat ID). All return the standard success envelope; Telegram account lookup returns `{ linked: false }` or a small linked-member identity.

The remaining `/api` routes are admin/vendor/Telegram-bot or venue-operator workflows and are not member-app endpoints. Telegram bot routes require a backend secret and must not be called by a browser client.

## Resource types (observed contract)

```ts
type ApiSuccess<T> = { success: true; data: T; message?: string };
type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
};

type Member = {
  id: string;
  f_name: string | null;
  l_name: string | null;
  phone: string;
  chat_id: string | null;
  telegram_username: string | null;
  trophy: string | null;
  is_member: number | null;
  member_title: string | null;
  eth_chess_rating: number | null;
  address: string | null;
  profile_picture: string | null;
  district: number | null;
  status: number | null;
  is_deleted: number | null;
  role: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  password?: string; // Sensitive backend response field; never expose in UI/state.
};

type MemberDetails = {
  id: number;
  user_id: string | null;
  chess_dot_com_username: string | null;
  lichess_username: string | null;
  lichess_classical_rating: number | null;
  lichess_rapid_rating: number | null;
  lichess_blitz_rating: number | null;
  lichess_bullet_rating: number | null;
  chess_dot_com_bullet_rating: number | null;
  chess_dot_com_blitz_rating: number | null;
  chess_dot_com_rapid_rating: number | null;
  fide_standard_rating: number | null;
  fide_rapid_rating: number | null;
  fide_blitz_rating: number | null;
  chess_dot_com_info: unknown | null;
  lichess_info: unknown | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Venue = {
  id: number;
  name: string | null;
  address: string | null;
  google_map_link: string | null;
  district: number | null;
  latitude: string | null;
  longtude: string | null;
  commission: number;
  can_change_price_per_min: number | null;
  pricing_method: string | null;
  price_per_min: number | null;
  status: number | null;
  is_deleted: number | null;
  vendor_id: number | null;
  responsible_person: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type VenueTable = {
  id: number;
  venue_id: number | null;
  name: string | null;
  status: number | null;
  ideal_player: string | null;
  ideal_player_color: "white" | "black" | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  is_available?: boolean;
};

type MatchHistory = {
  id: number;
  user_id: string | null;
  started_at: string | Date | null;
  game_end_at: string | Date | null;
  time_in_min: number | null;
  price_per_min: number | null;
  white_player_id: string | null;
  black_player_id: string | null;
  winner_id: string | null;
  venue_id: number | null;
  table_id: number | null;
  status: string | null;
  is_loser_approved: number | null;
  commission_percent: number | null;
  commission_amount: number | null;
  venue_fee: number | null;
  pricing_method: string | null;
  is_club_paid: number | null;
  invoice_id: number | null;
  ideal_player_color: "white" | "black" | null;
  cancellation_reason: number | null;
  log_details: unknown | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type BrilliantMoveSubmission = {
  id: number;
  user_id: string | null;
  platform: string | null;
  move_url: string | null;
  admin_vote: number | null;
  week_number: number | null;
  rank: number | null;
  is_awarded: number | null;
  is_deleted: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  vote_count?: number;
  admin_vote_weighted?: number;
  weighted_vote_count?: number;
};

type MembershipTier = {
  id: number;
  name: string;
  price: number;
  duration_days: number | null;
};
type Invoice = {
  id: number;
  payment_type: string;
  paid_in_date: string | Date | null;
  total_min: number;
  paid_in_amount: number;
  payment_status: string | null;
  payment_method: string | null;
  payment_proof_url: string | null;
  member_id: string | null;
  venue_id: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};
```

## Statuses and validation details

- Member/member-status fields are integers/nullable integers; no canonical member status enum is defined in the schema.
- Venue and table active status is `1`; inactive status is `0`. Venue soft deletion uses `is_deleted === 1`.
- Match statuses observed include `pending_start`, `started`, and `awaiting_loser_confirmation`; end/cancellation strings and all transition rules should be treated as backend-owned.
- Brilliant moves use integer ISO week numbers (`week_number`), optional admin vote/rank, and integer `is_awarded`; the app should not invent prize values or a leaderboard.
- Membership tier price is a non-negative integer; duration, when supplied, is positive days. Payment proof is a URL. The backend does not define an event or tournament registration status.
- No API response is paginated. Lookup and list responses use complete `data` arrays.

## Uploads, money, and dates

- No multipart/file upload middleware or avatar upload endpoint was found. `profile_picture` and `payment_proof_url` are plain strings; payment proof is Zod-validated as a URL. Do not offer file upload UI without a backend endpoint.
- Integer prices/amounts are stored as ETB-style values in membership and match billing data; no tournament entry price endpoint exists.
- Times are database timestamps. Use `Africa/Addis_Ababa` for user-facing dates unless a response already supplies a localized display string.

## Feature scope

Supported member-facing flows: registration and login, own-profile read/update, linking Chess.com/Lichess accounts, active venue and live-table discovery, joining/leaving tables and submitting/confirming match results, brilliant-move submission/voting, membership tiers and membership invoice/payment-proof submission.

Not available in backend:

- Events/tournaments, event details, registration/cancellation, event capacity, event fees, and member event history.
- Dedicated venue detail endpoint, venue photo/gallery, amenities, opening hours, venue event list, venue search/filter.
- Dedicated current-member match-history endpoint, profile aggregate stats, rankings/leaderboard, achievements, or prize/challenge registration. Brilliant moves are supported, but are move submissions/votes rather than prize challenges.
- Notifications/preferences, password reset, verification, and avatar/file uploads.
- Membership invoice listing/status history for a member.

## Open questions / gaps

- `GET /api/members/me` and public member registration return raw member records; current code does not strip the password hash. Frontend types must mark the field sensitive and app code must not display/cache it. Backend response sanitization is recommended.
- `requireAuth` verifies any role, and the `/me`, venues, match mutation, and brilliant-move routes do not consistently enforce the `member` role. Backend authorization should be reviewed before treating these routes as member-only.
- `POST /api/matches/venues`-related public discovery includes venue/table data, but public availability is not consistently aligned with authenticated `/api/venues`; confirm intended access policy.
- Registration allows optional name and several server-managed properties. Confirm required onboarding fields, phone normalization/uniqueness behavior, and whether the public register response can be sanitized.
- The member update schema is passthrough and allows fields such as `status`, `chat_id`, and rating to be changed by the user. Only send clearly user-editable profile fields; backend should enforce allowed fields.
- Profile picture and payment-proof URLs have no upload flow or documented host restrictions.
- Lookup route's set of available `type` values is defined in implementation, not API documentation; verify district lookup behavior before using it in onboarding.
- No browser-compatible event/tournament system, payment for event entry, or registration lifecycle is implemented.
