interface BuildInfo {
  version: string;
  hash: string;
  date: string;
  env: string;
  branch: string;
  label: string;
}

export function getBuildInfo(): BuildInfo {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
  const hash = process.env.NEXT_PUBLIC_BUILD_HASH || "dev";
  const date = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString();
  const env = process.env.NEXT_PUBLIC_BUILD_ENV || "development";
  const branch = process.env.NEXT_PUBLIC_GIT_BRANCH || "local";

  return {
    version,
    hash,
    date,
    env,
    branch,
    label: `${version}+${hash}`,
  };
}
