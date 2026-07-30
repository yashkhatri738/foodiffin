"use client";

import { useEffect, useState } from "react";
import {
  Package,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  Loader2,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAvailableDeliveryOrders,
  acceptDeliveryOrder,
  completeDeliveryOrder,
  getDeliveryPartnerActiveOrders,
  getDeliveryPartnerHistory,
  type DeliveryOrder,
} from "@/lib/delivery.action";

type TabType = "open" | "active" | "history";

export default function DeliveryOrdersPage() {
  const [tab, setTab] = useState<TabType>("open");
  const [openOrders, setOpenOrders] = useState<DeliveryOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<DeliveryOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    if (tab === "open") {
      const res = await getAvailableDeliveryOrders();
      if (res.success && res.data) setOpenOrders(res.data);
    } else if (tab === "active") {
      const res = await getDeliveryPartnerActiveOrders();
      if (res.success && res.data) setActiveOrders(res.data);
    } else if (tab === "history") {
      const res = await getDeliveryPartnerHistory();
      if (res.success && res.data) setHistoryOrders(res.data);
    }
    setLoading(false);
  };

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    const res = await acceptDeliveryOrder(orderId);
    if (res.success) {
      toast.success("Delivery accepted! Go pick up the food from the kitchen.");
      setTab("active");
    } else {
      toast.error(res.error || "Failed to accept order.");
    }
    setActionLoading(null);
  };

  const handleComplete = async (orderId: string) => {
    setActionLoading(orderId);
    const res = await completeDeliveryOrder(orderId);
    if (res.success) {
      toast.success("Order delivered successfully!");
      setTab("history");
    } else {
      toast.error(res.error || "Failed to complete delivery.");
    }
    setActionLoading(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="flex flex-col gap-5 min-w-0 flex-1">
      {/* Header */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            <Package size={14} />
            Fulfillment Queue
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Courier delivery tasks
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
            Accept open kitchen orders, track navigation paths, collect cash payments, and manage earnings payouts.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex h-10 w-10 place-items-center rounded-xl bg-white/80 text-stone-700 border border-stone-200 transition hover:bg-stone-100 hover:-translate-y-0.5 justify-center items-center"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-4">
        {[
          { id: "open", label: "Open Orders" },
          { id: "active", label: "Active Delivery" },
          { id: "history", label: "History Log" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as TabType)}
            className={`pb-3.5 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-[2px] ${
              tab === item.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-stone-500 hover:text-stone-850"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="animate-spin text-orange-600 mx-auto mb-2" size={32} />
          <p className="text-xs text-stone-500 font-bold">Querying delivery queue...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* OPEN ORDERS TAB */}
          {tab === "open" && (
            openOrders.length === 0 ? (
              <div className="portal-card rounded-[24px] bg-white border border-stone-200 p-12 text-center shadow-sm">
                <Package className="w-14 h-14 text-stone-300 mx-auto mb-4" />
                <h3 className="font-bold text-stone-850 text-lg mb-1">No pending orders</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  All local kitchen orders have been dispatched. Check back in a few minutes or click the refresh button!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {openOrders.map((order) => (
                  <article key={order.id} className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">#FD-{order.id.slice(0, 6).toUpperCase()}</h4>
                        <p className="text-[10px] text-stone-400 font-semibold">{formatTime(order.created_at)}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        ₹{order.delivery_cost_share || 30} payout
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-xs text-stone-600 border-t border-b border-stone-100 py-3">
                      <div>
                        <span className="font-bold text-stone-400 text-[10px] uppercase block mb-1">Pickup From</span>
                        <p className="font-bold text-stone-800">{order.restaurants?.name}</p>
                        <p className="text-[11px] text-stone-500">{order.restaurants?.address}</p>
                      </div>
                      <div className="pt-2">
                        <span className="font-bold text-stone-400 text-[10px] uppercase block mb-1">Delivery to</span>
                        <p className="font-bold text-stone-800">{order.address?.full_name}</p>
                        <p className="text-[11px] text-stone-500">{order.address?.address_line1}, {order.address?.city}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAccept(order.id)}
                      disabled={actionLoading !== null}
                      className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="animate-spin" size={13} />
                      ) : (
                        <Navigation size={13} />
                      )}
                      Accept Delivery task
                    </button>
                  </article>
                ))}
              </div>
            )
          )}

          {/* ACTIVE ORDER TAB */}
          {tab === "active" && (
            activeOrders.length === 0 ? (
              <div className="portal-card rounded-[24px] bg-white border border-stone-200 p-12 text-center shadow-sm">
                <Navigation className="w-14 h-14 text-stone-300 mx-auto mb-4" />
                <h3 className="font-bold text-stone-850 text-lg mb-1">No active delivery</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Go to the Open Orders tab and accept a food parcel delivery task to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-xl mx-auto">
                {activeOrders.map((order) => (
                  <article key={order.id} className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 ring-2 ring-orange-500/20">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-600 block">Active task</span>
                        <h3 className="font-bold text-stone-900 text-base">#FD-{order.id.slice(0, 6).toUpperCase()}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          COD: ₹{order.total_amount}
                        </span>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase font-bold">
                          {order.payment_method === "cash" ? "Collect cash" : "Paid online"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {/* Restaurant Contact */}
                      <div className="flex gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-100 text-orange-600 shrink-0">
                          <Package size={15} />
                        </span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">1. Pickup Address (Kitchen)</span>
                          <p className="font-bold text-stone-800 text-xs mt-0.5">{order.restaurants?.name}</p>
                          <p className="text-xs text-stone-500">{order.restaurants?.address}</p>
                          <a
                            href={`tel:${order.restaurants?.phone}`}
                            className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
                          >
                            <Phone size={11} /> Call Restaurant
                          </a>
                        </div>
                      </div>

                      {/* Customer Contact */}
                      <div className="flex gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-100 text-orange-600 shrink-0">
                          <MapPin size={15} />
                        </span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">2. Delivery Address (Customer)</span>
                          <p className="font-bold text-stone-800 text-xs mt-0.5">{order.address?.full_name}</p>
                          <p className="text-xs text-stone-500">{order.address?.address_line1}, {order.address?.city}</p>
                          <a
                            href={`tel:${order.address?.phone}`}
                            className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
                          >
                            <Phone size={11} /> Call Customer
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleComplete(order.id)}
                      disabled={actionLoading !== null}
                      className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="animate-spin" size={13} />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      Mark as Delivered & Settle Cash
                    </button>
                  </article>
                ))}
              </div>
            )
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            historyOrders.length === 0 ? (
              <div className="portal-card rounded-[24px] bg-white border border-stone-200 p-12 text-center shadow-sm">
                <CheckCircle className="w-14 h-14 text-stone-300 mx-auto mb-4" />
                <h3 className="font-bold text-stone-850 text-lg mb-1">No completed history</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  You haven't completed any delivery tasks yet. Complete your first task to see your record statistics!
                </p>
              </div>
            ) : (
              <div className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase">
                        <th className="py-2.5 px-2">Order ID</th>
                        <th className="py-2.5 px-2">Kitchen</th>
                        <th className="py-2.5 px-2">Customer</th>
                        <th className="py-2.5 px-2 text-right">Earning Payout</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                      {historyOrders.map((h) => (
                        <tr key={h.id}>
                          <td className="py-3 px-2 font-bold">#FD-{h.id.slice(0, 6).toUpperCase()}</td>
                          <td className="py-3 px-2 font-medium">{h.restaurants?.name}</td>
                          <td className="py-3 px-2 text-stone-500">{h.address?.full_name}</td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-600">₹{h.delivery_cost_share || 30}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                              Delivered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
