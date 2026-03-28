'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';

export default function ProfileSettingsPage() {
  const { user } = useUserStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [notifications, setNotifications] = useState({
    cardPull: true,
    communityComment: true,
    eventBenefit: false,
    appUpdate: true,
  });

  const handleSave = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('users')
          .update({ nickname })
          .eq('id', authUser.id);
      }
      alert('저장됨');
    } catch {
      alert('저장 실패. 잠시 후 다시 시도해주세요.');
    }
  };

  const handlePasswordReset = async () => {
    const email = user?.email;
    if (!email) {
      alert('이메일 정보를 찾을 수 없습니다.');
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('이메일로 비밀번호 재설정 링크를 발송했습니다.');
    } catch {
      alert('비밀번호 재설정 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDeleteAccount = () => {
    alert('회원 탈퇴를 원하시면 고객센터로 문의해주세요.');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const avatarInitial = (nickname || user?.nickname || '?')[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <Link href="/profile" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-bold text-gray-800">설정</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-5"
        >
          <h2 className="text-sm font-semibold text-gray-500 mb-4">프로필</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600 mb-2">
              {avatarInitial}
            </div>
            <span className="text-xs text-gray-400">프로필</span>
          </div>

          {/* Nickname */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-medium">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="닉네임을 입력해주세요"
            />
            <p className="text-xs text-gray-400 text-right">{nickname.length}/20</p>
          </div>

          <button
            onClick={handleSave}
            className="mt-4 w-full bg-primary-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            저장
          </button>
        </motion.div>

        {/* Notification settings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-5"
        >
          <h2 className="text-sm font-semibold text-gray-500 mb-4">알림 설정</h2>

          {[
            { key: 'cardPull' as const, label: '카드 뽑기 알림' },
            { key: 'communityComment' as const, label: '커뮤니티 댓글 알림' },
            { key: 'eventBenefit' as const, label: '이벤트/혜택 알림' },
            { key: 'appUpdate' as const, label: '앱 업데이트 알림' },
          ].map(({ key, label }, i) => (
            <div
              key={key}
              className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <span className="text-sm text-gray-700">{label}</span>
              <button
                onClick={() => toggleNotification(key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-primary-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Account section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <h2 className="text-sm font-semibold text-gray-500 px-5 pt-5 mb-2">계정</h2>

          <button
            onClick={handlePasswordReset}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-50"
          >
            <span className="text-sm text-gray-700">비밀번호 변경</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-red-50 transition-colors border-t border-gray-50"
          >
            <span className="text-sm text-red-500 font-medium">회원 탈퇴</span>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
