// Plausible Analytics custom event tracking
// Only fires if Plausible script is loaded (NEXT_PUBLIC_PLAUSIBLE_DOMAIN set)

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function trackEvent(event: string, props?: Record<string, string | number | boolean>) {
  window.plausible?.(event, props ? { props } : undefined);
}
