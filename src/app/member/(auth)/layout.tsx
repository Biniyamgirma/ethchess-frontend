import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberLoading } from "@/components/shared/member-states";

export const metadata: Metadata = {
  title: "Join the board",
};

export default function MemberAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<MemberLoading label="Getting your board ready..." />}>
      {children}
    </Suspense>
  );
}
