import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables for server clients.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type AuthenticatedUser = {
  id: string;
  email?: string;
  role?: string;
};

export async function getUserFromAuthHeader(
  authHeader: string | null,
): Promise<AuthenticatedUser | null> {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
    role:
      (data.user.app_metadata?.role as string | undefined) ??
      (data.user.user_metadata?.role as string | undefined),
  };
}

export async function getAuthenticatedAdminFromAuthHeader(
  authHeader: string | null,
): Promise<AuthenticatedUser | null> {
  const user = await getUserFromAuthHeader(authHeader);

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}
