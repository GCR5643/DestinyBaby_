import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Supabase 호출에 3초 타임아웃 — 프로젝트 정지/DNS 실패 시 전체 앱 504 방지
  const getUserWithTimeout = async () => {
    const timeout = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => {
        console.error('[Middleware] Supabase getUser 3s timeout — fail-open');
        resolve({ data: { user: null } });
      }, 3000)
    );
    try {
      return await Promise.race([supabase.auth.getUser(), timeout]);
    } catch (err) {
      console.error('[Middleware] Supabase getUser error:', err);
      return { data: { user: null } } as const;
    }
  };
  const { data: { user } } = await getUserWithTimeout();

  // SKIP_AUTH: 개발 환경 전용 인증 우회
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH_DEV === 'true') {
    return supabaseResponse;
  }

  // 공개 경로: 인증 없이 접근 가능 (투표 바이럴 등)
  const publicPaths = ['/naming/vote/', '/daily-fortune', '/birthdate'];
  const isPublic = publicPaths.some(p => request.nextUrl.pathname.startsWith(p));
  if (isPublic) return supabaseResponse;

  const protectedPaths = ['/saju', '/cards', '/community', '/shop', '/profile', '/credits', '/naming'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (!user && isProtected) {
    // Allow guests to access most routes with the guest cookie
    const isGuest = request.cookies.get('destiny-baby-guest')?.value === 'true';
    const guestAllowedPaths = ['/naming', '/cards', '/saju', '/community', '/profile', '/credits'];
    const isGuestAllowed = guestAllowedPaths.some(p => request.nextUrl.pathname.startsWith(p));
    if (isGuest && isGuestAllowed) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
