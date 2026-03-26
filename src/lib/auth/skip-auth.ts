/**
 * 테스트용 인증 우회 플래그
 *
 * NEXT_PUBLIC_SKIP_AUTH=true 로 설정하면 모든 인증 체크를 우회합니다.
 * 롤백: 환경변수를 삭제하거나 false로 변경하면 원래 인증이 복원됩니다.
 */
export const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

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
