"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { Send, Bot, User as UserIcon, X, MessageSquare } from 'lucide-react';
import { CANTEENS, MenuItem } from '@/lib/data';
import { classifyIntent, detectMealType, detectHealthPreference, detectPricePreference } from '@/lib/chatbot-intents';
import { ResponseBuilder } from '@/lib/chatbot-response-builder';
import { ChatbotResponse } from '@/lib/chatbot-types';
import { filterMenuItems } from '@/lib/gemini-service';
import { chatAction } from '@/app/actions/chat';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
    jsonData?: ChatbotResponse;
}

const SUGGESTED_QUESTIONS = {
    budget: [
        "How much money do I have left?",
        "Am I on track for my savings goal?",
        "Why did my budget change?",
    ],
    meals: [
        "What should I eat for breakfast?",
        "Suggest healthy lunch options",
        "Show me cheap snacks",
        "What's good for dinner?",
    ],
    features: [
        "How does the meal planner work?",
        "What happens if I skip a meal?",
        "How do I apply for mess pass?",
        "What's in the Log Book?",
    ],
    menu: [
        "What's available at Kuksi?",
        "Show me vegetarian options",
        "What items are under ₹50?",
    ]
};

const ALL_QUICK_QUESTIONS = [
    ...SUGGESTED_QUESTIONS.budget,
    ...SUGGESTED_QUESTIONS.meals,
    ...SUGGESTED_QUESTIONS.features,
    ...SUGGESTED_QUESTIONS.menu
];

