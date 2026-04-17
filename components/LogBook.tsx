"use client";

import { useMenu, LogItem } from '@/context/MenuContext';
import { MenuItem } from '@/lib/data';
import { X, Trash2, Plus, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface LogBookProps {
    isOpen: boolean;
    onClose: () => void;
    stagedItems: MenuItem[];
    onRemoveItem: (index: number) => void;
    onSaveLog: () => void;
    onAddManualItem: (name: string, price: number, category: string) => void;
}

export default function LogBook({ isOpen, onClose, stagedItems, onRemoveItem, onSaveLog, onAddManualItem }: LogBookProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Snacks');

    if (!isOpen) return null;

    const total = stagedItems.reduce((acc, item) => acc + item.price, 0);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && price) {
            onAddManualItem(name, Number(price), category);
            setName('');
            setPrice('');
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Log Book 📝</h2>
                        <p className="text-sm text-gray-500">Review your meals before logging.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Add Manual Item Button */}
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add Manual Item
                        </button>
                    ) : (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-blue-900 text-sm">Add Item</h3>
                                <button onClick={() => setIsAdding(false)} className="text-blue-400 hover:text-blue-600"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Item Name (e.g. Juice)"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    required
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        className="w-1/2 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-1/2 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option>Snacks</option>
                                        <option>Breakfast</option>
                                        <option>Lunch</option>
                                        <option>Dinner</option>
                                        <option>Beverages</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">Add to List</button>
                            </form>
                        </div>
                    )}

                    {stagedItems.length === 0 && !isAdding ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-4xl mb-3">🛒</p>
                            <p>No items selected yet.</p>
                            <p className="text-xs">Select items from the planner to add them here.</p>
                        </div>
                    ) : (
                        stagedItems.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                        {item.category === 'Beverages' ? '🥤' : '🍛'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.name}</p>
                                        <div className="flex gap-2 text-xs text-gray-500">
                                            <span>{item.mealPeriod?.[0] || item.category}</span>
                                            <span>•</span>
                                            <span>₹{item.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(index)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-gray-500 font-medium">Total to Log</span>
                        <span className="text-2xl font-bold text-gray-900">₹{total}</span>
                    </div>

                    <button
                        onClick={onSaveLog}
                        disabled={stagedItems.length === 0}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        Save to Daily Log <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
