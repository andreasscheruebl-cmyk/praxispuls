import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * Get the current authenticated user or redirect to login.
 * Use in Server Components and Server Actions.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

/**
 * Get the current user without redirecting.
 * Returns null if not authenticated.
 */
export async function getUserOptional() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication for API routes.
 * Returns a discriminated union: either { user } or { error } (NextResponse).
 */
export async function requireAuthForApi(): Promise<
  | { user: User; error?: never }
  | { user?: never; error: NextResponse }
> {
  const user = await getUserOptional();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Nicht angemeldet", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Require authentication for Server Actions.
 * Returns a discriminated union: either { user } or { error, code } (plain objects).
 */
export async function requireAuthForAction(): Promise<
  | { user: User; error?: never }
  | { user?: never; error: string; code: string }
> {
  const user = await getUserOptional();
  if (!user) {
    return { error: "Nicht angemeldet", code: "UNAUTHORIZED" };
  }
  return { user };
}

/**
 * Parse ADMIN_EMAILS env var into a normalized array.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Require admin access for API routes.
 * Returns a discriminated union: either { user } or { error } (NextResponse).
 */
export async function requireAdminForApi(): Promise<
  | { user: User; error?: never }
  | { user?: never; error: NextResponse }
> {
  const auth = await requireAuthForApi();
  if (auth.error) return auth;

  if (!getAdminEmails().includes(auth.user.email?.toLowerCase() || "")) {
    return {
      error: NextResponse.json(
        { error: "Kein Admin-Zugriff", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { user: auth.user };
}

/**
 * Require the current user to be an admin.
 * Throws if not authenticated or not in ADMIN_EMAILS.
 * Use in Server Actions that perform admin operations.
 */
export async function requireAdmin() {
  const user = await getUser();

  if (!getAdminEmails().includes(user.email?.toLowerCase() || "")) {
    throw new Error("Unauthorized: admin access required");
  }

  return user;
}
