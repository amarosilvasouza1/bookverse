import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/SettingsForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      banner: true,
      socialLinks: true,
      geminiApiKey: true,
    }
  });

  if (!user) {
    redirect('/login');
  }

  return <SettingsForm user={user} />;
}
