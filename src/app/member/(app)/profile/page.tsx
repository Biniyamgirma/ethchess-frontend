"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Link2,
  MapPin,
  UserRound,
} from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MemberHero } from "@/components/layout/member-shell";
import { MemberError, MemberLoading } from "@/components/shared/member-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLinkChessAccounts,
  useMemberMatchHistory,
  useMemberProfile,
  useUpdateMemberProfile,
} from "@/hooks/use-member-data";

const profileSchema = z.object({
  f_name: z.string().trim().min(1, "Add your first name."),
  l_name: z.string().trim().min(1, "Add your last name."),
  phone: z.string().trim().min(5, "Enter a valid phone number."),
  address: z.string(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const accountSchema = z
  .object({
    chessDotComUsername: z.string().trim().optional(),
    lichessUsername: z.string().trim().optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.chessDotComUsername && value.chessDotComUsername.length >= 2,
      ) || Boolean(value.lichessUsername && value.lichessUsername.length >= 2),
    {
      message: "Add a Chess.com or Lichess username to link.",
      path: ["chessDotComUsername"],
    },
  );
type AccountValues = z.infer<typeof accountSchema>;

export default function MemberProfilePage() {
  const profile = useMemberProfile();
  const matchHistory = useMemberMatchHistory();
  const update = useUpdateMemberProfile();
  const linkAccounts = useLinkChessAccounts();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });
  const accountForm = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    if (!profile.data) return;
    reset({
      f_name: profile.data.f_name ?? "",
      l_name: profile.data.l_name ?? "",
      phone: profile.data.phone ?? "",
      address: profile.data.address ?? "",
    });
  }, [profile.data, reset]);

  if (profile.isLoading)
    return <MemberLoading label="Bringing up your profile..." />;
  if (profile.isError) return <MemberError message={profile.error.message} />;
  if (!profile.data) return null;

  const initials =
    `${profile.data.f_name?.[0] ?? ""}${profile.data.l_name?.[0] ?? ""}` ||
    "EC";
  const joined = new Intl.DateTimeFormat("en-ET", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(profile.data.createdAt));

  return (
    <>
      <MemberHero
        eyebrow="Your corner of the club"
        title="This is your board."
        description="Keep your details up to date and link your chess accounts when you're ready."
      />
      <div className="mb-8 flex items-center gap-4 rounded-2xl border bg-card p-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
          {initials}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-heading text-lg font-bold">
            {[profile.data.f_name, profile.data.l_name]
              .filter(Boolean)
              .join(" ") || "EthChess member"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Member since {joined}
          </p>
        </div>
        {profile.data.eth_chess_rating !== null ? (
          <div className="ml-auto text-right">
            <p className="font-heading text-2xl font-bold">
              {profile.data.eth_chess_rating}
            </p>
            <p className="text-xs text-muted-foreground">EthChess rating</p>
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="details" className="gap-6">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="details" className="px-4 py-2">
            Profile
          </TabsTrigger>
          <TabsTrigger value="match-history" className="px-4 py-2">
            Match history
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardContent className="p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <UserRound className="size-5 text-primary" />
                  <h2 className="font-heading text-lg font-bold">
                    Your details
                  </h2>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={handleSubmit((values) => update.mutate(values))}
                >
                  <ProfileField
                    id="profile-first-name"
                    label="First name"
                    error={errors.f_name?.message}
                    {...register("f_name")}
                  />
                  <ProfileField
                    id="profile-last-name"
                    label="Last name"
                    error={errors.l_name?.message}
                    {...register("l_name")}
                  />
                  <ProfileField
                    id="profile-phone"
                    label="Phone number"
                    error={errors.phone?.message}
                    inputMode="tel"
                    {...register("phone")}
                  />
                  <ProfileField
                    id="profile-address"
                    label="Address"
                    error={errors.address?.message}
                    {...register("address")}
                  />
                  <Button
                    type="submit"
                    className="min-h-11"
                    disabled={update.isPending}
                  >
                    {update.isPending ? "Saving..." : "Save changes"}
                    {!update.isPending ? <ArrowUpRight /> : null}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-5 sm:p-7">
                <div className="mb-2 flex items-center gap-3">
                  <Link2 className="size-5 text-primary" />
                  <h2 className="font-heading text-lg font-bold">
                    Bring your chess accounts
                  </h2>
                </div>
                <p className="mb-5 text-sm leading-6 text-muted-foreground">
                  Link Chess.com or Lichess to sync the profile details
                  available from those sites.
                </p>
                <form
                  className="space-y-4"
                  onSubmit={accountForm.handleSubmit((values) =>
                    linkAccounts.mutate({
                      ...(values.chessDotComUsername?.trim()
                        ? {
                            chessDotComUsername:
                              values.chessDotComUsername.trim(),
                          }
                        : {}),
                      ...(values.lichessUsername?.trim()
                        ? { lichessUsername: values.lichessUsername.trim() }
                        : {}),
                    }),
                  )}
                >
                  <ProfileField
                    id="chess-com-username"
                    label="Chess.com username"
                    error={
                      accountForm.formState.errors.chessDotComUsername?.message
                    }
                    {...accountForm.register("chessDotComUsername")}
                  />
                  <ProfileField
                    id="lichess-username"
                    label="Lichess username"
                    error={
                      accountForm.formState.errors.lichessUsername?.message
                    }
                    {...accountForm.register("lichessUsername")}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="min-h-11"
                    disabled={linkAccounts.isPending}
                  >
                    {linkAccounts.isPending ? "Linking..." : "Link accounts"}
                    {!linkAccounts.isPending ? <ArrowUpRight /> : null}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="match-history">
          {matchHistory.isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading your match history...
            </p>
          ) : matchHistory.isError ? (
            <p
              role="alert"
              className="py-10 text-center text-sm text-destructive"
            >
              {matchHistory.error.message}
            </p>
          ) : matchHistory.data?.length ? (
            <div className="space-y-3">
              {matchHistory.data.map((match) => (
                <Card
                  key={match.id}
                  className={
                    match.result === "won"
                      ? "border-green-500/30 bg-green-500/5 shadow-none"
                      : "border-red-500/30 bg-red-500/5 shadow-none"
                  }
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                      <p
                        className={`font-heading font-bold ${
                          match.result === "won"
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 dark:text-red-400"
                        }`}
                      >
                        {match.result === "won" ? "Victory" : "Defeat"}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {match.white_player_name}{" "}
                        <span className="text-muted-foreground">vs</span>{" "}
                        {match.black_player_name}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-5">
                      <p className="flex items-center gap-2">
                        <Clock3 className="size-4 shrink-0" />
                        {match.total_minutes}{" "}
                        {match.total_minutes === 1 ? "minute" : "minutes"}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        {match.venue_name}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarClock className="size-4 shrink-0" />
                        {formatMatchDate(match.started_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              You do not have any completed matches yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function formatMatchDate(value: string | null) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

const ProfileField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label: string;
    error?: string;
  }
>(function ProfileField({ id, label, error, ...props }, ref) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-heading text-sm font-semibold">
        {label}
      </label>
      <Input
        id={id}
        ref={ref}
        className="h-11"
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
});
