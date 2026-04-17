"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useWallet } from "@/app/context/WalletContext";
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";

const PICKUP_OPTIONS = [
  { label: "ASAP (Now)", value: "now" },
  { label: "15 minutes", value: "15min" },
  { label: "30 minutes", value: "30min" },
  { label: "1 hour", value: "1h" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalAmount, canteenId } = useCart();
  const { balance, refreshBalance } = useWallet();
  const [pickup, setPickup] = useState("now");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const total = getTotalAmount();
  const insufficient = balance < total;

  const placeOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const pickupTime = pickup !== "now" ? new Date(Date.now() + parseInt(pickup) * 60000).toISOString() : null;
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canteenId,
          items: cartItems.map((ci) => ({ menuItemId: ci.menuItem.id, quantity: ci.quantity })),
          specialInstructions: instructions,
          pickupTime,
        }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      const data = await res.json();
      await refreshBalance();
      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || "Order failed. Please try again.");
    } finally {
      setLoading(false); setShowConfirm(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-500">
        <ShoppingBag size={48} className="text-gray-300" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <button onClick={() => router.push("/canteens")} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
          Browse Canteens
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

        {/* Items */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">Order Items</h2>
          {cartItems.map((ci) => (
            <div key={ci.menuItem.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{ci.menuItem.name}</p>
                <p className="text-xs text-gray-400">₹{ci.menuItem.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(ci.menuItem.id, ci.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><Minus size={12} /></button>
                <span className="text-sm font-bold w-5 text-center">{ci.quantity}</span>
                <button onClick={() => updateQuantity(ci.menuItem.id, ci.quantity + 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><Plus size={12} /></button>
              </div>
              <p className="text-sm font-semibold text-gray-800 w-16 text-right">₹{(ci.menuItem.price * ci.quantity).toFixed(2)}</p>
              <button onClick={() => removeFromCart(ci.menuItem.id)} className="text-gray-300 hover:text-red-500 transition ml-1"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        {/* Pickup time */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Pickup Time</h2>
          <select value={pickup} onChange={(e) => setPickup(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-400 outline-none">
            {PICKUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Special Instructions</h2>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Any special requests? (Optional)"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-orange-400 outline-none resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between text-sm text-gray-600"><span>Items Total</span><span>₹{total.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>Platform Fee</span><span>₹0.00</span></div>
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Wallet Balance</span>
            <span className={insufficient ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>₹{balance.toFixed(2)}</span>
          </div>
        </div>

        {insufficient && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
            <AlertCircle size={18} />
            Insufficient balance. Please top up your wallet.
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={() => setShowConfirm(true)}
          disabled={insufficient || loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Place Order • ₹{total.toFixed(2)}
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Order?</h3>
            <p className="text-gray-500 text-sm mb-6">₹{total.toFixed(2)} will be deducted from your wallet.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={placeOrder} disabled={loading}
                className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">
                {loading ? "Placing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
