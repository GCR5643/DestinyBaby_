'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold text-gray-800">개인정보처리방침</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">1. 수집하는 개인정보</h2>
          <p>서비스 이용 시 다음 정보를 수집합니다:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>필수:</strong> 이메일 주소 (소셜 로그인 시 자동 수집)</li>
            <li><strong>선택:</strong> 닉네임, 아이 이름, 아이 생년월일, 부모 생년월일</li>
            <li><strong>자동 수집:</strong> 접속 로그, 기기 정보, 쿠키</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">2. 수집 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>사주 분석 및 이름 추천 서비스 제공</li>
            <li>오늘의 운수 등 개인화 콘텐츠 생성</li>
            <li>서비스 개선 및 통계 분석</li>
            <li>유료 서비스 결제 처리</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">3. 보유 기간</h2>
          <p>회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 보관합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>전자상거래 관련 기록: 5년</li>
            <li>접속 로그: 3개월</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">4. 제3자 제공</h2>
          <p>이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 요청이 있는 경우 예외로 합니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">5. 외부 서비스</h2>
          <p>서비스는 다음 외부 서비스를 이용하며, 각 서비스의 개인정보처리방침을 따릅니다:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Supabase (인증 및 데이터 저장)</li>
            <li>Upstage AI (AI 분석 처리 — 개인 식별 정보 미전송)</li>
            <li>Vercel (호스팅)</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해 개인정보 처리를 중단할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-gray-900 mb-2">7. 문의</h2>
          <p>개인정보 관련 문의: <a href="mailto:support@destiny-baby.com" className="text-primary-600 underline">support@destiny-baby.com</a></p>
        </section>
        <p className="text-xs text-gray-400 pt-4">시행일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
