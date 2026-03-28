'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold text-gray-800">이용약관</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">제1조 (목적)</h2>
          <p>이 약관은 &quot;운명의 아이&quot; 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와 운영자의 권리·의무를 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">제2조 (서비스 내용)</h2>
          <p>서비스는 전통 명리학(사주팔자)과 AI 기술을 결합하여 아기 이름 추천, 탄생일 추천, 오늘의 운수, 운명 카드 등의 콘텐츠를 제공합니다. 모든 결과는 오락 및 참고 목적이며, 의학적·법적 조언이 아닙니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">제3조 (이용 요금)</h2>
          <p>기본 서비스(이름 추천, 탄생일 추천)는 무료로 제공됩니다. &quot;운명의 조각&quot; 크레딧을 통해 유료 서비스(오늘의 운수, 상세 리포트 등)를 이용할 수 있으며, 크레딧은 환불이 불가합니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">제4조 (면책)</h2>
          <p>서비스의 사주 분석 및 이름 추천 결과는 전통 명리학에 기반한 참고 정보이며, 서비스 제공자는 결과의 정확성이나 효과를 보장하지 않습니다. 건강, 질병, 재산 등에 대한 중요한 결정은 전문가와 상담하시기 바랍니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">제5조 (개인정보)</h2>
          <p>개인정보 처리에 관한 사항은 <Link href="/privacy" className="text-primary-600 underline">개인정보처리방침</Link>을 따릅니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">제6조 (서비스 변경 및 중단)</h2>
          <p>운영자는 서비스 개선을 위해 사전 공지 후 서비스를 변경하거나 중단할 수 있으며, 무료 서비스의 경우 별도 보상을 제공하지 않습니다.</p>
        </section>
        <p className="text-xs text-gray-400 pt-4">시행일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
