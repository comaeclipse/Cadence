import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for hydration scripts (no nonce support in static headers)
  "script-src 'self' 'unsafe-inline'",
  // Tailwind and react-to-print inject inline styles
  "style-src 'self' 'unsafe-inline'",
  // next/font/google self-hosts fonts — no external font requests
  "font-src 'self'",
  // data: for chart SVGs; no blob: needed (react-to-print uses window.print())
  "img-src 'self' data:",
  // All API calls are same-origin
  "connect-src 'self'",
  // No iframes used
  "frame-src 'none'",
  // Prevent clickjacking
  "frame-ancestors 'none'",
  // Prevent base tag injection
  "base-uri 'self'",
  // Prevent form hijacking
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
