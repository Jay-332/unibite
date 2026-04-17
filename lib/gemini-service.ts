/**
 * Gemini AI Service for UniBites Chatbot
 * Provides AI-powered responses while maintaining strict business rules
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { MenuItem } from './data';
import { ChatbotResponse, Intent, MealType, GeminiRequest } from './chatbot-types';
import { UNIBITES_KNOWLEDGE, CHATBOT_CAPABILITIES } from './unibites-knowledge';
import { ResponseBuilder } from './chatbot-response-builder'; // Import builder for fallback responses

// Get API key from environment
// Get API key from environment (prefer server-side key)
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Validate API key format
const isValidAPIKey = API_KEY.length > 0 && API_KEY.startsWith('AIza');

// Debug: Log API key status (not the actual key)
if (typeof window === 'undefined') {
    // Only log on server-side to avoid console spam
    console.log('🤖 Gemini API Status:', {
        configured: !!API_KEY,
        valid: isValidAPIKey,
        mode: isValidAPIKey ? 'AI-Powered' : 'Fallback (Rule-Based)'
    });

    if (!isValidAPIKey && API_KEY.length > 0) {
        console.warn('⚠️ Invalid Gemini API key format. Expected key starting with "AIza"');
    } else if (!API_KEY) {
        console.warn('⚠️ No Gemini API key found. Set NEXT_PUBLIC_GEMINI_API_KEY in .env.local');
    }
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Enhanced system prompt for AI Compass with comprehensive knowledge
const SYSTEM_PROMPT = `You are AI Compass, the official AI assistant for UniBites - a smart campus food budgeting platform.

${UNIBITES_KNOWLEDGE}

## YOUR CAPABILITIES
${CHATBOT_CAPABILITIES}

## CRITICAL RESPONSE RULES

### 1. MEAL REQUESTS
When user asks for meal suggestions:
- Detect meal type: breakfast, lunch, snacks, or dinner
- NEVER default to dinner if not specified - ASK which meal
- Consider user's budget constraints
- Apply filters: healthy, cheap, vegetarian if mentioned
- Show ONLY items from provided menu
- NEVER invent or hallucinate items
- Suggest "Best Value" options (good price + high rating)
- Warn if item is over budget

### 2. BUDGET QUERIES
When user asks about money/budget/spending:
- Show ONLY budget information
- DO NOT suggest meals unless explicitly asked
- Provide context (days remaining, savings status)
- Give helpful tips if overspending

### 3. FEATURE QUESTIONS
When user asks how something works:
- Explain clearly and simply using knowledge base
- Use examples when helpful
- Mention related features
- Guide them to take action

### 4. OUT-OF-SCOPE QUESTIONS (CRITICAL!)
If user asks about ANYTHING not related to food/meals/budget/UniBites features:

You MUST politely decline with this format:
"I apologize, but I can only help with UniBites food and budget queries. I'm specialized in:

🍽️ Meal suggestions and menu information
💰 Budget tracking and savings goals
📊 Platform features and how to use them

Is there anything I can help you with regarding your meals or budget?"

DO NOT attempt to answer out-of-scope questions (politics, coding, general knowledge, weather, etc.)

### 5. RESPONSE FORMAT
- Always respond in valid JSON matching ChatbotResponse interface
- Be friendly, helpful, and encouraging
- Use emojis appropriately (🍽️, 💰, ✓, ⚠️, 💡)
- Use Indian Rupees (₹) for all prices
- Keep responses concise but informative
- DO NOT use markdown characters like * or ** or # in your message text. Use simple text only.

You have access to the user's current budget and complete menu database. Use this to provide personalized, helpful responses.`;


export async function generateAIResponse(request: GeminiRequest): Promise<ChatbotResponse> {
    try {
        console.log('🔑 Checking API Key config...');
        // Validate API key
        if (!API_KEY || API_KEY.length === 0) {
            console.error('❌ API Key is missing');
            throw new Error('MISSING_API_KEY: No Gemini API key configured');
        }

        if (!isValidAPIKey) {
            console.error('❌ API Key format is invalid');
            throw new Error('INVALID_API_KEY: API key format is invalid. Expected key starting with "AIza"');
        }

        console.log('✅ API Key is valid format. Initializing model gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // PRE-FILTERING: Prioritize relevant items to send to AI
        // This ensures the AI sees matching items instead of just the first 20
        let contextItems = [...request.menuItems];

        // 1. Filter by meal type if detected
        if (request.mealType) {
            const relevant = contextItems.filter(i =>
                i.mealPeriod.some(p => p.toLowerCase() === request.mealType?.toLowerCase())
            );
            // If we have relevant items, prioritize them, but keep others as backup
            if (relevant.length > 0) {
                const others = contextItems.filter(i => !relevant.includes(i));
                contextItems = [...relevant, ...others];
            }
        }

        // 2. Keyword boost (simple)
        const lowerQuery = request.query.toLowerCase();
        contextItems.sort((a, b) => {
            const aMatch = lowerQuery.includes(a.name.toLowerCase()) || lowerQuery.includes(a.category.toLowerCase());
            const bMatch = lowerQuery.includes(b.name.toLowerCase()) || lowerQuery.includes(b.category.toLowerCase());
            return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
        });

        // Build context for AI
        const context = `
User Query: "${request.query}"
Detected Intent: ${request.intent}
Detected Meal Type: ${request.mealType || 'none'}
Remaining Budget: ₹${request.remainingBudget}

Available Menu Items (Top ${Math.min(contextItems.length, 30)} most relevant):
${contextItems.slice(0, 30).map(item =>
            `- ${item.name} (₹${item.price}) - ${item.category} - ${item.mealPeriod.join('/')} [${item.isHealthy ? 'Healthy' : 'Standard'}]`
        ).join('\n')}

Respond with a JSON object matching this structure:
{
  "intent": "${request.intent}",
  "message": "your friendly response here",
  "budget": {
    "remaining": ${request.remainingBudget},
    "currency": "INR"
  },
  "meal_type": ${request.mealType ? `"${request.mealType}"` : 'null'},
  "items": [],
  "ui_actions": []
}

For BUDGET_QUERY: Set items to empty array, message shows budget only.
For MEAL_REQUEST: Include up to 3 matching items in items array with structure:
{
  "name": "item name",
  "price": number,
  "canteen": "canteen name",
  "category": "category",
  "health_tag": "healthy" | "normal" | "fried"
}

For each item, add a ui_action:
{
  "label": "View [item name]",
  "action": "VIEW_ITEM",
  "item_name": "item name"
}
`;

        const prompt = `${SYSTEM_PROMPT}\n\n${context}`;

        console.log('🚀 Calling Gemini API with prompt length:', prompt.length);

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (apiError: any) {
            const errorDetails = {
                message: apiError.message,
                status: apiError.status,
                code: apiError.code,
                details: JSON.stringify(apiError, Object.getOwnPropertyNames(apiError))
            };

            console.error('🚨 Gemini API Call Failed with details:', errorDetails);

            // Provide specific error message
            if (apiError?.message?.includes('API_KEY_INVALID') || apiError?.status === 400) {
                throw new Error('INVALID_API_KEY: The API key is invalid or has been disabled');
            } else if (apiError?.status === 403) {
                throw new Error('API_KEY_ERROR: API key does not have permission to use Gemini');
            } else if (apiError?.status === 429) {
                throw new Error('API_ERROR: Rate limit exceeded. Please try again later');
            }

            throw apiError;
        }

        console.log('✅ Gemini API Response received. Parsing...');
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('❌ No JSON found in response:', text);
            throw new Error('No valid JSON in AI response');
        }

        const aiResponse: ChatbotResponse = JSON.parse(jsonMatch[0]);
        console.log('✅ Gemini API success. Intent:', aiResponse.intent);
        return aiResponse;

    } catch (error: any) {
        console.error('🚨 AI Service Error - Switching to Fallback Mode:', error);

        // gracefully handle error by returning rule-based response
        return generateFallbackResponse(request);
    }
}

/**
 * Fallback Rule-Based Response Generator
 * Used when AI service is unavailable or errors out
 */
