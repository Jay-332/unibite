"use client";

import { useState } from "react";
import { Plus, Minus, Clock } from "lucide-react";
import VegIndicator from "./VegIndicator";
import { useCart, CartMenuItem } from "@/app/context/CartContext";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  preparationTime: number;
  isAvailable: boolean;
  tags: string[];
  canteenId: string;
  imageUrl: string | null;
}

export default function MenuItemCard({ item, canteenName }: { item: MenuItem; canteenName: string }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cartItems.find((ci) => ci.menuItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const cartMenuItem: CartMenuItem = {
    id: item.id,
    name: item.name,
    price: item.price,
    canteenId: item.canteenId,
    canteenName,
    imageUrl: item.imageUrl,
    isVeg: item.isVeg,
    preparationTime: item.preparationTime,
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all ${!item.isAvailable ? "opacity-60" : "hover:shadow-md"}`}>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <VegIndicator isVeg={item.isVeg} />
                <h3 className="font-semibold text-gray-800 text-sm leading-snug">{item.name}</h3>
              </div>
              {item.tags.includes("popular") && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⭐ Popular</span>
              )}
            </div>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-base font-bold text-gray-900">₹{item.price}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock size={10} /> {item.preparationTime} min
              </p>
            </div>
            {item.isAvailable ? (
              quantity === 0 ? (
                <button
                  onClick={() => addToCart(cartMenuItem)}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  <Plus size={14} /> Add
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, quantity - 1)}
                    className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition font-bold">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold text-gray-800 w-5 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition font-bold">
                    <Plus size={14} />
                  </button>
                </div>
              )
            ) : (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
