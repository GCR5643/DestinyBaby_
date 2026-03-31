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
  const setAuthReady = useUserStore((s) => s.setAuthReady);
  const initialized = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // 인증 유저 → Zustand 동기화 헬퍼
    const syncUser = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, string> }) => {
      try {
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
      } catch {
        // DB 조회 실패 시에도 최소한의 유저 정보로 세팅
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

    // onAuthStateChange 단일 진입점 — INITIAL_SESSION으로 초기 세션 확인
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await syncUser(session.user);
        } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          setUser(null);
        }

        if (!initialized.current) {
          initialized.current = true;
          setAuthReady(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAuthReady]);

  return <>{children}</>;
}
