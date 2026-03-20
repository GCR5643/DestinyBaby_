import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { resultId, selectedName, selectedHanja, paymentMethod } = body;

  // Verify payment amount (1,000원)
  // In production: verify with Toss/Naver/Stripe webhook

  const { data: report, error } = await supabase
    .from('naming_reports')
    .insert({
      result_id: resultId,
      user_id: user.id,
      selected_name: selectedName,
      selected_hanja: selectedHanja,
      report_data: {},
      price_paid: 1000,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reportId: report.id });
}
