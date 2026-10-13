import { Skeleton } from "@/components/ui/skeleton";

export default function MemberLoadingPage() {
  return (
    <div className="space-y-7" aria-label="Loading member page">
      <Skeleton className="h-64 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
