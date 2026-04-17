"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MENU_ITEMS, MenuItem } from '@/lib/data';
import { Sparkles, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function VendorAIChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'Chef'}! I'm your menu assistant. Ask me about your top items or what to add.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const vendorItems = MENU_ITEMS.filter(i => i.canteenId === user?.canteenId);

    const generateResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('top') || lowerQuery.includes('best') || lowerQuery.includes('liked')) {
            const topItem = [...vendorItems].sort((a, b) => b.rating - a.rating)[0];
            return `Your highest rated item is **${topItem.name}** with ${topItem.rating} stars! Students love it.`;
        }

        if (lowerQuery.includes('default') || lowerQuery.includes('daily')) {
            const dailyCount = vendorItems.filter(i => i.isDaily).length;
            const defaultCount = vendorItems.filter(i => !i.isDaily).length;
            return `You have ${defaultCount} default items and ${dailyCount} daily specials active. Consider rotating your specials if sales dip.`;
        }

        if (lowerQuery.includes('engagement') || lowerQuery.includes('timing')) {
            return `Lunch hours show the highest activity. Consider adding a new "Daily Special" for Lunch to boost revenue.`;
        }

        return "I can help analyze your menu performance. Try asking about 'top rated items' or 'daily specials'.";
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        setTimeout(() => {
            const aiResponse = generateResponse(userMsg);
            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            setIsLoading(false);
        }, 1000);
    };

    if (!user?.canteenId) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <Sparkles size={16} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Menu Assistant</h3>
                    <p className="text-xs text-gray-500">Private & Secure</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-50 rounded-2xl rounded-bl-none px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your menu..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        <TrendingUp size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
