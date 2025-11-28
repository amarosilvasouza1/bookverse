'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Get list of conversations (only with mutual followers)
export async function getConversations() {
  const session = await getSession();
  if (!session) return [];

  const userId = session.id as string;

  // Fetch existing conversations
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true, username: true }
          }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Format for UI
  return conversations.map(conv => {
    const otherParticipant = conv.participants.find(p => p.userId !== userId)?.user;
    return {
      id: conv.id,
      otherUser: otherParticipant,
      lastMessage: conv.messages[0]
    };
  });
}

// Get list of mutual followers who don't have a conversation yet
export async function getMutualFollowersForChat() {
  const session = await getSession();
  if (!session) return [];

  const userId = session.id as string;

  // Find users who follow me AND I follow them
  const mutualFollows = await prisma.user.findMany({
    where: {
      AND: [
        { followers: { some: { followerId: userId } } }, // I follow them
        { following: { some: { followingId: userId } } } // They follow me
      ]
    },
    select: { id: true, name: true, image: true, username: true }
  });

  return mutualFollows;
}

// Get list of users I follow but who DON'T follow me back (for Follow Requests)
export async function getNonMutualFollowings() {
  const session = await getSession();
  if (!session) return [];

  const userId = session.id as string;

  // Find users I follow who do NOT follow me back
  const nonMutuals = await prisma.user.findMany({
    where: {
      followers: { some: { followerId: userId } }, // I follow them
      NOT: {
        following: { some: { followingId: userId } } // They follow me
      }
    },
    select: { id: true, name: true, image: true, username: true }
  });
  
  return nonMutuals;
}

// Send a message (Enforce Mutual Follow)
export async function sendMessage(recipientId: string, content: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const userId = session.id as string;

  // 1. Check Mutual Follow
  const isMutual = await prisma.follow.count({
    where: {
      OR: [
        { followerId: userId, followingId: recipientId },
        { followerId: recipientId, followingId: userId }
      ]
    }
  });

  if (isMutual < 2) {
    return { error: 'You can only message users who follow you back.' };
  }

  // 2. Find or Create Conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: recipientId } } }
      ]
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: recipientId }
          ]
        }
      }
    });
  }

  // 3. Create Message
  await prisma.directMessage.create({
    data: {
      content,
      senderId: userId,
      conversationId: conversation.id
    }
  });

  // 4. Update Conversation Timestamp
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() }
  });

  revalidatePath('/dashboard/social');
  return { success: true };
}

// Request a Follow Back
export async function requestFollowBack(targetUserId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const userId = session.id as string;

  // Check if I already follow them (prerequisite)
  const doIFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: targetUserId
      }
    }
  });

  if (!doIFollow) {
    return { error: 'You must follow them first.' };
  }

  // Create Notification
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: 'FOLLOW_REQUEST',
      message: `${session.name} wants to chat and is requesting you to follow them back.`,
      link: `/dashboard/profile/${session.username}` // Link to my profile
    }
  });

  return { success: true };
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const session = await getSession();
  if (!session) return [];

  return await prisma.directMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, image: true } }
    }
  });
}
