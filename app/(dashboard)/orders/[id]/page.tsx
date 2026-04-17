"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react";

const TIMELINE = ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];
const LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Being Prepared",
  READY: "Ready for Pickup",
  COMPLETED: "Completed",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => setOrder(d.order)).finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" }) });
    setOrder((o: any) => ({ ...o, status: "CANCELLED" }));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Order not found.</div>;

  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
              <p className="text-sm text-gray-500">{order.canteen?.name}</p>
            </div>
            <span className="text-xl font-bold text-orange-500">₹{order.totalAmount.toFixed(2)}</span>
          </div>

          {/* Status Timeline */}
          {order.status !== "CANCELLED" && (
            <div className="space-y-3 mb-5">
              {TIMELINE.slice(0, 5).map((step, idx) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${idx <= currentStep ? "bg-orange-500" : "bg-gray-200"}`}>
                    {idx < currentStep && <div className="w-2 h-2 bg-white rounded-full" />}
                    {idx === currentStep && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />}
                  </div>
                  <span className={`text-sm ${idx <= currentStep ? "text-gray-900 font-medium" : "text-gray-400"}`}>{LABELS[step]}</span>
                </div>
              ))}
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              This order was cancelled. Refund of ₹{order.totalAmount.toFixed(2)} is added back to your wallet.
            </div>
          )}

          {/* Items */}
          <div className="border-t border-dashed border-gray-100 pt-4 space-y-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.quantity}× {item.menuItem?.name}</span>
                <span className="text-gray-900 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin size={16} className="text-orange-400" />
            <span>{order.canteen?.location}</span>
          </div>
          {order.pickupTime && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={16} className="text-orange-400" />
              <span>Pickup at {new Date(order.pickupTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
          {order.specialInstructions && (
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Package size={16} className="text-orange-400 mt-0.5" />
              <span>{order.specialInstructions}</span>
            </div>
          )}
        </div>

        {order.status === "PENDING" && (
          <button onClick={handleCancel} className="w-full border border-red-200 text-red-600 font-semibold py-3.5 rounded-2xl hover:bg-red-50 transition">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
