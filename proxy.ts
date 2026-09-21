import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Protected route patterns
const AUTH_PATHS = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && AUTH_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard/student", req.nextUrl));
  }

  // Protect dashboard routes
  const isProtectedRoute =
    path.startsWith("/dashboard/student") ||
    path.startsWith("/dashboard/teacher") ||
    path.startsWith("/dashboard/admin");

  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Role-based redirects
  if (isLoggedIn && user?.email) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;

    if (path.startsWith("/dashboard/teacher") && role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/student", req.nextUrl));
    }

    if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/student", req.nextUrl));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};