'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버 런타임 로그에 실제 스택 출력
    console.error('[GlobalError] digest:', error.digest);
    console.error('[GlobalError] message:', error.message);
    console.error('[GlobalError] stack:', error.stack);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>⚠️ 오류가 발생했습니다</h1>
        <p>{error.message}</p>
        <pre style={{ background: '#f4f4f4', padding: 12, overflow: 'auto', fontSize: 12 }}>
          {error.stack}
        </pre>
        <button onClick={() => reset()} style={{ marginTop: 16, padding: '8px 16px' }}>
          다시 시도
        </button>
      </body>
    </html>
  );
}
