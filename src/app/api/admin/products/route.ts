import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { adminProductSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adminProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("products").insert([parsed.data]);

  if (error) {
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
