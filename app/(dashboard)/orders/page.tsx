"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserOrders } from "@/lib/order.action";
import { createClient } from "@/lib/supabase/client";
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
  Truck,
  ChefHat,
  X,
  ZoomIn,
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
  delivery_partner?: {
    full_name: string;
    phone: string;
  } | null;
}

const statusConfig = {
  pending: {
    label: "Order Placed",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
    borderColor: "border-yellow-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600 bg-blue-50",
    borderColor: "border-blue-500",
  },
  packed: {
    label: "Packed",
    icon: Package,
    color: "text-purple-600 bg-purple-50",
    borderColor: "border-purple-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-indigo-600 bg-indigo-50",
    borderColor: "border-indigo-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
    borderColor: "border-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
    borderColor: "border-red-500",
  },
};

// Status flow order for timeline
const statusFlow = ["pending", "confirmed", "packed", "out_for_delivery", "delivered"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadOrders();

    // Supabase realtime subscription
    const clientSupabase = createClient();
    const channel = clientSupabase
      .channel("live-orders-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // Trigger a silent database fetch update to maintain clean joined parameters
          getUserOrders().then((result) => {
            if (result.data) {
              setOrders(result.data as Order[]);
            }
          });
        }
      )
      .subscribe();

    return () => {
      clientSupabase.removeChannel(channel);
    };
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

  const getStatusIndex = (status: string) => {
    return statusFlow.indexOf(status);
  };

  const renderStatusTimeline = (currentStatus: string) => {
    if (currentStatus === "cancelled") {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Order Cancelled</span>
          </div>
        </div>
      );
    }

    const currentIndex = getStatusIndex(currentStatus);

    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          Order Status Timeline
        </h4>
        <div className="space-y-4">
          {statusFlow.map((status, index) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? config.color
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-orange-200" : ""}`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        isCompleted ? "bg-orange-400" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p
                    className={`font-semibold ${
                      isCompleted ? "text-gray-900" : "text-gray-400"
                    } ${isCurrent ? "text-orange-600" : ""}`}
                  >
                    {config.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-orange-600 mt-1">
                      Current Status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
                              className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              {item.dishes.image_url && (
                                <div 
                                  className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                                  onClick={() => setSelectedImage(item.dishes.image_url || null)}
                                >
                                  <Image
                                    src={item.dishes.image_url}
                                    alt={item.dishes.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="w-6 h-6 text-white" />
                                  </div>
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

                        {/* Status Timeline */}
                        <div className="mt-6">
                          {renderStatusTimeline(order.status)}
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

                        {/* Delivery Rider Details */}
                        {order.delivery_partner && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold mb-2">
                              <Truck className="w-4 h-4 animate-bounce" />
                              Delivery Agent Assigned
                            </div>
                            <p className="font-bold text-gray-900 text-sm">
                              {order.delivery_partner.full_name}
                            </p>
                            {order.delivery_partner.phone && (
                              <a
                                href={`tel:${order.delivery_partner.phone}`}
                                className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                📞 Call Rider ({order.delivery_partner.phone})
                              </a>
                            )}
                          </div>
                        )}

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

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Dish"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
