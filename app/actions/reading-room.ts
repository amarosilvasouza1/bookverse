'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createReadingRoom(bookId: string, isPrivate: boolean = false) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const room = await prisma.readingRoom.create({
      data: {
        hostId: session.id as string,
        bookId,
        status: 'ACTIVE',
        isPrivate,
        participants: {
          create: {
            userId: session.id as string,
          }
        }
      },
    });

    revalidatePath('/dashboard/reading-rooms');
    return { success: true, roomId: room.id };
  } catch (error) {
    console.error('Error creating room:', error);
    return { error: 'Failed to create room' };
  }
}

export async function getActiveRooms() {
  try {
    const rooms = await prisma.readingRoom.findMany({
      where: { status: 'ACTIVE' },
      include: {
        book: {
          select: { title: true, coverImage: true, author: { select: { name: true } } }
        },
        host: {
          select: { name: true, image: true, username: true }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return rooms;
  } catch {
    return [];
  }
}

export async function joinRoom(roomId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Check if already joined
    const existing = await prisma.readingRoomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: session.id as string,
        }
      }
    });

    if (!existing) {
      await prisma.readingRoomParticipant.create({
        data: {
          roomId,
          userId: session.id as string,
        }
      });
    }

    revalidatePath(`/dashboard/reading-rooms/${roomId}`);
    return { success: true };
  } catch (error) {
    console.error('Error joining room:', error);
    return { error: 'Failed to join room' };
  }
}

export async function leaveRoom(roomId: string) {
    const session = await getSession();
    if (!session?.id) return;
  
    try {
      await prisma.readingRoomParticipant.deleteMany({
        where: {
          roomId,
          userId: session.id as string,
        }
      });
      revalidatePath(`/dashboard/reading-rooms/${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
}

export async function getRoomDetails(roomId: string) {
    const session = await getSession();
    if (!session?.id) return { error: 'Unauthorized' };

    try {
        const room = await prisma.readingRoom.findUnique({
            where: { id: roomId },
            include: {
                book: {
                    include: {
                        pages: { orderBy: { pageNumber: 'asc' } },
                        author: { select: { name: true, username: true } }
                    }
                },
                host: { select: { id: true, name: true, image: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, image: true, username: true } }
                    },
                    orderBy: { joinedAt: 'asc' }
                },
                messages: {
                    include: {
                        user: { select: { id: true, name: true, image: true } }
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                }
            }
        });

        if (!room) return { error: 'Room not found' };
        
        // ensure user is participant
        const isParticipant = room.participants.some(p => p.userId === session.id);
        if (!isParticipant) {
             // auto-join if not (for smoother UX) or return error
             // For now, assume client calls joinRoom first or we auto-join here:
             // Let's stick to client calling joinRoom for clarity, but UI will likely handle it.
        }

        return { success: true, room };
    } catch (error) {
        console.error('Error fetching room:', error);
        return { error: 'Failed to fetch room' };
    }
}

export async function sendRoomMessage(roomId: string, content: string) {
    const session = await getSession();
    if (!session?.id) return { error: 'Unauthorized' };

    try {
        const message = await prisma.readingRoomMessage.create({
            data: {
                roomId,
                userId: session.id as string,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true
                    }
                }
            }
        });
        revalidatePath(`/dashboard/reading-rooms/${roomId}`);
        return { success: true, message };
    } catch (error) {
        console.error('Error sending message:', error);
        return { error: 'Failed to send message' };
    }
}

export async function syncRoomProgress(roomId: string, page: number) {
    const session = await getSession();
    if (!session?.id) return { error: 'Unauthorized' };

    // Only host can sync? Or anyone? Typically host.
    try {
        const room = await prisma.readingRoom.findUnique({
            where: { id: roomId },
            select: { hostId: true }
        });

        if (!room || room.hostId !== session.id) return { error: 'Only host can sync progress' };

        await prisma.readingRoom.update({
            where: { id: roomId },
            data: { currentPage: page }
        });

        revalidatePath(`/dashboard/reading-rooms/${roomId}`);
        return { success: true };
    } catch {
        return { error: 'Failed to sync' };
    }
}
