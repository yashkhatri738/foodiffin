"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserOrders } from "@/lib/order.action";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Wallet,
  Clock,
  ShoppingBag,
  Store,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface DishData {
  name: string;
  image_url?: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  dishes: DishData;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  address: {
    full_name: string;
    phone: string;
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  order_items: OrderItem[];
  restaurants?: {
    name: string;
    id: string;
  };
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600 bg-blue-50",
  },
  preparing: {
    label: "Preparing",
    icon: Package,
    color: "text-orange-600 bg-orange-50",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const result = await getUserOrders();

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setOrders(result.data as Order[]);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-10 h-10 text-orange-500" />
                My Orders
              </h1>
              <p className="text-gray-600 mt-2">
                Track and view all your food orders
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start ordering delicious food from your favorite restaurants!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status =
                statusConfig[order.status as keyof typeof statusConfig] ||
                statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </div>
                        <p className="text-white text-xs">
                          Order ID: {order.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${status.color} font-semibold`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          {status.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Items */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-500" />
                            Order Items
                          </h3>
                          {order.restaurants && (
                            <div className="flex items-center gap-2 text-sm">
                              <Store className="w-4 h-4 text-orange-500" />
                              <span className="font-semibold text-gray-700">
                                {order.restaurants.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                            >
                              {item.dishes.image_url && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.dishes.image_url}
                                    alt={item.dishes.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {item.dishes.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Quantity: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">
                                  ₹{(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-4">
                        {/* Total Amount */}
                        <div className="bg-orange-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Total Amount
                          </p>
                          <p className="text-3xl font-bold text-orange-600">
                            ₹{order.total_amount.toFixed(2)}
                          </p>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            {order.payment_method === "cash" ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                            Payment Method
                          </div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {order.payment_method === "cash"
                              ? "Cash on Delivery"
                              : "Online Payment"}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              order.payment_status === "paid"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {order.payment_status === "paid"
                              ? "Paid"
                              : "Pending"}
                          </p>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            Delivery Address
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {order.address.full_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.address.address_line1}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.address.city}, {order.address.state} -{" "}
                            {order.address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📞 {order.address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
