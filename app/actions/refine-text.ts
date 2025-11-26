'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function refineText(apiKey: string, text: string, instruction: string) {
  if (!apiKey) {
    return { error: 'API Key is required' };
  }

  if (!text) {
    return { error: 'No text selected to refine' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are an expert editor and writing assistant.
      
      Original Text:
      "${text}"
      
      Instruction:
      ${instruction}
      
      Please rewrite the original text following the instruction. 
      Return ONLY the rewritten text. Do not add quotes or explanations unless asked.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const refinedText = response.text();

    return { data: refinedText.trim() };
  } catch (error) {
    console.error('Error refining text:', error);
    return { error: 'Failed to refine text. Please check your API key and try again.' };
  }
}
