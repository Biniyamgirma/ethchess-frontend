"use client";

import Link from "next/link";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MemberAuthFrame } from "@/components/member/member-auth-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getDistricts, registerMember } from "@/lib/api/member";

const TELEGRAM_BOT_URL = "https://t.me/eth_chess_members_official_bot";

const registerSchema = z
  .object({
    f_name: z
      .string()
      .trim()
      .max(80, "First name must be 80 characters or fewer.")
      .optional(),
    l_name: z
      .string()
      .trim()
      .max(80, "Last name must be 80 characters or fewer.")
      .optional(),
    phone: z.string().trim().min(9, "Enter at least 9 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    address: z
      .string()
      .trim()
      .max(200, "Address must be 200 characters or fewer.")
      .optional(),
    district: z.string().optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Those passwords don't match.",
    path: ["confirmPassword"],
  });
type RegisterValues = z.infer<typeof registerSchema>;

export default function MemberRegisterPage() {
  const [registered, setRegistered] = useState(false);
  const districts = useQuery({
    queryKey: ["districts", "active"],
    queryFn: getDistricts,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const registerMemberMutation = useMutation({
    mutationFn: registerMember,
    onSuccess: () => {
      toast.success("Your account is ready. Activate your Telegram bot next.");
      setRegistered(true);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit(values: RegisterValues) {
    registerMemberMutation.mutate({
      f_name: values.f_name || undefined,
      l_name: values.l_name || undefined,
      phone: values.phone,
      password: values.password,
      address: values.address || undefined,
      district: values.district ? Number(values.district) : undefined,
    });
  }

  return (
    <MemberAuthFrame
      eyebrow="A seat at the board"
      title="Join the club."
      footer={
        <>
          Already one of us?{" "}
          <Link
            href="/member/login"
            className="font-heading font-bold text-primary underline-offset-4 hover:underline"
          >
            Sign in <ArrowUpRight className="inline size-4" />
          </Link>
        </>
      }
    >
      <p className="mt-2 text-muted-foreground">
        Meet your people, find a game, and grow at your own pace.
      </p>
      <Card className="mt-7 shadow-none">
        <CardContent className="p-5 sm:p-7">
          {registered ? (
            <div className="space-y-5 text-center" role="status">
              <h2 className="font-heading text-xl font-bold">
                Registration complete
              </h2>
              <p className="text-sm text-muted-foreground">
                To activate your Telegram bot account, open the official
                EthChess Members bot and press Start.
              </p>
              <Button
                nativeButton={false}
                render={
                  <a
                    href={TELEGRAM_BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                size="lg"
                className="h-12 w-full"
              >
                Activate on Telegram <ArrowUpRight />
              </Button>
              <Link
                href="/member/login"
                className="inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Continue to sign in
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit(submit)}
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  id="register-first-name"
                  label="First name (optional)"
                  icon={<UserRound />}
                  error={errors.f_name?.message}
                  autoComplete="given-name"
                  {...register("f_name")}
                />
                <FormInput
                  id="register-last-name"
                  label="Last name (optional)"
                  error={errors.l_name?.message}
                  autoComplete="family-name"
                  {...register("l_name")}
                />
              </div>
              <FormInput
                id="register-phone"
                label="Phone number"
                icon={<Phone />}
                error={errors.phone?.message}
                autoComplete="tel"
                inputMode="tel"
                {...register("phone")}
              />
              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="register-district"
                  className="font-heading text-sm font-semibold"
                >
                  District (optional)
                </label>
                <select
                  id="register-district"
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  defaultValue=""
                  {...register("district")}
                >
                  <option value="">Choose your district</option>
                  {(districts.data ?? []).map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name ?? `District ${district.id}`}
                    </option>
                  ))}
                </select>
                {districts.isLoading ? (
                  <p className="text-xs text-muted-foreground">
                    Loading active districts...
                  </p>
                ) : null}
                {districts.isError ? (
                  <p role="alert" className="text-xs text-destructive">
                    Districts could not be loaded. You can still register
                    without selecting one.
                  </p>
                ) : null}
              </div>
              <FormInput
                id="register-address"
                label="Address (optional)"
                autoComplete="street-address"
                error={errors.address?.message}
                {...register("address")}
              />
              <FormInput
                id="register-password"
                label="Password"
                error={errors.password?.message}
                autoComplete="new-password"
                type="password"
                {...register("password")}
              />
              <FormInput
                id="register-confirm-password"
                label="Confirm password"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                type="password"
                {...register("confirmPassword")}
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full"
                disabled={registerMemberMutation.isPending}
              >
                {registerMemberMutation.isPending
                  ? "Saving your seat..."
                  : "Create account"}
                {!registerMemberMutation.isPending ? <ArrowUpRight /> : null}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </MemberAuthFrame>
  );
}

const FormInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label: string;
    error?: string;
    icon?: ReactNode;
  }
>(function FormInput({ id, label, error, icon, className, ...props }, ref) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-heading text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          ref={ref}
          className={`h-11 ${icon ? "pl-10" : ""} ${className ?? ""}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
});
