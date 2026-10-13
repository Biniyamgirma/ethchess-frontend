"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { FormField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/lib/api/admin";
import { saveAdminUser } from "@/lib/auth/storage";

const loginSchema = z.object({
  f_name: z.string().trim().min(1, "Enter your first name."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (user) => {
      saveAdminUser(user);
      const nextPath = searchParams.get("next");
      const candidate = nextPath
        ? new URL(nextPath, window.location.origin)
        : null;
      const destination =
        candidate?.origin === window.location.origin
          ? `${candidate.pathname}${candidate.search}${candidate.hash}`
          : "/dashboard";
      router.replace(destination);
      toast.success(`Welcome back, ${user.f_name}.`);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#080808] p-12 text-[#FFFCF1] lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="relative z-10">
          <Image
            src="/brand/logo-white.svg"
            alt="EthChess™"
            width={164}
            height={34}
            priority
          />
        </div>
        <div className="relative z-10 max-w-xl pb-8">
          <p className="mb-5 font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            A move for every young mind.
          </p>
          <h1 className="font-heading text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
            Make room
            <br />
            for the next
            <br />
            <span className="text-primary">big move.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#FFFCF1]/65">
            One community. A thousand ways to play. Keep the club moving.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/50">
          <span>ETHIOPIA · SINCE 2020</span>
          <span className="font-heading font-bold tracking-[0.14em] text-white/75">
            PLAY. ENJOY. REPEAT.
          </span>
        </div>
        <div
          aria-hidden
          className="absolute -bottom-36 -right-32 size-[28rem] rounded-full border border-primary/25"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -right-16 size-[21rem] rounded-full border border-primary/20"
        />
        <ArrowUpRight
          aria-hidden
          className="absolute bottom-36 right-28 size-16 text-primary/35"
        />
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Logo />
            <span className="font-heading text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
              CLUB ADMIN
            </span>
          </div>
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your next move starts here
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back.
          </h2>
          <p className="mt-2 text-muted-foreground">Sign in to run the club.</p>
          <Card className="mt-8 shadow-none">
            <CardContent className="p-6 sm:p-8">
              <form
                className="space-y-5"
                onSubmit={handleSubmit((values) => mutation.mutate(values))}
              >
                <FormField
                  htmlFor="f_name"
                  label="First name"
                  error={errors.f_name?.message}
                >
                  <Input
                    id="f_name"
                    autoComplete="username"
                    placeholder="Your admin first name"
                    {...register("f_name")}
                  />
                </FormField>
                <FormField
                  htmlFor="password"
                  label="Password"
                  error={errors.password?.message}
                >
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="At least 8 characters"
                      className="pl-9 pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormField>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Signing you in..." : "Sign in"}
                  {!mutation.isPending ? (
                    <ArrowUpRight className="ml-1 size-4" />
                  ) : null}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need access? Ask your club administrator.
          </p>
        </div>
      </section>
    </main>
  );
}
