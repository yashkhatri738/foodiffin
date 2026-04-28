import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Foodiffin — Fresh Meals Delivered Daily",
  description:
    "Order fresh, home-style meals delivered to your doorstep. Tiffin subscriptions starting ₹99. Breakfast, lunch & dinner — made with love.",
  keywords: [
    "food delivery",
    "tiffin service",
    "meal subscription",
    "fresh food",
    "foodiffin",
  ],
  openGraph: {
    title: "Foodiffin — Fresh Meals Delivered Daily",
    description:
      "Home-style tiffin meals delivered fresh every day. Starting at ₹99.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
