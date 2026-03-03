import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. FORMAT THE MEASUREMENTS INTO A CLEAN TEXT BLOCK FOR THE DATABASE
    const formattedMessage = `
Garment: ${data.garmentType}
Target Date: ${data.targetDate || "Not specified"}
WhatsApp: ${data.whatsapp}

MEASUREMENTS
Bust/Chest: ${data.bust || "—"}"
Waist: ${data.waist || "—"}"
Hips: ${data.hips || "—"}"
Shoulder: ${data.shoulder || "—"}"
Length: ${data.length || "—"}"

NOTES:
${data.notes || "None provided."}
    `.trim();

    // 2. SAVE TO SUPABASE DATABASE
    const { error: dbError } = await supabase
      .from('messages')
      .insert([{
        name: data.fullName,
        email: data.email,
        subject: `Bespoke Request: ${data.garmentType}`,
        message: formattedMessage
      }]);

    if (dbError) console.error("Database saving error:", dbError);

    // 3. SEND THE EMAIL TO THE CUSTOMER
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"IVFODI Bespoke" <${process.env.EMAIL_USER}>`,
      to: data.email, 
      subject: 'Your IVFODI Bespoke Fitting Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0B; color: #ffffff; padding: 40px;">
          <h1 style="color: #D4AF37; text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px;">IVFODI</h1>
          <p>Hello ${data.fullName},</p>
          <p>Thank you for trusting IVFODI with your vision. We have received your bespoke request and our design team will review your measurements shortly.</p>
          
          <h2 style="color: #D4AF37; margin-top: 30px;">Your Request Details:</h2>
          <div style="background-color: #111111; padding: 20px; border: 1px solid #333;">
            <p><strong>Garment:</strong> ${data.garmentType}</p>
            <p><strong>Target Date:</strong> ${data.targetDate || "Not specified"}</p>
            <p><strong>Bust/Chest:</strong> ${data.bust || "—"}"</p>
            <p><strong>Waist:</strong> ${data.waist || "—"}"</p>
            <p><strong>Hips:</strong> ${data.hips || "—"}"</p>
            <p><strong>Shoulder:</strong> ${data.shoulder || "—"}"</p>
            <p><strong>Length:</strong> ${data.length || "—"}"</p>
          </div>
          
          <p style="margin-top: 30px;">We will contact you at <strong>${data.whatsapp}</strong> within 24 hours to confirm the details and discuss the next steps.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Bespoke request saved and email sent" }, { status: 200 });
  } catch (error) {
    console.error("Error processing bespoke request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}