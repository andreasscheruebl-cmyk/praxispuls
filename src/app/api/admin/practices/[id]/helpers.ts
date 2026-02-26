import { NextResponse } from "next/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate a route param as UUID. Returns error response if invalid.
 */
export function validateUuid(id: string): NextResponse | null {
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { error: "Ungültige ID", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Safely parse JSON body. Returns error response on malformed JSON.
 */
export async function parseJsonBody(
  request: Request
): Promise<
  { data: unknown; error?: never } | { data?: never; error: NextResponse }
> {
  try {
    const data: unknown = await request.json();
    return { data };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Ungültiges JSON", code: "BAD_REQUEST" },
        { status: 400 }
      ),
    };
  }
}
