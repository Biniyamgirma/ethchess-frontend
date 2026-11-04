import Link from "next/link";
import { ArrowLeft, ArrowUpRight, House } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-12">
      <section className="w-full max-w-lg text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          404 · Wrong turn
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The address may be outdated, or the page may have moved. Head back
          home and choose another route.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/" />}>
            <House /> Home
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Admin sign in <ArrowUpRight />
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/member/login" />}
          >
            <ArrowLeft /> Member sign in
          </Button>
        </div>
      </section>
    </main>
  );
}
