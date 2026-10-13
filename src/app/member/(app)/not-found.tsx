import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MemberHero } from "@/components/layout/member-shell";
import { Button } from "@/components/ui/button";

export default function MemberNotFoundPage() {
  return (
    <div className="mx-auto max-w-4xl py-10">
      <MemberHero
        eyebrow="404 · Plot twist"
        title="That page doesn't exist."
        description="No worries. There's always another move."
        action={
          <Button
            size="lg"
            className="min-h-12"
            render={<Link href="/member/home" />}
          >
            Back to your home board <ArrowUpRight />
          </Button>
        }
      />
    </div>
  );
}
