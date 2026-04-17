"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Utensils } from "lucide-react";

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

export default function CanteenCard({ canteen }: { canteen: Canteen }) {
  return (
    <Link href={`/canteens/${canteen.id}`}>
      <div className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
        {/* Image / header */}
        <div className="h-36 bg-gradient-to-br from-orange-400 to-rose-500 relative flex items-end p-5">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
          <div className="relative">
            <h2 className="text-xl font-bold text-white drop-shadow">{canteen.name}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {canteen.location}
            </p>
          </div>
          {/* Open/Closed badge */}
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${canteen.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {canteen.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={15} fill="currentColor" />
              <span className="text-sm font-semibold text-gray-700">{canteen.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Utensils size={14} />
              <span>{canteen._count.menuItems} items</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Clock size={14} />
            <span>{canteen.openTime} – {canteen.closeTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
