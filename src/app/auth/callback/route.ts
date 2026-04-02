import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SIGNUP_BONUS_FRAGMENTS = 10;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'magiclink' | 'email' | undefined;
  const nextParam = searchParams.get('next') ?? '/';
  // Open redirect 방지: 상대 경로만 허용
  const safePath = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  if (code || (token_hash && type)) {
    // 리다이렉트 응답을 먼저 생성하고, 세션 쿠키를 이 응답에 직접 설정
    const redirectUrl = new URL(safePath, origin);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // OAuth code exchange 또는 Magic Link OTP 검증
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: token_hash!, type: type! });

    if (!error) {
      // 신규 회원가입 보너스: 조각 10개 지급
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existing } = await supabase
            .from('users')
            .select('destiny_fragments')
            .eq('id', user.id)
            .single();

          const currentFragments = (existing as { destiny_fragments?: number } | null)?.destiny_fragments;
          if (currentFragments === null || currentFragments === undefined) {
            await supabase
              .from('users')
              .update({ destiny_fragments: SIGNUP_BONUS_FRAGMENTS })
              .eq('id', user.id);

            try {
              await supabase.from('fragment_transactions').insert({
                user_id: user.id,
                amount: SIGNUP_BONUS_FRAGMENTS,
                type: 'signup_bonus',
                description: '회원가입 축하 보너스 🎉',
              });
            } catch (error) {
              console.error('[AuthCallback] fragment_transactions 삽입 실패:', error);
            }
          }
        }
      } catch (error) {
        console.error('[AuthCallback] 회원가입 보너스 지급 실패:', error);
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-error`);
}
