"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/vendor/dashboard', icon: '📈' },
        { name: 'Menu Editor', href: '/vendor/menu', icon: '📝' },
        { name: 'Reviews', href: '/vendor/reviews', icon: '⭐' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 -ml-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden focus:outline-none"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <div className="flex items-center gap-2">
                                <Image src="/logo-bowl.jpg" alt="UniBites" width={32} height={32} className="rounded-lg object-contain" />
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold text-blue-700 leading-none">UniBites</h1>
                                    <p className="text-[10px] text-gray-500 font-medium">Vendor Portal</p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile / Actions */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-gray-700">{user?.name || 'Vendor'}</span>
                                <span className="text-xs text-gray-500">{user?.email}</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                {user?.name?.[0] || 'V'}
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/login?role=vendor');
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu (Collapsible) */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                {children}
            </main>
        </div>
    );
}
