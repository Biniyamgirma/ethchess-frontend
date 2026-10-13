import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  href?: string;
};

export function PageHeader({
  title,
  description,
  action,
  href,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {title}
          <ArrowUpRight
            className="mb-1 ml-2 inline size-5 text-primary"
            strokeWidth={2.5}
          />
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action ? (
        <div className={cn("shrink-0", href && "flex")}>
          {href ? <Link href={href}>{action}</Link> : action}
        </div>
      ) : null}
    </header>
  );
}
