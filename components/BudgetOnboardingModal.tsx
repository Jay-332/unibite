"use client";

import { useState } from 'react';
import { ArrowRight, Calculator } from 'lucide-react';

interface BudgetOnboardingModalProps {
    onComplete: (data: {
        allowance: number;
        savingGoal: number;
        durationDays: number;
        dailyLimit: number;
        baseDailyBudget: number;
        remainingDays: number;
    }) => void;
    initialValues?: {
        allowance: number;
        savingGoal: number;
        duration?: number;
    };
    onClose?: () => void;
}

export default function BudgetOnboardingModal({ onComplete, initialValues, onClose }: BudgetOnboardingModalProps) {
    const [allowance, setAllowance] = useState(initialValues?.allowance?.toString() || '');
    const [savingGoal, setSavingGoal] = useState(initialValues?.savingGoal?.toString() || '');

    // Estimate months/days if duration provided, else default
    const initMonths = initialValues?.duration ? Math.floor(initialValues.duration / 30) : 0;
    const initDays = initialValues?.duration ? initialValues.duration % 30 : 0;

    const [months, setMonths] = useState(initMonths.toString());
    const [days, setDays] = useState(initDays.toString());

    const handleCalculateAndSave = (e: React.FormEvent) => {
        e.preventDefault();

        const totalAllowance = Number(allowance);
        const goal = Number(savingGoal);
        const duration = (Number(months) * 30) + Number(days);

        if (totalAllowance > 0 && duration > 0) {
            const disposableIncome = totalAllowance - goal;
            const dailyLimit = Math.max(0, Math.floor(disposableIncome / duration)); // Rounded down for safety

            onComplete({
                allowance: totalAllowance,
                savingGoal: goal,
                durationDays: duration,
                dailyLimit: dailyLimit,
                baseDailyBudget: dailyLimit,
                remainingDays: duration
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
                    >
                        ✕
                    </button>
                )}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl backdrop-blur-md">
                        💰
                    </div>
                    <h2 className="text-2xl font-bold">Set Your Budget</h2>
                    <p className="text-green-50 text-sm mt-1">Let's calculate your smart daily limit.</p>
                </div>

                <form onSubmit={handleCalculateAndSave} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Allowance (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 5000"
                                value={allowance}
                                onChange={e => setAllowance(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Saving Goal (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 500"
                                value={savingGoal}
                                onChange={e => setSavingGoal(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</label>
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        value={months}
                                        onChange={e => setMonths(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg"
                                        min="0"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Months</span>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        value={days}
                                        onChange={e => setDays(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg"
                                        min="0"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Section */}
                    {allowance && savingGoal && (months || days) && (
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-xl border-2 border-blue-100">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calculator size={14} />
                                Budget Preview
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Daily Budget</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₹{Math.max(0, Math.floor((Number(allowance) - Number(savingGoal)) / ((Number(months) * 30) + Number(days))))}
                                    </p>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Days</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {(Number(months) * 30) + Number(days)}
                                    </p>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Spending</p>
                                    <p className="text-lg font-bold text-gray-700">
                                        ₹{Number(allowance) - Number(savingGoal)}
                                    </p>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">You'll Save</p>
                                    <p className="text-lg font-bold text-green-600">
                                        ₹{Number(savingGoal)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition shadow-lg flex items-center justify-center gap-2"
                    >
                        <Calculator size={20} /> Calculate & Set Budget
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        This will automatically update your daily limit.
                    </p>
                </form>
            </div>
        </div>
    );
}