// Local Knowledge Engine for Offline Answers
const LOCAL_ANSWERS: Record<string, string> = {
    // Feature: Mess Pass
    'mess pass': "🎟️ Mess Pass System\n\nThe Mess Pass is an all-inclusive meal plan covering Breakfast, Lunch, and Dinner for ₹150/day.\n\nHow to Apply:\n1. Go to Dashboard\n2. Click 'Apply Mess Pass'\n3. Select your dates\n4. Confirm payment\n\nYour budget tracking will be paused on days the pass is active.",

    // Feature: Meal Planner
    'meal planner': "📅 Smart Meal Planner\n\nThe planner helps you manage your daily food budget.\n\nHow it works:\n1. Automatically divides your daily budget by 4 meals\n2. Suggests 'Best Value' items\n3. Allows you to 'Skip' meals to save money for later\n4. Real-time budget updates as you select food",

    // Feature: Skip Meal (matches "skip a meal", "skipping")
    'skip': "⏭️ Skipping Meals\n\nSkipping a meal redistributes that meal's budget to your other meals for the day.\n\nExample:\nIf you have ₹200 for 4 meals (₹50 each) and skip Breakfast, you'll have ₹66 for the remaining 3 meals!\n\nJust click the 'Skip' button on any meal slot.",

    // Feature: Log Book
    'log book': "📖 Log Book\n\nThe Log Book tracks your history.\n\nIt shows:\n• Every item you've eaten\n• Timestamp and price\n• Daily spending totals\n\nYou can access it from the sidebar menu to review your habits!",

    // Feature: Savings
    'savings': "💰 Savings Goal\n\nYour monthly savings goal helps you stay on track.\n\n• We calculate a daily limit to ensure you meet this goal.\n• If you save extra today, it's added to future days!\n• If you overspend, future budgets drop slightly to compensate.",

    // Menu: Kuksi
    'kuksi': "🏪 Kuksi Canteen\n\nLocated in Block A.\n\nBest for:\n• South Indian Breakfast (Idli, Dosa)\n• Thaali Meals for Lunch\n• Fresh Juices\n\nOpen: 7:00 AM - 9:30 PM",

    // Menu: Veg Options
    'vegetarian': "🥗 Vegetarian Options\n\nWe have plenty of veg options!\n\n• Breakfast: Masala Dosa, Poha, Oats\n• Lunch/Dinner: Veg Thali, Paneer Butter Masala\n• Snacks: Samosa, Veg Puff, Fruit Salad",
};

