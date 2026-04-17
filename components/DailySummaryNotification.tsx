"use client";

import { useEffect, useState } from 'react';
import { X, TrendingDown, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface DailySummaryNotificationProps {
    dailySpend: number;
    dailyLimit: number;
    todaysSavings: number;
    loggedMealsCount: number;
    onDismiss: () => void;
}

export default function DailySummaryNotification({
    dailySpend,
    dailyLimit,
    todaysSavings,
    loggedMealsCount,
    onDismiss
}: DailySummaryNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in after a short delay
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    const isUnderBudget = todaysSavings >= 0;
    const savingsPercentage = ((todaysSavings / dailyLimit) * 100).toFixed(1);
    const spendPercentage = ((dailySpend / dailyLimit) * 100).toFixed(1);

    // Generate personalized message
    const getMessage = () => {
        if (isUnderBudget) {
            if (todaysSavings > dailyLimit * 0.3) {
                return {
                    title: "🎉 Excellent Budget Management!",
                    message: `You saved ₹${todaysSavings} today! That's ${savingsPercentage}% under budget. Keep up this amazing discipline!`,
                    tips: [
                        "Your savings are adding up nicely",
                        "You're on track for a great month",
                        "Consider treating yourself occasionally - you've earned it!"
                    ]
                };
            } else {
                return {
                    title: "✅ Great Job Staying on Track!",
                    message: `You spent ₹${dailySpend} and saved ₹${todaysSavings} today. Well done!`,
                    tips: [
                        "You're managing your budget wisely",
                        "Small savings add up over time",
                        "Keep making smart food choices"
                    ]
                };
            }
        } else {
            const overspend = Math.abs(todaysSavings);
            if (overspend > dailyLimit * 0.2) {
                return {
                    title: "💡 Budget Alert - Let's Improve Tomorrow",
                    message: `You spent ₹${dailySpend} today, which is ₹${overspend} over your daily limit.`,
                    tips: [
                        "Try planning your meals in advance tomorrow",
                        "Look for budget-friendly options in the menu",
                        "Consider skipping expensive add-ons or beverages",
                        "Use the AI Compass chatbot for meal suggestions within budget"
                    ]
                };
            } else {
                return {
                    title: "⚠️ Slightly Over Budget Today",
                    message: `You spent ₹${dailySpend}, which is ₹${overspend} over budget. No worries, you can balance it out!`,
                    tips: [
                        "Tomorrow, aim for lighter or more affordable meals",
                        "Check the 'healthy' filter for budget-friendly options",
                        "Small adjustments can make a big difference"
                    ]
                };
            }
        }
    };

    const content = getMessage();

    return (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className={`p-6 text-white relative overflow-hidden ${isUnderBudget ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                {isUnderBudget ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Daily Summary</h2>
                                <p className="text-white/90 text-sm">End of Day Report</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2">{content.title}</h3>
                        <p className="text-white/95 text-sm leading-relaxed">{content.message}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Meals Logged</p>
                            <p className="text-2xl font-bold text-gray-900">{loggedMealsCount}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">₹{dailySpend}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">{isUnderBudget ? 'Saved' : 'Over'}</p>
                            <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${isUnderBudget ? 'text-green-600' : 'text-red-600'}`}>
                                {isUnderBudget ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                ₹{Math.abs(todaysSavings)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                            <span>Budget Usage</span>
                            <span>{spendPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isUnderBudget ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(parseFloat(spendPercentage), 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        💡 {isUnderBudget ? 'Keep It Up!' : 'Tips for Tomorrow'}
                    </h4>
                    <ul className="space-y-2">
                        {content.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className={`mt-0.5 ${isUnderBudget ? 'text-green-600' : 'text-orange-600'}`}>•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Button */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleClose}
                        className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${isUnderBudget ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        Got it, Thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
