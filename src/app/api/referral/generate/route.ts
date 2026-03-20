import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateReferralCode } from '@/lib/utils';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const code = generateReferralCode();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('referral_codes')
    .insert({ user_id: user.id, code, expires_at: expiresAt })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ code: data.code });
}
