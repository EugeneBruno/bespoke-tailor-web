import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RateRecord = {
  count: number;
  resetAt: number;
};

const rateMap = new Map<string, RateRecord>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

function enforceRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const existing = rateMap.get(key);
  if (!existing || existing.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (existing.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((existing.resetAt - now) / 1000).toString(),
        },
      },
    );
  }

  existing.count += 1;
  rateMap.set(key, existing);
  return null;
}

async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return false;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const user = await response.json();
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role;

  return role === "admin";
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const authorized = await verifyAdminRequest(request);

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
