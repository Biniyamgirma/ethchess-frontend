# EthChess backend routes reference

This is a route-by-route reference transcribed from `ethchess-backend/src/server.ts`, its route modules, validators, controllers, and services. It is intended to be a reusable frontend integration reference. Backend source is read-only for this project.

## Conventions

- Backend origin is configured by `PORT` (default `4000`). Resource paths below include the `/api` prefix. The health endpoint is `/health`.
- JSON success responses generally use `{ success: true, message?: string, data: ... }`. Login responses use `{ success: true, message, data: { user } }`. Logout returns a success/message envelope.
- Errors generally use `{ success: false, message, ... }`; Zod errors use `{ success: false, message: "Validation failed", errors }`.
- There is no shared list pagination, sorting, or search query convention; list routes return arrays.
- Browser JWT authentication uses the HttpOnly `token` cookie; frontend requests need credentials enabled. `requireAuth` accepts a valid token but does not enforce a role by itself. Where route middleware adds role checks, they are called out below.
- `BOT` means the `x-ethchess-bot-secret` header, checked against `TELEGRAM_BOT_API_SECRET`. Some bot routes additionally require a linked Telegram member or venue owner.
- Parameter IDs are generally positive integers. JSON property names and enums below preserve backend casing.
- `VALIDATION` refers to the named Zod schema in `ethchess-backend/src/validators/`; validation failures use the standard error envelope.

## Health

| Method | Path      | Access | Request | Response / notes                  |
| ------ | --------- | ------ | ------- | --------------------------------- |
| GET    | `/health` | Public | None    | `{ success, message, timestamp }` |

## Authentication — `/api/auth`

| Method | Path                             | Access | Request                                                                                                                                              | Response / notes                                        |
| ------ | -------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| POST   | `/api/auth/login`                | Public | `{ identifier, password, role }`; role is `admin`, `vendor`, or `member`; password min 8. `authLoginSchema`                                          | Sets HttpOnly token cookie; returns authenticated user. |
| POST   | `/api/auth/login/phone`          | Public | `{ phone, password }`; password min 8. `phoneLoginSchema`                                                                                            | Sets HttpOnly token cookie; member phone login.         |
| POST   | `/api/auth/telegram/link`        | Public | `{ password, chatId, phone? , identifier? , telegramUsername? }`; exactly one of `phone`/`identifier`; numeric-string `chatId`. `telegramLinkSchema` | Links an account to Telegram; response from controller. |
| POST   | `/api/auth/telegram/vendor-link` | Public | `{ phone, password, chatId, telegramUsername? }`; `chatId` string or integer. `telegramVendorLinkSchema`                                             | Vendor Telegram account link; response from controller. |
| POST   | `/api/auth/logout`               | Public | Optional empty body. `authLogoutSchema`                                                                                                              | Clears token cookie.                                    |

## Admins — `/api/admins`

