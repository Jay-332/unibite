"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryFilter from "@/components/canteen/CategoryFilter";
import MenuItemCard from "@/components/canteen/MenuItemCard";
import { useCart } from "@/app/context/CartContext";
import { Star, MapPin, ShoppingBag, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

function isCurrentlyOpen(openTime: string, closeTime: string) {
  const now = new Date();
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= oh * 60 + om && nowMins <= ch * 60 + cm;
}

export default function CanteenMenuPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [canteen, setCanteen] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalItems, getTotalAmount } = useCart();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/canteens/${id}`).then((r) => r.json()),
      fetch(`/api/menu/${id}`).then((r) => r.json()),
    ])
      .then(([cd, md]) => { setCanteen(cd.canteen); setMenuItems(md.menuItems || []); })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    fetch(`/api/menu/${id}?category=${category}&search=${search}`)
      .then((r) => r.json())
      .then((d) => setMenuItems(d.menuItems || []));
  }, [category, search, id]);

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isOpen = canteen ? isCurrentlyOpen(canteen.openTime, canteen.closeTime) : false;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-600 text-white p-6 pt-10 relative">
        <Link href="/canteens" className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
          <ArrowLeft size={16} /> All Canteens
        </Link>
        <h1 className="text-2xl font-bold">{canteen?.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
          <span className="flex items-center gap-1"><MapPin size={13} /> {canteen?.location}</span>
          <span className="flex items-center gap-1"><Star size={13} fill="currentColor" /> {canteen?.rating?.toFixed(1)}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isOpen ? "bg-green-500" : "bg-red-500"}`}>
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:border-orange-400 outline-none text-sm"
          />
        </div>

        {/* Category Filter */}
        <CategoryFilter active={category} onChange={setCategory} />

        {/* Menu Grid */}
        {menuItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3" />
            <p>No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} canteenName={canteen?.name || ""} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-between px-6 transition"
            >
              <span className="bg-orange-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{totalItems}</span>
              <span>View Cart</span>
              <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
