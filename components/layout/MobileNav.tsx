"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Utensils, Package, Wallet, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/canteens", label: "Canteens", icon: Utensils },
  { href: "/checkout", label: "Cart", icon: ShoppingCart },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
      <div className="flex">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const isCart = href === "/checkout";
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 relative min-h-[56px] transition ${active ? "text-orange-500" : "text-gray-400"}`}>
              <div className="relative">
                <Icon size={22} />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
