import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { statusUpdateSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const { name, email, orderId, status } = parsed.data;

    let statusTitle = "";
    let statusMessage = "";

    if (status === "Processing") {
      statusTitle = "Your Order is in Production";
      statusMessage = "Our artisans have begun packaging your order. We will notify you the moment your order is ready for dispatch.";
    } else if (status === "Shipped") {
      statusTitle = "Your Order Has Shipped";
      statusMessage = "Great news! Your garments have been dispatched and are currently on their way to you. Log into your account to track the delivery.";
    } else if (status === "Delivered") {
      statusTitle = "Your Order Has Been Delivered";
      statusMessage = "Your IVFODI garments have arrived. Thank you for trusting us with your style. We hope you love your new pieces.";
    } else {
      return NextResponse.json({ message: "No email needed for this status." }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"IVFODI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Update: ${statusTitle} (Ref: ${orderId.slice(0, 8)})`,
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0B; color: #ffffff; padding: 40px; border: 1px solid #333;">
          <h1 style="color: #D4AF37; text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; font-weight: normal; letter-spacing: 4px;">IVFODI</h1>
          <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #aaaaaa;">${statusMessage}</p>
          <div style="margin-top: 30px; padding: 20px; border-left: 3px solid #D4AF37; background-color: #111111;">
            <p style="margin: 0; color: #dddddd;"><strong>Order Status:</strong> <span style="color: #D4AF37; text-transform: uppercase; letter-spacing: 1px;">${status}</span></p>
            <p style="margin: 5px 0 0 0; color: #888888; font-size: 12px; font-family: monospace;">Order ID: ${orderId}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Status update email sent" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
