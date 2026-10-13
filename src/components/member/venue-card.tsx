import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Venue } from "@/types/member";

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link href={`/member/venues/${venue.id}`} className="group block h-full">
      <Card className="h-full bg-card shadow-none transition-transform motion-safe:group-hover:-translate-y-1">
        <CardContent className="flex h-full flex-col p-5">
          <div className="mb-5 flex aspect-[16/8] items-end overflow-hidden rounded-xl bg-[#080808] p-4">
            <span className="font-heading text-2xl font-bold text-primary">
              ETHCHESS
            </span>
            <MapPin className="ml-auto size-5 text-[#E2725B]" />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold">
                {venue.name || "Chess venue"}
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {venue.address || "Address not listed"}
              </p>
            </div>
            <ArrowUpRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <span className="mt-auto pt-5 font-heading text-xs font-semibold uppercase tracking-wider text-primary">
            Check the tables
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
