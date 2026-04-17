/**
 * Intent Classification System for AI Compass
 * Classifies user queries into one of 5 intent types
 */

import { Intent, MealType } from './chatbot-types';

/**
 * Classifies user query into an intent type
 * CRITICAL: Budget queries must NEVER be classified as meal requests
 */
export const classifyIntent = (query: string): Intent => {
    const q = query.toLowerCase().trim();

    // GENERAL_CHAT - Greetings and pleasantries (highest priority)
    if (q.match(/^(hi|hello|hey|thanks|thank you|good morning|good afternoon|good evening|greetings|help|ok|okay)$/)) {
        return 'GENERAL_CHAT';
    }

    // BUDGET_QUERY - Budget/spending questions (SECOND HIGHEST PRIORITY)
    // CRITICAL BUG FIX: A question about budget is NOT a meal request
    const budgetKeywords = ['budget', 'remaining', 'left', 'spent', 'spend', 'money', 'cost', 'how much', 'balance', 'allowance'];
    const hasBudgetKeyword = budgetKeywords.some(keyword => q.includes(keyword));

    // Check if it's PURELY about budget (not asking for food suggestions)
    const askingForFood = q.includes('suggest') || q.includes('show me') || q.includes('buy') ||
        q.includes('get me') || q.includes('what can i') || q.includes('recommend') ||
        q.includes('with my') && (q.includes('breakfast') || q.includes('lunch') || q.includes('dinner'));

    // If has budget keyword and NOT asking for food → BUDGET_QUERY
    if (hasBudgetKeyword && !askingForFood) {
        return 'BUDGET_QUERY';
    }

    // FOOD_DETAILS - Asking about a specific item
    if ((q.includes('tell me about') || q.includes('what is') || q.includes('details of') ||
        q.includes('info about')) && !q.includes('suggest')) {
        return 'FOOD_DETAILS';
    }

    // MEAL_REQUEST - Food suggestions or meal queries
    const mealKeywords = ['suggest', 'recommend', 'show', 'what can i', 'what should i',
        'breakfast', 'lunch', 'dinner', 'snack', 'eat', 'food', 'meal',
        'buy', 'get', 'order', 'have', 'hungry', 'healthy', 'cheap'];

    if (mealKeywords.some(keyword => q.includes(keyword))) {
        return 'MEAL_REQUEST';
    }

    // Check if it's about UniBites topics
    const unibites_topics = ['canteen', 'menu', 'kuksi', 'mrc', 'food court', 'campus', 'unibites'];
    if (unibites_topics.some(topic => q.includes(topic))) {
        return 'MEAL_REQUEST'; // Treat as meal request
    }

    // OUT_OF_SCOPE - Everything else
    return 'OUT_OF_SCOPE';
};

/**
 * Detects meal type from user query
 * CRITICAL: Does NOT default to dinner - returns null if unclear
 * Returns capitalized meal types to match MenuItem.mealPeriod
 */
export const detectMealType = (query: string): MealType => {
    const q = query.toLowerCase();

    // Explicit meal type mentions - return capitalized to match data
    if (q.includes('breakfast')) return 'Breakfast';
    if (q.includes('lunch')) return 'Lunch';
    if (q.includes('dinner')) return 'Dinner';
    if (q.includes('snack')) return 'Snacks'; // Note: plural to match data

    // Time-based detection (only if no explicit meal type)
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 19) return 'Snacks';

    // CRITICAL: Do NOT default to dinner
    // Return null so we can ask the user
    return null;
};

/**
 * Detects health preference from query
 */
export const detectHealthPreference = (query: string): 'healthy' | 'any' => {
    const q = query.toLowerCase();
    if (q.includes('healthy') || q.includes('light') || q.includes('nutritious')) {
        return 'healthy';
    }
    return 'any';
};

/**
 * Detects price preference from query
 */
export const detectPricePreference = (query: string): 'cheap' | 'expensive' | 'any' => {
    const q = query.toLowerCase();
    if (q.includes('cheap') || q.includes('budget') || q.includes('affordable') || q.includes('low price')) {
        return 'cheap';
    }
    if (q.includes('expensive') || q.includes('premium') || q.includes('best')) {
        return 'expensive';
    }
    return 'any';
};
