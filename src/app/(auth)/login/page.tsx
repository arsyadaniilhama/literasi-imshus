"use client";

import { useActionState } from "react";
import Link from "next/link";
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
    <Card className="backdrop-blur-sm bg-card/80 shadow-xl border-primary/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-sm">
          <span className="text-xl font-bold text-primary-foreground">I</span>
        </div>
        <CardTitle className="text-2xl font-heading">{SCHOOL_NAME}</CardTitle>
        <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="santri@ims.hus"
              aria-invalid={state.errors?.email ? "true" : "false"}
              aria-describedby={state.errors?.email ? "email-error" : undefined}
            />
            {state.errors?.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              aria-invalid={state.errors?.password ? "true" : "false"}
              aria-describedby={state.errors?.password ? "password-error" : undefined}
            />
            {state.errors?.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
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