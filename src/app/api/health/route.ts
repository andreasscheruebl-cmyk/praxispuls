import { NextResponse } from "next/server";
import { getBuildInfo } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const build = getBuildInfo();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    build,
    uptime: process.uptime(),
  });
}
