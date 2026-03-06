import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { adminOrderStatusSchema } from "@/lib/validation/api";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = adminOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { id, status } = parsed.data;

  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
