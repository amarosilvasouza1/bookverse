'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession } from '@/lib/auth';

export async function generateBookAI(apiKey: string, prompt: string, pageCount: number = 3, mode: 'complete' | 'structure' | 'page' = 'complete') {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    if (!apiKey || !prompt) {
      return { error: 'API Key and Prompt are required' };
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    // gemini-2.0-flash is the only one that didn't return 404, so we stick with it and handle 429s
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let systemPrompt = '';
    
    if (mode === 'structure') {
      systemPrompt = `You are a helpful book writing assistant. 
      Generate a book structure (outline) based on the user's prompt.
      You MUST generate exactly ${pageCount} pages/chapters.
      The content for each page should be a brief 1-2 sentence summary of what happens in that chapter.
      Return ONLY valid JSON with the following structure:
      {
        "title": "Book Title",
        "description": "Book Description",
        "genre": "Genre",
        "pages": [
          {
            "title": "Chapter Title",
            "content": "Brief summary of chapter...",
            "pageNumber": 1
          }
          // ... exactly ${pageCount} items
        ]
      }`;
    } else if (mode === 'page') {
      systemPrompt = `You are a creative writing assistant.
      Write the content for a SINGLE chapter/page based on the user's prompt.
      Use Markdown formatting:
      - Use **bold** for emphasis.
      - Use *italics* for internal thoughts or emphasis.
      - Use proper paragraph breaks (\\n\\n).
      - Make it engaging and well-structured.
      Return ONLY valid JSON with the following structure:
      {
        "content": "The full chapter content..."
      }`;
    } else {
      // Complete mode
      systemPrompt = `You are a helpful book writing assistant. 
      Generate a book structure based on the user's prompt.
      You MUST generate exactly ${pageCount} pages/chapters.
      Use Markdown formatting for the content:
      - Use **bold** for emphasis.
      - Use *italics* for internal thoughts or emphasis.
      - Use proper paragraph breaks (\\n\\n).
      Return ONLY valid JSON with the following structure:
      {
        "title": "Book Title",
        "description": "Book Description",
        "genre": "Genre",
        "pages": [
          {
            "title": "Chapter Title",
            "content": "Chapter Content (at least 300 words, well formatted)",
            "pageNumber": 1
          }
          // ... exactly ${pageCount} items
        ]
      }`;
    }

    const fullPrompt = `${systemPrompt}
    
    User Prompt: ${prompt}
    
    IMPORTANT: Return ONLY the raw JSON string. Do not include markdown formatting like \`\`\`json or \`\`\`.`;

    // Retry logic for 429 errors
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent(fullPrompt);
        break; // Success
      } catch (error: any) {
        if (error.message?.includes('429') && retries > 1) {
          console.log(`Rate limit hit, retrying... (${retries - 1} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          retries--;
        } else {
          throw error; // Re-throw if not 429 or no retries left
        }
      }
    }

    if (!result) throw new Error('Failed to generate content after retries');

    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonResponse = JSON.parse(cleanText);
      return { success: true, data: jsonResponse };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw Text:', text);
      return { error: 'Failed to parse AI response. Please try again.' };
    }

  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('429')) {
      return { error: 'Rate limit exceeded. Please wait a moment and try again.' };
    }
    return { error: errorMessage || 'Failed to generate content. Please check your API key.' };
  }
}
