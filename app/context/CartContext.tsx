"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartMenuItem {
  id: string;
  name: string;
  price: number;
  canteenId: string;
  canteenName?: string;
  imageUrl?: string | null;
  isVeg: boolean;
  preparationTime: number;
}

export interface CartItem {
  menuItem: CartMenuItem;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  canteenId: string | null;
  addToCart: (menuItem: CartMenuItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  canteenId: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
  getTotalAmount: () => 0,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [canteenId, setCanteenId] = useState<string | null>(null);

  // Persist cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("unibites_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCartItems(parsed.cartItems || []);
        setCanteenId(parsed.canteenId || null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("unibites_cart", JSON.stringify({ cartItems, canteenId }));
  }, [cartItems, canteenId]);

  const addToCart = (menuItem: CartMenuItem) => {
    // If adding from a different canteen, clear the cart
    if (canteenId && canteenId !== menuItem.canteenId) {
      setCartItems([{ menuItem, quantity: 1 }]);
      setCanteenId(menuItem.canteenId);
      return;
    }
    setCanteenId(menuItem.canteenId);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.menuItem.id !== menuItemId);
      if (updated.length === 0) setCanteenId(null);
      return updated;
    });
  };

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) { removeFromCart(menuItemId); return; }
    setCartItems((prev) =>
      prev.map((i) => i.menuItem.id === menuItemId ? { ...i, quantity: newQuantity } : i)
    );
  };

  const clearCart = () => { setCartItems([]); setCanteenId(null); };
  const getTotalItems = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const getTotalAmount = () => cartItems.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, canteenId, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalAmount }}>
      {children}
    </CartContext.Provider>
  );
}