| Method | Path                    | Access                              | Request                                                                                                                               | Response / notes                                                                                                            |
| ------ | ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/admins/login`     | Public                              | `{ f_name, password }`; `f_name` nonempty; password min 8. `adminLoginSchema`                                                         | Sets HttpOnly token cookie; returns `{ data: { user } }`. This is the admin login endpoint used by the frontend login form. |
| POST   | `/api/admins/register`  | Authenticated admin, role level > 6 | `{ f_name, password, role }`; optional `l_name`. `adminRegisterSchema`                                                                | Creates admin.                                                                                                              |
| PATCH  | `/api/admins/:id`       | Authenticated admin, role level > 6 | Positive ID; optional `f_name`, `l_name`, `password`, `status`, `role`; at least one field. `adminRoleIdSchema` + `adminUpdateSchema` | Updates admin details.                                                                                                      |
| POST   | `/api/admins/roles`     | Authenticated admin, role level > 6 | `{ name }`; optional `status`. `adminRoleCreateSchema`                                                                                | Creates admin role.                                                                                                         |
| PATCH  | `/api/admins/roles/:id` | Authenticated admin, role level > 6 | Positive ID; `name?`, `status?`, at least one. `adminRoleUpdateSchema`                                                                | Updates admin role.                                                                                                         |
| DELETE | `/api/admins/roles/:id` | Authenticated admin, role level > 6 | Positive integer `id`                                                                                                                 | Deletes admin role; returns conflict if assigned to admins/vendors.                                                         |
| GET    | `/api/admins/roles`     | Public                              | None                                                                                                                                  | Returns active roles (`status: "1"`).                                                                                       |

## Members — `/api/members`

| Method | Path                             | Access                       | Request                                                                                                                                                                                                                                                          | Response / notes                                              |
| ------ | -------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| POST   | `/api/members/register`          | Public                       | `{ phone, password }` required; optional `id`, `f_name`, `l_name`, `chat_id`, `telegram_username`, `trophy`, `member_title`, `eth_chess_rating`, `address`, `profile_picture`, `district`, `status`, `role`. Phone min 9; password min 8. `memberRegisterSchema` | Creates a member but does not create a login session.         |
| GET    | `/api/members/me`                | Authenticated                | None                                                                                                                                                                                                                                                             | Current member profile.                                       |
| PUT    | `/api/members/me`                | Authenticated                | Optional member profile fields: `f_name`, `l_name`, `chat_id`, `phone`, `telegram_username`, `trophy`, `member_title`, `eth_chess_rating`, `password`, `address`, `profile_picture`, `district`, `status`. `memberUpdateSchema`                                  | Updates current member profile.                               |
| PATCH  | `/api/members/me/link-accounts`  | Authenticated                | `memberSyncSchema` body                                                                                                                                                                                                                                          | Syncs/links external accounts for current member.             |
| GET    | `/api/members`                   | Authenticated admin          | None                                                                                                                                                                                                                                                             | Lists members; no pagination convention.                      |
| GET    | `/api/members/:id`               | Authenticated                | `:id`; no route-level validator                                                                                                                                                                                                                                  | Reads member details; route does not add an admin-role check. |
| PATCH  | `/api/members/:id`               | Authenticated admin          | `:id` + `adminMemberUpdateSchema`                                                                                                                                                                                                                                | Updates member.                                               |
| DELETE | `/api/members/:id`               | Authenticated admin          | `:id`; no route-level validator                                                                                                                                                                                                                                  | Soft-deletes member.                                          |
| POST   | `/api/members/bot/register`      | BOT                          | `{ chat_id, f_name, phone, password, address, district }` required; optional `l_name`, `telegram_username`. Additional bounds/patterns in `telegramMemberRegisterSchema`.                                                                                        | Registers a Telegram member.                                  |
| POST   | `/api/members/bot/profile`       | BOT + linked Telegram member | `telegramMemberProfileSchema` body, including `chat_id`                                                                                                                                                                                                          | Reads Telegram member profile.                                |
| POST   | `/api/members/bot/link-chesscom` | BOT + linked Telegram member | `telegramChessComLinkSchema` body, including `chat_id`                                                                                                                                                                                                           | Links Chess.com account.                                      |

> Member route access is not uniformly constrained to the `member` JWT role. Do not treat successful generic authentication as proof of member role.

## Brilliant moves — `/api/brilliant-moves`

| Method | Path                                      | Access                       | Request                                                                                                                                    | Response / notes                             |
| ------ | ----------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| POST   | `/api/brilliant-moves/submit`             | Authenticated                | `{ move_url?, platform? }`; at least one must be provided; URL must be valid when present. `brilliantMoveSubmissionSchema`                 | Submits a move.                              |
| PATCH  | `/api/brilliant-moves/:id`                | Authenticated                | `:id` + same optional `{ move_url?, platform? }` body. `brilliantMoveSubmissionSchema`                                                     | Edits submission.                            |
| GET    | `/api/brilliant-moves`                    | Authenticated                | None                                                                                                                                       | Lists brilliant moves; no common pagination. |
| PATCH  | `/api/brilliant-moves/:id/admin-vote`     | Authenticated admin          | `:id` + optional `{ vote?, vote_type? }`; vote must be 0–5 if provided; type is `upvote`, `downvote`, or `star`. `brilliantMoveVoteSchema` | Admin voting action.                         |
| PATCH  | `/api/brilliant-moves/:id/rank-and-award` | Authenticated admin          | `:id`; no route-level validator                                                                                                            | Updates move rank/award.                     |
| POST   | `/api/brilliant-moves/:id/vote`           | Authenticated                | `:id` + optional `{ vote?, vote_type? }`; same constraints as admin vote                                                                   | Votes on a move.                             |
| POST   | `/api/brilliant-moves/bot/submit`         | BOT + linked Telegram member | `{ chat_id, move_url }`; URL trimmed, nonempty, max 2048 and valid URL. `telegramBrilliantMoveSubmissionSchema`                            | Submits a move through Telegram.             |
| POST   | `/api/brilliant-moves/bot/week`           | BOT + linked Telegram member | `{ chat_id }`. `telegramBrilliantMoveRequestSchema`                                                                                        | Lists weekly moves for Telegram.             |
| POST   | `/api/brilliant-moves/bot/:id/vote`       | BOT + linked Telegram member | `{ chat_id }` + positive integer `:id`. `telegramBrilliantMoveIdSchema`                                                                    | Votes through Telegram.                      |

## Venues — `/api/venues`

All routes in this router require authentication.

| Method | Path              | Access                              | Request                                                                                                                                                                                                                                               | Response / notes                                             |
| ------ | ----------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/api/venues`     | Authenticated                       | None                                                                                                                                                                                                                                                  | Returns venues.                                              |
| POST   | `/api/venues`     | Authenticated admin, role level > 6 | Venue create body: `commission` integer (required); optional `name`, `can_change_price_per_min`, `vendor_id`, `address`, `pricing_method`, `responsible_person`, `google_map_link`, `district`, `longtude`, `latitude`, `status`. `venueCreateSchema` | Creates venue. Note backend property spelling is `longtude`. |
| PATCH  | `/api/venues/:id` | Authenticated admin, role level > 6 | Venue ID and body as consumed by controller (no route-level validator)                                                                                                                                                                                | Updates venue.                                               |

