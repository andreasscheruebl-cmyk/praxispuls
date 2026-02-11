import { readFileSync } from "fs";
import { execSync } from "child_process";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const { version } = JSON.parse(readFileSync("./package.json", "utf8"));

function getGitHash(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

function getGitBranch(): string {
  if (process.env.VERCEL_GIT_COMMIT_REF) {
    return process.env.VERCEL_GIT_COMMIT_REF;
  }
  try {
    return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch {
    return "local";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_BUILD_HASH: getGitHash(),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_ENV: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    NEXT_PUBLIC_GIT_BRANCH: getGitBranch(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
};

// Only wrap with Sentry build plugin when auth token is available
// (avoids "No auth token" warnings on Vercel / local builds)
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryBuildOptions)
  : nextConfig;
