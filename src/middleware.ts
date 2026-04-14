import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const AUTH_PROTECTED_PREFIXES = ['/admin', '/profile', '/wallet'];

export async function middleware(request: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isProd) {
      return new NextResponse('Service Configuration Error', { status: 503 });
    }
    return NextResponse.next();
  }
  try {
    return await updateSession(request);
  } catch (error) {
    console.error('[Middleware] 세션 업데이트 실패:', error);
    const path = request.nextUrl.pathname;
    if (isProd && AUTH_PROTECTED_PREFIXES.some(p => path.startsWith(p))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session');
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
