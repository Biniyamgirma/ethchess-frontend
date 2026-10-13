import { Suspense } from "react";
import { MemberShell } from "@/components/layout/member-shell";
import { MemberLoading } from "@/components/shared/member-states";

export default function MemberAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<MemberLoading label="Getting your board ready..." />}>
      <MemberShell>{children}</MemberShell>
    </Suspense>
  );
}
