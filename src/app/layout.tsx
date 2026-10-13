import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/satoshi/satoshi-regular.woff2", weight: "400" },
    { path: "../../public/fonts/satoshi/satoshi-medium.woff2", weight: "500" },
    { path: "../../public/fonts/satoshi/satoshi-bold.woff2", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EthChess Admin",
  description: "Run the club. Grow the game.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${satoshi.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
