"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { WalletProvider } from "./context/WalletContext";
import { CartProvider } from "./context/CartContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <MenuProvider>
          <WalletProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </WalletProvider>
        </MenuProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
