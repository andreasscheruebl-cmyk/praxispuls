import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: `praxispuls@${process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0"}+${process.env.NEXT_PUBLIC_BUILD_HASH || "dev"}`,
  environment: process.env.NEXT_PUBLIC_BUILD_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