export default function FloatingChatbot() {
    const { user } = useAuth();
    const router = useRouter();
    const { items, dailySpend, loggedMeals, remainingBudget, selectedCanteen, currentSavings } = useMenu();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isAIMode, setIsAIMode] = useState(true); // Track if AI is working
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your AI Compass.\nI can help you find meals, track your budget, and make smart food choices!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Execute immediately (Removed Artificial Latency)
        const botResponse = await generateResponse(userMessage.text);
        setMessages(prev => [...prev, botResponse]);
    };

    const generateResponse = async (query: string): Promise<Message> => {
        // 1. Classify intent
        const intent = classifyIntent(query);
        const mealType = detectMealType(query);
        const healthPref = detectHealthPreference(query);
        const pricePref = detectPricePreference(query);

        try {
            // 2. Try Gemini AI first (via Server Action)
            const aiResponse = await chatAction({
                query,
                remainingBudget,
                menuItems: items,
                intent,
                mealType
            });

            setIsAIMode(true); // AI is working

            return {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: aiResponse.message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                jsonData: aiResponse
            };
        } catch (error) {
            console.error('AI Response failed, using fallback:', error);
            setIsAIMode(false); // Switched to fallback mode

            // 3. Fallback to rule-based system
            const builder = new ResponseBuilder(intent);
            let response: ChatbotResponse;

            switch (intent) {
                case 'BUDGET_QUERY':
                    response = handleBudgetQuery(builder);
                    break;

                case 'MEAL_REQUEST':
                    response = handleMealRequest(query, builder);
                    break;

                case 'FOOD_DETAILS':
                    response = handleFoodDetails(query, builder);
                    break;

                case 'GENERAL_CHAT':
                    response = handleGeneralChat(builder);
                    break;

                case 'OUT_OF_SCOPE':
                    response = handleOutOfScope(builder);
                    break;

                default:
                    response = builder.setMessage("I'm here to help! Ask me about meals or your budget.").build();
            }

            return {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: response.message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                jsonData: response
            };
        }
    };

    // ===== INTENT HANDLERS =====

    const handleBudgetQuery = (builder: ResponseBuilder): ChatbotResponse => {
        const dailyLimit = user?.budget?.dailyLimit || 200;

        let message = `You have ₹${remainingBudget} left for today.`;

        if (remainingBudget < 50) {
            message += "\n\n⚠️ Budget is running low! Consider lighter meals.";
        } else if (remainingBudget > dailyLimit * 0.7) {
            message += "\n\n✨ You're doing great! Plenty of budget remaining.";
        }

        builder
            .setMessage(message)
            .setBudget(remainingBudget);

        // CRITICAL: No items for budget queries
        return builder.build();
    };

    const handleMealRequest = (query: string, builder: ResponseBuilder): ChatbotResponse => {
        const mealType = detectMealType(query);

        // If no meal type detected, ask user
        if (!mealType) {
            builder.setMessage("Which meal are you looking for?\n• Breakfast\n• Lunch\n• Dinner\n• Snack");
            return builder.build();
        }

        const healthPref = detectHealthPreference(query);
        const pricePref = detectPricePreference(query);

        // Filter items
        let suggestions = items
            .filter(i => i.isAvailable !== false)
            .filter(i => i.mealPeriod.some(period => period.toLowerCase() === mealType?.toLowerCase()))
            .filter(i => i.price <= remainingBudget);

        // Apply canteen filter
        if (selectedCanteen) {
            suggestions = suggestions.filter(i => i.canteenId === selectedCanteen);
        }

        // Apply health filter
        if (healthPref === 'healthy') {
            suggestions = suggestions.filter(i => i.isHealthy);
        }

        // Apply price filter
        if (pricePref === 'cheap') {
            suggestions = suggestions.filter(i => i.price <= 50);
        } else if (pricePref === 'expensive') {
            suggestions = suggestions.sort((a, b) => b.price - a.price);
        } else {
            suggestions = suggestions.sort((a, b) => b.rating - a.rating);
        }

        const topPicks = suggestions.slice(0, 3);

        if (topPicks.length > 0) {
            const getCanteenName = (canteenId: string) => {
                const canteen = CANTEENS.find(c => c.id === canteenId);
                return canteen?.name || canteenId;
            };

            let message = `Here are some ${mealType} options within your ₹${remainingBudget} budget:\n\n`;
            message += topPicks.map(i => `• ${i.name} (₹${i.price}) - ${getCanteenName(i.canteenId)}`).join('\n');

            builder
                .setMessage(message)
                .setMealType(mealType)
                .setBudget(remainingBudget);

            topPicks.forEach(item => {
                builder
                    .addItem(item)
                    .addUIAction(`View ${item.name}`, 'VIEW_ITEM', item.name);
            });
        } else {
            builder.setMessage(`No ${mealType} items fit your ₹${remainingBudget} budget right now. Try checking back later!`);
        }

        return builder.build();
    };

    const handleFoodDetails = (query: string, builder: ResponseBuilder): ChatbotResponse => {
        // Extract item name from query
        const matchingItems = items.filter(i =>
            query.toLowerCase().includes(i.name.toLowerCase())
        );

        if (matchingItems.length > 0) {
            const item = matchingItems[0];
            const canteen = CANTEENS.find(c => c.id === item.canteenId);

            const message = `${item.name}\n\n` +
                `Price: ₹${item.price}\n` +
                `Canteen: ${canteen?.name || item.canteenId}\n` +
                `Rating: ${item.rating}⭐\n` +
                `${item.isHealthy ? '✅ Healthy option' : ''}`;

            builder
                .setMessage(message)
                .addItem(item)
                .addUIAction(`View ${item.name}`, 'VIEW_ITEM', item.name);
        } else {
            builder.setMessage("I couldn't find that item. Try asking about a specific dish!");
        }

        return builder.build();
    };

    const handleGeneralChat = (builder: ResponseBuilder): ChatbotResponse => {
        builder.setMessage("Hello! I'm here to help you find meals and manage your budget. What would you like to know?");
        return builder.build();
    };

    const handleOutOfScope = (builder: ResponseBuilder): ChatbotResponse => {
        builder.setMessage("I'm here to help with UniBites food and budget planning. That topic isn't something I can help with.\n\nYou can ask me about:\n• Your remaining budget\n• Meal suggestions\n• Campus canteens\n• Specific food items");
        return builder.build();
    };

    // ===== UI ACTION HANDLER =====

    const handleUIAction = (action: any) => {
        if (action.action === 'VIEW_ITEM' && action.item_name) {
            const item = items.find(i => i.name === action.item_name);
            if (item) {
                router.push(`/student/menu?viewItem=${item.id}`);
            }
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl z-50 transition-all duration-300 hover:scale-105 border-2 border-[#114833] ${isOpen ? 'bg-[#114833] text-[#FFFDF4] rotate-90' : 'bg-[#FFFDF4] text-[#114833]'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[550px] bg-[#FFFDF4] rounded-xl shadow-2xl border-2 border-[#114833]/10 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in zoom-in-95 font-sans">
                    {/* Header */}
                    <div className="bg-[#114833] p-4 flex items-center gap-3 text-[#FFFDF4] border-b-4 border-yellow-600/30">
                        <div className="bg-[#FFFDF4]/10 p-2 rounded-lg border border-[#FFFDF4]/20">
                            <Bot size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-serif font-bold text-lg tracking-wide">AI Compass</h3>
                            <p className="text-[10px] text-green-100 uppercase tracking-wider opacity-80">
                                {isAIMode ? '• AI Powered' : '• Rule-Based'}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFDF4]">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 border ${msg.sender === 'user' ? 'bg-[#114833] text-[#FFFDF4] border-[#114833]' : 'bg-white text-[#114833] border-[#114833]/20'}`}>
                                    {msg.sender === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`max-w-[80%] p-3.5 rounded-lg text-sm shadow-sm border ${msg.sender === 'user' ? 'bg-[#114833] text-[#FFFDF4] border-[#114833]' : 'bg-white text-gray-800 border-gray-200'}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                    {/* UI Action Buttons */}
                                    {msg.jsonData?.ui_actions && msg.jsonData.ui_actions.length > 0 && (
                                        <div className="mt-3 flex flex-col gap-2 border-t border-gray-100/50 pt-2">
                                            <p className="text-[10px] opacity-60 font-medium uppercase tracking-wide">Suggested Actions:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.jsonData.ui_actions.map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUIAction(action)}
                                                        className="text-xs bg-[#114833]/5 text-[#114833] font-semibold px-3 py-1.5 rounded border border-[#114833]/10 hover:bg-[#114833] hover:text-white transition-colors duration-200"
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Persistent Quick Questions - Always Visible */}
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            {ALL_QUICK_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(q);
                                        setTimeout(() => {
                                            const btn = document.getElementById('chat-send-btn');
                                            btn?.click();
                                        }, 50);
                                    }}
                                    className="text-xs bg-white border border-[#114833]/20 text-[#114833] px-4 py-2 rounded-full hover:bg-[#114833] hover:text-white transition-all shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me about meals or budget..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#114833] focus:border-[#114833] transition-all"
                        />
                        <button
                            id="chat-send-btn"
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2.5 bg-[#114833] text-white rounded-lg hover:bg-[#0d3626] disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
