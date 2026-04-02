import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PACK_CREDITS: Record<string, number> = {
  trial: 10,
  basic: 33,
  premium: 115,
  royal: 350,
};

export async function POST(request: NextRequest) {
  // 버그 2 수정: request body 파싱 실패 시 크래시 방지
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).paymentKey !== 'string' ||
    typeof (body as Record<string, unknown>).orderId !== 'string' ||
    typeof (body as Record<string, unknown>).amount !== 'number'
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid required fields: paymentKey, orderId, amount' },
      { status: 400 },
    );
  }

  const { paymentKey, orderId, amount } = body as {
    paymentKey: string;
    orderId: string;
    amount: number;
  };

  // 버그 1 수정: Toss API 호출 전 amount를 DB의 pending 주문과 비교 검증
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from('payment_orders')
    .select('user_id, pack_id, credits, amount')
    .eq('id', orderId)
    .eq('status', 'pending')
    .single();

  if (orderError || !order) {
    console.error('Payment order not found:', orderId, orderError);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if ((order as { amount: number }).amount !== amount) {
    console.error(
      'Amount mismatch: client sent',
      amount,
      'but DB has',
      (order as { amount: number }).amount,
    );
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

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

  // Grant credits after successful payment verification
  try {
    const credits = PACK_CREDITS[(order as { pack_id: string }).pack_id] ?? (order as { credits: number }).credits;

    // 원자적 크레딧 업데이트 (FOR UPDATE 행 잠금으로 race condition 방지)
    const { error: creditError } = await supabase.rpc('add_credits', {
      p_user_id: (order as { user_id: string }).user_id,
      p_amount: credits,
    });

    if (creditError) {
      console.error('[toss-confirm] add_credits RPC failed:', creditError);
      // RPC 미존재 시 폴백 — 주문 status=completed 체크로 중복 방지
      const { data: user } = await supabase
        .from('users')
        .select('credits')
        .eq('id', (order as { user_id: string }).user_id)
        .single();

      const currentCredits = (user as { credits?: number } | null)?.credits ?? 0;
      await supabase
        .from('users')
        .update({ credits: currentCredits + credits })
        .eq('id', (order as { user_id: string }).user_id);
    }

    // Mark order as completed
    await supabase
      .from('payment_orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    // Record credit transaction
    await supabase.from('credit_transactions').insert({
      user_id: (order as { user_id: string }).user_id,
      amount: credits,
      type: 'purchase',
      description: `크레딧 구매 (주문: ${orderId})`,
    });
  } catch (e) {
    console.error('Failed to grant credits after payment:', e);
    // Return error so the client can retry or show an error state
    return NextResponse.json({ error: 'Credit grant failed', payment }, { status: 500 });
  }

  return NextResponse.json({ payment });
}
