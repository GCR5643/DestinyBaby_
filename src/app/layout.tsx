import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { KakaoScript } from "@/components/layout/KakaoScript";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "운명의 아이 (Destiny Baby)",
  description: "AI가 사주로 찾아주는 우리 아이 이름 · 운명 카드",
  keywords: ["작명", "사주", "아이이름", "아기이름", "운명카드", "AI작명"],
  openGraph: {
    title: "운명의 아이",
    description: "AI가 사주로 찾아주는 우리 아이 이름",
    type: "website",
  },
};

// 격리 테스트: Providers/KakaoScript 없이 렌더링
const ISOLATE = process.env.NEXT_PUBLIC_ISOLATE_ROOT === '1';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (ISOLATE) {
    return (
      <html lang="ko">
        <body>
          <div style={{ padding: 20, background: '#eff' }}>ISOLATE MODE — Providers/Kakao OFF</div>
          {children}
        </body>
      </html>
    );
  }
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
        <KakaoScript />
      </body>
    </html>
  );
}
