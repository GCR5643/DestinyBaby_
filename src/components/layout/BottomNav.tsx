'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Sun, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/daily-fortune', label: '오늘운수', icon: Sun },
  { href: '/naming', label: '작명소', icon: Sparkles },
  { href: '/profile', label: '프로필', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb md:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn(
              'flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-0',
              isActive ? 'text-primary-600' : 'text-gray-400'
            )}>
              <Icon className="w-5 h-5" />
              <span className={cn('text-xs font-medium', isActive ? 'text-primary-600' : 'text-gray-400')}>
                {label}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
