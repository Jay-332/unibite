'use server';

import { generateAIResponse } from '@/lib/gemini-service';
import { GeminiRequest, ChatbotResponse } from '@/lib/chatbot-types';

export async function chatAction(request: GeminiRequest): Promise<ChatbotResponse> {
    try {
        console.log('💬 Server Action: Received chat request');
        return await generateAIResponse(request);
    } catch (error: any) {
        console.error('❌ Server Action Error:', error);
        throw new Error(error.message || 'Failed to process chat request');
    }
}
