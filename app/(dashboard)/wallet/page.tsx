"use client";

import { useState } from "react";
import { useWallet } from "@/app/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import TopUpModal from "@/components/wallet/TopUpModal";
import TransactionList from "@/components/wallet/TransactionList";
import { AlertTriangle, Wallet, TrendingUp, ArrowUpCircle } from "lucide-react";

export default function WalletPage() {
  const { balance, transactions, isLoading, topUp, refreshBalance } = useWallet();
  const { user } = useAuth();
  const [showTopUp, setShowTopUp] = useState(false);

  const dailyBudget = (user as any)?.dailyBudget || 150;
  const lowBalance = balance < dailyBudget;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold text-white">Token Wallet</h1>
          <p className="text-blue-300 mt-1">Manage your UniBites balance</p>
        </div>

        {/* Low Balance Warning */}
        {lowBalance && !isLoading && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-amber-400 shrink-0" size={20} />
            <p className="text-amber-300 text-sm">
              Low balance! Your balance (₹{balance.toFixed(0)}) is below your daily budget (₹{dailyBudget}).
            </p>
          </div>
        )}

        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Available Balance</span>
            </div>
            <div className="text-5xl font-bold text-white mb-1">
              {isLoading ? (
                <div className="h-12 w-40 bg-white/20 rounded-xl animate-pulse" />
              ) : (
                `₹${balance.toFixed(2)}`
              )}
            </div>
            <p className="text-blue-300 text-sm mb-6">UniBites Tokens</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopUp(true)}
                className="flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                <ArrowUpCircle size={18} />
                Top Up
              </button>
              <button
                onClick={refreshBalance}
                className="flex items-center gap-2 bg-white/20 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/30 transition-all"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
            <TrendingUp size={20} className="text-green-400 mb-2" />
            <p className="text-white/60 text-xs">Daily Budget</p>
            <p className="text-white text-xl font-bold">₹{dailyBudget}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
            <Wallet size={20} className="text-purple-400 mb-2" />
            <p className="text-white/60 text-xs">Total Transactions</p>
            <p className="text-white text-xl font-bold">{transactions.length}</p>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionList transactions={transactions} isLoading={isLoading} />
      </div>

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onTopUp={async (amount) => { await topUp(amount); setShowTopUp(false); }}
        />
      )}
    </div>
  );
}
