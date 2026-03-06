import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { replySchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const data = parsed.data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"IVFODI" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Re: ${data.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0B; color: #ffffff; padding: 40px;">
          <h1 style="color: #D4AF37; border-bottom: 1px solid #333; padding-bottom: 20px;">IVFODI</h1>
          <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; margin-top: 20px;">${data.replyText}</div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #777; font-size: 12px;">
            <p>On ${new Date(data.originalDate).toLocaleString()}, you wrote:</p>
            <blockquote style="border-left: 2px solid #D4AF37; padding-left: 10px; margin-left: 0; color: #aaa;">${data.originalMessage}</blockquote>
          </div>
        </div>
      `,
    });

    const { error: dbError } = await supabaseAdmin
      .from("messages")
      .update({ status: "Replied" })
      .eq("id", data.messageId);

    if (dbError) {
      return NextResponse.json({ error: "Failed to update message status." }, { status: 500 });
    }

    return NextResponse.json({ message: "Reply sent successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
