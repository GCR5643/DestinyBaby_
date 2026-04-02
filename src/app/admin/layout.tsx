import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminEmailsEnv = process.env.ADMIN_EMAILS;

  if (!adminEmailsEnv) {
    console.error(
      '[AdminLayout] ADMIN_EMAILS 환경변수가 설정되지 않았습니다. 접근을 차단합니다.'
    );
    redirect('/');
  } else {
    const adminEmails = adminEmailsEnv.split(',').map((e) => e.trim());
    if (!user.email || !adminEmails.includes(user.email)) {
      redirect('/');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
