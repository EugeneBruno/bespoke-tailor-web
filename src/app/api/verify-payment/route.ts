import { NextResponse } from "next/server";
import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPaymentSchema } from "@/lib/validation/api";

const calculateCartTotalInKobo = (
  cart: Array<{ price: string; quantity: number }>,
) => {
  const totalNaira = cart.reduce((total, item) => {
    const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
    return total + numericPrice * item.quantity;
  }, 0);

  return totalNaira * 100;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const { reference, cart, formData } = parsed.data;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json(
        { error: "Duplicate payment reference." },
        { status: 409 },
      );
    }

    const expectedAmountInKobo = calculateCartTotalInKobo(cart);

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: "Unable to verify payment." },
        { status: 400 },
      );
    }

    const paystackData = await paystackResponse.json();
    const transaction = paystackData?.data;

    const isSuccessful = transaction?.status === "success";
    const paystackAmount = Number(transaction?.amount);
    const expectedAmount = Number(expectedAmountInKobo);
    const amountMatches = Math.abs(paystackAmount - expectedAmount) < 100;
    const currencyMatches = transaction?.currency === "NGN";

    if (!isSuccessful || !amountMatches || !currencyMatches) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 },
      );
    }

    const totalNaira = expectedAmount / 100;

    const { error } = await supabaseAdmin.from("orders").insert([
      {
        reference,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_email: formData.email,
        total_amount: `₦${totalNaira.toLocaleString()}`,
        status: "Paid",
        items: cart,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Duplicate payment reference." },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
