/**
 * TypeScript Interfaces for JSON-Based Chatbot
 */

export type Intent = 'MEAL_REQUEST' | 'BUDGET_QUERY' | 'FOOD_DETAILS' | 'GENERAL_CHAT' | 'OUT_OF_SCOPE';
import { MenuItem } from './data';
export type MealType = 'Snacks' | 'Breakfast' | 'Lunch' | 'Dinner' | null;
export type HealthTag = 'healthy' | 'normal' | 'fried';
export type UIAction = 'VIEW_ITEM' | 'ADD_TO_CART' | 'NONE';

export interface ChatbotItem {
    name: string;
    price: number;
    canteen: string;
    category: string;
    health_tag: HealthTag;
}

export interface ChatbotUIAction {
    label: string;
    action: UIAction;
    item_name: string | null;
}

export interface ChatbotResponse {
    intent: Intent;
    message: string;
    budget: {
        remaining: number | null;
        currency: 'INR';
    };
    meal_type: MealType;
    items: ChatbotItem[];
    ui_actions: ChatbotUIAction[];
}

export interface GeminiRequest {
    query: string;
    remainingBudget: number;
    menuItems: MenuItem[];
    intent: Intent;
    mealType: MealType;
}