## Vendors — `/api/vendors`

| Method | Path               | Access                              | Request                                                                                                                                                                                   | Response / notes                |
| ------ | ------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| POST   | `/api/vendors`     | Authenticated admin, role level > 6 | Vendor create body: optional `f_name`, `l_name`, `venue_id`, `role`, `phone_number`, `email`, `telegram_username`, `whats_up_username`; required `password` (min 8). `vendorCreateSchema` | Creates vendor.                 |
| PUT    | `/api/vendors/me`  | Authenticated vendor                | Vendor update fields; optional `f_name`, `l_name`, `venue_id`, `password` (min 8), `phone_number`, `email`, `telegram_username`, `whats_up_username`. `vendorUpdateSchema`                | Updates current vendor profile. |
| PATCH  | `/api/vendors/:id` | Authenticated admin, role level > 6 | Vendor ID and vendor update fields, including optional `role`. `adminVendorUpdateSchema`                                                                                                  | Updates vendor.                 |

## Subscriptions — `/api/subscriptions`

All routes in this router require authentication. The tier mutations use `requireAdminLevel`; invoice handlers may perform additional service-level checks.

| Method | Path                                      | Access                              | Request                                                                                                                  | Response / notes              |
| ------ | ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| GET    | `/api/subscriptions/tiers`                | Authenticated                       | None                                                                                                                     | Lists membership tiers.       |
| POST   | `/api/subscriptions/tiers`                | Authenticated admin, role level > 6 | `{ name, price, duration_days? }`; price is nonnegative integer, duration positive integer. `membershipTierCreateSchema` | Creates tier.                 |
| PATCH  | `/api/subscriptions/tiers/:id`            | Authenticated admin, role level > 6 | Optional `{ name, price, duration_days }`; duration may be null. `membershipTierUpdateSchema`                            | Updates tier.                 |
| DELETE | `/api/subscriptions/tiers/:id`            | Authenticated admin, role level > 6 | Tier ID and `membershipTierUpdateSchema` (body fields optional)                                                          | Deletes tier.                 |
| POST   | `/api/subscriptions/invoices`             | Authenticated                       | `{ tier_id, payment_method? }`. `invoiceCreateSchema`                                                                    | Creates a membership invoice. |
| PATCH  | `/api/subscriptions/invoices/:id/proof`   | Authenticated                       | `{ payment_proof_url }` required URL; optional positive `paid_in_amount`, `payment_method`. `paymentProofSchema`         | Submits payment proof.        |
| POST   | `/api/subscriptions/invoices/:id/confirm` | Authenticated admin, role level > 3 | Invoice ID. `invoiceConfirmationSchema`                                                                                  | Confirms invoice/payment.     |

## Lookups — `/api/lookups`

| Method | Path                                | Access                              | Request                                                | Response / notes                                                |
| ------ | ----------------------------------- | ----------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| GET    | `/api/lookups/:type/active`         | Public                              | `type` is `district` or `cancellationReason`           | Lists active values.                                            |
| POST   | `/api/lookups/:type`                | Authenticated admin, role level > 5 | Optional `{ name }`. `lookupCreateSchema`              | Creates lookup.                                                 |
| PATCH  | `/api/lookups/:type/:id`            | Authenticated admin, role level > 5 | Optional `{ name }`; positive ID. `lookupUpdateSchema` | Updates lookup.                                                 |
| PATCH  | `/api/lookups/:type/:id/activate`   | Authenticated                       | Positive ID; type enum                                 | Activates lookup; route has no explicit admin-level middleware. |
| PATCH  | `/api/lookups/:type/:id/deactivate` | Authenticated admin, role level > 5 | Positive ID; type enum                                 | Deactivates lookup.                                             |

