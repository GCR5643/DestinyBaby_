'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Sparkles, Sun, User } from 'lucide-react';
import type { Element } from '@/types';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  element: Element;  // 활성 시 이 오행 컬러로 배지 표시
};

const NAV_ITEMS: NavItem[] = [
  { href: '/',              label: '홈',       icon: Home,     element: 'water' },
  { href: '/daily-fortune', label: '오늘운수', icon: Sun,      element: 'fire' },
  { href: '/naming',        label: '작명소',   icon: Sparkles, element: 'wood' },
  { href: '/profile',       label: '프로필',   icon: User,     element: 'earth' },
];

const DOT_BG: Record<Element, string> = {
  wood:  'bg-oheng-wood-500',
  fire:  'bg-oheng-fire-500',
  earth: 'bg-oheng-earth-500',
  metal: 'bg-oheng-metal-500',
  water: 'bg-oheng-water-500',
};

const ICON_ACTIVE: Record<Element, string> = {
  wood:  'text-oheng-wood-700',
  fire:  'text-oheng-fire-700',
  earth: 'text-oheng-earth-700',
  metal: 'text-oheng-metal-700',
  water: 'text-oheng-water-700',
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-pb"
      aria-label="주요 네비게이션"
    >
      {/* 상단 골드 라인 (카드 앤틱 프레임 느낌) */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent opacity-60" />

      <div className="bg-white/95 backdrop-blur-md border-t border-primary-100 shadow-[0_-4px_20px_rgba(108,92,231,0.08)]">
        <div className="flex items-end justify-around max-w-lg mx-auto px-2 pt-2 pb-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, element }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-0 group"
                aria-current={isActive ? 'page' : undefined}
              >
                {/* 활성 시 위로 뜨는 버블 배지 */}
                <motion.div
                  animate={{
                    y: isActive ? -6 : 0,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className={cn(
                    'flex items-center justify-center rounded-full transition-colors',
                    isActive
                      ? cn('w-11 h-11 border-2 border-white shadow-soft', DOT_BG[element])
                      : 'w-9 h-9'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                    )}
                  />
                </motion.div>

                {/* 레이블 */}
                <span
                  className={cn(
                    'text-[11px] font-medium transition-all',
                    isActive ? cn('font-display', ICON_ACTIVE[element]) : 'text-gray-400'
                  )}
                >
                  {label}
                </span>

                {/* 활성 표시 도트 */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className={cn('w-1 h-1 rounded-full mt-0.5', DOT_BG[element])}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
