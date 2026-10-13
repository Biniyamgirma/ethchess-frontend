import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function MemberAuthFrame({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#080808] p-10 text-[#FFFCF1] lg:flex lg:flex-col lg:justify-between xl:p-16">
        <Link href="/member/home" className="relative z-10 w-fit">
          <Image
            src="/brand/logo-white.svg"
            alt="EthChess™"
            width={160}
            height={32}
            priority
          />
        </Link>
        <div className="relative z-10 max-w-xl py-12">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Ethiopia&apos;s youth chess community
          </p>
          <h1 className="mt-6 font-heading text-5xl font-bold leading-[1.04] tracking-tight xl:text-7xl">
            PLAY.
            <br />
            ENJOY.
            <br />
            <span className="text-primary">REPEAT.</span>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/60">
            One community. A thousand ways to play. Find your people at the
            board.
          </p>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-8 size-12 text-primary"
            strokeWidth={1.5}
          />
        </div>
        <p className="relative z-10 border-t border-white/15 pt-5 font-heading text-xs font-semibold tracking-[0.16em] text-white/55">
          YOUR MOVE. YOUR COMMUNITY.
        </p>
        <div
          aria-hidden="true"
          className="absolute -bottom-44 -right-40 size-[28rem] rounded-full border border-primary/20"
        />
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Logo variant="icon" />
            <span className="font-heading text-[10px] font-bold tracking-[0.16em] text-muted-foreground">
              ETHCHESS MEMBERS
            </span>
          </div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {children}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
