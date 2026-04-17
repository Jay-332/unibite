"use client";

import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';

export default function ReviewsPage() {
    const { user } = useAuth();
    const { items, reviews } = useMenu();

    // Get items belonging to this vendor's canteen
    const vendorItems = items.filter(item => item.canteenId === user?.canteenId);
    const vendorItemIds = vendorItems.map(item => item.id);

    // Get reviews for this vendor's items only
    const vendorReviews = reviews.filter(review => vendorItemIds.includes(review.itemId));

    // Calculate stats
    const avgRating = vendorReviews.length > 0
        ? (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length).toFixed(1)
        : "0";

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Customer Reviews ⭐</h1>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
                    <p className="text-sm text-gray-500">{vendorReviews.length} review{vendorReviews.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="grid gap-6">
                {vendorReviews.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500">No reviews yet. Reviews from students will appear here.</p>
                    </div>
                ) : (
                    vendorReviews
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((review) => {
                            const item = vendorItems.find(it => it.id === review.itemId);
                            return (
                                <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                                                {review.userName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{review.userName || 'Anonymous'}</h3>
                                                <p className="text-xs text-gray-500">Ordered: {item?.name || 'Unknown Item'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                        ))}
                                    </div>

                                    {review.comment ? (
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{review.comment}</p>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">No comment provided</p>
                                    )}
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
}
