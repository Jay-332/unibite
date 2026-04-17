"use client";

import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { USERS } from '@/lib/data';
import DailyMealPlanner from '@/components/DailyMealPlanner';
import SafetyGoalCard from '@/components/SafetyGoalCard';
import FloatingChatbot from '@/components/FloatingChatbot';
import CanteenFilter from '@/components/CanteenFilter';
import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

// Inner component to access MenuContext
import BudgetOnboardingModal from '@/components/BudgetOnboardingModal';
import MessPassModal from '@/components/MessPassModal';
import MessPassStatus from '@/components/MessPassStatus';
import DailySummaryNotification from '@/components/DailySummaryNotification';
import { MenuItem } from '@/lib/data';
import { ShoppingBag, Pencil } from 'lucide-react';

import { useRouter } from 'next/navigation';

function DashboardContent() {
    const { user, updateUser } = useAuth();
    const { dailySpend, stageItem, unstageItem, stagedItems, todaysSavings, loggedMeals } = useMenu();
    const router = useRouter();

    // Log Book State
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [showMessPassModal, setShowMessPassModal] = useState(false);
    const [showDailySummary, setShowDailySummary] = useState(false);

    // Use mock data if user context is hydrating or fallback
    const userData = user || USERS[0];
    const budget = userData.budget || { dailyLimit: 200, spentToday: 0, monthlyLimit: 5000, spentMonth: 1200 };

    // Calculate display values
    const remainingDaily = budget.dailyLimit - dailySpend; // Dynamic daily spend from context

    // Handle Item Selection (Staging to cart)
    const handleToggleItem = (item: MenuItem) => {
        if (budget.isCycleCompleted) return; // Disable logging when cycle is complete

        // Check if item is already staged
        const existingStaged = stagedItems.find(staged => staged.id === item.id);

        if (existingStaged) {
            unstageItem(item.id);
        } else {
            stageItem(item);
        }
    };

    const handleDismissPopup = () => {
        if (user && user.budget) {
            updateUser({
                budget: {
                    ...user.budget,
                    hasSeenCompletionPopup: true
                }
            });
        }
    };

    const handleApplyMessPass = (startDate: string, endDate: string, totalDays: number, totalFee: number) => {
        if (user) {
            updateUser({
                messPass: {
                    isActive: true,
                    startDate,
                    endDate,
                    totalDays,
                    dailyRate: 150,
                    totalFee,
                    appliedDate: new Date().toISOString()
                }
            });
            setShowMessPassModal(false);
        }
    };

    const handleCancelMessPass = () => {
        if (user && confirm('Are you sure you want to cancel your mess pass?')) {
            updateUser({
                messPass: undefined
            });
        }
    };

    const showCelebration = budget.isCycleCompleted && !budget.hasSeenCompletionPopup;
    const hasActiveMessPass = user?.messPass?.isActive;

    // Check for end-of-day notification trigger
    useEffect(() => {
        if (!user || hasActiveMessPass) return;

        const today = new Date().toDateString();
        const todaysMeals = loggedMeals.filter(meal =>
            new Date(meal.timestamp).toDateString() === today
        );

        // Get last notification date from localStorage
        const lastNotificationDate = localStorage.getItem('lastDailySummaryDate');

        // Check if we should show notification:
        // 1. At least 3 meals logged today (breakfast, lunch, dinner minimum)
        // 2. Haven't shown notification today yet
        // 3. Current time is after 8 PM (20:00)
        const currentHour = new Date().getHours();
        const shouldShowNotification =
            todaysMeals.length >= 3 &&
            lastNotificationDate !== today &&
            currentHour >= 20;

        if (shouldShowNotification) {
            setShowDailySummary(true);
            localStorage.setItem('lastDailySummaryDate', today);
        }
    }, [loggedMeals, user, hasActiveMessPass]);

    const handleDismissSummary = () => {
        setShowDailySummary(false);
    };

    // Count today's logged meals
    const today = new Date().toDateString();
    const todaysMealsCount = loggedMeals.filter(meal =>
        new Date(meal.timestamp).toDateString() === today
    ).length;

    return (
        <div className="pb-24"> {/* Padding for drawer/fab */}
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userData.name.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500 mt-1">Here's your food plan and budget for today.</p>
                </div>
                {!hasActiveMessPass && (
                    <button
                        onClick={() => setShowMessPassModal(true)}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition shadow-sm flex items-center gap-2"
                    >
                        🍽️ Apply Mess Pass
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Budget & Goals - NOW SIDE BY SIDE in Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mess Pass Status - Only when Active */}
                        {hasActiveMessPass && (
                            <MessPassStatus
                                messPass={user.messPass!}
                                onCancel={handleCancelMessPass}
                            />
                        )}

                        {/* Daily Limit Card - Always Visible */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 relative group">
                            {budget.isCycleCompleted ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Budget Cycle Completed</h3>
                                        <p className="text-sm text-gray-500">You've successfully finished your plan.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditingBudget(true)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"
                                        title="Edit Budget"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <Wallet size={16} className={remainingDaily < 50 ? 'text-red-500' : 'text-green-500'} />
                                            {hasActiveMessPass ? 'Extra Budget' : 'Daily Budget Left'}
                                        </h3>
                                        <div className="mt-4 flex items-baseline gap-2">
                                            <span className={`text-4xl font-bold tracking-tight ${remainingDaily < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                                ₹{remainingDaily}
                                            </span>
                                            <span className="text-sm text-gray-400">/ ₹{budget.dailyLimit}</span>
                                        </div>
                                        <div className="mt-2 text-xs">
                                            <span className={`font-semibold ${todaysSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {todaysSavings >= 0 ? '✓ ' : '⚠ '}
                                                {todaysSavings >= 0 ? 'Saving' : 'Overspent'} ₹{Math.abs(todaysSavings)} today
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${remainingDaily < 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min((dailySpend / budget.dailyLimit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Savings Goal Card - Hide when Mess Pass is active to save space */}
                        {!hasActiveMessPass && (
                            <div className="h-48">
                                <SafetyGoalCard
                                    monthlyLimit={budget.monthlyLimit}
                                    spentMonth={budget.spentMonth}
                                />
                            </div>
                        )}
                    </div>

                    {/* Meal Planner takes remaining width below budget cards */}
                    {/* passing stagedItems to show checked state */}
                    <DailyMealPlanner
                        onStage={handleToggleItem}
                        stagedItems={stagedItems}
                    />
                </div>

                {/* Right Column: Canteen Filter */}
                <div className="hidden lg:block space-y-6">
                    <CanteenFilter />
                </div>
            </div>

            {/* Fixed Overlay Components */}
            {/* Initial Onboarding */}
            {user && !user.isOnboardingComplete && (
                <BudgetOnboardingModal
                    onComplete={(data) => {
                        updateUser({
                            isOnboardingComplete: true,
                            budget: {
                                ...user.budget!,
                                monthlyLimit: data.allowance,
                                savingGoal: data.savingGoal,
                                dailyLimit: data.dailyLimit,
                                baseDailyBudget: data.baseDailyBudget,
                                totalPlannedDays: data.durationDays,
                                remainingDays: data.remainingDays,
                                daysUsed: 0,
                                isCycleCompleted: false,
                                spentToday: 0,
                                spentMonth: 0
                            }
                        });
                    }}
                />
            )}

            {/* Edit Budget Modal */}
            {user && isEditingBudget && (
                <BudgetOnboardingModal
                    initialValues={{
                        allowance: user.budget?.monthlyLimit || 0,
                        savingGoal: user.budget?.savingGoal || 0,
                        duration: user.budget?.totalPlannedDays || 30
                    }}
                    onClose={() => setIsEditingBudget(false)}
                    onComplete={(data) => {
                        updateUser({
                            budget: {
                                ...user.budget!,
                                monthlyLimit: data.allowance,
                                savingGoal: data.savingGoal,
                                dailyLimit: data.dailyLimit,
                                baseDailyBudget: data.baseDailyBudget,
                                totalPlannedDays: data.durationDays,
                                remainingDays: data.remainingDays,
                                daysUsed: 0,
                                isCycleCompleted: false,
                                hasSeenCompletionPopup: false,
                                spentToday: 0,
                                spentMonth: 0,
                                additionalSavings: 0
                            }
                        });
                        setIsEditingBudget(false);
                    }}
                />
            )}

            {/* Mess Pass Modal */}
            {showMessPassModal && (
                <MessPassModal
                    onClose={() => setShowMessPassModal(false)}
                    onApply={handleApplyMessPass}
                />
            )}

            {/* Daily Summary Notification */}
            {showDailySummary && !hasActiveMessPass && (
                <DailySummaryNotification
                    dailySpend={dailySpend}
                    dailyLimit={budget.dailyLimit}
                    todaysSavings={todaysSavings}
                    loggedMealsCount={todaysMealsCount}
                    onDismiss={handleDismissSummary}
                />
            )}

            {/* Celebratory Completion Popup */}
            {showCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-br from-green-600 to-blue-600 p-8 text-white text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl backdrop-blur-md animate-bounce">
                                🎉
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Cycle Complete!</h2>
                            <p className="text-white/90 text-sm leading-relaxed mb-1">
                                You have saved <span className="font-bold text-white">₹{budget.additionalSavings}</span> additionally over the past <span className="font-bold text-white">{budget.totalPlannedDays}</span> days!
                            </p>
                            <p className="text-white/80 text-xs">
                                That's on top of your ₹{budget.savingGoal} goal!
                            </p>
                        </div>
                        <div className="p-6">
                            <button
                                onClick={handleDismissPopup}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition shadow-lg"
                            >
                                OK, Great!
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <FloatingChatbot />
        </div>
    );
}

export default function StudentDashboard() {
    return <DashboardContent />;
}
