/**
 * 테스트용 인증 우회 플래그 (개발 환경 전용)
 *
 * 개발 환경에서만 SKIP_AUTH_DEV=true 로 설정하면 인증 체크를 우회합니다.
 * 프로덕션에서는 항상 false — NEXT_PUBLIC_ 접두사를 제거하여 클라이언트 번들 노출 방지
 */
export const SKIP_AUTH =
  process.env.NODE_ENV === 'development' &&
  process.env.SKIP_AUTH_DEV === 'true';

/** protectedProcedure에서 사용할 mock user (인증 우회 시) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_USER: any = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'test@destiny-baby.local',
  app_metadata: {},
  user_metadata: { full_name: '테스트 사용자' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};
