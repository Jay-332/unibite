/**
 * JSON Response Builder for AI Compass
 * Builds structured responses following strict rules
 */

import { ChatbotResponse, Intent, ChatbotItem, ChatbotUIAction } from './chatbot-types';
import { MenuItem } from './data';

export class ResponseBuilder {
    private response: ChatbotResponse;

    constructor(intent: Intent) {
        this.response = {
            intent,
            message: '',
            budget: { remaining: null, currency: 'INR' },
            meal_type: null,
            items: [],
            ui_actions: []
        };
    }

    setMessage(message: string): ResponseBuilder {
        this.response.message = message;
        return this;
    }

    setBudget(remaining: number): ResponseBuilder {
        this.response.budget.remaining = remaining;
        return this;
    }

    setMealType(type: string): ResponseBuilder {
        this.response.meal_type = type as any;
        return this;
    }

    addItem(item: MenuItem): ResponseBuilder {
        const chatbotItem: ChatbotItem = {
            name: item.name,
            price: item.price,
            canteen: item.canteenId,
            category: item.category,
            health_tag: item.isHealthy ? 'healthy' : (item.category === 'fried' ? 'fried' : 'normal')
        };
        this.response.items.push(chatbotItem);
        return this;
    }

    addUIAction(label: string, action: 'VIEW_ITEM' | 'ADD_TO_CART' | 'NONE', itemName?: string): ResponseBuilder {
        const uiAction: ChatbotUIAction = {
            label,
            action,
            item_name: itemName || null
        };
        this.response.ui_actions.push(uiAction);
        return this;
    }

    /**
     * Enforces strict rules before building
     */
    build(): ChatbotResponse {
        // Rule 1: BUDGET_QUERY must have empty items
        if (this.response.intent === 'BUDGET_QUERY') {
            this.response.items = [];
            this.response.ui_actions = [];
            this.response.meal_type = null;
        }

        // Rule 2: GENERAL_CHAT must have null budget and no items
        if (this.response.intent === 'GENERAL_CHAT') {
            this.response.budget.remaining = null;
            this.response.items = [];
            this.response.ui_actions = [];
            this.response.meal_type = null;
        }

        // Rule 3: OUT_OF_SCOPE only has message
        if (this.response.intent === 'OUT_OF_SCOPE') {
            this.response.budget.remaining = null;
            this.response.items = [];
            this.response.ui_actions = [];
            this.response.meal_type = null;
        }

        return this.response;
    }
}