/**
 * Fallback Rule-Based Response Generator
 * Used when AI service is unavailable or errors out
 */
function generateFallbackResponse(request: GeminiRequest): ChatbotResponse {
    const builder = new ResponseBuilder(request.intent);
    const query = request.query.toLowerCase();

    // 0. Check Local Knowledge Engine (Keyword Matching)
    for (const [key, answer] of Object.entries(LOCAL_ANSWERS)) {
        if (query.includes(key)) {
            builder.setMessage(`(Offline Mode) ${answer}`);
            return builder.build();
        }
    }

    // 0.5 Handle Price/Budget Constraints (e.g., "under 50", "cheaper than 100")
    const priceMatch = query.match(/under\s*₹?(\d+)|less than\s*₹?(\d+)|cheaper than\s*₹?(\d+)/);
    if (priceMatch) {
        const limit = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
        const cheapItems = request.menuItems.filter(i => i.price <= limit && i.isAvailable !== false);

        let message = `(Offline Mode) 🏷️ Products under ₹${limit}:\n\n`;

        if (cheapItems.length > 0) {
            // Sort by price (low to high)
            cheapItems.sort((a, b) => a.price - b.price);

            // Format cleanly
            const topItems = cheapItems.slice(0, 5); // Show top 5
            topItems.forEach(item => {
                message += `• ${item.name} - ₹${item.price}\n`;
                builder.addItem(item);
                builder.addUIAction(`View ${item.name}`, 'VIEW_ITEM', item.name);
            });

            if (cheapItems.length > 5) {
                message += `\n...and ${cheapItems.length - 5} more options!`;
            }
        } else {
            message += "I couldn't find any items in that price range. Try increasing your limit slightly!";
        }

        builder.setMessage(message);
        return builder.build();
    }

    // 1. Handle MEAL_REQUEST
    if (request.intent === 'MEAL_REQUEST') {
        const matchingItems = filterMenuItems(
            request.menuItems,
            request.mealType,
            request.remainingBudget
        );

        let message = '';
        if (matchingItems.length > 0) {
            message = `(Offline Mode) 🍽️ Here are the best ${request.mealType || 'options'} for you:\n\n`;
            message += `Budget: ₹${request.remainingBudget}\n`;
            message += `-------------------\n`;

            matchingItems.forEach(item => {
                message += `• ${item.name}\n   ₹${item.price} | ⭐ ${item.rating}\n`;
                builder.addItem(item);
                builder.addUIAction(`View ${item.name}`, 'VIEW_ITEM', item.name);
            });
        } else {
            message = `(Offline Mode) 😕 No exact matches found.\n\nYour budget is ₹${request.remainingBudget}.\n\n💡 Tip: Try checking specific canteens or increasing your budget slightly if possible.`;
        }

        builder.setMessage(message);
        builder.setBudget(request.remainingBudget);
        if (request.mealType) builder.setMealType(request.mealType);
    }

    // 2. Handle BUDGET_QUERY
    else if (request.intent === 'BUDGET_QUERY') {
        builder.setMessage(
            `(Offline Mode) 💰 Budget Update\n\n` +
            `Remaining Today: ₹${request.remainingBudget}\n` +
            `Status: ${request.remainingBudget > 50 ? '✅ Healthy' : '⚠️ Low'}\n\n` +
            `Spend wisely to hit your savings goals!`
        );
        builder.setBudget(request.remainingBudget);
    }

    // 3. Handle GENERAL_CHAT / FEATURE questions
    else {
        builder.setMessage(
            "🛑 Offline Mode Active\n\nI can still help you with:\n" +
            "• 🍽️ Meal suggestions\n" +
            "• 💰 Budget checking\n" +
            "• 🏷️ Finding items by price\n\n" +
            "For complex questions, please try again later when my AI connection is restored!"
        );
    }

    return builder.build();
}

// Helper function to filter menu items
export function filterMenuItems(
    items: MenuItem[],
    mealType: MealType,
    remainingBudget: number,
    healthPref?: 'healthy' | 'any',
    pricePref?: 'cheap' | 'expensive' | 'any'
): MenuItem[] {
    let filtered = items
        .filter(i => i.isAvailable !== false)
        .filter(i => i.price <= remainingBudget);

    // Filter by meal type (case-insensitive)
    if (mealType) {
        filtered = filtered.filter(i =>
            i.mealPeriod.some(period => period.toLowerCase() === mealType.toLowerCase())
        );
    }

    // Filter by health preference
    if (healthPref === 'healthy') {
        filtered = filtered.filter(i => i.isHealthy);
    }

    // Sort by price preference
    if (pricePref === 'cheap') {
        filtered = filtered.filter(i => i.price <= 50);
    } else if (pricePref === 'expensive') {
        filtered = filtered.sort((a, b) => b.price - a.price);
    } else {
        filtered = filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered.slice(0, 3);
}
