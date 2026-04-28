"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, X, Plus, Minus, ShoppingBag } from "lucide-react";

export interface Dish {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  tags: string[];
}

interface DishCardProps {
  dish: Dish;
  onView: (dish: Dish) => void;
}

export function DishCard({ dish, onView }: DishCardProps) {
  return (
    <div className="fd-dish-card" onClick={() => onView(dish)}>
      <div className="fd-dish-card-img">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <span className="fd-dish-category-badge">{dish.category}</span>
      </div>
      <div className="fd-dish-card-body">
        <h3 className="fd-dish-name">{dish.name}</h3>
        <div className="fd-dish-rating">
          <Star size={12} fill="#E8590C" color="#E8590C" />
          <span>{dish.rating.toFixed(1)}</span>
        </div>
        <p className="fd-dish-desc">{dish.description}</p>
        <div className="fd-dish-footer">
          <span className="fd-dish-price">₹{dish.price}</span>
          <button
            className="fd-dish-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onView(dish);
            }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

interface DishModalProps {
  dish: Dish | null;
  onClose: () => void;
}

export function DishModal({ dish, onClose }: DishModalProps) {
  const [qty, setQty] = useState(1);

  if (!dish) return null;

  return (
    <div
      className="fd-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
        <button className="fd-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="fd-modal-img">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="600px"
          />
        </div>

        <div className="fd-modal-body">
          <div className="fd-modal-tags">
            {dish.tags.map((t) => (
              <span key={t} className="fd-modal-tag">
                {t}
              </span>
            ))}
          </div>
          <h2 className="fd-modal-dish-name">{dish.name}</h2>
          <div className="fd-modal-rating">
            <Star size={15} fill="#E8590C" color="#E8590C" />
            <span>{dish.rating.toFixed(1)}</span>
            <span className="fd-modal-rating-count">(142 ratings)</span>
          </div>
          <p className="fd-modal-desc">{dish.description}</p>

          <div className="fd-modal-footer">
            <div>
              <span className="fd-modal-price">₹{dish.price * qty}</span>
              <span className="fd-modal-per">
                {" "}
                per {qty > 1 ? `${qty} plates` : "plate"}
              </span>
            </div>
            <div className="fd-modal-qty">
              <button
                className="fd-qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="fd-qty-num">{qty}</span>
              <button
                className="fd-qty-btn"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button className="fd-modal-add-btn">
            <ShoppingBag size={18} />
            Add to Cart — ₹{dish.price * qty}
          </button>
        </div>
      </div>
    </div>
  );
}
