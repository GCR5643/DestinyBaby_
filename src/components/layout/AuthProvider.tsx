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

    // 초기 세션 확인
    const initSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // users 테이블에서 프로필 데이터 가져오기
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUser(profile as User);
          } else {
            // users 테이블에 없으면 기본 프로필 생성
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              nickname: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '사용자',
              credits: 0,
              total_pulls: 0,
              destiny_fragments: 0,
            } as User);
          }
        } else {
          // 초기화 전이면 persist된 기존 값 유지하지 않음 — 명시적 로그아웃
          setUser(null);
        }
      } catch {
        // 네트워크 에러 시: persist된 기존 user를 유지 (null로 덮어쓰지 않음)
        // → 이전에 로그인한 유저는 오프라인에서도 UI 접근 가능
        if (!initialized.current) {
          // 첫 로드에서 네트워크 에러면 기존 persist 유지
          console.warn('[AuthProvider] 세션 확인 실패, 기존 상태 유지');
        }
      } finally {
        initialized.current = true;
      }
    };

    initSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as User);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              nickname: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '사용자',
              credits: 0,
              total_pulls: 0,
              destiny_fragments: 0,
            } as User);
          }
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
