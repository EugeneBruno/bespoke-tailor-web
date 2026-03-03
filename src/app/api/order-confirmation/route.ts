import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Calculate Estimated Delivery (Current Date + 7 calendar days to equal roughly 5 working days)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Format the cart items into a clean HTML list
    const itemsHtml = data.items.map((item: any) => 
      `<li style="margin-bottom: 10px; color: #cccccc;">
        <strong>${item.quantity}x ${item.name}</strong> (Size: ${item.size}) <br/> 
        <span style="color: #D4AF37;">${item.price}</span>
      </li>`
    ).join('');

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build the Email
    const mailOptions = {
      from: `"IVFODI" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Order Confirmation - Ref: ${data.reference}`,
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0B; color: #ffffff; padding: 40px; border: 1px solid #333;">
          <h1 style="color: #D4AF37; text-align: center; border-bottom: 1px solid #333; padding-bottom: 20px; font-weight: normal; letter-spacing: 4px;">IVFODI</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">Dear ${data.name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #aaaaaa;">Thank you for your purchase. Your order has been successfully placed and our artisans are preparing your garments.</p>
          
          <h2 style="color: #ffffff; margin-top: 40px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Order Summary (Ref: ${data.reference})</h2>
          <div style="background-color: #111111; padding: 25px; border: 1px solid #222;">
            <ul style="list-style-type: none; padding: 0; margin: 0;">
              ${itemsHtml}
            </ul>
            <div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 15px; text-align: right;">
              <strong style="color: #D4AF37; font-size: 18px;">Total: ${data.total}</strong>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; border-left: 3px solid #D4AF37; background-color: #111111;">
            <p style="margin: 0; color: #dddddd;"><strong>Estimated Delivery:</strong><br/> ${formattedDate}</p>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #666666; text-align: center;">
            Want to track your order progress? <br/> Create an account on our website using this email address to view real-time updates.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Confirmation email sent" }, { status: 200 });

  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}