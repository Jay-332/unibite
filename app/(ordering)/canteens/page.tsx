"use client";

import { useState, useEffect } from "react";
import CanteenCard from "@/components/canteen/CanteenCard";
import { MapPin, Search } from "lucide-react";

interface Canteen {
  id: string;
  name: string;
  location: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  imageUrl: string | null;
  rating: number;
  _count: { menuItems: number };
}

function isCurrentlyOpen(openTime: string, closeTime: string): boolean {
  const now = new Date();
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= oh * 60 + om && nowMins <= ch * 60 + cm;
}

export default function CanteensPage() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/canteens")
      .then((r) => r.json())
      .then((d) => setCanteens(d.canteens || []))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = canteens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Canteens</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={14} /> Browse campus canteens and order food
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search canteens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-52 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No canteens found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((canteen) => (
              <CanteenCard
                key={canteen.id}
                canteen={{ ...canteen, isOpen: isCurrentlyOpen(canteen.openTime, canteen.closeTime) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
