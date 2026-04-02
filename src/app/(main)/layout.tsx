import BottomNav from '@/components/layout/BottomNav';

// force-dynamic 제거: 각 페이지에서 필요 시 개별 설정
// 정적 페이지(terms, privacy 등)가 정적 생성 혜택을 받을 수 있도록

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
