"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useMenu } from '@/context/MenuContext';
import { useAuth } from '@/context/AuthContext';
import { MenuItem, MealPeriod } from '@/lib/data';
import { ChevronDown, Check } from 'lucide-react';

interface PlannerInputProps {
    label: string;
    period: MealPeriod;
    selectedItem: MenuItem | null;
    onSelect: (item: MenuItem) => void;
    onToggle: () => void;
    isChecked: boolean;
    remainingBudget: number;
    selectedCanteen: string | null;
    budgetPerMeal: number;
}

function PlannerInput({
    label,
    period,
    selectedItem,
    onSelect,
    onToggle,
    isChecked,
    remainingBudget,
    selectedCanteen,
    budgetPerMeal
}: PlannerInputProps) {
    const { items, priceSort } = useMenu();
    const [isOpen, setIsOpen] = useState(false);

    // Filter items for this period
    const options = useMemo(() => {
        let filtered = items.filter(i => i.mealPeriod.includes(period) && i.isAvailable !== false);

        if (selectedCanteen) {
            filtered = filtered.filter(i => i.canteenId === selectedCanteen);
        }

        return filtered.sort((a, b) => {
            const aAffordable = a.price <= remainingBudget;
            const bAffordable = b.price <= remainingBudget;
            if (aAffordable && !bAffordable) return -1;
            if (!aAffordable && bAffordable) return 1;

            if (priceSort === 'low-high') return a.price - b.price;
            if (priceSort === 'high-low') return b.price - a.price;
            return b.rating - a.rating;
        });
    }, [items, period, remainingBudget, selectedCanteen, priceSort]);

    const affordableItems = options.filter(i => i.price <= remainingBudget);
    const overBudgetItems = options.filter(i => i.price > remainingBudget);
    const isOverBudget = selectedItem && selectedItem.price > remainingBudget;

    const getCanteenName = (canteenId: string) => {
        const canteenMap: Record<string, string> = { 'c1': 'Kuksi', 'c2': 'MRC' };
        return canteenMap[canteenId] || canteenId;
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {period}
                </label>
                <div className="flex items-center gap-2">
                    {budgetPerMeal > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
                            Target: ₹{Math.round(budgetPerMeal)}
                        </span>
                    )}
                    {isOverBudget && (
                        <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                            Over Budget
                        </span>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex-1 bg-white border rounded-lg p-3 flex justify-between items-center cursor-pointer transition shadow-sm ${isOverBudget ? 'border-red-300 hover:border-red-400' : 'border-gray-200 hover:border-green-500'
                        }`}
                >
                    <div className="flex-1">
                        {selectedItem ? (
                            <div className="flex justify-between items-center pr-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{selectedItem.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                        {getCanteenName(selectedItem.canteenId)}
                                    </span>
                                </div>
                                <span className={`font-bold text-sm ${isOverBudget ? 'text-red-600' : 'text-green-700'}`}>
                                    ₹{selectedItem.price}
                                </span>
                            </div>
                        ) : (
                            <span className="text-gray-400 text-sm">Select meal...</span>
                        )}
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {selectedItem && (
                    <button
                        onClick={onToggle}
                        className={`w-12 rounded-lg border flex items-center justify-center transition ${isChecked
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-gray-200 text-gray-300 hover:border-green-400 hover:text-green-400'
                            }`}
                        title={isChecked ? "Selected for Log Book" : "Select to Log"}
                    >
                        <Check size={20} className={isChecked ? 'stroke-[3]' : ''} />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
                    {affordableItems.length > 0 && (
                        <>
                            <div className="px-3 py-1.5 bg-green-50 text-[10px] font-bold text-green-700 uppercase tracking-wider sticky top-0">
                                Within Budget
                            </div>
                            {affordableItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item);
                                        setIsOpen(false);
                                    }}
                                    className={`p-3 text-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-green-50 text-green-800' : 'text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{item.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                            {getCanteenName(item.canteenId)}
                                        </span>
                                    </div>
                                    <span className="font-medium text-green-600">₹{item.price}</span>
                                </div>
                            ))}
                        </>
                    )}

                    {overBudgetItems.length > 0 && (
                        <>
                            <div className="px-3 py-1.5 bg-red-50 text-[10px] font-bold text-red-600 uppercase tracking-wider sticky top-0">
                                Over Budget
                            </div>
                            {overBudgetItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item);
                                        setIsOpen(false);
                                    }}
                                    className={`p-3 text-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 opacity-70 ${selectedItem?.id === item.id ? 'bg-red-50 text-red-800' : 'text-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{item.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">
                                            {getCanteenName(item.canteenId)}
                                        </span>
                                    </div>
                                    <span className="font-medium text-red-500">₹{item.price}</span>
                                </div>
                            ))}
                        </>
                    )}

                    {affordableItems.length === 0 && overBudgetItems.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No items available for {period}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface DailyMealPlannerProps {
    onStage: (item: MenuItem) => void;
    stagedItems: MenuItem[];
}

export default function DailyMealPlanner({ onStage, stagedItems }: DailyMealPlannerProps) {
    const { items, stageItem, unstageItem, remainingBudget, selectedCanteen, stagedItems: contextStagedItems, dailySpend } = useMenu();
    const { user } = useAuth();

    const [breakfast, setBreakfast] = useState<MenuItem | null>(null);
    const [lunch, setLunch] = useState<MenuItem | null>(null);
    const [snacks, setSnacks] = useState<MenuItem | null>(null);
    const [dinner, setDinner] = useState<MenuItem | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const dailyLimit = user?.budget?.dailyLimit || 200;
    const remainingDays = user?.budget?.remainingDays || 30;

    // Calculate smart budget distribution
    const calculateSmartBudget = useCallback(() => {
        const activeMeals = 4; // Always 4 meals now

        // Base budget per meal
        const baseBudgetPerMeal = remainingBudget / activeMeals;

        return {
            perMeal: baseBudgetPerMeal
        };
    }, [remainingBudget]);

    const budgetInfo = calculateSmartBudget();

    const isSlotChecked = useCallback((slot: string, item: MenuItem | null) => {
        if (!item) return false;
        const slotName = slot.charAt(0).toUpperCase() + slot.slice(1);
        return contextStagedItems.some(i => i.id === item.id && i.stagedFromSlot === slotName);
    }, [contextStagedItems]);

    const getRandItem = useCallback((p: MealPeriod) => {
        let filtered = items.filter(i => i.mealPeriod.includes(p) && i.isAvailable !== false);
        if (selectedCanteen) {
            filtered = filtered.filter(i => i.canteenId === selectedCanteen);
        }

        // Simple random suggestions that fit budget if possible
        const affordable = filtered.filter(i => i.price <= budgetInfo.perMeal);
        const pool = affordable.length > 0 ? affordable : filtered;

        if (pool.length > 0) {
            // Sort by rating desc
            pool.sort((a, b) => b.rating - a.rating);
            return pool[0];
        }
        return null;
    }, [items, selectedCanteen, budgetInfo.perMeal]);

    // Initial load
    useEffect(() => {
        if (items.length === 0 || isInitialized) return;

        const savedBreakfastId = localStorage.getItem('campusbite_planner_breakfast');
        const savedLunchId = localStorage.getItem('campusbite_planner_lunch');
        const savedSnacksId = localStorage.getItem('campusbite_planner_snacks');
        const savedDinnerId = localStorage.getItem('campusbite_planner_dinner');

        const savedBreakfast = savedBreakfastId ? items.find(i => i.id === savedBreakfastId) : null;
        const savedLunch = savedLunchId ? items.find(i => i.id === savedLunchId) : null;
        const savedSnacks = savedSnacksId ? items.find(i => i.id === savedSnacksId) : null;
        const savedDinner = savedDinnerId ? items.find(i => i.id === savedDinnerId) : null;

        const validB = savedBreakfast && (!selectedCanteen || savedBreakfast.canteenId === selectedCanteen) ? savedBreakfast : getRandItem('Breakfast');
        const validL = savedLunch && (!selectedCanteen || savedLunch.canteenId === selectedCanteen) ? savedLunch : getRandItem('Lunch');
        const validS = savedSnacks && (!selectedCanteen || savedSnacks.canteenId === selectedCanteen) ? savedSnacks : getRandItem('Snacks');
        const validD = savedDinner && (!selectedCanteen || savedDinner.canteenId === selectedCanteen) ? savedDinner : getRandItem('Dinner');

        setBreakfast(validB || null);
        setLunch(validL || null);
        setSnacks(validS || null);
        setDinner(validD || null);
        setIsInitialized(true);
    }, [items, isInitialized, selectedCanteen, getRandItem]);

    // Save to localStorage
    useEffect(() => {
        if (!isInitialized) return;
        if (breakfast) localStorage.setItem('campusbite_planner_breakfast', breakfast.id);
        if (lunch) localStorage.setItem('campusbite_planner_lunch', lunch.id);
        if (snacks) localStorage.setItem('campusbite_planner_snacks', snacks.id);
        if (dinner) localStorage.setItem('campusbite_planner_dinner', dinner.id);
    }, [breakfast, lunch, snacks, dinner, isInitialized]);

    const handleToggleSlot = (slot: 'breakfast' | 'lunch' | 'snacks' | 'dinner', item: MenuItem | null) => {
        if (!item) return;
        const slotName = slot.charAt(0).toUpperCase() + slot.slice(1);
        const isCurrentlyChecked = isSlotChecked(slot, item);

        if (isCurrentlyChecked) {
            unstageItem(item.id, slotName);
        } else {
            stageItem(item, slotName);
        }
    };

    const handleSelectBreakfast = (item: MenuItem) => {
        if (breakfast) unstageItem(breakfast.id, 'Breakfast');
        setBreakfast(item);
    };

    const handleSelectLunch = (item: MenuItem) => {
        if (lunch) unstageItem(lunch.id, 'Lunch');
        setLunch(item);
    };

    const handleSelectSnacks = (item: MenuItem) => {
        if (snacks) unstageItem(snacks.id, 'Snacks');
        setSnacks(item);
    };

    const handleSelectDinner = (item: MenuItem) => {
        if (dinner) unstageItem(dinner.id, 'Dinner');
        setDinner(item);
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
            {/* Simplified Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                            🍽️ Today's Meal Plan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Simple planning for your day</p>
                    </div>
                </div>
            </div>

            {/* Meal Slots */}
            <div className="space-y-4">
                <PlannerInput
                    label="Breakfast"
                    period="Breakfast"
                    selectedItem={breakfast}
                    onSelect={handleSelectBreakfast}
                    onToggle={() => handleToggleSlot('breakfast', breakfast)}
                    isChecked={isSlotChecked('breakfast', breakfast)}
                    remainingBudget={remainingBudget}
                    selectedCanteen={selectedCanteen}
                    budgetPerMeal={budgetInfo.perMeal}
                />
                <PlannerInput
                    label="Lunch"
                    period="Lunch"
                    selectedItem={lunch}
                    onSelect={handleSelectLunch}
                    onToggle={() => handleToggleSlot('lunch', lunch)}
                    isChecked={isSlotChecked('lunch', lunch)}
                    remainingBudget={remainingBudget}
                    selectedCanteen={selectedCanteen}
                    budgetPerMeal={budgetInfo.perMeal}
                />
                <PlannerInput
                    label="Snacks"
                    period="Snacks"
                    selectedItem={snacks}
                    onSelect={handleSelectSnacks}
                    onToggle={() => handleToggleSlot('snacks', snacks)}
                    isChecked={isSlotChecked('snacks', snacks)}
                    remainingBudget={remainingBudget}
                    selectedCanteen={selectedCanteen}
                    budgetPerMeal={budgetInfo.perMeal}
                />
                <PlannerInput
                    label="Dinner"
                    period="Dinner"
                    selectedItem={dinner}
                    onSelect={handleSelectDinner}
                    onToggle={() => handleToggleSlot('dinner', dinner)}
                    isChecked={isSlotChecked('dinner', dinner)}
                    remainingBudget={remainingBudget}
                    selectedCanteen={selectedCanteen}
                    budgetPerMeal={budgetInfo.perMeal}
                />
            </div>
        </div>
    );
}
