"use client";

import { MenuItem, Review, USERS } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import MenuImage from './MenuImage';
import { X, Star, Flame } from 'lucide-react';
import { useState } from 'react';

interface FoodDetailModalProps {
    item: MenuItem;
    onClose: () => void;
}

export default function FoodDetailModal({ item, onClose }: FoodDetailModalProps) {
    const { user } = useAuth();
    const { addReview, reviews, stageItem, stagedItems } = useMenu();
    const isStaged = stagedItems.some(i => i.id === item.id);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    const filteredReviews = reviews.filter(r => r.itemId === item.id);

    // Mock user if not logged in (fallback)
    const currentUser = user || USERS[0];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        const newReview: Review = {
            id: Date.now().toString(),
            itemId: item.id,
            userId: currentUser.id,
            userName: currentUser.name,
            rating,
            comment,
            date: new Date().toISOString(),
        };

        addReview(newReview);
        setRating(0);
        setComment('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">

                {/* Header Image */}
                <div className="h-48 md:h-64 relative bg-gray-200">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 bg-white/50 backdrop-blur p-2 rounded-full hover:bg-white transition"
                    >
                        <X size={20} className="text-gray-800" />
                    </button>
                    <MenuImage src={item.image} alt={item.name} />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">{item.name}</h2>
                        <span className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold text-lg shadow-lg">
                            ₹{item.price}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Tags & Desc */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase border ${item.type === 'veg' ? 'border-green-600 text-green-700 bg-green-50' : 'border-red-600 text-red-700 bg-red-50'}`}>
                                {item.type}
                            </span>
                            {item.isHealthy && (
                                <span className="px-2 py-1 rounded text-xs font-medium border border-blue-600 text-blue-700 bg-blue-50 flex items-center gap-1">
                                    <Flame size={12} /> Healthy
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            {item.description || "A delicious meal prepared fresh for you."}
                        </p>
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            Reviews <span className="text-sm font-normal text-gray-500">({filteredReviews.length})</span>
                        </h3>

                        {/* Add Review */}
                        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rate this item</label>
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 active:scale-95 duration-75"
                                    >
                                        <Star
                                            size={24}
                                            className={`${(hoveredStar || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your feedback (optional)"
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm mb-3"
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={rating === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Submit Review
                            </button>
                        </form>

                        {/* List Reviews */}
                        <div className="space-y-4">
                            {filteredReviews.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">No reviews yet. Be the first!</p>
                            ) : (
                                filteredReviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{review.userName}</p>
                                                <div className="flex text-yellow-400 text-xs my-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={10} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            if (item.isAvailable === false) return;
                            stageItem(item);
                            // Simple toast feedback
                            const toast = document.createElement('div');
                            toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold z-[60] animate-in fade-in slide-in-from-bottom-5';
                            toast.innerText = isStaged ? 'Already in Cart 🛒' : 'Added to Cart 🛒';
                            document.body.appendChild(toast);
                            setTimeout(() => toast.remove(), 2000);
                        }}
                        disabled={item.isAvailable === false || isStaged}
                        className={`flex-[2] py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${item.isAvailable === false
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : isStaged
                                ? 'bg-green-100 text-green-700 border border-green-200 shadow-none'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'}`}
                    >
                        {item.isAvailable === false
                            ? 'Out of Stock'
                            : isStaged
                                ? '✓ In Cart'
                                : 'Add to Log +'}
                    </button>
                </div>
            </div>
        </div>
    );
}
