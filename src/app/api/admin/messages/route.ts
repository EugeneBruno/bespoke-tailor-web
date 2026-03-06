import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { adminMessageStatusSchema } from "@/lib/validation/api";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = adminMessageStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { id, status } = parsed.data;

  const { error } = await supabaseAdmin.from("messages").update({ status }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update message status." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
