import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { isSafeUrl } from "@/lib/url-validation";

/**
 * Extract potential logo URLs from a website by checking common locations:
 * - Favicon (various sizes)
 * - Apple touch icon
 * - Open Graph image
 * - <link rel="icon"> / <link rel="shortcut icon">
 * - <meta property="og:image">
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const websiteUrl = searchParams.get("url");
    if (!websiteUrl) {
      return NextResponse.json({ error: "Missing url parameter", code: "BAD_REQUEST" }, { status: 400 });
    }

    // Normalize URL
    let baseUrl: URL;
    try {
      baseUrl = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
    } catch {
      return NextResponse.json({ logos: [] });
    }

    const logos: string[] = [];
    const seen = new Set<string>();

    function addLogo(url: string) {
      if (!seen.has(url)) {
        seen.add(url);
        logos.push(url);
      }
    }

    // SSRF protection: block private/internal URLs
    if (!isSafeUrl(baseUrl.toString())) {
      return NextResponse.json({ logos: [] });
    }

    // Try to fetch the homepage HTML and extract logo references
    try {
      const res = await fetch(baseUrl.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PraxisPuls/1.0)" },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const html = await res.text();

        // Extract <link rel="icon|shortcut icon|apple-touch-icon" href="...">
        const linkRegex = /<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
        let match: RegExpExecArray | null;
        while ((match = linkRegex.exec(html)) !== null) {
          const href = match[1] as string;
          try {
            addLogo(new URL(href, baseUrl).toString());
          } catch { /* skip invalid URLs */ }
        }

        // Also try href before rel (some sites order it differently)
        const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed)["'][^>]*>/gi;
        while ((match = linkRegex2.exec(html)) !== null) {
          const href = match[1] as string;
          try {
            addLogo(new URL(href, baseUrl).toString());
          } catch { /* skip */ }
        }

        // Extract og:image
        const ogRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
        while ((match = ogRegex.exec(html)) !== null) {
          const content = match[1] as string;
          try {
            addLogo(new URL(content, baseUrl).toString());
          } catch { /* skip */ }
        }

        // Also try content before property
        const ogRegex2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/gi;
        while ((match = ogRegex2.exec(html)) !== null) {
          const content = match[1] as string;
          try {
            addLogo(new URL(content, baseUrl).toString());
          } catch { /* skip */ }
        }
      }
    } catch {
      // Website fetch failed — try common fallback paths
    }

    // Always try common favicon paths as fallback
    const commonPaths = [
      "/favicon.ico",
      "/favicon.png",
      "/apple-touch-icon.png",
      "/apple-touch-icon-precomposed.png",
      "/logo.png",
      "/logo.svg",
    ];

    for (const path of commonPaths) {
      try {
        const url = new URL(path, baseUrl).toString();
        if (!seen.has(url)) {
          const check = await fetch(url, {
            method: "HEAD",
            signal: AbortSignal.timeout(3000),
          });
          if (check.ok) {
            const contentType = check.headers.get("content-type") || "";
            if (contentType.startsWith("image/")) {
              addLogo(url);
            }
          }
        }
      } catch { /* skip */ }
    }

    // Limit to 6 results
    return NextResponse.json({ logos: logos.slice(0, 6) });
  } catch {
    return NextResponse.json({ logos: [] });
  }
}
