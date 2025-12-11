'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

// Report types
type ReportType = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
type ContentType = 'POST' | 'COMMENT' | 'BOOK' | 'MESSAGE' | 'USER';

// Submit a report
export async function submitReport(
  contentType: ContentType,
  contentId: string,
  reason: ReportType,
  details?: string
) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  const userId = session.id as string;

  try {
    // Check if user already reported this content
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        contentType,
        contentId,
        status: { not: 'DISMISSED' } // Allow re-reporting if previously dismissed
      }
    });

    if (existing) {
      return { error: 'You have already reported this content' };
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        contentType,
        contentId,
        reason,
        details,
        status: 'PENDING'
      }
    });

    return { success: true, reportId: report.id };
  } catch (error) {
    console.error('Failed to submit report:', error);
    return { error: 'Failed to submit report' };
  }
}

// Get reports (admin only)
export async function getReports(status?: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  // Check if admin
  const user = await prisma.user.findUnique({
    where: { id: session.id as string },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  try {
    const reports = await prisma.report.findMany({
      where: status ? { status } : undefined,
      include: {
        reporter: {
          select: { id: true, name: true, username: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error('Failed to get reports:', error);
    return { error: 'Failed to get reports' };
  }
}

// Resolve a report (admin only)
export async function resolveReport(
  reportId: string,
  action: 'WARN' | 'REMOVE' | 'BAN' | 'DISMISS'
) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  // Check if admin
  const user = await prisma.user.findUnique({
    where: { id: session.id as string },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return { error: 'Report not found' };
    }

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: session.id as string,
        action
      }
    });

    // Take action based on content type
    if (action === 'REMOVE') {
      if (report.contentType === 'POST') {
        await prisma.post.delete({ where: { id: report.contentId } });
      } else if (report.contentType === 'COMMENT') {
        await prisma.comment.delete({ where: { id: report.contentId } });
      } else if (report.contentType === 'BOOK') {
        await prisma.book.update({
          where: { id: report.contentId },
          data: { published: false }
        });
      }
    }

    // Notify the reporter
    await createNotification(
      report.reporterId,
      'SYSTEM',
      action === 'DISMISS' 
        ? 'Your report was reviewed and no action was taken.'
        : `Your report was reviewed. Action taken: ${action}`,
      undefined
    );

    revalidatePath('/dashboard/admin/reports');
    return { success: true };
  } catch (error) {
    console.error('Failed to resolve report:', error);
    return { error: 'Failed to resolve report' };
  }
}
