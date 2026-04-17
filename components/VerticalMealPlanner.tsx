"use client";

import { useState, useMemo } from 'react';
import { useMenu } from '@/context/MenuContext';
import { MenuItem, CANTEENS, MealPeriod } from '@/lib/data';
import MenuImage from './MenuImage';
import { RefreshCw, PlusCircle, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface PlannerSlotProps {
    title: string;
    period: MealPeriod;
    onLog: (item: MenuItem) => void;
}

function PlannerSlot({ title, period, onLog }: PlannerSlotProps) {
    const { items } = useMenu();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isLogged, setIsLogged] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);

    // Initial random suggestion
    const categoryItems = useMemo(() =>
        items.filter(i => i.mealPeriod.includes(period)),
        [items, period]);

    useState(() => {
        if (categoryItems.length > 0) {
            setSelectedItem(categoryItems[0]); // Pick first as default suggestion
        }
    });

    const handleSwap = (item: MenuItem) => {
        setSelectedItem(item);
        setIsSwapOpen(false);
        setIsLogged(false); // Reset log state on swap
    };

    const handleLog = () => {
        if (selectedItem) {
            onLog(selectedItem);
            setIsLogged(true);
        }
    };

    const getCanteenName = (id: string) => CANTEENS.find(c => c.id === id)?.name || 'Campus';

    if (!selectedItem) return null;

    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative">
            {/* Time Indicator Line */}
            <div className="absolute left-0 top-6 w-1 h-12 bg-gray-200 rounded-r-lg"></div>

            {/* Image */}
            <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <MenuImage src={selectedItem.image} alt={selectedItem.name} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-lg truncate pr-2">{selectedItem.name}</h4>
                        <span className="font-bold text-green-700">₹{selectedItem.price}</span>
                    </div>
                    <p className="text-xs text-gray-500">{title} • {getCanteenName(selectedItem.canteenId)}</p>

                    {/* Review Sticker */}
                    <div className="flex items-center gap-1 mt-1">
                        {selectedItem.rating >= 4.5 ? (
                            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100 flex items-center gap-1">
                                <ThumbsUp size={10} /> Well-liked
                            </span>
                        ) : (
                            <span className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                                <ThumbsDown size={10} /> Mixed reviews
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => setIsSwapOpen(true)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition"
                    >
                        <RefreshCw size={12} /> Swap
                    </button>
                    <button
                        onClick={handleLog}
                        disabled={isLogged}
                        className={`flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition ${isLogged ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                        {isLogged ? <><Check size={12} /> Logged</> : <><PlusCircle size={12} /> Log Meal</>}
                    </button>
                </div>
            </div>

            {/* Swap Modal (Simplified inline or centered) */}
            {isSwapOpen && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10 flex flex-col p-4 rounded-xl animate-in fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs text-gray-500 uppercase">Select Option</span>
                        <button onClick={() => setIsSwapOpen(false)}><span className="text-xs text-red-500 font-bold">Cancel</span></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {categoryItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleSwap(item)}
                                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer border ${selectedItem.id === item.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <span className="text-sm font-medium truncate">{item.name}</span>
                                <span className="text-xs font-bold">₹{item.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VerticalMealPlanner() {
    const { logMeal } = useMenu();

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-xl px-1">Today's Meal Plan</h3>
            <PlannerSlot title="Breakfast Suggestion" period="Breakfast" onLog={logMeal} />
            <PlannerSlot title="Lunch Suggestion" period="Lunch" onLog={logMeal} />
            <PlannerSlot title="Evening Snack" period="Snacks" onLog={logMeal} />
            <PlannerSlot title="Dinner Suggestion" period="Dinner" onLog={logMeal} />
        </div>
    );
}
