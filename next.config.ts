import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",

  // Scripts (Paystack + Turnstile + Cloudinary widget)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://challenges.cloudflare.com https://widget.cloudinary.com",

  // Styles
  "style-src 'self' 'unsafe-inline'",

  // Images
  "img-src 'self' data: blob: https://res.cloudinary.com",

  // API calls
  "connect-src 'self' https://api.paystack.co https://*.supabase.co https://api.cloudinary.com https://challenges.cloudflare.com",

  // Iframes (CRITICAL FOR PAYMENTS & CAPTCHA)
  "frame-src 'self' https://checkout.paystack.com https://challenges.cloudflare.com",

  // Fonts
  "font-src 'self' data:",

  // Prevent embedding your site elsewhere
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;