"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MemberErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center">
      <TriangleAlert className="size-8 text-[#E2725B]" />
      <p className="mt-5 font-heading text-xs font-bold uppercase tracking-[0.16em] text-[#E2725B]">
        A little plot twist
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">
        That page hit a snag.
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your moves are safe. Give it another try.
      </p>
      <Button className="mt-5 min-h-11" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
