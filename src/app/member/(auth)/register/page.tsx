"use client";

import Link from "next/link";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MemberAuthFrame } from "@/components/member/member-auth-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerMember } from "@/lib/api/member";

const registerSchema = z
  .object({
    f_name: z.string().trim().min(1, "Add your first name."),
    l_name: z.string().trim().min(1, "Add your last name."),
    phone: z.string().trim().min(9, "Enter at least 9 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Those passwords don't match.",
    path: ["confirmPassword"],
  });
type RegisterValues = z.infer<typeof registerSchema>;

export default function MemberRegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const registerMemberMutation = useMutation({
    mutationFn: registerMember,
    onSuccess: () => {
      toast.success("Your next move starts here. Sign in to play.");
      router.replace("/member/login");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit(values: RegisterValues) {
    registerMemberMutation.mutate({
      f_name: values.f_name,
      l_name: values.l_name,
      phone: values.phone,
      password: values.password,
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
          <form
            className="space-y-4"
            onSubmit={handleSubmit(submit)}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                id="register-first-name"
                label="First name"
                icon={<UserRound />}
                error={errors.f_name?.message}
                autoComplete="given-name"
                {...register("f_name")}
              />
              <FormInput
                id="register-last-name"
                label="Last name"
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
