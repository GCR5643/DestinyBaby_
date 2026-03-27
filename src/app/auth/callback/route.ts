import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

const SIGNUP_BONUS_FRAGMENTS = 10;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 신규 회원가입 보너스: 조각 10개 지급
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // users 테이블에서 destiny_fragments 확인
          const { data: existing } = await supabase
            .from('users')
            .select('destiny_fragments')
            .eq('id', user.id)
            .single();

          // 새 유저이거나 조각이 null이면 보너스 지급
          const currentFragments = (existing as { destiny_fragments?: number } | null)?.destiny_fragments;
          if (currentFragments === null || currentFragments === undefined) {
            await supabase
              .from('users')
              .update({ destiny_fragments: SIGNUP_BONUS_FRAGMENTS })
              .eq('id', user.id);

            // 트랜잭션 기록
            try {
              await supabase.from('fragment_transactions').insert({
                user_id: user.id,
                amount: SIGNUP_BONUS_FRAGMENTS,
                type: 'signup_bonus',
                description: '회원가입 축하 보너스 🎉',
              });
            } catch {
              // table may not exist yet
            }
          }
        }
      } catch {
        // 보너스 지급 실패해도 로그인은 진행
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-error`);
}
