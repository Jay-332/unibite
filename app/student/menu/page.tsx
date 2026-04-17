"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CANTEENS, MenuItem, MealPeriod } from '@/lib/data';
import MenuImage from '@/components/MenuImage';
import { useMenu } from '@/context/MenuContext';
import FoodDetailModal from '@/components/FoodDetailModal';
import { Star } from 'lucide-react';

function MenuBrowserContent() {
    const { items, stageItem } = useMenu();
    const [selectedCanteen, setSelectedCanteen] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod | 'All'>('All');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
    const searchParams = useSearchParams();

    // Auto-open item if suggested by AI
    useEffect(() => {
        const itemId = searchParams.get('viewItem');
        if (itemId && items.length > 0) {
            const item = items.find(i => i.id === itemId);
            if (item) {
                setSelectedItem(item);
            }
        }
    }, [searchParams, items]);

    const periods: (MealPeriod | 'All')[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];

    const filterItems = (canteenId: string | 'all') => {
        return items.filter(item => {
            const matchCanteen = canteenId === 'all' || item.canteenId === canteenId;
            const matchPeriod = selectedPeriod === 'All' || item.mealPeriod.includes(selectedPeriod);
            const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchType = typeFilter === 'all' || item.type === typeFilter;
            return matchCanteen && matchPeriod && matchSearch && matchType;
        });
    };

    const renderCanteenSection = (canteenId: string) => {
        const canteenItems = filterItems(canteenId).sort((a, b) => {
            const availA = a.isAvailable !== false ? 1 : 0;
            const availB = b.isAvailable !== false ? 1 : 0;
            return availB - availA;
        });
        const canteen = CANTEENS.find(c => c.id === canteenId);

        if (!canteen || canteenItems.length === 0) return null;

        return (
            <div key={canteen.id} className="mb-8">
                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{canteen.name}</h2>
                        <p className="text-xs text-gray-500">{canteen.location}</p>
                    </div>
                    {canteen.lastUpdated && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            Updated: {new Date(canteen.lastUpdated).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {canteenItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group cursor-pointer"
                        >
                            <div className={`h-40 bg-gray-200 relative ${item.isAvailable === false ? 'opacity-60' : ''}`}>
                                <MenuImage src={item.image} alt={item.name} />
                                {item.isAvailable === false && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg">
                                            OUT OF STOCK
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm font-bold">
                                        ₹{item.price}
                                    </span>
                                </div>
                                {item.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase border ${item.type === 'veg' ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                        <Star size={12} className="fill-current" />
                                        {item.rating}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.isAvailable === false) return;
                                        stageItem(item);
                                        // Simple toast feedback
                                        const toast = document.createElement('div');
                                        toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold z-50 animate-in fade-in slide-in-from-bottom-5';
                                        toast.innerText = 'Added to Cart 🛒';
                                        document.body.appendChild(toast);
                                        setTimeout(() => toast.remove(), 2000);
                                    }}
                                    disabled={item.isAvailable === false}
                                    className={`w-full py-2 rounded-lg text-sm font-bold transition ${item.isAvailable === false
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white'}`}
                                >
                                    {item.isAvailable === false ? 'Currently Unavailable' : 'Add to Log +'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header & Filters */}
            <div className="mb-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">Campus Menus 🍔</h1>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for food (e.g., Dosa, Sandwich)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔍
                    </span>
                </div>

                {/* Period Filter + Type Toggle Row */}
                <div className="flex items-center justify-between gap-4">
                    {/* Period Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
                        {periods.map(period => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${selectedPeriod === period
                                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>

                    {/* Veg/Non-Veg Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 flex-shrink-0">
                        <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${typeFilter === 'all'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setTypeFilter('veg')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${typeFilter === 'veg'
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🥬 Veg
                        </button>
                        <button
                            onClick={() => setTypeFilter('non-veg')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${typeFilter === 'non-veg'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🍗 Non-Veg
                        </button>
                    </div>
                </div>
                {/* Canteen Filter */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setSelectedCanteen('all')}
                        className={`pb-2 text-sm font-medium border-b-2 transition ${selectedCanteen === 'all' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        All Canteens
                    </button>
                    {CANTEENS.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCanteen(c.id)}
                            className={`pb-2 text-sm font-medium border-b-2 transition ${selectedCanteen === c.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                {selectedCanteen === 'all' ? (
                    CANTEENS.map(c => renderCanteenSection(c.id))
                ) : (
                    renderCanteenSection(selectedCanteen)
                )}

                {filterItems(selectedCanteen).length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">🍽️</p>
                        <p className="text-gray-500">No items available for this selection.</p>
                        <button
                            onClick={() => { setSelectedPeriod('All'); setSearchQuery(''); }}
                            className="text-green-600 text-sm font-bold mt-2 hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedItem && (
                <FoodDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
}

export default function MenuBrowser() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MenuBrowserContent />
        </Suspense>
    );
}
