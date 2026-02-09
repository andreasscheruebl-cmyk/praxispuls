import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { searchPlaces } from "@/lib/google";

export async function GET(request: Request) {
  try {
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 3) {
      return NextResponse.json([]);
    }

    const results = await searchPlaces(query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
