"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/Hero.jpg",
    tag: "Starting from ₹99",
    heading: "Fresh Meals Delivered Daily 🍱",
    sub: "Wholesome home-style food, crafted with care and delivered to your door every day.",
  },
  {
    image: "/hero2.jpg",
    tag: "Breakfast Special",
    heading: "Start Your Morning Right ☀️",
    sub: "Nutritious breakfast boxes prepared fresh every morning — never miss the most important meal.",
  },
  {
    image: "/hero3.jpg",
    tag: "Lunch Combo",
    heading: "Power Through Lunch Break 💪",
    sub: "Balanced meals with protein, fibre, and freshness that keep you going all afternoon.",
  },
  {
    image: "/hero4.jpg",
    tag: "Dinner Delight",
    heading: "Relax, Dinner Is Sorted 🌙",
    sub: "Wind down with a warm, satisfying dinner delivered right at your doorstep.",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((index + slides.length) % slides.length);
      setAnimating(false);
    }, 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo(current + 1);
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const slide = slides[current];

  return (
    <section className="fd-hero">
      {/* Background image */}
      <div
        className={`fd-hero-bg ${animating ? "fd-hero-bg-out" : "fd-hero-bg-in"}`}
      >
        <Image
          src={slide.image}
          alt={slide.heading}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="fd-hero-overlay" />
      </div>

      {/* Content */}
      <div
        className={`fd-hero-content ${animating ? "fd-hero-content-out" : "fd-hero-content-in"}`}
      >
        <span className="fd-hero-tag">{slide.tag}</span>
        <h1 className="fd-hero-heading">{slide.heading}</h1>
        <p className="fd-hero-sub">{slide.sub}</p>
        <div className="fd-hero-greet">
          Hello, Yash 👋 — your meal is ready!
        </div>
        <a href="#dishes" className="fd-hero-cta">
          Explore Menu
        </a>
      </div>

      {/* Arrows */}
      <button
        className="fd-hero-arrow fd-hero-arrow-left"
        onClick={() => goTo(current - 1)}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className="fd-hero-arrow fd-hero-arrow-right"
        onClick={() => goTo(current + 1)}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="fd-hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`fd-hero-dot ${i === current ? "fd-hero-dot-active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
