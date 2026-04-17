"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User as LegacyUser } from '@/lib/data';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegisterData = {
    name: string;
    email: string;
    password?: string;
    role: string;
    canteenId?: string;
};

export interface AuthContextType {
    user: LegacyUser | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: RegisterData) => Promise<void>;
    updateUser: (updates: Partial<LegacyUser>) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [userOverrides, setUserOverrides] = useState<Partial<LegacyUser>>({});

    // Build a LegacyUser shape from the NextAuth session so all old components
    // that do `user.name`, `user.email`, `user.role`, `user.budget.*` still work.
    const sessionUser = session?.user as any;

    const user: LegacyUser | null = sessionUser
        ? {
              id: sessionUser.id ?? sessionUser.email,
              name: sessionUser.name ?? '',
              email: sessionUser.email ?? '',
              role: (sessionUser.role as any) ?? 'student',
              canteenId: sessionUser.canteenId,
              isOnboardingComplete: true,
              budget: {
                  dailyLimit: sessionUser.dailyBudget ?? 150,
                  monthlyLimit: 5000,
                  savingGoal: sessionUser.savingsGoal ?? 2000,
                  spentToday: 0,
                  spentMonth: 0,
              },
              preferences: [],
              ...userOverrides,
          }
        : null;

    // ── login ────────────────────────────────────────────────────────────────
    // We call signIn from NextAuth on the (auth)/login page directly.
    // This stub is kept for backward compat with the old /app/login/page.tsx
    // which calls `login(email, password)`. Import signIn there instead.
    const login = async (_email: string, _password: string): Promise<boolean> => {
        // The old login page calls this — redirect to NextAuth signIn in place
        const { signIn } = await import('next-auth/react');
        const res = await signIn('credentials', { email: _email, password: _password, redirect: false });
        return !res?.error;
    };

    // ── register ─────────────────────────────────────────────────────────────
    const register = async (data: RegisterData) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password,
                phoneNumber: undefined,
            }),
        });
        if (!res.ok) throw new Error(await res.text());
        // Auto sign-in after registration
        const { signIn } = await import('next-auth/react');
        await signIn('credentials', { email: data.email, password: data.password, redirect: false });
    };

    // ── updateUser ───────────────────────────────────────────────────────────
    // For local optimistic overrides (budget redistribution, etc.)
    const updateUser = (updates: Partial<LegacyUser>) => {
        setUserOverrides((prev) => ({ ...prev, ...updates }));
    };

    // ── logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        setUserOverrides({});
        await signOut({ redirect: false });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                updateUser,
                logout,
                isLoading: status === 'loading',
                isAuthenticated: status === 'authenticated',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
