"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/app/context/WalletContext";
import { TrendingUp, Wallet, ShoppingBag, Star, AlertTriangle, Utensils } from "lucide-react";

export default function DashboardPage() {
  const { balance } = useWallet();
  const [daily, setDaily] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/budget/daily").then((r) => r.json()),
      fetch("/api/budget/insights").then((r) => r.json()),
      fetch("/api/orders/my-orders").then((r) => r.json()),
    ]).then(([d, i, o]) => { setDaily(d); setInsights(i); setOrders((o.orders || []).slice(0, 3)); }).finally(() => setIsLoading(false));
  }, []);

  const spentPct = daily ? Math.min((daily.totalSpent / daily.dailyBudget) * 100, 100) : 0;

  const QUICK_ACTIONS = [
    { icon: <Utensils size={20} />, label: "Browse Canteens", href: "/canteens", color: "from-orange-400 to-rose-500" },
    { icon: <Wallet size={20} />, label: "Top Up Wallet", href: "/wallet", color: "from-blue-500 to-indigo-600" },
    { icon: <ShoppingBag size={20} />, label: "View Orders", href: "/orders", color: "from-purple-500 to-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Image src="/logo-bowl.jpg" alt="UniBites logo" width={44} height={44} className="rounded-xl shadow-sm" />
          <div>
            <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
            <p className="text-green-700/80 text-sm">Welcome back! Here&apos;s your snapshot.</p>
          </div>
        </div>

        {daily?.isOverBudget && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
            <AlertTriangle size={18} className="shrink-0" />
            You've exceeded your daily budget today!
          </div>
        )}

        {/* Today's Snapshot */}
        <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Today's Snapshot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-xs text-gray-400">Token Balance</p>
              <p className="text-xl font-bold text-gray-900">₹{balance.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Today's Spending</p>
              <p className="text-xl font-bold text-gray-900">₹{daily?.totalSpent?.toFixed(0) || "0"}</p>
              <p className="text-xs text-gray-400">of ₹{daily?.dailyBudget || 0} budget</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Remaining</p>
              <p className={`text-xl font-bold ${daily?.remaining < 0 ? "text-red-500" : "text-green-600"}`}>
                ₹{(daily?.remaining || 0).toFixed(0)}
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${spentPct >= 100 ? "bg-red-500" : spentPct >= 80 ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>₹0</span><span>₹{daily?.dailyBudget || 0}</span>
          </div>
        </div>

        {/* Weekly Summary */}
        {insights && (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">This Week</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-400">Total Spent</p><p className="text-lg font-bold text-gray-900">₹{insights.totalThisWeek?.toFixed(0)}</p></div>
              <div><p className="text-xs text-gray-400">Avg Daily</p><p className="text-lg font-bold text-gray-900">₹{insights.avgDaily?.toFixed(0)}</p></div>
              <div><p className="text-xs text-gray-400">Days Under Budget</p><p className="text-lg font-bold text-green-600">{insights.daysUnderBudget}</p></div>
              <div><p className="text-xs text-gray-400">Days Over Budget</p><p className="text-lg font-bold text-red-500">{insights.daysOverBudget}</p></div>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Extra Savings Pool</p>
                <p className="text-2xl font-bold text-green-800 mt-1">₹{(insights.extraSavings || 0).toFixed(0)}</p>
                <p className="text-xs text-green-700/90 mt-1">Use this for extra purchases apart from meals.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">AI Budget Insight</p>
                <p className="text-sm text-emerald-900 mt-1">{insights.aiInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className={`bg-gradient-to-br ${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-md`}>
                <div className="flex justify-center mb-2">{a.icon}</div>
                <p className="text-xs font-semibold leading-tight">{a.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Orders</h2>
              <Link href="/orders" className="text-orange-500 text-sm font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {orders.map((o) => (
                <Link href={`/orders/${o.id}`} key={o.id}>
                  <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-xl px-2 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.canteen?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{o.totalAmount.toFixed(2)}</p>
                      <span className="text-xs text-gray-400">{o.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
