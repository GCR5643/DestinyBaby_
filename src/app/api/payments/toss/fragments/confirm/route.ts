import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FRAGMENT_PACKS: Record<string, number> = {
  handful: 10,
  pouch: 30,
  pouch_large: 100,
  golden_jar: 300,
};

export async function POST(request: NextRequest) {
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
      { error: 'Missing required fields: paymentKey, orderId, amount' },
      { status: 400 },
    );
  }

  const { paymentKey, orderId, amount } = body as {
    paymentKey: string;
    orderId: string;
    amount: number;
  };

  const supabase = await createClient();

  // 1. DB에서 pending 주문 조회 + 금액 검증
  const { data: order, error: orderError } = await supabase
    .from('payment_orders')
    .select('user_id, pack_id, credits, amount, status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
  }

  const typedOrder = order as { user_id: string; pack_id: string; credits: number; amount: number; status: string };

  // 이미 완료된 주문 — 중복 요청 방지 (idempotent)
  if (typedOrder.status === 'completed') {
    const fragments = FRAGMENT_PACKS[typedOrder.pack_id] ?? typedOrder.credits;
    return NextResponse.json({ success: true, fragments, alreadyCompleted: true });
  }

  if (typedOrder.status !== 'pending') {
    return NextResponse.json({ error: '처리할 수 없는 주문 상태입니다' }, { status: 400 });
  }

  if (typedOrder.amount !== amount) {
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
  }

  // 2. 토스페이먼츠 결제 승인 API 호출
  const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!tossResponse.ok) {
    const tossError = await tossResponse.json();
    console.error('[toss-fragments] Payment confirmation failed:', tossError);

    await supabase
      .from('payment_orders')
      .update({ status: 'failed' })
      .eq('id', orderId);

    return NextResponse.json(
      { error: tossError.message || '결제 승인에 실패했습니다' },
      { status: 400 },
    );
  }

  // 3. 결제 성공 — 조각 지급
  const fragments = FRAGMENT_PACKS[typedOrder.pack_id] ?? typedOrder.credits;

  try {
    // add_fragments RPC로 원자적 지급
    const { error: rpcError } = await supabase.rpc('add_fragments', {
      p_user_id: typedOrder.user_id,
      p_amount: fragments,
      p_type: 'purchase',
      p_description: `운명의 조각 구매 (주문: ${orderId})`,
    });

    if (rpcError) {
      console.warn('[toss-fragments] RPC failed, using manual fallback:', rpcError);
      // 수동 폴백
      const { data: user } = await supabase
        .from('users')
        .select('destiny_fragments')
        .eq('id', typedOrder.user_id)
        .single();

      const current = (user as { destiny_fragments?: number } | null)?.destiny_fragments ?? 0;

      await supabase
        .from('users')
        .update({ destiny_fragments: current + fragments })
        .eq('id', typedOrder.user_id);

      await supabase.from('fragment_transactions').insert({
        user_id: typedOrder.user_id,
        amount: fragments,
        type: 'purchase',
        description: `운명의 조각 구매 (주문: ${orderId})`,
        balance_after: current + fragments,
      });
    }

    // 주문 완료 처리
    await supabase
      .from('payment_orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

  } catch (e) {
    console.error('[toss-fragments] Fragment grant failed:', e);
    return NextResponse.json(
      { error: '조각 지급에 실패했습니다. 고객센터에 문의해주세요.', orderId },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, fragments });
}
