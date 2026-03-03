import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, orderId, status } = data;

    // Determine the exact message based on the status
    let statusTitle = "";
    let statusMessage = "";

    if (status.toLowerCase() === 'processing') {
      statusTitle = "Your Order is in Production";
      statusMessage = "Our artisans have begun packaging your order. We will notify you the moment your order is ready for dispatch.";
    } else if (status.toLowerCase() === 'shipped') {
      statusTitle = "Your Order Has Shipped";
      statusMessage = "Great news! Your garments have been dispatched and are currently on their way to you. Log into your account to track the delivery.";
    } else if (status.toLowerCase() === 'delivered') {
      statusTitle = "Your Order Has Been Delivered";
      statusMessage = "Your IVFODI garments have arrived. Thank you for trusting us with your style. We hope you love your new pieces.";
    } else {
      // If it's just 'Pending' or something else, we don't necessarily need to send an email, 
      // but we return 200 so the frontend doesn't crash.
      return NextResponse.json({ message: "No email needed for this status." }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
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

          <p style="margin-top: 40px; font-size: 12px; color: #666666; text-align: center;">
            You can view real-time updates by logging into your account on our website.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Status update email sent" }, { status: 200 });

  } catch (error) {
    console.error("Error sending status email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}