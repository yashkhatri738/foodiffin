"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Truck,
  Store,
  RefreshCw,
  ZoomIn,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getAllOrdersForAdmin, updateOrderStatus as updateStatus } from "@/lib/admin.order.action";

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
  profiles?: {
    full_name: string;
    phone: string;
  };
}

const statusConfig = {
  pending: {
    label: "Order Placed",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
    badgeColor: "bg-yellow-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600 bg-blue-50",
    badgeColor: "bg-blue-500",
  },
  packed: {
    label: "Packed",
    icon: Package,
    color: "text-purple-600 bg-purple-50",
    badgeColor: "bg-purple-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-indigo-600 bg-indigo-50",
    badgeColor: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
    badgeColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
    badgeColor: "bg-red-500",
  },
};

const statusOptions = [
  { value: "pending", label: "Order Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const result = await getAllOrdersForAdmin();
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setOrders(result.data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    const result = await updateStatus(orderId, newStatus);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Order status updated successfully");
      loadOrders();
    }
    setUpdatingOrder(null);
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

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-10 h-10 text-orange-500" />
                All Orders
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track all customer orders
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Orders ({orders.length})
            </button>
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = orders.filter(o => o.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === key
                      ? `${config.color} border-2 ${config.color.replace('text-', 'border-').replace('bg-', 'border-')}`
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Orders Found
            </h2>
            <p className="text-gray-600">
              {filterStatus === "all" 
                ? "No orders have been placed yet"
                : `No orders with status "${statusConfig[filterStatus as keyof typeof statusConfig]?.label}"`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
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
                        <div className="text-white text-right">
                          <p className="text-2xl font-bold">
                            ₹{order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-white/80 capitalize">
                            {order.payment_method} - {order.payment_status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                                  className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                                  onClick={() => setSelectedImage(item.dishes.image_url || null)}
                                >
                                  <Image
                                    src={item.dishes.image_url}
                                    alt={item.dishes.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {item.dishes.name}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  Qty: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600 text-sm">
                                  ₹{(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer & Address */}
                      <div className="space-y-4">
                        {/* Customer Info */}
                        {order.profiles && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <User className="w-4 h-4" />
                              Customer
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {order.profiles.full_name}
                            </p>
                            {order.profiles.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {order.profiles.phone}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Delivery Address */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            Delivery Address
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {order.address.full_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {order.address.address_line1}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.address.city}, {order.address.state} -{" "}
                            {order.address.postal_code}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            📞 {order.address.phone}
                          </p>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div className="space-y-4">
                        <div className="bg-orange-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Package className="w-4 h-4" />
                            Update Status
                          </div>
                          
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.color} font-semibold text-sm mb-3`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </div>

                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingOrder === order.id || order.status === "delivered" || order.status === "cancelled"}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {updatingOrder === order.id && (
                            <div className="flex items-center gap-2 text-orange-600 text-xs mt-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Updating...
                            </div>
                          )}
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
