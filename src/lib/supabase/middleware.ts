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

  const { data: { user } } = await supabase.auth.getUser();

  // SKIP_AUTH: 테스트용 전체 인증 우회
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
    return supabaseResponse;
  }

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
