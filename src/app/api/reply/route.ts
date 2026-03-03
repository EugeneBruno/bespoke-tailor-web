import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. SEND THE EMAIL REPLY
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"IVFODI" <${process.env.EMAIL_USER}>`,
      to: data.email, // The customer's email
      subject: `Re: ${data.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0B; color: #ffffff; padding: 40px;">
          <h1 style="color: #D4AF37; border-bottom: 1px solid #333; padding-bottom: 20px;">IVFODI</h1>
          
          <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            ${data.replyText}
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #777; font-size: 12px;">
            <p>On ${new Date(data.originalDate).toLocaleString()}, you wrote:</p>
            <blockquote style="border-left: 2px solid #D4AF37; padding-left: 10px; margin-left: 0; color: #aaa;">
              ${data.originalMessage}
            </blockquote>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 2. UPDATE SUPABASE STATUS TO "Replied"
    const { error: dbError } = await supabase
      .from('messages')
      .update({ status: 'Replied' })
      .eq('id', data.messageId);

    if (dbError) throw dbError;

    return NextResponse.json({ message: "Reply sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}