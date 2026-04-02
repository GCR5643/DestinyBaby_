import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { resultId, selectedName, selectedHanja, orderId } = body;

  // 결제 검증: 완료된 주문이 있는지 확인
  if (orderId) {
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('status, amount, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '결제가 확인되지 않았습니다' }, { status: 402 });
    }
  } else {
    // orderId 없이 호출 시: 조각(무료 크레딧)으로 차감 시도
    const { error: deductError } = await supabase.rpc('deduct_fragments', {
      p_user_id: user.id,
      p_amount: 5,
      p_type: 'naming_report',
      p_description: `작명 리포트 생성: ${selectedName}`,
    });

    if (deductError) {
      return NextResponse.json({ error: '조각이 부족하거나 결제가 필요합니다' }, { status: 402 });
    }
  }

  const { data: report, error } = await supabase
    .from('naming_reports')
    .insert({
      result_id: resultId,
      user_id: user.id,
      selected_name: selectedName,
      selected_hanja: selectedHanja,
      report_data: {},
      price_paid: orderId ? 1000 : 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reportId: report.id });
}
