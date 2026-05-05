"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "./CartContext";
import CartBar from "./CartBar";

export default function CartShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === "/checkout";

  return (
    <CartProvider>
      {children}
      {!isCheckoutPage && <CartBar />}
    </CartProvider>
  );
}
