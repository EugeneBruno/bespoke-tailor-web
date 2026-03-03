import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/utils/supabase'; // Bring in your database connection!

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. SAVE TO SUPABASE DATABASE
    const { error: dbError } = await supabase
      .from('messages')
      .insert([{
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      }]);

    if (dbError) {
      console.error("Database saving error:", dbError);
      // We log the error, but we don't stop the email from sending!
    }

    // 2. SEND THE EMAIL
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"IVFODI Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      replyTo: data.email, 
      subject: `New Inquiry: ${data.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0B; color: #ffffff; padding: 40px;">
          <h1 style="color: #D4AF37; border-bottom: 1px solid #333; padding-bottom: 20px;">New Contact Message</h1>
          <div style="background-color: #111111; padding: 20px; border: 1px solid #333; margin-top: 20px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
          </div>
          <h2 style="color: #D4AF37; margin-top: 30px;">Message:</h2>
          <div style="background-color: #111111; padding: 20px; border: 1px solid #333; white-space: pre-wrap;">
            ${data.message}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Message sent and saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing contact request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}