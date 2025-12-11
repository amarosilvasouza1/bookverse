'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

export async function togglePostLike(postId: string, type: string = 'HEART') {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.id as string,
        },
      },
    });

    if (existingLike) {
      if (existingLike.type === type) {
        // Toggle off if same type
        await prisma.postLike.delete({
            where: { id: existingLike.id },
        });
      } else {
        // Change type
        await prisma.postLike.update({
            where: { id: existingLike.id },
            data: { type },
        });
      }
    } else {
      const like = await prisma.postLike.create({
        data: {
          postId,
          userId: session.id as string,
          type,
        },
        include: {
          post: true,
        },
      });

      // Notify post author if it's not their own post
      if (like.post.authorId !== session.id) {
        await createNotification(
          like.post.authorId,
          type === 'HEART' ? 'LIKE' : 'REACTION',
          `${session.username} reacted with ${type} to your post`,
          `/dashboard/communities/${like.post.communityId}`
        );
      }
    }

    revalidatePath('/dashboard/communities/[id]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { error: 'Failed to toggle like' };
  }
}

export async function createComment(postId: string, content: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  if (!content.trim()) {
    return { error: 'Content is required' };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.id as string,
      },
      include: {
        post: true,
      },
    });

    // Notify post author if it's not their own post
    if (comment.post.authorId !== session.id) {
      await createNotification(
        comment.post.authorId,
        'COMMENT',
        `${session.username} commented on your post`,
        `/dashboard/communities/${comment.post.communityId}`
      );
    }

    // Handle Mentions
    const mentionRegex = /@(\w+(\.\w+)*)/g;
    const matches = content.match(mentionRegex);
    
    if (matches) {
      const usernames = matches.map(m => m.substring(1)); // remove @
      const mentionedUsers = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { id: true, username: true }
      });

      for (const user of mentionedUsers) {
        if (user.id !== session.id) {
           await createNotification(
             user.id,
             'MENTION', // Make sure this typestring is valid in createNotification signature or update it
             `${session.username} mentioned you in a comment`,
             `/dashboard/communities/${comment.post.communityId}`
           );
        }
      }
    }

    revalidatePath('/dashboard/communities/[id]', 'page');
    return { success: true, comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { error: 'Failed to create comment' };
  }
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { error: 'Comment not found' };
    }

    if (comment.authorId !== session.id) {
      return { error: 'Unauthorized' };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath('/dashboard/communities/[id]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { error: 'Failed to delete comment' };
  }
}

export async function getComments(postId: string) {
  const session = await getSession();
  
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: comments, currentUserId: session?.id };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { error: 'Failed to fetch comments' };
  }
}
