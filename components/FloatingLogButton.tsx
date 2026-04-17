"use client";

import { useMenu } from '@/context/MenuContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, X, Trash2, Check, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FloatingLogButton() {
    const { stagedItems, unstageItem, updateStagedQuantity, confirmStagedItems } = useMenu();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalPrice = stagedItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

    const handleConfirm = () => {
        confirmStagedItems();
        setIsPanelOpen(false);
        // Show toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold z-[60] animate-in fade-in slide-in-from-bottom-5';
        toast.innerText = '✅ Items logged successfully!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    };

    return (
        <>
            {/* Floating Button */}
            {stagedItems.length > 0 && (
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="fixed bottom-24 right-6 z-40 bg-black text-white px-4 py-3 rounded-full shadow-xl font-bold flex items-center gap-3 hover:scale-105 transition animate-in zoom-in"
                >
                    <ShoppingBag size={20} />
                    <span className="bg-white text-black px-2 py-0.5 rounded-full text-xs font-bold">
                        {stagedItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                    </span>
                </button>
            )}

            {/* Side Panel Overlay */}
            {isPanelOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsPanelOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Review Your Selection</h2>
                                <p className="text-sm text-gray-500">{stagedItems.length} items ready to log</p>
                            </div>
                            <button
                                onClick={() => setIsPanelOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {stagedItems.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No items selected</p>
                                </div>
                            ) : (
                                stagedItems.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                        <div className="text-2xl">🍛</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.category}</p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-1 py-0.5">
                                            <button
                                                onClick={() => updateStagedQuantity(item.id, -1, item.stagedFromSlot)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity || 1}</span>
                                            <button
                                                onClick={() => updateStagedQuantity(item.id, 1, item.stagedFromSlot)}
                                                className="p-1 text-gray-400 hover:text-green-600 transition"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <span className="font-bold text-green-600">₹{item.price * (item.quantity || 1)}</span>
                                        <button
                                            onClick={() => unstageItem(item.id, item.stagedFromSlot)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {stagedItems.length > 0 && (
                            <div className="p-6 border-t border-gray-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Total</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{totalPrice}</span>
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Confirm & Log Items
                                </button>
                                <button
                                    onClick={() => router.push('/student/logbook')}
                                    className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition"
                                >
                                    View Full Log Book →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