## Venue tables — `/api` mount

Every route requires authentication and `requireVenueTableAccess`: the venue's vendor owner or an admin whose role level is greater than 2.

| Method | Path                               | Access                                    | Request                                                                                          | Response / notes        |
| ------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| GET    | `/api/venues/:venueId/tables`      | Authenticated + `requireVenueTableAccess` | Positive venue ID                                                                                | Lists tables for venue. |
| POST   | `/api/venues/:venueId/tables`      | Authenticated + venue-table access        | `venueId` coerced to number; optional `{ name, status, ideal_player }`. `venueTableCreateSchema` | Creates table.          |
| PATCH  | `/api/venue-tables/:id`            | Authenticated + venue-table access        | `id` coerced to number; optional `{ name, status, ideal_player }`. `venueTableUpdateSchema`      | Updates table.          |
| DELETE | `/api/venue-tables/:id`            | Authenticated + venue-table access        | `:id`; no route-level validator                                                                  | Deletes table.          |
| PATCH  | `/api/venue-tables/:id/activate`   | Authenticated + venue-table access        | `:id`; no route-level validator                                                                  | Activates table.        |
| PATCH  | `/api/venue-tables/:id/deactivate` | Authenticated + venue-table access        | `:id`; no route-level validator                                                                  | Deactivates table.      |

## Matches — `/api/matches`

### Browser/member routes

| Method | Path                                  | Access        | Request                                                      | Response / notes             |
| ------ | ------------------------------------- | ------------- | ------------------------------------------------------------ | ---------------------------- |
| GET    | `/api/matches/venues`                 | Public        | None                                                         | Public venue discovery.      |
| GET    | `/api/matches/venues/:venueId/tables` | Public        | `:venueId`; no route-level validator                         | Public table discovery.      |
| POST   | `/api/matches/tables/:tableId/join`   | Authenticated | Optional `{ color: "white" \| "black" }`. `matchStartSchema` | Joins a table/match.         |
| POST   | `/api/matches/tables/:tableId/leave`  | Authenticated | Empty body. `leaveMatchTableSchema`                          | Leaves table/match.          |
| POST   | `/api/matches/tables/:tableId/start`  | Authenticated | Optional `{ color: "white" \| "black" }`. `matchStartSchema` | Starts match.                |
| POST   | `/api/matches/:id/end`                | Authenticated | `{ loser_user_id }`. `matchEndSchema`                        | Ends match.                  |
| POST   | `/api/matches/:id/confirm-loser`      | Authenticated | Match ID. `matchConfirmLoserSchema`                          | Confirms match loser/result. |

### Telegram bot routes

These routes are protected by the bot-secret middleware, and handlers may require a linked Telegram member (`chat_id`).

| Method | Path                                      | Access | Request                                                                                                                                                                                         | Response / notes           |
| ------ | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| GET    | `/api/matches/bot/account`                | BOT    | Validator expects `{ chat_id }` in request body, unusual for GET. Without that body, validation responds 400. If valid, there is no response controller and request falls through to not-found. |
| POST   | `/api/matches/bot/account`                | BOT    | `{ chat_id }`. `telegramBotAccountSchema`                                                                                                                                                       | Reads linked account.      |
| POST   | `/api/matches/bot/matches`                | BOT    | `{ chat_id }`                                                                                                                                                                                   | Lists bot-visible matches. |
| POST   | `/api/matches/bot/unlink`                 | BOT    | `{ chat_id }`                                                                                                                                                                                   | Unlinks Telegram account.  |
| POST   | `/api/matches/bot/venues`                 | BOT    | `{ chat_id }`                                                                                                                                                                                   | Lists bot-visible venues.  |
| POST   | `/api/matches/bot/venues/:venueId/tables` | BOT    | `{ chat_id }`; positive venue ID. `telegramBotVenueTablesSchema`                                                                                                                                | Lists venue tables.        |
| POST   | `/api/matches/bot/tables/:tableId/join`   | BOT    | `{ chat_id, color? }`; color may be `white`, `black`, or null. `telegramBotJoinSchema`                                                                                                          | Joins table.               |
| POST   | `/api/matches/bot/tables/:tableId/leave`  | BOT    | `{ chat_id }`. `telegramBotLeaveSchema`                                                                                                                                                         | Leaves table.              |
| POST   | `/api/matches/bot/:id/start`              | BOT    | `{ chat_id }`. `telegramBotMatchSchema`                                                                                                                                                         | Starts match.              |
| POST   | `/api/matches/bot/:id/end`                | BOT    | `{ chat_id, loser: "self" \| "opponent" }`. `telegramBotEndSchema`                                                                                                                              | Ends match.                |
| POST   | `/api/matches/bot/:id/confirm-loser`      | BOT    | `{ chat_id, token }`. `telegramBotConfirmSchema`                                                                                                                                                | Confirms loser.            |

