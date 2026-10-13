"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

type LogoProps = {
  variant?: "horizontal" | "vertical" | "icon";
  className?: string;
};

export function Logo({ variant = "horizontal", className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const src =
    variant === "icon"
      ? isDark
        ? "/brand/logo-icon-white.svg"
        : "/brand/logo-icon.svg"
      : variant === "vertical"
        ? isDark
          ? "/brand/logo-vertical-white.svg"
          : "/brand/logo-vertical.svg"
        : isDark
          ? "/brand/logo-white.svg"
          : "/brand/logo-horizontal.svg";

  const dimensions =
    variant === "icon"
      ? { width: 38, height: 38 }
      : variant === "vertical"
        ? { width: 148, height: 108 }
        : { width: 164, height: 34 };

  return (
    <Image
      src={src}
      alt={variant === "icon" ? "EthChess" : "EthChess™"}
      width={dimensions.width}
      height={dimensions.height}
      priority
      className={className}
    />
  );
}
