import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKoreanDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatTime(time: string): string {
  if (!time) return '시간 미상';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}시 ${m}분`;
}

export function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    wood: '#27ae60',
    fire: '#e74c3c',
    earth: '#f39c12',
    metal: '#bdc3c7',
    water: '#2980b9',
  };
  return colors[element] || '#6C5CE7';
}

export function getElementEmoji(element: string): string {
  const emojis: Record<string, string> = {
    wood: '🌿',
    fire: '🔥',
    earth: '🌍',
    metal: '⚡',
    water: '💧',
  };
  return emojis[element] || '✨';
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    N: '#95a5a6',    // Normal: gray
    R: '#4a90d9',    // Rare: blue
    SR: '#a29bfe',   // Super Rare: purple
    SSR: '#F9CA24',  // Super Super Rare: gold/yellow
    UR: '#dc2626',   // Ultra Rare: red/crimson
    SSS: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)', // Legendary: rainbow
  };
  return colors[grade] || '#95a5a6';
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
