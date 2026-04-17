"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChefHat } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  PREPARING: { label: "Preparing", color: "text-purple-600", bg: "bg-purple-50", icon: ChefHat },
  READY: { label: "Ready for Pickup!", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  COMPLETED: { label: "Completed", color: "text-gray-600", bg: "bg-gray-100", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

const ACTIVE = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "past">("active");

  useEffect(() => {
    fetch("/api/orders/my-orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setIsLoading(false));
  }, []);

  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const past = orders.filter((o) => !ACTIVE.includes(o.status));
  const displayed = tab === "active" ? active : past;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-6">
          {(["active", "past"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition capitalize ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
              {t} {t === "active" ? `(${active.length})` : `(${past.length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{tab === "active" ? "No active orders" : "No past orders"}</p>
            <Link href="/canteens" className="inline-block mt-4 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
              Browse Canteens
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const Icon = cfg.icon;
              return (
                <Link href={`/orders/${order.id}`} key={order.id}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{order.canteen?.name}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {order.items?.map((i: any) => `${i.quantity}x ${i.menuItem?.name}`).join(", ")}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-100">
                      <span className="text-xs text-gray-400">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
