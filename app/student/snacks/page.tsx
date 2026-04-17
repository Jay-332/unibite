"use client";

import { useState } from 'react';

const INGREDIENTS = [
    { id: 'i1', name: 'Amul Milk (200ml)', price: 15, calories: 120, unit: 'pack' },
    { id: 'i2', name: 'Oats (100g)', price: 20, calories: 380, unit: 'cup' },
    { id: 'i3', name: 'Banana', price: 5, calories: 90, unit: 'pc' },
    { id: 'i4', name: 'Honey (sachet)', price: 2, calories: 30, unit: 'pc' },
    { id: 'i5', name: 'Almonds (5pcs)', price: 10, calories: 40, unit: 'pack' },
    { id: 'i6', name: 'Bread Slices (2)', price: 10, calories: 150, unit: 'pack' },
    { id: 'i7', name: 'Cheese Slice', price: 15, calories: 110, unit: 'pc' },
];

export default function SnacksPage() {
    const [cart, setCart] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        if (cart.includes(id)) {
            setCart(cart.filter(itemId => itemId !== id));
        } else {
            setCart([...cart, id]);
        }
    };

    const selectedItems = INGREDIENTS.filter(item => cart.includes(item.id));
    const totalCost = selectedItems.reduce((acc, item) => acc + item.price, 0);
    const totalCals = selectedItems.reduce((acc, item) => acc + item.calories, 0);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">DIY Snack Planner 🥛</h1>
                <p className="text-gray-500">Pick raw ingredients from the Amul Store & Canteen to make your own healthy snacks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ingredients Grid */}
                <div className="lg:col-span-2">
                    <h2 className="font-bold text-xl mb-4 text-gray-700">Available Ingredients</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {INGREDIENTS.map((item) => {
                            const isSelected = cart.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={`
                    cursor-pointer p-4 rounded-xl border transition relative overflow-hidden group
                    ${isSelected ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'}
                  `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-800">{item.name}</span>
                                        <span className="bg-white/80 px-2 py-1 rounded text-xs font-bold shadow-sm">₹{item.price}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{item.calories} kcal • {item.unit}</p>

                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-green-600">
                                            ✅
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-2">💡 AI Suggestion: Power Smoothie</h3>
                        <p className="text-sm text-blue-600 mb-3">Mix Milk + Oats + Banana for a high-energy post-class snack!</p>
                        <button
                            onClick={() => setCart(['i1', 'i2', 'i3'])}
                            className="text-xs font-bold text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Load Recipe (₹40)
                        </button>
                    </div>
                </div>

                {/* Summary Card */}
                <div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
                        <h2 className="font-bold text-xl mb-4 border-b pb-2">Your Snack Mix</h2>

                        <div className="space-y-4 mb-6">
                            {selectedItems.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Select items to calculate cost</p>
                            ) : (
                                selectedItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.name}</span>
                                        <span className="font-medium">₹{item.price}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                                <span>Total Cost</span>
                                <span>₹{totalCost}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Total Calories</span>
                                <span>{totalCals} kcal</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg">
                            Save to Daily Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
