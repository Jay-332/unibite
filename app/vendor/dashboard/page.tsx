"use client";

import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { FEEDBACKS } from '@/lib/data';

export default function VendorDashboard() {
    const { user } = useAuth();
    const { items, reviews, loggedMeals } = useMenu();

    // Get items belonging to this vendor's canteen
    const vendorItems = items.filter(item => item.canteenId === user?.canteenId);
    const vendorItemIds = vendorItems.map(item => item.id);

    // Get reviews for this vendor's items only
    const vendorReviews = reviews.filter(review => vendorItemIds.includes(review.itemId));

    // Get logged meals for this vendor's items only
    const vendorLoggedMeals = loggedMeals.filter(meal => vendorItemIds.includes(meal.id) || vendorItems.some(v => v.name === meal.name));

    // Calculate purchase count for each item
    const itemPurchaseCounts = vendorItems.map(item => {
        const count = vendorLoggedMeals.filter(meal => meal.id === item.id || meal.name === item.name).length;
        return { ...item, purchaseCount: count };
    }).sort((a, b) => b.purchaseCount - a.purchaseCount);

    // Calculate average rating from reviews
    const avgRating = vendorReviews.length > 0
        ? (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length).toFixed(1)
        : "N/A";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of today's sales and feedback.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Menu Items</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{vendorItems.length}</p>
                    <span className="text-xs text-gray-400">Items in your menu</span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Avg Rating</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{avgRating} {avgRating !== "N/A" && "⭐"}</p>
                    <span className="text-xs text-gray-400">
                        {vendorReviews.length > 0
                            ? `Based on ${vendorReviews.length} review${vendorReviews.length > 1 ? 's' : ''}`
                            : 'No reviews yet'
                        }
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-4">Top Selling Items 🔥</h2>
                    <div className="space-y-4">
                        {vendorItems.length === 0 ? (
                            <p className="text-gray-500 text-sm">No items in your menu yet.</p>
                        ) : itemPurchaseCounts.slice(0, 3).every(item => item.purchaseCount === 0) ? (
                            <p className="text-gray-500 text-sm">No purchases yet. Top sellers will appear here.</p>
                        ) : (
                            itemPurchaseCounts
                                .slice(0, 3)
                                .map((item, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                                style={{ backgroundColor: '#436C26' }}
                                            >
                                                {i + 1}
                                            </span>
                                            <span className="font-medium text-gray-800">{item.name}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {item.purchaseCount} orders • ₹{item.price}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-4">Recent Reviews</h2>
                    <div className="space-y-4">
                        {vendorReviews.length === 0 ? (
                            <p className="text-gray-500 text-sm">No reviews yet.</p>
                        ) : (
                            vendorReviews
                                .slice(-5)
                                .reverse()
                                .map((review, i) => {
                                    const item = vendorItems.find(it => it.id === review.itemId);
                                    return (
                                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-sm text-gray-800">
                                                    {item?.name || 'Unknown Item'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, s) => (
                                                        <span key={s} className={`text-xs ${s < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-gray-600 mt-1">"{review.comment}"</p>
                                            )}
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-400">{review.userName}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-lg mb-4">Recent Feedback</h2>
                <div className="space-y-4">
                    {FEEDBACKS.length === 0 ? (
                        <p className="text-gray-500 text-sm">No feedback yet.</p>
                    ) : (
                        FEEDBACKS.filter(f => f.target === 'all' || f.target === user?.canteenId)
                            .slice(-3)
                            .reverse()
                            .map((feedback, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm text-gray-800">
                                            {feedback.type === 'suggestion' ? '💡 Suggestion' : '❓ Issue'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(feedback.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">"{feedback.message}"</p>
                                    <div className="flex gap-2 mt-2">
                                        {feedback.target === 'all' && (
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Common</span>
                                        )}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}
