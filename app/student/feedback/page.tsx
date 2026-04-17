"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CANTEENS, FEEDBACKS, Feedback } from '@/lib/data';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function StudentFeedback() {
    const { user } = useAuth();
    const [type, setType] = useState<'query' | 'suggestion'>('query');
    const [target, setTarget] = useState<'all' | string>('all');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || !user) return;

        const newFeedback: Feedback = {
            id: `fb_${Date.now()}`,
            studentId: user.id,
            type,
            target,
            message,
            timestamp: new Date().toISOString()
        };

        // In a real app, this would be an API call
        FEEDBACKS.push(newFeedback);
        console.log("Feedback Submitted:", newFeedback);

        setSubmitted(true);
        setMessage('');

        // Reset success message after 3 seconds
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Feedback & Queries</h1>
                    <p className="text-gray-500 mt-1">Share your suggestions or report issues specific to canteens.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Tabs */}
                <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
                    <button
                        onClick={() => setType('query')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${type === 'query' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        <span>❓</span> Raise a Query / Issue
                    </button>
                    <button
                        onClick={() => setType('suggestion')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${type === 'suggestion' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        <span>🍔</span> Suggest Menu Item
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8">
                    {submitted ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Feedback Sent!</h3>
                            <p className="text-gray-500">Thank you for sharing. We've notified the vendors.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-green-600 font-bold hover:underline"
                            >
                                Send another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Target Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Who is this for?
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className={`border-2 rounded-xl p-4 cursor-pointer transition ${target === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="target"
                                                className="w-4 h-4 text-green-600"
                                                checked={target === 'all'}
                                                onChange={() => setTarget('all')}
                                            />
                                            <span className="font-bold text-gray-700">All Vendors (Common)</span>
                                        </div>
                                    </label>

                                    <label className={`border-2 rounded-xl p-4 cursor-pointer transition ${target !== 'all' ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="target"
                                                className="w-4 h-4 text-green-600"
                                                checked={target !== 'all'}
                                                onChange={() => setTarget(CANTEENS[0].id)} // Default to first canteen
                                            />
                                            <span className="font-bold text-gray-700">Specific Canteen</span>
                                        </div>

                                        {target !== 'all' && (
                                            <select
                                                value={target}
                                                onChange={(e) => setTarget(e.target.value)}
                                                className="mt-3 w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {CANTEENS.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {type === 'query' ? 'Describe your issue or question' : 'What would you like to see on the menu?'}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-gray-700"
                                    placeholder={type === 'query' ? "e.g., The tables need better cleaning..." : "e.g., Please add Cold Coffee to the breakfast menu..."}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                                <Send size={20} />
                                Submit Feedback
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
