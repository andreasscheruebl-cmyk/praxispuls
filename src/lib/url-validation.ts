/**
 * Validate that a URL is safe to fetch server-side.
 * Blocks private/internal IPs to prevent SSRF attacks.
 */
export function isSafeUrl(urlString: string): boolean {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(url.protocol)) return false;

  const hostname = url.hostname.toLowerCase();

  // Block localhost and loopback (IPv6 bracket notation: [::1])
  if (
    ["localhost", "127.0.0.1", "[::1]", "::1", "0.0.0.0"].includes(hostname)
  ) {
    return false;
  }

  // Block private/reserved IPv4 ranges
  const parts = hostname.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    if (parts[0] === 10) return false; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) return false; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return false; // 192.168.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return false; // 169.254.0.0/16 (link-local)
    if (parts[0] === 0) return false; // 0.0.0.0/8
  }

  return true;
}
