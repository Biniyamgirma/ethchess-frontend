"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, LockKeyhole, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MemberAuthFrame } from "@/components/member/member-auth-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginMember } from "@/lib/api/member";
import { saveMemberSession } from "@/lib/auth/member-storage";
import { toast } from "sonner";

const loginSchema = z.object({
  phone: z.string().trim().min(1, "Enter the phone number on your account."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function MemberLoginPage() {
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const login = useMutation({
    mutationFn: loginMember,
    onSuccess: (user) => {
      saveMemberSession({ id: user.id, role: "member", name: user.name });
      toast.success(`Welcome back, ${user.name}.`);
      const nextPath = params.get("next");
      const candidate = nextPath
        ? new URL(nextPath, window.location.origin)
        : null;
      const destination =
        candidate?.origin === window.location.origin &&
        candidate.pathname.startsWith("/member")
          ? `${candidate.pathname}${candidate.search}${candidate.hash}`
          : "/member/home";
      window.location.replace(destination);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <MemberAuthFrame
      eyebrow="Your next move starts here"
      title="Welcome back, champ."
      footer={
        <>
          New around here?{" "}
          <Link
            href="/member/register"
            className="font-heading font-bold text-primary underline-offset-4 hover:underline"
          >
            Join the club <ArrowUpRight className="inline size-4" />
          </Link>
        </>
      }
    >
      <p className="mt-2 text-muted-foreground">
        Sign in and see what the community is up to.
      </p>
      <Card className="mt-7 shadow-none">
        <CardContent className="p-5 sm:p-7">
          <form
            className="space-y-5"
            onSubmit={handleSubmit((values) => login.mutate(values))}
          >
            <div className="space-y-2">
              <label
                htmlFor="member-phone"
                className="font-heading text-sm font-semibold"
              >
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="member-phone"
                  className="h-12 pl-10"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="Your account phone number"
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
              </div>
              {errors.phone ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="member-password"
                className="font-heading text-sm font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="member-password"
                  type="password"
                  className="h-12 pl-10"
                  autoComplete="current-password"
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
              </div>
              {errors.password ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Getting you to the board..." : "Let's play"}
              {!login.isPending ? <ArrowUpRight /> : null}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Forgot your password? Password reset isn&apos;t available yet. Reach out
        to the club.
      </p>
    </MemberAuthFrame>
  );
}
