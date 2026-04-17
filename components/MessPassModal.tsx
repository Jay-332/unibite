"use client";

import { useState } from 'react';
import { X, Calendar, IndianRupee, CheckCircle } from 'lucide-react';

interface MessPassModalProps {
    onClose: () => void;
    onApply: (startDate: string, endDate: string, totalDays: number, totalFee: number) => void;
}

const DAILY_MESS_RATE = 150; // ₹150 per day (covers breakfast, lunch, dinner)

export default function MessPassModal({ onClose, onApply }: MessPassModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalDays, setTotalDays] = useState(0);
    const [totalFee, setTotalFee] = useState(0);

    const calculateFee = (start: string, end: string) => {
        if (!start || !end) return;

        const startDateObj = new Date(start);
        const endDateObj = new Date(end);

        if (endDateObj < startDateObj) {
            alert('End date must be after start date');
            return;
        }

        const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

        setTotalDays(diffDays);
        setTotalFee(diffDays * DAILY_MESS_RATE);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        calculateFee(newStartDate, endDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        calculateFee(startDate, newEndDate);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || totalDays === 0) {
            alert('Please select valid dates');
            return;
        }
        onApply(startDate, endDate, totalDays, totalFee);
    };

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            🍽️
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Apply for Mess Pass</h2>
                            <p className="text-white/90 text-sm mt-1">All meals included (Breakfast, Lunch, Dinner)</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rate Info */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-800">
                            <IndianRupee size={20} />
                            <span className="font-bold">₹{DAILY_MESS_RATE} per day</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">Includes all three meals daily</p>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                min={today}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                min={startDate || today}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Fee Calculation */}
                    {totalDays > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Days:</span>
                                <span className="font-bold text-gray-900">{totalDays} days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Daily Rate:</span>
                                <span className="font-bold text-gray-900">₹{DAILY_MESS_RATE}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900">Total Fee:</span>
                                    <span className="text-2xl font-bold text-green-600">₹{totalFee}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                        <CheckCircle size={20} />
                        Apply for Mess Pass
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        Note: Once activated, budget tracking will be disabled during the mess pass period.
                    </p>
                </form>
            </div>
        </div>
    );
}
