'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';

/**
 * Supabase 인증 상태를 감지하여 Zustand userStore에 동기화하는 Provider.
 * 로그인/로그아웃 시 자동으로 user 상태가 업데이트됩니다.
 *
 * 핵심: 초기 로딩 중에는 persist된 기존 user를 유지하여,
 * 로그인 직후 페이지 이동 시 user=null 깜빡임을 방지합니다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);
  const initialized = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // 인증 유저 → Zustand 동기화 헬퍼
    const syncUser = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, string> }) => {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile as User);
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          nickname: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '사용자',
          credits: 0,
          total_pulls: 0,
          destiny_fragments: 0,
        } as User);
      }
    };

    // 초기 세션 확인 — getSession()으로 refresh token 자동 갱신 트리거
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncUser(session.user);
        } else {
          setUser(null);
        }
      } catch {
        // 네트워크 에러 시: persist된 기존 user 유지 (null로 덮어쓰지 않음)
        if (!initialized.current) {
          console.warn('[AuthProvider] 세션 확인 실패, 기존 상태 유지');
        }
      } finally {
        initialized.current = true;
      }
    };

    initSession();

    // 인증 상태 변경 리스너 — SIGNED_IN + TOKEN_REFRESHED 모두 처리
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          await syncUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}
