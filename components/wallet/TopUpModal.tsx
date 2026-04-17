"use client";

import { useState } from "react";
import { X, Smartphone, CreditCard, BadgeCheck } from "lucide-react";

const QUICK_AMOUNTS = [100, 200, 500, 1000];
const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: <Smartphone size={16} /> },
  { id: "card", label: "Card", icon: <CreditCard size={16} /> },
  { id: "campus", label: "Campus ID", icon: <BadgeCheck size={16} /> },
];

interface TopUpModalProps {
  onClose: () => void;
  onTopUp: (amount: number) => Promise<void>;
}

export default function TopUpModal({ onClose, onTopUp }: TopUpModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleConfirm = async () => {
    const num = parseFloat(amount);
    if (!num || num < 10) { setError("Minimum top-up is ₹10"); return; }
    if (num > 5000) { setError("Maximum top-up is ₹5000"); return; }
    setLoading(true);
    setError("");

    try {
      // 1. Create order on the server
      const res = await fetch("/api/wallet/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });
      const order = await res.json();

      if (!res.ok) throw new Error(order.error || "Failed to create order");
      if (order.isMock) {
        await onTopUp(num);
        return;
      }

      // 2. Load Razorpay SDK
      const resScript = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!resScript) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "UniBites",
        description: "Wallet Top Up",
        order_id: order.id,
        handler: async function (response: any) {
          // 4. On success, process the top-up
          // In a real app, you would verify the signature on the server here.
          try {
             await onTopUp(num);
          } catch (err) {
             setError("Top-up failed after payment. Please contact support.");
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        setError(response.error.description);
      });
      paymentObject.open();
      
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add Tokens</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={22} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Enter Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min={10}
                max={5000}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-semibold focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">Quick Add</label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa.toString())}
                  className={`py-2 rounded-lg text-sm font-semibold border-2 transition ${
                    amount === qa.toString()
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
                >
                  ₹{qa}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium border-2 transition ${
                    paymentMethod === m.id
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Add ₹${amount || "0"} Tokens`}
          </button>
        </div>
      </div>
    </div>
  );
}
