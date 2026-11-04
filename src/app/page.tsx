import { Suspense } from "react";
import LoginForm from "@/app/(auth)/login/login-form";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
