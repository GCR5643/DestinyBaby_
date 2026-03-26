'use client';

import Link from 'next/link';
import { Gem } from 'lucide-react';
import { motion } from 'framer-motion';

interface FragmentBadgeProps {
  balance: number;
  showLink?: boolean;
}

export default function FragmentBadge({ balance, showLink = true }: FragmentBadgeProps) {
  const content = (
    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-full px-3 py-1.5 shadow-sm">
      <Gem className="w-4 h-4 text-purple-500" />
      <span className="text-sm font-bold text-purple-700">{balance.toLocaleString()}</span>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/wallet" className="hover:opacity-80 transition">
        {content}
      </Link>
    );
  }

  return content;
}