## Match invoices — `/api/match-invoices`

Routes require authentication and billing access (`requireBillingAccess` permits admins/vendors, not members).

| Method | Path                             | Access                      | Request                                                                                                         | Response / notes        |
| ------ | -------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------- |
| POST   | `/api/match-invoices`            | Admin/vendor billing access | `{ member_id? , phone? , venue_id? }`; at least one of `member_id`/`phone` required. `matchInvoiceCreateSchema` | Creates match invoice.  |
| PATCH  | `/api/match-invoices/:id/status` | Admin/vendor billing access | `{ status: "paid" \| "canceled" }`. `matchInvoiceStatusSchema`                                                  | Updates invoice status. |

## Venue-owner bot — `/api/venue-owner-bot`

Every route requires the bot-secret header. `chat_id` is checked against a venue owner where applicable.

| Method | Path                                                              | Access | Request                                                                     | Response / notes                 |
| ------ | ----------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- | -------------------------------- |
| POST   | `/api/venue-owner-bot/venues`                                     | BOT    | `{ chat_id }`                                                               | Lists venues available to owner. |
| POST   | `/api/venue-owner-bot/venues/:venueId/tables/list`                | BOT    | `{ chat_id }`                                                               | Lists venue tables.              |
| POST   | `/api/venue-owner-bot/venues/:venueId/tables`                     | BOT    | `{ chat_id, name }`; trimmed nonempty name, max 80 chars                    | Creates table.                   |
| PATCH  | `/api/venue-owner-bot/venues/:venueId/tables/:tableId/activate`   | BOT    | `{ chat_id }`                                                               | Activates table.                 |
| PATCH  | `/api/venue-owner-bot/venues/:venueId/tables/:tableId/deactivate` | BOT    | `{ chat_id }`                                                               | Deactivates table.               |
| POST   | `/api/venue-owner-bot/venues/:venueId/invoices`                   | BOT    | `{ chat_id, member_id? , phone? }`; at least one member identifier required | Creates match invoice.           |
| PATCH  | `/api/venue-owner-bot/invoices/:id/status`                        | BOT    | `{ chat_id, status: "paid" \| "canceled" }`                                 | Updates invoice status.          |
| POST   | `/api/venue-owner-bot/venues/:venueId/matches`                    | BOT    | `{ chat_id }`                                                               | Lists venue matches.             |
| POST   | `/api/venue-owner-bot/venues/:venueId/matches/manual`             | BOT    | `{ chat_id, table_id, player_one, player_two }`                             | Starts manual match.             |
| POST   | `/api/venue-owner-bot/cancellation-reasons`                       | BOT    | `{ chat_id }`                                                               | Lists cancellation reasons.      |
| POST   | `/api/venue-owner-bot/matches/:id/cancel`                         | BOT    | `{ chat_id, cancellation_reason }`                                          | Cancels match.                   |

## Frontend member-app scope

The member UI currently uses the member-supported endpoints documented in [backend-analysis.md](./backend-analysis.md). Admin/vendor/bot routes above are recorded for future reference, not exposed as member-app actions. Do not infer unsupported features from a route name alone; confirm response fields and role behavior in its controller/service before adding a UI flow.

## Known gaps and cautions

- No OpenAPI/Swagger specification or Postman collection was found; route modules and validators are the source of truth.
- No common pagination, sorting, search, or filtering convention is implemented for list endpoints.
- `GET /api/matches/bot/account` appears registered but has no response handler and falls through to not-found.
- Authentication and role enforcement differ between route groups; use the concrete middleware chain rather than assuming all `/api` routes share one policy.
- For exact DTO and response fields, consult the route's controller/service and the corresponding model. Validators define accepted request fields but do not fully describe response shapes.
