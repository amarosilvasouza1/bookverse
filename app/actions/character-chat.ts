'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { Prisma } from '@prisma/client';

type ChatSessionWithMessages = Prisma.ChatSessionGetPayload<{
  include: { messages: true }
}>;

export async function chatWithCharacter(characterId: string, message: string, apiKey: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    if (!apiKey) {
      return { error: 'API Key is required' };
    }

    // 1. Fetch Character and Context
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return { error: 'Character not found' };
    }

    // 2. Get or Create Chat Session
    let chatSession = await prisma.chatSession.findFirst({
      where: {
        userId: session.id as string,
        characterId: characterId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10, // Last 10 messages for context
        },
      },
    });

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.id as string,
          characterId: characterId,
        },
        include: {
          messages: true,
        },
      });
    }

    // 3. Save User Message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'USER',
        content: message,
      },
    });

    // 4. Construct Prompt
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const history = (chatSession as ChatSessionWithMessages).messages.map((msg) => 
      `${msg.role === 'USER' ? 'User' : character.name}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are roleplaying as ${character.name}.
    
    Character Description: ${character.description}
    Personality/Context: ${character.personality}
    
    Instructions:
    - Stay in character at all times.
    - Respond to the user's latest message.
    - Use the provided history for context.
    - Keep responses concise and engaging (max 3-4 sentences unless asked for more).
    - Do not break the fourth wall.
    
    Chat History:
    ${history}
    User: ${message}
    ${character.name}:`;

    // 5. Generate Response
    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // 6. Save AI Response
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'ASSISTANT',
        content: text,
      },
    });

    return { success: true, message: text };

  } catch (error: unknown) {
    console.error('Chat Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return { error: errorMessage };
  }
}

export async function getChatHistory(characterId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        userId: session.id as string,
        characterId: characterId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chatSession) {
      return { success: true, data: [] };
    }

    return { success: true, data: (chatSession as ChatSessionWithMessages).messages };
  } catch (error: unknown) {
    console.error('Get History Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch history';
    return { error: errorMessage };
  }
}
