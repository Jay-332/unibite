"use client";

import { useMenu } from '@/context/MenuContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function LogBookPage() {
    const { loggedMeals, dailySpend, removeLogItem, todaysSavings, totalBudgetLeft } = useMenu();
    const { user } = useAuth();

    // Group logs by the slot they were logged from (not their mealPeriod array)
    const groupedLogs = {
        Breakfast: loggedMeals.filter(i => i.loggedFromSlot === 'Breakfast'),
        Lunch: loggedMeals.filter(i => i.loggedFromSlot === 'Lunch'),
        Dinner: loggedMeals.filter(i => i.loggedFromSlot === 'Dinner'),
        Snacks: loggedMeals.filter(i => !i.loggedFromSlot || !['Breakfast', 'Lunch', 'Dinner'].includes(i.loggedFromSlot)),
    };

    const budget = user?.budget;
    const dailyLimit = budget?.dailyLimit || 200;
    const remaining = dailyLimit - dailySpend;

    return (
        <div className="space-y-8 pb-24">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <ShoppingBag className="text-blue-600" /> Log Book
                </h1>
                <p className="text-gray-500 mt-1">Your daily food diary and budget tracker.</p>
            </div>

            {/* Daily Summary - 4 Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Spent Today */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Total Spent Today</p>
                    <p className="text-3xl font-bold text-gray-900">₹{dailySpend}</p>
                    <p className="text-xs text-gray-400 mt-1">of ₹{dailyLimit} daily budget</p>
                </div>

                {/* Daily Budget Left */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Daily Budget Left</p>
                    <p className={`text-3xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        ₹{remaining}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">remaining for today</p>
                </div>

                {/* Total Budget Left */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Total Budget Left</p>
                    <p className="text-3xl font-bold text-blue-600">
                        ₹{(budget?.monthlyLimit || 5000) - (budget?.savingGoal || 0) - ((user?.budget?.spentMonth || 0) + dailySpend)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        (Monthly Budget - Savings - Spent)
                    </p>
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-6">
                {(Object.entries(groupedLogs) as [string, typeof loggedMeals][]).map(([period, items]) => (
                    items.length > 0 && (
                        <div key={period} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">{period}</h2>
                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                                {item.category === 'Beverages' ? '🥤' : '🍛'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {item.isManual && <span className="ml-2 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold">MANUAL</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900">₹{item.price}</span>
                                            <button
                                                onClick={() => removeLogItem(item.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}

                {loggedMeals.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-5xl mb-4">🍽️</p>
                        <h3 className="text-xl font-bold text-gray-600">Your Plate is Empty</h3>
                        <p className="text-sm mt-2">Go to the Dashboard or Menu to log your meals.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
