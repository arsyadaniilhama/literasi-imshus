"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register } from "@/actions/auth";
import { SCHOOL_NAME } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, null);

  return (
    <Card className="relative w-full max-w-[480px] [--card-spacing:--spacing(6)] backdrop-blur-sm bg-card/80 ring-primary/10 shadow-2xl shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
        {/* Garis aksen emas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-gold to-primary"
        />
        <CardHeader className="text-center gap-2.5">
          <Link href="/" className="mx-auto inline-block">
            <Image
              src="/imshus-logo.png"
              alt={`${SCHOOL_NAME} - Beranda`}
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg shadow-sm"
              priority
            />
          </Link>
          <CardTitle className="text-3xl font-heading">Daftar</CardTitle>
          <CardDescription>
            {SCHOOL_NAME} — Blog Santri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  className="h-11 px-3.5"
                />
                {state?.errors?.name && (
                  <p className="text-sm text-destructive">{state.errors.name[0]}</p>
                )}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="santri@example.com"
                  required
                  className="h-11 px-3.5"
                />
                {state?.errors?.email && (
                  <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 8 karakter"
                required
                className="h-11 px-3.5"
              />
              {state?.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
            {state?.error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {state.error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="relative h-10 w-full overflow-hidden border-2 border-gold/60 bg-gradient-to-r from-primary via-primary to-gold text-base font-semibold tracking-wide text-primary-foreground shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:border-gold"
              disabled={pending}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
              </span>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 underline underline-offset-2">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
  );
}