import Link from "next/link";
import { ArrowUpRight, LoaderCircle, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MemberLoading({
  label = "Getting things ready...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
      <LoaderCircle className="size-5 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function MemberError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-none">
      <CardContent className="p-5">
        <p className="font-heading font-semibold">That didn&apos;t load.</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export function MemberEmpty({
  title = "Nothing here yet. Go make some moves.",
  description,
  href,
  action,
}: {
  title?: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <Card className="border-dashed bg-card shadow-none">
      <CardContent className="flex flex-col items-start p-6 sm:p-8">
        <MoveRight className="mb-4 size-6 text-primary" />
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {href && action ? (
          <Button
            variant="outline"
            className="mt-5 min-h-11"
            render={<Link href={href} />}
          >
            {action}
            <ArrowUpRight />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
