// ─────────────────────────────────────────────
// ALERTIO — next.config.js
// ─────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

loadRootPublicEnv();

function loadRootPublicEnv() {
  const rootEnvPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(rootEnvPath)) return;

  const lines = fs.readFileSync(rootEnvPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^(NEXT_PUBLIC_[A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

const isCapacitor = process.env.CAPACITOR_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export for Capacitor, default for Vercel
  output: isCapacitor ? "export" : undefined,

  // Relative paths for Capacitor (no HTTP server)
  assetPrefix:   isCapacitor ? "./" : undefined,
  trailingSlash: isCapacitor ? true : false,

  // Allow image optimization from external sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "**.gstatic.com" },
    ],
    // Required for static export
    unoptimized: isCapacitor ? true : false,
  },

  // Transpile the shared core package
  transpilePackages: ["@alertio/core"],

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API ?? (
      process.env.NODE_ENV === "development" && !process.env.VERCEL ? "true" : ""
    ),
  },

  // Headers: CSP + security (not applied in static export)
  async headers() {
    if (isCapacitor) return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Rewrites: proxy /api to Vercel functions in dev
  async rewrites() {
    if (isCapacitor || process.env.NODE_ENV !== "development") return [];
    return [
      {
        source:      "/api/:path*",
        destination: `${process.env.API_DEV_URL ?? "http://localhost:3000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
