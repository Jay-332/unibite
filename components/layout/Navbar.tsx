"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useWallet } from "@/app/context/WalletContext";
import { ShoppingCart, LayoutDashboard, Utensils, Package, Wallet, LogOut, Menu, X, ChevronDown, Settings } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/canteens", label: "Canteens", icon: Utensils },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const { balance } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo-bowl.jpg"
              alt="UniBites logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            <span className="font-bold text-green-700 text-lg hidden sm:block">UniBites</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${active ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100"}`}>
                  <Icon size={16} />{label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Wallet Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Wallet size={14} />₹{balance.toFixed(0)}
            </div>

            {/* Cart */}
            <Link href="/checkout" className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <ShoppingCart size={22} className="text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 transition">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                  {(user as any)?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">{(user as any)?.name || "User"}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{(user as any)?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{(user as any)?.email}</p>
                  </div>
                  {(user as any)?.role === "CANTEEN_ADMIN" && (
                    <Link href="/admin/dashboard" className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-b border-gray-100">
                      <Settings size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname.startsWith(href) ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}>
                <Icon size={18} />{label}
              </Link>
            ))}
            {(user as any)?.role === "CANTEEN_ADMIN" && (
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                <Settings size={18} /> Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
