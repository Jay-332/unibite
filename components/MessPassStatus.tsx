"use client";

import { Calendar, CheckCircle, X } from 'lucide-react';

interface MessPassStatusProps {
    messPass: {
        isActive: boolean;
        startDate: string;
        endDate: string;
        totalDays: number;
        dailyRate: number;
        totalFee: number;
        appliedDate: string;
    };
    onCancel: () => void;
}

export default function MessPassStatus({ messPass, onCancel }: MessPassStatusProps) {
    const startDate = new Date(messPass.startDate);
    const endDate = new Date(messPass.endDate);
    const today = new Date();

    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isActive = today >= startDate && today <= endDate;
    const isPending = today < startDate;

    return (
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-xl shadow-sm text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            🍽️
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Mess Pass</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {isActive && (
                                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        Active
                                    </span>
                                )}
                                {isPending && (
                                    <span className="bg-yellow-400/20 text-yellow-100 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                        <Calendar size={12} />
                                        Starts Soon
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
                        title="Cancel Mess Pass"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Period:</span>
                        <span className="font-bold">
                            {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Total Days:</span>
                        <span className="font-bold">{messPass.totalDays} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Days Remaining:</span>
                        <span className="font-bold">{Math.max(0, daysRemaining)} days</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">Total Fee Paid:</span>
                            <span className="text-2xl font-bold">₹{messPass.totalFee}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/90">
                        ℹ️ All meals (Breakfast, Lunch, Dinner) are included. Use Log Book to track extra snacks or expenses.
                    </p>
                </div>
            </div>
        </div>
    );
}
