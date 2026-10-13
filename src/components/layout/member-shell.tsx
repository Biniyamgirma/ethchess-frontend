"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Compass,
  Crown,
  DoorOpen,
  House,
  MapPin,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMemberLogout } from "@/hooks/use-member-data";
import { useMemberSession } from "@/hooks/use-member-session";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/member/home", label: "Home", mobileLabel: "Home", icon: House },
  {
    href: "/member/venues",
    label: "Find a board",
    mobileLabel: "Venues",
    icon: MapPin,
  },
  {
    href: "/member/brilliant-moves",
    label: "Brilliant moves",
    mobileLabel: "Moves",
    icon: Crown,
  },
  {
    href: "/member/profile",
    label: "Profile",
    mobileLabel: "Profile",
    icon: UserRound,
  },
];

export function MemberShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useMemberSession();
  const logout = useMemberLogout();

  return (
    <div className="min-h-svh bg-background md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-[#080808] px-4 py-6 text-[#FFFCF1] md:flex">
        <Link href="/member/home" className="mb-10 flex items-center px-3">
          <Image
            src="/brand/logo-white.svg"
            alt="EthChess™"
            width={160}
            height={32}
            priority
          />
        </Link>
        <nav aria-label="Member navigation" className="flex-1 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/member/home" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 font-heading text-sm font-semibold transition-colors hover:bg-white/10",
                  active && "bg-primary text-white hover:bg-primary",
                )}
              >
                <Icon className="size-4" />
                {label}
                {active ? <ArrowUpRight className="ml-auto size-4" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-white/15 p-3">
          <p className="truncate font-heading text-sm font-semibold">
            {session?.name || "Welcome to the board"}
          </p>
          <p className="mt-1 text-xs text-white/55">PLAY. ENJOY. REPEAT.</p>
          <div className="mt-3 flex items-center justify-between">
            <ThemeToggle />
            {session ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#FFFCF1] hover:bg-white/10 hover:text-white"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <DoorOpen />
                Log out
              </Button>
            ) : (
              <Link
                href="/member/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-[#FFFCF1] hover:bg-white/10 hover:text-white",
                )}
              >
                Sign in <ArrowUpRight />
              </Link>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6 md:px-8">
          <Link
            href="/member/home"
            className="md:hidden"
            aria-label="EthChess home"
          >
            <Image
              src="/brand/logo-icon.svg"
              alt="EthChess"
              width={38}
              height={38}
              priority
            />
          </Link>
          <p className="hidden font-heading text-xs font-bold tracking-[0.14em] text-muted-foreground md:block">
            ETHIOPIA · THE BOARD IS YOURS
          </p>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden max-w-40 truncate text-sm sm:inline">
              {session?.name || "EthChess member"}
            </span>
            <ThemeToggle className="md:hidden" />
            <Link href="/member/profile" aria-label="Your profile">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-5" />
              </span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-10 md:pt-9">
          {children}
        </main>
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex max-w-lg items-center justify-around">
            {navigation.map(({ href, mobileLabel, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/member/home" && pathname.startsWith(`${href}/`));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 text-muted-foreground",
                      active && "text-primary",
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="font-heading text-[10px] font-semibold">
                      {mobileLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function MemberHero({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="relative mb-9 overflow-hidden rounded-3xl bg-[#080808] p-6 text-[#FFFCF1] sm:p-10 lg:p-12">
      <div className="relative z-10 max-w-3xl">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
      <Compass
        aria-hidden="true"
        className="absolute -bottom-9 -right-6 size-36 rotate-12 text-primary/15 sm:right-6 sm:size-52"
        strokeWidth={0.8}
      />
    </section>
  );
}
