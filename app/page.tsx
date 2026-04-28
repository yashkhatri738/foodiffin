"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import { DishCard, DishModal, type Dish } from "@/components/DishComponents";

// ─── Data ────────────────────────────────────────────────────────────────────

const DISHES: Dish[] = [
  {
    id: 1,
    name: "Paneer Butter Masala Thali",
    category: "Lunch",
    price: 149,
    image: "/hero2.jpg",
    rating: 4.7,
    description: "Creamy paneer cubes in rich tomato-butter gravy served with 3 rotis, steamed rice, dal, and salad.",
    tags: ["Vegetarian", "Chef's Pick"],
  },
  {
    id: 2,
    name: "Masala Oats Bowl",
    category: "Breakfast",
    price: 89,
    image: "/hero3.jpg",
    rating: 4.3,
    description: "Savory oats cooked with seasonal vegetables, peanuts, and aromatic spices — light yet filling.",
    tags: ["Healthy", "Vegetarian"],
  },
  {
    id: 3,
    name: "Dal Tadka & Rice",
    category: "Lunch",
    price: 99,
    image: "/hero4.jpg",
    rating: 4.5,
    description: "Classic yellow dal tempered with cumin, garlic, and dried chili, served with steamed basmati rice.",
    tags: ["Comfort Food", "Vegetarian"],
  },
  {
    id: 4,
    name: "Grilled Veggie Bowl",
    category: "Dinner",
    price: 159,
    image: "/Hero1.jpg",
    rating: 4.6,
    description: "Seasonal grilled vegetables with quinoa, hummus, and tahini drizzle. Clean, balanced, delicious.",
    tags: ["Healthy", "Vegan"],
  },
  {
    id: 5,
    name: "Chole Bhature",
    category: "Breakfast",
    price: 109,
    image: "/Hero.jpg",
    rating: 4.8,
    description: "Fluffy deep-fried bhaturas paired with spicy Punjabi chole, sliced onions and tangy pickle.",
    tags: ["Popular", "Indulgent"],
  },
  {
    id: 6,
    name: "Veg Fried Rice & Manchurian",
    category: "Dinner",
    price: 139,
    image: "/hero2.jpg",
    rating: 4.4,
    description: "Indo-Chinese fusion: fragrant fried rice with crispy vegetable manchurian balls in a savory sauce.",
    tags: ["Indo-Chinese", "Vegetarian"],
  },
  {
    id: 7,
    name: "Poha & Chai Combo",
    category: "Breakfast",
    price: 79,
    image: "/hero3.jpg",
    rating: 4.2,
    description: "Classic Maharashtra-style poha with mustard seeds, turmeric, and onions, paired with masala chai.",
    tags: ["Light", "Traditional"],
  },
  {
    id: 8,
    name: "Rajma Chawal",
    category: "Lunch",
    price: 119,
    image: "/hero4.jpg",
    rating: 4.9,
    description: "Slow-cooked kidney beans in thick, aromatic gravy over fluffy basmati rice. Pure soul food.",
    tags: ["Best Seller", "Vegetarian"],
  },
];

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner"];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const filtered = useMemo(() => {
    return DISHES.filter((d) => {
      const matchCat = activeCategory === "All" || d.category === activeCategory;
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="fd-root">
      {/* ── Navbar ── */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* ── Hero ── */}
      <HeroCarousel />

      {/* ── Category Tabs ── */}
      <section className="fd-categories">
        <div className="fd-categories-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase()}`}
              className={`fd-cat-tab ${activeCategory === cat ? "fd-cat-tab-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "All" && "🍽️ "}
              {cat === "Breakfast" && "☀️ "}
              {cat === "Lunch" && "🌤️ "}
              {cat === "Dinner" && "🌙 "}
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Dishes Grid ── */}
      <section className="fd-dishes-section" id="dishes">
        <div className="fd-dishes-inner">
          <div className="fd-dishes-header">
            <h2 className="fd-dishes-title">
              {activeCategory === "All" ? "All Dishes" : `${activeCategory} Menu`}
            </h2>
            <span className="fd-dishes-count">{filtered.length} items</span>
          </div>

          {filtered.length === 0 ? (
            <div className="fd-empty">
              <span className="fd-empty-icon">🍽️</span>
              <p>No dishes found for &quot;{searchQuery}&quot;</p>
              <button className="fd-empty-reset" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="fd-dish-grid">
              {filtered.map((dish) => (
                <DishCard key={dish.id} dish={dish} onView={setSelectedDish} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="fd-about" id="about">
        <div className="fd-about-inner">
          <div className="fd-about-badge">Why Foodiffin?</div>
          <h2 className="fd-about-title">Freshness Delivered to Your Door, Daily</h2>
          <p className="fd-about-sub">
            We partner with home chefs and cloud kitchens to bring you restaurant-quality meals at tiffin prices.
            Every dish is made fresh, packed hygienically, and delivered hot.
          </p>
          <div className="fd-about-cards">
            {[
              { icon: "🍳", title: "Freshly Cooked", desc: "Prepared daily in hygienic kitchens — no reheated meals." },
              { icon: "⚡", title: "Fast Delivery", desc: "Hot meal at your door in under 45 minutes, guaranteed." },
              { icon: "💰", title: "Affordable Plans", desc: "Subscription plans starting ₹99. Save up to 40% weekly." },
              { icon: "🌿", title: "Balanced Nutrition", desc: "Dietitian-approved meals with the right macros for your lifestyle." },
            ].map((card) => (
              <div key={card.title} className="fd-about-card">
                <div className="fd-about-card-icon">{card.icon}</div>
                <h3 className="fd-about-card-title">{card.title}</h3>
                <p className="fd-about-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="fd-footer">
        <div className="fd-footer-inner">
          <div className="fd-footer-logo">
            <span className="fd-logo-food">Food</span><span className="fd-logo-iffin">iffin</span>
          </div>
          <p className="fd-footer-tagline">Fresh meals, happy bellies. © {new Date().getFullYear()} Foodiffin</p>
          <div className="fd-footer-links">
            <a href="#" className="fd-footer-link">Privacy</a>
            <a href="#" className="fd-footer-link">Terms</a>
            <a href="#" className="fd-footer-link">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── Dish Modal ── */}
      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
}