'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createRoom(bookId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Create room and add creator as participant
    const room = await prisma.readingRoom.create({
      data: {
        hostId: session.id as string,
        bookId,
        status: 'ACTIVE',
        participants: {
          create: {
            userId: session.id as string,
          }
        }
      },
    });

    return { success: true, roomId: room.id };
  } catch (error) {
    console.error('Create Room Error:', error);
    return { error: 'Failed to create room' };
  }
}

export async function joinRoom(roomId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Check if room exists and is active
    const room = await prisma.readingRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || room.status !== 'ACTIVE') {
      return { error: 'Room not found or inactive' };
    }

    // Add user to participants if not already joined
    await prisma.readingRoomParticipant.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId: session.id as string,
        }
      },
      update: {},
      create: {
        roomId,
        userId: session.id as string,
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Join Room Error:', error);
    return { error: 'Failed to join room' };
  }
}

export async function leaveRoom(roomId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.readingRoomParticipant.deleteMany({
      where: {
        roomId,
        userId: session.id as string,
      }
    });

    // If host leaves, maybe end room? For now, let's keep it simple.
    // Ideally we should check if no participants left and delete room.

    return { success: true };
  } catch (error) {
    console.error('Leave Room Error:', error);
    return { error: 'Failed to leave room' };
  }
}

export async function getRoomState(roomId: string) {
  try {
    const room = await prisma.readingRoom.findUnique({
      where: { id: roomId },
      include: {
        host: {
          select: { name: true, image: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    });

    if (!room) return { error: 'Room not found' };

    const session = await getSession();
    const isHost = session?.id === room.hostId;
    const isParticipant = room.participants.some(p => p.userId === session?.id);

    return { 
      success: true, 
      data: {
        currentPage: room.currentPage,
        status: room.status,
        host: room.host,
        participants: room.participants.map(p => p.user),
        isHost,
        isParticipant
      }
    };
  } catch (error) {
    console.error('Get Room State Error:', error);
    return { error: 'Failed to fetch room state' };
  }
}

export async function updateRoomPage(roomId: string, pageNumber: number) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const room = await prisma.readingRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) return { error: 'Room not found' };
    if (room.hostId !== session.id) return { error: 'Only host can update page' };

    await prisma.readingRoom.update({
      where: { id: roomId },
      data: { currentPage: pageNumber },
    });

    return { success: true };
  } catch (error) {
    console.error('Update Room Page Error:', error);
    return { error: 'Failed to update page' };
  }
}

export async function getRooms() {
  try {
    const rooms = await prisma.readingRoom.findMany({
      where: { status: 'ACTIVE' },
      include: {
        book: { select: { title: true, coverImage: true } },
        host: { select: { name: true, image: true } },
        participants: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: rooms };
  } catch (error) {
    console.error('Get Rooms Error:', error);
    return { error: 'Failed to fetch rooms' };
  }
}
