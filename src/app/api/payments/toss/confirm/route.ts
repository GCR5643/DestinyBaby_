import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { paymentKey, orderId, amount } = body;

  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error }, { status: 400 });
  }

  const payment = await response.json();
  return NextResponse.json({ payment });
}
