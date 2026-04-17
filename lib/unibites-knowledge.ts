/**
 * UniBites Knowledge Base - Optimized
 * Essential information for AI Chatbot
 */

export const UNIBITES_KNOWLEDGE = `
# UniBites Platform - Quick Reference

## CORE FEATURES
- Smart Meal Planner: Plans 4 meals (Breakfast, Lunch, Snacks, Dinner) with AI suggestions
- Budget System: Day-by-day tracking with automatic redistribution
- Mess Pass: Apply for all-inclusive meal coverage (₹150/day)
- Log Book: Track all logged meals with spending summary
- Daily Notifications: 8 PM summary after 3+ meals logged

## BUDGET SYSTEM
- Automatically updates daily based on spending
- Redistributes savings/overspending across remaining days
- Formula: New Daily = Base + (Yesterday's Difference ÷ Remaining Days)
- Minimum daily limit: ₹50
- Tracks monthly savings goal progress

## MEAL PLANNER
- Divides budget by active meals (4 or less if skipped)
- AI suggests "Best Value" (4.5+ rating, good price)
- Shows "Treat Yourself" options when ahead on savings
- Skip meals to redistribute budget
- Real-time budget updates

## CANTEENS
- Kuksi Canteen (Block A)
- MRC (Block C)

## COMMON ITEMS
- Veg Thali (₹80), Masala Dosa (₹60), Samosa (₹15)
- Chicken Sandwich (₹90), Cold Coffee (₹50)
- Fruit Salad (₹70), Oats & Milk (₹60)
`;

export const CHATBOT_CAPABILITIES = `
I can help with:
✅ Meal suggestions (breakfast/lunch/snacks/dinner)
✅ Budget tracking and savings goals
✅ Platform features and usage
✅ Menu information and prices

❌ I cannot help with topics unrelated to food/budget
`;
