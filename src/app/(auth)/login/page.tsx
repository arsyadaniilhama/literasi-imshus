"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { SCHOOL_NAME } from "@/lib/constants";

export default function LoginPage() {
  const initialState = { success: false, error: undefined, errors: undefined };

  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <Card className="relative w-full max-w-[480px] [--card-spacing:--spacing(6)] backdrop-blur-sm bg-card/80 ring-primary/10 shadow-2xl shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
      {/* Garis aksen emas */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-gold to-primary"
      />
      <CardHeader className="text-center gap-2.5">
        <Link href="/" className="mx-auto inline-block mb-4">
          <Image
            src="/imshus-logo.png"
            alt={`${SCHOOL_NAME} - Beranda`}
            width={56}
            height={56}
            className="h-14 w-14 rounded-lg shadow-sm"
            priority
          />
        </Link>
        <CardTitle className="text-3xl font-heading">{SCHOOL_NAME}</CardTitle>
        <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {state.error}
            </div>
          )}

          <div className="space-y-2.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="santri@ims.hus"
              className="h-11 px-3.5"
              aria-invalid={state.errors?.email ? "true" : "false"}
              aria-describedby={state.errors?.email ? "email-error" : undefined}
            />
            {state.errors?.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-11 px-3.5"
              aria-invalid={state.errors?.password ? "true" : "false"}
              aria-describedby={state.errors?.password ? "password-error" : undefined}
            />
            {state.errors?.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="relative h-10 w-full overflow-hidden border-2 border-gold/60 bg-gradient-to-r from-primary via-primary to-gold text-base font-semibold tracking-wide text-primary-foreground shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:border-gold"
            disabled={pending}
          >
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
            </span>
            {pending ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 underline underline-offset-2">
            Daftar di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}