"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type LogoProps = {
  variant?: "horizontal" | "vertical" | "icon";
  className?: string;
};

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot() {
  return "light";
}

export function Logo({ variant = "horizontal", className }: LogoProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";
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
