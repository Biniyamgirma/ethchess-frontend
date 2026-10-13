import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FormField({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-accent-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
