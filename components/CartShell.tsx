"use client";

import { CartProvider } from "./CartContext";
import CartBar from "./CartBar";

export default function CartShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartBar />
    </CartProvider>
  );
}
