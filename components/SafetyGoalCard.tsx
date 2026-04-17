"use client";

import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { PiggyBank, TrendingUp } from "lucide-react";

interface SafetyGoalCardProps {
    monthlyLimit: number;
    spentMonth: number;
}

export default function SafetyGoalCard({ monthlyLimit, spentMonth }: SafetyGoalCardProps) {
    const { user } = useAuth();
    const { currentSavings, dailySpend } = useMenu();

    // Get savings goal from user's budget (set during onboarding)
    const savingsGoal = user?.budget?.savingGoal || 0;
    const dailyLimit = user?.budget?.dailyLimit || 200;

    // Calculate progress percentage
    const progressPercent = savingsGoal > 0 ? Math.min((currentSavings / savingsGoal) * 100, 100) : 0;

    // Determine status color
    const getStatusColor = () => {
        if (progressPercent >= 100) return 'text-green-600';
        if (progressPercent >= 50) return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
                {user?.budget?.isCycleCompleted ? (
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <PiggyBank size={16} className="text-blue-500" />
                            Cycle Savings Summary
                        </h3>

                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Planned Goal</span>
                                <span className="text-sm font-bold text-gray-700">₹{user.budget.savingGoal}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Additional</span>
                                <span className="text-sm font-bold text-green-600">+₹{user.budget.additionalSavings || 0}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Total Saved</span>
                                    <span className="text-3xl font-black text-blue-600 leading-none">
                                        ₹{(user.budget.savingGoal || 0) + (user.budget.additionalSavings || 0)}
                                    </span>
                                </div>
                                <div className="text-green-600 mb-1">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <PiggyBank size={16} className="text-blue-500" />
                                Today's Savings
                            </h3>

                            <div className="mt-3 flex items-baseline gap-2">
                                <span className={`text-3xl font-bold tracking-tight ${getStatusColor()}`}>
                                    ₹{currentSavings}
                                </span>
                                <span className="text-sm text-gray-400">saved today</span>
                            </div>

                            {/* Progress toward goal */}
                            {savingsGoal > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Progress to goal</span>
                                        <span className={`font-medium ${getStatusColor()}`}>
                                            {Math.round(progressPercent)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-green-500' :
                                                progressPercent >= 50 ? 'bg-blue-500' : 'bg-gray-400'
                                                }`}
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                                        <TrendingUp size={12} />
                                        Goal: ₹{savingsGoal}/cycle
                                    </p>
                                </div>
                            )}

                            {savingsGoal === 0 && (
                                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                                    Set a savings goal in budget settings to track your progress.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Decorative background circle */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full z-0"></div>
        </div>
    );
}
