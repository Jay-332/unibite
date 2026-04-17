"use client";

import { useMenu } from '@/context/MenuContext';
import { ChevronUp, ChevronDown, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function LogDrawer() {
    const { loggedMeals, dailySpend } = useMenu();
    const [isExpanded, setIsExpanded] = useState(false);

    if (loggedMeals.length === 0) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-2xl z-40 transition-all duration-300 ease-in-out border-t border-gray-100 ${isExpanded ? 'h-[60vh] md:h-[50vh]' : 'h-16'}`}>

            {/* Handle/Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-16 px-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-700">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Today's Log</p>
                        <p className="text-xs text-gray-500">{loggedMeals.length} items</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Total Spent</p>
                        <p className="font-bold text-green-600 text-lg">₹{dailySpend}</p>
                    </div>
                    {isExpanded ? <ChevronDown className="text-gray-400" /> : <ChevronUp className="text-gray-400" />}
                </div>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto h-[calc(100%-4rem)] bg-gray-50">
                <div className="space-y-3 max-w-2xl mx-auto">
                    {loggedMeals.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-500">
                                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    {item.isManual && (
                                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Manual Log</span>
                                    )}
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">₹{item.price}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
