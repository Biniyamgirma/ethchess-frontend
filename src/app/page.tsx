import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-[#080808] p-7 text-[#FFFCF1] sm:p-12 xl:p-16">
        <Image
          src="/brand/logo-white.svg"
          alt="EthChess™"
          width={164}
          height={34}
          style={{ height: "auto" }}
          priority
        />
        <div className="relative z-10 max-w-xl py-20">
          <p className="mb-5 font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Ethiopia’s youth chess community
          </p>
          <h1 className="font-heading text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            A new generation
            <br />
            is making its
            <br />
            <span className="text-primary">move.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#FFFCF1]/65">
            A place for young players to learn, connect and enjoy the game.
            We’re building something bigger around every board.
          </p>
          <Link href="/login" className="mt-8 inline-flex">
            <Button size="lg" className="h-12 px-5">
              Admin sign in <ArrowUpRight />
            </Button>
          </Link>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/50">
          <span>ETHIOPIA · ETHCHESS</span>
          <span className="font-heading font-bold tracking-[0.14em] text-white/75">
            PLAY. ENJOY. REPEAT.
          </span>
        </div>
        <div
          aria-hidden
          className="absolute -bottom-36 -right-32 size-[28rem] rounded-full border border-primary/25"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -right-16 size-[21rem] rounded-full border border-primary/20"
        />
        <ArrowUpRight
          aria-hidden
          className="absolute bottom-36 right-28 size-16 text-primary/35"
        />
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-16 sm:px-10">
        <div className="max-w-md">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The club is yours
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            More than a game.
            <br />A community in motion.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            From neighborhood venues to the next tournament, EthChess makes room
            for every young mind at the board.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              "Find a welcoming place to play",
              "Meet players and make new friends",
              "Learn, compete and grow together",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <MoveRight className="size-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
