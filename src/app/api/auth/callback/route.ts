import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { practices, loginEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send welcome email on first login (after email confirmation)
      const user = data.session?.user;
      if (user?.email && user.user_metadata?.practice_name) {
        sendWelcomeEmail({
          to: user.email,
          practiceName: user.user_metadata.practice_name as string,
        }).catch((err) => {
          console.error("Failed to send welcome email:", err);
        });
      }

      // Record login event
      if (user?.email) {
        const practice = await db.query.practices.findFirst({
          where: eq(practices.email, user.email),
          columns: { id: true },
        });
        if (practice) {
          const forwarded = request.headers.get("x-forwarded-for");
          const ipAddress = forwarded ? forwarded.split(",")[0]?.trim() : null;
          await db.insert(loginEvents).values({
            practiceId: practice.id,
            userAgent: request.headers.get("user-agent"),
            ipAddress,
            method: "magic_link",
          }).catch(() => {});
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
