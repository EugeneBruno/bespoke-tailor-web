import { NextResponse } from "next/server";

import { getUserFromAuthHeader, supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const user = await getUserFromAuthHeader(request.headers.get("authorization"));

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
