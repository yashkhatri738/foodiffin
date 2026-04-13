'use client';

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

interface Dish {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

const dishes: Dish[] = [
  {
    id: 1,
    name: "Steak vasitable",
    category: "Salad",
    price: 20,
    image: "/hero2.jpg",
  },
  {
    id: 2,
    name: "Steak vasitable",
    category: "Salad",
    price: 23,
    image: "/hero3.jpg",
  },
  {
    id: 3,
    name: "Steak vasitable",
    category: "Salad",
    price: 27,
    image: "/hero4.jpg",
  },
  {
    id: 4,
    name: "Steak vasitable",
    category: "Salad",
    price: 29,
    image: "/Hero1.jpg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              <span className="text-orange-600">Foo</span>
              <span className="text-gray-800">die</span>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="text-orange-600 font-bold hover:text-orange-700"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  about
                </Link>
                <Link
                  href="/delivery"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  delivery
                </Link>
                <Link
                  href="/recipes"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  recipes
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  contact
                </Link>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button className="text-gray-700 hover:text-orange-600">
                <ShoppingCart size={24} />
              </button>
              <button className="text-gray-700 hover:text-orange-600">
                <User size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                From Kitchen to<br />Your Door
              </h1>

              <p className="text-gray-600 text-lg mb-8 max-w-md">
                Welcome to [Your Food Delivery Website], where culinary delights
                meet doorstep convenience. Indulge in a seamless dining
              </p>

              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full w-fit transition transform hover:scale-105">
                GET TESTY MEALS
              </button>
            </div>

            {/* Right Image */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gray-800 rounded-full opacity-50" />
              <div className="relative w-80 h-80 rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-gray-700">
                <Image
                  src="/Hero1.jpg"
                  alt="Featured Dish"
                  width={350}
                  height={350}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* Foodie Text */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-4xl font-black opacity-20 -rotate-90">
                Foodie
              </div>
            </div>
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer"
            >
              {/* Dish Image */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 shadow-md">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Dish Info */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-gray-900 mb-1">{dish.name}</h3>
                <p className="text-gray-500 text-sm">{dish.category}</p>
              </div>

              {/* Price & Button */}
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-bold text-lg">
                  ${dish.price}
                </span>
                <button className="text-orange-600 hover:bg-orange-50 p-2 rounded-full transition">
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
