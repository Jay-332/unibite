"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MenuProvider, useMenu } from '@/context/MenuContext';
import { Send, Bot, User as UserIcon } from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
}

function ChatbotContent() {
    const { user } = useAuth();
    const { items } = useMenu(); // Access real menu data
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your CampusBite Assistant.\nI have access to the latest menus from all canteens.\n\nAsk me "What's good for lunch?" or "Find healthy snacks under ₹50".`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

        // Simulate AI Latency
        setTimeout(() => {
            const botResponse = generateResponse(userMessage.text);
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    const generateResponse = (query: string): Message => {
        const q = query.toLowerCase();
        let text = "I'm not sure about that. Try asking about food, budget, or menus!";

        // Logic to filter real data
        let suggestions = items;

        // Filter by Price
        if (q.includes('under') || q.includes('budget') || q.includes('cheap')) {
            const budgetMatch = q.match(/\d+/);
            const budget = budgetMatch ? parseInt(budgetMatch[0]) : 100;
            suggestions = suggestions.filter(i => i.price <= budget);
        }

        // Filter by Health
        if (q.includes('healthy') || q.includes('nutritious')) {
            suggestions = suggestions.filter(i => i.isHealthy);
        }

        // Filter by Meal Period
        if (q.includes('breakfast')) suggestions = suggestions.filter(i => i.mealPeriod.includes('Breakfast'));
        if (q.includes('lunch')) suggestions = suggestions.filter(i => i.mealPeriod.includes('Lunch'));
        if (q.includes('dinner')) suggestions = suggestions.filter(i => i.mealPeriod.includes('Dinner'));
        if (q.includes('snack')) suggestions = suggestions.filter(i => i.mealPeriod.includes('Snacks'));

        // Sort by Rating
        suggestions.sort((a, b) => b.rating - a.rating);

        // Limit to top 3
        const topPicks = suggestions.slice(0, 3);

        if (q.includes('food') || q.includes('recommend') || q.includes('eat') || q.includes('hungry') || q.includes('lunch') || q.includes('dinner') || q.includes('breakfast') || q.includes('snack')) {
            if (topPicks.length > 0) {
                const list = topPicks.map(i => `- **${i.name}** (₹${i.price}) at ${getRestaurantName(i.canteenId)} [⭐${i.rating}]`).join('\n');
                text = `Here are some top picks for you:\n\n${list}\n\nEnjoy your meal! 😋`;
            } else {
                text = "I couldn't find any items matching those criteria. Try increasing your budget or checking a different category.";
            }
        } else if (q.includes('hello') || q.includes('hi')) {
            text = "Hello! Ready to eat? What are you in the mood for?";
        }

        return {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getRestaurantName = (id: string) => {
        // Simple lookup since we don't have CANTEENS in context but imported in page. 
        // In a real app we'd have Canteens in context too.
        if (id === 'c1') return 'Main Cafeteria';
        if (id === 'c2') return 'Tech Bites';
        if (id === 'c3') return 'Green Garden';
        return 'Campus Canteen';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center gap-3 text-white">
                <div className="bg-white/20 p-2 rounded-full">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-lg">AI Compass</h1>
                    <p className="text-xs text-green-100 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                        Online • Context Aware
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
            `}>
                            {msg.sender === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`
              max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm
              ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'}
            `}>
                            {msg.text}
                            <p className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about meals, budget, or nutrition..."
                        className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 top-2 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ChatbotPage() {
    return (
        <MenuProvider>
            <ChatbotContent />
        </MenuProvider>
    );
}
