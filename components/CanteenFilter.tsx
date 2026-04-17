"use client";

import { CANTEENS } from '@/lib/data';
import { useMenu } from '@/context/MenuContext';
import { Store, ArrowUpDown } from 'lucide-react';

export default function CanteenFilter() {
    const { selectedCanteen, setSelectedCanteen, priceSort, setPriceSort } = useMenu();

    const handleReset = () => {
        setSelectedCanteen(null);
        setPriceSort('none');
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative z-10">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-4">
                <Store size={16} className="text-blue-500" />
                Filter Options
            </h3>

            {/* Canteen Selection */}
            <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Canteen</p>
                <div className="space-y-1.5">
                    {/* All Canteens Option */}
                    <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                            type="radio"
                            name="canteen-filter"
                            checked={selectedCanteen === null}
                            onChange={() => setSelectedCanteen(null)}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className={`text-sm ${selectedCanteen === null ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            All Canteens
                        </span>
                    </label>

                    {/* Individual Canteens */}
                    {CANTEENS.map(canteen => (
                        <label
                            key={canteen.id}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                        >
                            <input
                                type="radio"
                                name="canteen-filter"
                                checked={selectedCanteen === canteen.id}
                                onChange={() => setSelectedCanteen(canteen.id)}
                                className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <span className={`text-sm flex-1 ${selectedCanteen === canteen.id ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                {canteen.name}
                            </span>
                            {canteen.isOpen && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                    Open
                                </span>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Price Sort */}
            <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ArrowUpDown size={12} />
                    Sort by Price
                </p>
                <div className="space-y-1.5">
                    <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                            type="radio"
                            name="price-sort"
                            checked={priceSort === 'none'}
                            onChange={() => setPriceSort('none')}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${priceSort === 'none' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            Default (Rating)
                        </span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                            type="radio"
                            name="price-sort"
                            checked={priceSort === 'low-high'}
                            onChange={() => setPriceSort('low-high')}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${priceSort === 'low-high' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            Low → High
                        </span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                            type="radio"
                            name="price-sort"
                            checked={priceSort === 'high-low'}
                            onChange={() => setPriceSort('high-low')}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${priceSort === 'high-low' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            High → Low
                        </span>
                    </label>
                </div>
            </div>

            {/* Reset Button */}
            {(selectedCanteen || priceSort !== 'none') && (
                <button
                    onClick={handleReset}
                    className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition mt-2"
                >
                    Reset Filters
                </button>
            )}

            {/* Active Filter Indicator */}
            {(selectedCanteen || priceSort !== 'none') && (
                <div className="mt-3 text-[11px] text-green-600 font-medium text-center px-2 py-1 bg-green-50 rounded">
                    Active: {selectedCanteen ? CANTEENS.find(c => c.id === selectedCanteen)?.name : 'All'}
                    {priceSort !== 'none' && ` • ${priceSort === 'low-high' ? '↑ Price' : '↓ Price'}`}
                </div>
            )}
        </div>
    );
}
