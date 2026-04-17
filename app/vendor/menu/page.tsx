"use client";

import { useState, useRef, useEffect } from 'react';
import { MenuItem, MealPeriod } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { Pencil, Trash2, Plus, X, Save, Upload, Search } from 'lucide-react';


export default function MenuManager() {
    const { user } = useAuth();
    const { items, addItem, updateItem, deleteItem } = useMenu();
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Snacks');
    const [newItemIsDaily, setNewItemIsDaily] = useState(false);
    const [newItemIsAvailable, setNewItemIsAvailable] = useState(true);
    const [newItemPeriods, setNewItemPeriods] = useState<MealPeriod[]>(['Snacks']);
    const [newItemImage, setNewItemImage] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [previewError, setPreviewError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Reset preview error when image changes
    useEffect(() => {
        setPreviewError(false);
    }, [newItemImage]);

    // Filter items for current vendor and search query
    const vendorItems = items.filter(i => {
        const isVendorItem = i.canteenId === user?.canteenId;
        const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        return isVendorItem && matchesSearch;
    });

    const resetForm = () => {
        setNewItemName('');
        setNewItemPrice('');
        setNewItemCategory('Snacks');
        setNewItemIsDaily(false);
        setNewItemIsAvailable(true);
        setNewItemPeriods(['Snacks']);
        setNewItemImage('');
        setNewItemDescription('');
        setEditId(null);
        setIsEditing(false);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItemImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.canteenId) return;

        if (editId) {
            // Update existing
            updateItem(editId, {
                name: newItemName,
                price: Number(newItemPrice),
                category: newItemCategory,
                mealPeriod: newItemPeriods,
                isDaily: newItemIsDaily,
                isAvailable: newItemIsAvailable,
                image: newItemImage,
                description: newItemDescription
            });
        } else {
            // Add new
            const newItem: MenuItem = {
                id: `m${Date.now()}`,
                canteenId: user.canteenId,
                name: newItemName,
                price: Number(newItemPrice),
                category: newItemCategory,
                mealPeriod: newItemPeriods,
                type: 'veg',
                isHealthy: true,
                isDaily: newItemIsDaily,
                isAvailable: newItemIsAvailable,
                rating: 5.0,
                prepTime: '15m',
                image: newItemImage,
                description: newItemDescription
            };
            addItem(newItem);
        }
        resetForm();
    };

    const handleEditClick = (item: MenuItem) => {
        setEditId(item.id);
        setNewItemName(item.name);
        setNewItemPrice(item.price.toString());
        setNewItemCategory(item.category);
        setNewItemIsDaily(item.isDaily);
        setNewItemIsAvailable(item.isAvailable !== false); // Default to true if undefined
        setNewItemPeriods(item.mealPeriod);
        setNewItemImage(item.image || '');
        setNewItemDescription(item.description || '');
        setIsEditing(true);
    };

    const handleDeleteClick = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(id);
        }
    };

    const togglePeriod = (period: MealPeriod) => {
        setNewItemPeriods(prev =>
            prev.includes(period)
                ? prev.filter(p => p !== period)
                : [...prev, period]
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                    <p className="text-gray-500 mt-1">Manage your daily menu and prices.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {showSearch ? (
                            <div className="relative group animate-in fade-in slide-in-from-right-2 duration-300">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="pl-10 pr-10 py-2 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none w-64 shadow-sm"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                    <Search size={18} />
                                </div>
                                <button
                                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Search Menu"
                            >
                                <Search size={22} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Plus size={18} /> Add New Item
                    </button>

                </div>
            </div>

            {/* Sliding Drawer for Editing - "Slides to the side" */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={resetForm}
                    ></div>

                    {/* Drawer Panel */}
                    <div className="relative w-full md:w-[480px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-100 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                            <h3 className="font-bold text-green-900 text-xl">{editId ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={resetForm} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm border border-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            <form onSubmit={handleSaveItem} className="space-y-6">
                                {/* Image Upload - Prominent at Top */}
                                <div className="flex justify-center">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-dashed border-green-200 bg-gray-50 flex items-center justify-center hover:border-green-400 hover:bg-green-50 transition-colors">
                                            {newItemImage && !previewError ? (
                                                <img
                                                    src={newItemImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setPreviewError(true)}
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <span className="text-4xl block mb-2">📸</span>
                                                    <span className="text-xs text-green-600 font-medium">Upload Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm backdrop-blur-[1px]">
                                            Change Photo
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white"
                                            placeholder="e.g. Veg Biryani"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                                            <input
                                                type="number"
                                                value={newItemPrice}
                                                onChange={(e) => setNewItemPrice(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white"
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Availability</label>
                                            <label className={`flex items-center justify-center gap-2 h-[46px] rounded-lg border cursor-pointer transition ${newItemIsAvailable ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={newItemIsAvailable}
                                                    onChange={(e) => setNewItemIsAvailable(e.target.checked)}
                                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                />
                                                <span className="font-bold text-sm">In Stock</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={newItemDescription}
                                            onChange={(e) => setNewItemDescription(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white resize-none"
                                            placeholder="Describe ingredients, taste..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Meal Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'] as MealPeriod[]).map((period) => (
                                                <button
                                                    key={period}
                                                    type="button"
                                                    onClick={() => togglePeriod(period)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${newItemPeriods.includes(period)
                                                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {period}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={handleSaveItem}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> {editId ? 'Update Item' : 'Save Item'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-6 py-3.5 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-800">Item Details</th>
                            <th className="hidden md:table-cell p-4 font-semibold text-gray-800">Meal Type</th>
                            <th className="hidden md:table-cell p-4 font-semibold text-gray-800">Type</th>
                            <th className="p-4 font-semibold text-gray-800">Price</th>
                            <th className="hidden lg:table-cell p-4 font-semibold text-gray-800 text-center">Status</th>
                            <th className="p-4 font-semibold text-gray-800 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {vendorItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-2">🍽️</div>
                                        <p className="font-bold text-gray-700">No items found</p>
                                        <p className="text-sm">Click "Add New Item" to start building your menu!</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            vendorItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div key={`img-${item.id}-${item.image?.slice(-20) || 'none'}`} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center relative">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent && !parent.querySelector('.emoji-fallback')) {
                                                                const span = document.createElement('span');
                                                                span.className = 'text-2xl emoji-fallback';
                                                                span.innerText = '🍲';
                                                                parent.appendChild(span);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-2xl">🍲</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">{item.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[140px] md:max-w-[200px]">{item.description || item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.mealPeriod.slice(0, 2).map(p => (
                                                <span key={p} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                                    {p}
                                                </span>
                                            ))}
                                            {item.mealPeriod.length > 2 && (
                                                <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-500 border border-gray-100">
                                                    +{item.mealPeriod.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-4">
                                        {item.isDaily ? (
                                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                                                Daily
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                                Regular
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-gray-800">₹{item.price}</td>
                                    <td className="hidden lg:table-cell p-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => updateItem(item.id, { isAvailable: !item.isAvailable })}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition border ${item.isAvailable !== false
                                                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                    : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${item.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {item.isAvailable !== false ? 'IN STOCK' : 'OUT STOCK'}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                title="Edit Item"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
