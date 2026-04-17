"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  orderId: string | null;
  timestamp: string;
  balanceAfter: number;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  topUp: (amount: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  transactions: [],
  isLoading: false,
  topUp: async () => {},
  refreshBalance: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  }, [status]);

  const fetchTransactions = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/wallet/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(true);
      Promise.all([refreshBalance(), fetchTransactions()]).finally(() =>
        setIsLoading(false)
      );
    }
  }, [status, refreshBalance, fetchTransactions]);

  const topUp = async (amount: number) => {
    const res = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("Top up failed");
    await Promise.all([refreshBalance(), fetchTransactions()]);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, isLoading, topUp, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}
