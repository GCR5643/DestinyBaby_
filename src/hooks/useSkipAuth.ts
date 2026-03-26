'use client';

import { SKIP_AUTH } from '@/lib/auth/skip-auth';

/**
 * 클라이언트 컴포넌트에서 인증 우회 여부를 확인하는 훅
 * SKIP_AUTH=true이면 user가 null이어도 로그인 리다이렉트를 하지 않음
 */
export function useSkipAuth() {
  return SKIP_AUTH;
}
