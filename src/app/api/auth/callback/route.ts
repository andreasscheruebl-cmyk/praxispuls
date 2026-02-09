import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

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

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
