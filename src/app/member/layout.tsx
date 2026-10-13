import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "EthChess Members",
    template: "%s | EthChess",
  },
  description:
    "Find your next game and make moves with the EthChess community.",
  icons: { icon: "/brand/logo-icon.svg" },
};

export default function MemberRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
