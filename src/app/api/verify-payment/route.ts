import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import 'server-only';

interface CartItem {
  id: string;
  name: string;
  price: string;
  size: string;
  image: string;
  quantity: number;
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const calculateCartTotalInKobo = (cart: CartItem[]) => {
  const totalNaira = cart.reduce((total, item) => {
    const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
    return total + numericPrice * item.quantity;
  }, 0);

  return totalNaira * 100;
};

export async function POST(request: Request) {
  try {
    const { reference, cart, formData } = await request.json();

    if (!reference || !Array.isArray(cart) || !formData?.email) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required server environment variables.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const expectedAmountInKobo = calculateCartTotalInKobo(cart as CartItem[]);

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      cache: 'no-store',
    });

    if (!paystackResponse.ok) {
      return NextResponse.json({ error: 'Unable to verify payment.' }, { status: 400 });
    }

    const paystackData = await paystackResponse.json();
    const transaction = paystackData?.data;

    const isSuccessful = transaction?.status === 'success';
    const amountMatches = transaction?.amount === expectedAmountInKobo;

    if (!isSuccessful || !amountMatches) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    const safeFormData = formData as CheckoutFormData;
    const totalNaira = expectedAmountInKobo / 100;

    const { error } = await supabaseAdmin.from('orders').insert([
      {
        customer_name: `${safeFormData.firstName} ${safeFormData.lastName}`.trim(),
        customer_email: safeFormData.email,
        total_amount: `₦${totalNaira.toLocaleString()}`,
        status: 'Pending',
        items: cart,
      },
    ]);

    if (error) {
      console.error('Order insert error:', error);
      return NextResponse.json({ error: 'Failed to save order.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
