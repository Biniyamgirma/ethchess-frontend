"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  ChessKnight,
  ExternalLink,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getAdminMemberDetails } from "@/lib/api/members";
import { MEMBER_STATUS, type AdminMemberDetails } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  return String(value);
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/60 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">
        {displayValue(value)}
      </dd>
    </div>
  );
}

function RatingCard({
  title,
  username,
  ratings,
}: {
  title: string;
  username: string | null;
  ratings: { label: string; value: number | null }[];
}) {
  return (
    <section className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading font-semibold">{title}</h3>
        {username ? (
          <Badge variant="secondary" className="max-w-40 truncate">
            @{username}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Not linked</span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ratings.map((rating) => (
          <ProfileField
            key={rating.label}
            label={rating.label}
            value={rating.value}
          />
        ))}
      </dl>
    </section>
  );
}

function ExternalProfileData({
  label,
  data,
}: {
  label: string;
  data: Record<string, unknown> | null;
}) {
  if (!data) return null;
  return (
    <details className="group rounded-xl border p-4">
      <summary className="cursor-pointer list-none font-heading text-sm font-semibold marker:hidden">
        <span className="flex items-center justify-between">
          {label} profile data
          <span className="text-xs font-normal text-muted-foreground group-open:hidden">
            Show
          </span>
          <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
            Hide
          </span>
        </span>
      </summary>
      <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

function MemberProfile({ member }: { member: AdminMemberDetails }) {
  const fullName = `${member.f_name ?? ""} ${member.l_name ?? ""}`.trim();
  const official = member.is_member === 1;
  const status = member.is_deleted
    ? "Deleted"
    : member.status === MEMBER_STATUS.blocked
      ? "Blocked"
      : member.status === MEMBER_STATUS.pending
        ? "Pending"
        : "Active";
  const details = member.details;

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          <AvatarImage
            src={member.profile_picture ?? undefined}
            alt={fullName}
          />
          <AvatarFallback className="bg-primary/10 font-heading text-lg font-bold text-primary">
            {member.f_name?.slice(0, 1) ?? "?"}
            {member.l_name?.slice(0, 1) ?? ""}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 font-heading text-xl font-bold">
            {fullName || "EthChess player"}
            {official ? (
              <span
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-sky-400"
                aria-label="Verified official member"
                title="Verified official member"
              >
                <BadgeCheck className="size-5 fill-sky-500/15" />
                <span className="sr-only">Official member</span>
              </span>
            ) : null}
          </h2>
          <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
            {member.id}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={status === "Active" ? "default" : "secondary"}>
              {status}
            </Badge>
            {official ? (
              <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <BadgeCheck data-icon="inline-start" />
                Official member
              </Badge>
            ) : null}
            {member.member_title ? (
              <Badge variant="outline">{member.member_title}</Badge>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 font-heading font-semibold">
          <UserRound className="size-4 text-primary" />
          Member information
        </h3>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ProfileField label="Phone" value={member.phone} />
          <ProfileField label="Telegram" value={member.telegram_username} />
          <ProfileField label="District" value={member.district_name} />
          <ProfileField label="Address" value={member.address} />
          <ProfileField label="Club rating" value={member.eth_chess_rating} />
          <ProfileField label="Trophy" value={member.trophy} />
          <ProfileField label="Role" value={member.role} />
          <ProfileField
            label="Joined"
            value={
              member.createdAt
                ? new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(member.createdAt))
                : null
            }
          />
        </dl>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 font-heading font-semibold">
          <ChessKnight className="size-4 text-primary" />
          Chess profiles &amp; ratings
        </h3>
        {details ? (
          <div className="space-y-3">
            <RatingCard
              title="Chess.com"
              username={details.chess_dot_com_username}
              ratings={[
                { label: "Bullet", value: details.chess_dot_com_bullet_rating },
                { label: "Blitz", value: details.chess_dot_com_blitz_rating },
                { label: "Rapid", value: details.chess_dot_com_rapid_rating },
              ]}
            />
            <RatingCard
              title="Lichess"
              username={details.lichess_username}
              ratings={[
                { label: "Bullet", value: details.lichess_bullet_rating },
                { label: "Blitz", value: details.lichess_blitz_rating },
                { label: "Rapid", value: details.lichess_rapid_rating },
                { label: "Classical", value: details.lichess_classical_rating },
              ]}
            />
            <div className="rounded-xl border p-4">
              <h4 className="font-heading text-sm font-semibold">
                FIDE ratings
              </h4>
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <ProfileField
                  label="Standard"
                  value={details.fide_standard_rating}
                />
                <ProfileField label="Rapid" value={details.fide_rapid_rating} />
                <ProfileField label="Blitz" value={details.fide_blitz_rating} />
              </dl>
            </div>
            <ExternalProfileData
              label="Chess.com"
              data={details.chess_dot_com_info}
            />
            <ExternalProfileData label="Lichess" data={details.lichess_info} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
            No linked chess profile details have been added yet.
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        Private member information is available to administrators with role
        level above 5.
      </p>
      {details?.chess_dot_com_username ? (
        <a
          href={`https://www.chess.com/member/${encodeURIComponent(details.chess_dot_com_username)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Open Chess.com profile <ExternalLink className="size-3" />
        </a>
      ) : null}
    </div>
  );
}

export function MemberDetailsDialog({
  memberId,
  open,
  onOpenChange,
}: {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const details = useQuery({
    queryKey: ["admin-member-details", memberId],
    queryFn: () => getAdminMemberDetails(memberId!),
    enabled: open && memberId !== null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-3xl gap-0 overflow-y-auto p-0">
        <div className="bg-[#080808] px-5 py-5 text-[#FFFCF1] sm:px-6">
          <DialogHeader className="pr-8">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              EthChess member profile
            </p>
            <DialogTitle className="mt-1 text-xl">Member details</DialogTitle>
            <DialogDescription className="text-[#FFFCF1]/65">
              Profile, official membership, and connected chess accounts.
            </DialogDescription>
          </DialogHeader>
        </div>

        {details.isPending ? (
          <div className="space-y-4 p-5 sm:p-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : details.isError ? (
          <div
            role="alert"
            className="m-5 rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm"
          >
            Could not load member details: {details.error.message}
          </div>
        ) : (
          <MemberProfile member={details.data} />
        )}
      </DialogContent>
    </Dialog>
  );
}
