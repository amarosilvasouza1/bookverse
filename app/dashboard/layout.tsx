import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageProvider } from '@/context/LanguageContext';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <LanguageProvider>
      <DashboardShell userId={session.id as string}>
        {children}
      </DashboardShell>
    </LanguageProvider>
  );
}
