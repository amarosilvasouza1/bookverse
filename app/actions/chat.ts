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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversations = await (prisma.conversation as any).findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: { 
              id: true, 
              name: true, 
              image: true, 
              username: true,
              items: {
                where: { equipped: true, item: { type: 'FRAME' } },
                select: { item: { select: { rarity: true } } }
              }
            }
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
  // Cast to any to bypass Prisma inference errors due to stale client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversationsData = conversations as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversationsWithUnread = await Promise.all(conversationsData.map(async (conv: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherParticipant = conv.participants.find((p: any) => p.userId !== userId)?.user;
    
    // Count unread messages from the other user
    const unreadCount = await prisma.directMessage.count({
      where: {
        conversationId: conv.id,
        senderId: { not: userId },
        read: false
      }
    });

    // Check if typing indicator is active (less than 5 seconds ago)
    const isOtherTyping = conv.typingUserId && 
                          conv.typingUserId !== userId &&
                          conv.typingAt && 
                          (Date.now() - new Date(conv.typingAt).getTime()) < 5000;

    return {
      id: conv.id,
      otherUser: otherParticipant,
      lastMessage: conv.messages[0],
      unreadCount,
      isTyping: isOtherTyping
    };
  }));

  return conversationsWithUnread;
}

// Set typing indicator
export async function setTyping(conversationId: string, isTyping: boolean) {
  const session = await getSession();
  if (!session) return;

  const userId = session.id as string;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.conversation as any).update({
      where: { id: conversationId },
      data: {
        typingUserId: isTyping ? userId : null,
        typingAt: isTyping ? new Date() : null
      }
    });
  } catch {
    // Silent fail - typing indicator is not critical
  }
}

// Mark messages as read in a conversation
export async function markMessagesAsRead(conversationId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const userId = session.id as string;

  await prisma.directMessage.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      read: false
    },
    data: {
      read: true
    }
  });

  revalidatePath('/dashboard/social');
  return { success: true };
}

// Get list of mutual followers who don't have a conversation yet
export async function getMutualFollowersForChat() {
  const session = await getSession();
  if (!session) return [];

  const userId = session.id as string;

  // Find users who follow me AND I follow them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutualFollows = await (prisma.user as any).findMany({
    where: {
      AND: [
        { followers: { some: { followerId: userId } } }, // I follow them
        { following: { some: { followingId: userId } } } // They follow me
      ]
    },
    select: { 
      id: true, 
      name: true, 
      image: true, 
      username: true,
      items: {
        where: { equipped: true, item: { type: 'FRAME' } },
        select: { item: { select: { rarity: true } } }
      }
    }
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
    select: { 
      id: true, 
      name: true, 
      image: true, 
      username: true,
      items: {
        where: { equipped: true, item: { type: 'FRAME' } },
        select: { item: { select: { rarity: true } } }
      }
    }
  });
  
  return nonMutuals;
}

// Send a message (Enforce Mutual Follow)
export async function sendMessage(recipientId: string, content: string, mediaUrl?: string, mediaType?: 'IMAGE' | 'VIDEO') {
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

  // 3. Create Message (with Error Handling)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.directMessage as any).create({
      data: {
        content,
        senderId: userId,
        conversationId: conversation.id,
        mediaUrl,
        mediaType
      }
    });

    // 4. Update Conversation Timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });
  
  } catch (error) {
    console.error("Message creation failed:", error);
    // Return specific error if possible, or generic
    return { error: 'Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error') };
  }

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

// Update Last Seen Timestamp
export async function updateLastSeen() {
  const session = await getSession();
  if (!session) return;

  const userId = session.id as string;

  try {
    await prisma.user.update({
        where: { id: userId },
        data: { 
            // @ts-expect-error - Prisma client sync issue
            lastSeen: new Date() 
        }
    });
  } catch (e) {
    // Silent fail for heartbeat
    console.error("Failed to update last seen", e);
  }
}

// Get messages for a conversation with pagination
export async function getMessages(conversationId: string, cursor?: string, limit: number = 20) {
  const session = await getSession();
  if (!session) return { messages: [], nextCursor: null };

  const messages = await prisma.directMessage.findMany({
    where: { conversationId },
    take: limit + 1, // Fetch one extra to check if there are more
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // Skip the cursor itself
    orderBy: { createdAt: 'desc' }, // Fetch newest first
    include: {
      sender: { 
        select: { 
          id: true, 
          name: true, 
          image: true,
          items: {
            where: { equipped: true, item: { type: 'FRAME' } },
            select: { item: { select: { rarity: true } } }
          }
        } 
      }
    }
  });

  let nextCursor: string | null = null;
  if (messages.length > limit) {
    const nextItem = messages.pop(); // Remove the extra item
    nextCursor = nextItem?.id || null;
  }

  // Reverse to show oldest to newest in chat
  return {
    messages: messages.reverse(),
    nextCursor
  };
}
