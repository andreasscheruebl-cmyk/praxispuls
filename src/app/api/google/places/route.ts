import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { searchPlaces } from "@/lib/google";

export async function GET(request: Request) {
  try {
    await getUser(); // Auth check

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 3) {
      return NextResponse.json([]);
    }

    const results = await searchPlaces(query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }
}
