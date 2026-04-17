"use client";

import { Transaction } from "@/app/context/WalletContext";
import { ArrowDownCircle, ArrowUpCircle, ShoppingBag } from "lucide-react";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function TxIcon({ type }: { type: string }) {
  if (type === "DEPOSIT" || type === "REFUND")
    return <ArrowDownCircle size={20} className="text-green-400" />;
  if (type === "PAYMENT")
    return <ShoppingBag size={20} className="text-red-400" />;
  return <ArrowUpCircle size={20} className="text-blue-400" />;
}

interface Props { transactions: Transaction[]; isLoading: boolean; }

export default function TransactionList({ transactions, isLoading }: Props) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-6">
      <h3 className="text-white font-bold text-lg mb-4">Transaction History</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10">
          <ShoppingBag size={40} className="text-white/30 mx-auto mb-3" />
          <p className="text-white/50">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isCredit = tx.type === "DEPOSIT" || tx.type === "REFUND";
            return (
              <div key={tx.id} className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <TxIcon type={tx.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{tx.description || tx.type}</p>
                  <p className="text-white/50 text-xs">{formatDate(tx.timestamp)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${isCredit ? "text-green-400" : "text-red-400"}`}>
                    {isCredit ? "+" : "-"}₹{Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-white/40 text-xs">₹{tx.balanceAfter.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
