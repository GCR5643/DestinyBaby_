'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';

/**
 * Supabase 인증 상태를 감지하여 Zustand userStore에 동기화하는 Provider.
 * 로그인/로그아웃 시 자동으로 user 상태가 업데이트됩니다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);

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
          setUser(null);
        }
      } catch {
        // 에러 시 null 처리
        setUser(null);
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
