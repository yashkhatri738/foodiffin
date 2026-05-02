"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";

export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE"; dishId: string }
  | { type: "INCREMENT"; dishId: string }
  | { type: "DECREMENT"; dishId: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };

    case "ADD": {
      const exists = state.items.find((i) => i.dishId === action.item.dishId);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.dishId === action.item.dishId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }

    case "INCREMENT":
      return {
        items: state.items.map((i) =>
          i.dishId === action.dishId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };

    case "DECREMENT": {
      const item = state.items.find((i) => i.dishId === action.dishId);
      if (!item) return state;
      if (item.quantity <= 1) {
        return {
          items: state.items.filter((i) => i.dishId !== action.dishId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.dishId === action.dishId ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      };
    }

    case "REMOVE":
      return { items: state.items.filter((i) => i.dishId !== action.dishId) };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (dishId: string) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  clear: () => void;
  getQuantity: (dishId: string) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("foodiffin_cart");
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // Silently ignore parse errors
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("foodiffin_cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: Omit<CartItem, "quantity">) =>
    dispatch({ type: "ADD", item });
  const removeItem = (dishId: string) => dispatch({ type: "REMOVE", dishId });
  const increment = (dishId: string) => dispatch({ type: "INCREMENT", dishId });
  const decrement = (dishId: string) => dispatch({ type: "DECREMENT", dishId });
  const clear = () => dispatch({ type: "CLEAR" });
  const getQuantity = (dishId: string) =>
    state.items.find((i) => i.dishId === dishId)?.quantity ?? 0;
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        increment,
        decrement,
        clear,
        getQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
