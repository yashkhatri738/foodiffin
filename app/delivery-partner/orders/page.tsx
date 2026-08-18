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
  Banknote,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldCheck,
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

  // Payment confirmation state for active orders (orderId -> boolean)
  const [cashCollectedMap, setCashCollectedMap] = useState<Record<string, boolean>>({});
  
  // Modal for payment settlement confirmation
  const [settlementModalOrder, setSettlementModalOrder] = useState<DeliveryOrder | null>(null);
  const [modalConfirmed, setModalConfirmed] = useState(false);

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

  const handleOpenSettlementModal = (order: DeliveryOrder) => {
    setSettlementModalOrder(order);
    setModalConfirmed(order.payment_method !== "cash" || !!cashCollectedMap[order.id]);
  };

  const handleConfirmAndComplete = async () => {
    if (!settlementModalOrder) return;
    
    if (settlementModalOrder.payment_method === "cash" && !modalConfirmed) {
      toast.error("Please confirm that cash payment has been collected!");
      return;
    }

    const orderId = settlementModalOrder.id;
    setActionLoading(orderId);
    const res = await completeDeliveryOrder(orderId);
    if (res.success) {
      toast.success(`Payment settled & Order #FD-${orderId.slice(0, 6).toUpperCase()} marked as Delivered!`);
      setSettlementModalOrder(null);
      setCashCollectedMap((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
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
            Accept open kitchen orders, collect payments safely, and complete deliveries.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-stone-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setTab("open")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
              tab === "open"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Open Tasks ({openOrders.length})
          </button>
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tab === "active"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            In-Transit
            {activeOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
              tab === "history"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            History
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* OPEN ORDERS TAB */}
          {tab === "open" && (
            openOrders.length === 0 ? (
              <div className="portal-card rounded-[24px] bg-white border border-stone-200 p-12 text-center shadow-sm">
                <Package className="w-14 h-14 text-stone-300 mx-auto mb-4" />
                <h3 className="font-bold text-stone-850 text-lg mb-1">No open delivery requests</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  All current customer orders have been dispatched or accepted. New food dispatch tasks will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                {activeOrders.map((order) => {
                  const isCOD = order.payment_method === "cash";
                  const isCashCollected = !!cashCollectedMap[order.id];

                  return (
                    <article key={order.id} className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 ring-2 ring-orange-500/20">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-orange-600 block">Active Delivery</span>
                          <h3 className="font-bold text-stone-900 text-base">#FD-{order.id.slice(0, 6).toUpperCase()}</h3>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isCOD ? 'text-amber-800 bg-amber-100' : 'text-emerald-700 bg-emerald-50'}`}>
                            {isCOD ? `COD: Collect ₹${order.total_amount}` : `Online Paid: ₹${order.total_amount}`}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-5">
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

                      {/* ══ STEP 1: PAYMENT COLLECTION VERIFICATION BOX ══ */}
                      <div className={`p-4 rounded-2xl mb-4 border transition ${
                        isCOD
                          ? isCashCollected
                            ? "bg-emerald-50/80 border-emerald-300"
                            : "bg-amber-50/80 border-amber-300"
                          : "bg-blue-50/80 border-blue-200"
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {isCOD ? (
                              <Banknote className={`w-5 h-5 mt-0.5 shrink-0 ${isCashCollected ? "text-emerald-600" : "text-amber-600"}`} />
                            ) : (
                              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-blue-600" />
                            )}
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-stone-500">
                                Step 1: Payment Verification
                              </span>
                              <p className="text-sm font-extrabold text-stone-900 mt-0.5">
                                {isCOD ? `Collect ₹${order.total_amount} Cash from Customer` : `Payment Pre-Paid Online (₹${order.total_amount})`}
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                {isCOD
                                  ? "Payment is mandatory before handing over the food parcel."
                                  : "Customer has already paid online. No cash collection needed."}
                              </p>
                            </div>
                          </div>

                          {isCOD && (
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm shrink-0 hover:bg-stone-50 select-none">
                              <input
                                type="checkbox"
                                checked={isCashCollected}
                                onChange={(e) => {
                                  setCashCollectedMap((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.checked,
                                  }));
                                }}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-stone-800">
                                {isCashCollected ? "Received ✓" : "Collect Cash"}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* ══ STEP 2: DELIVER & COMPLETE BUTTON ══ */}
                      <button
                        onClick={() => handleOpenSettlementModal(order)}
                        disabled={actionLoading !== null}
                        className={`w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold shadow-md transition ${
                          isCOD && !isCashCollected
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        } disabled:opacity-50`}
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : isCOD && !isCashCollected ? (
                          <>
                            <Banknote size={15} /> Receive Payment & Complete Delivery
                          </>
                        ) : (
                          <>
                            <CheckCircle size={15} /> Confirm & Mark as Delivered
                          </>
                        )}
                      </button>
                    </article>
                  );
                })}
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
                        <th className="py-2.5 px-2">Payment Collected</th>
                        <th className="py-2.5 px-2 text-right">Rider Payout</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                      {historyOrders.map((h) => (
                        <tr key={h.id}>
                          <td className="py-3 px-2 font-bold">#FD-{h.id.slice(0, 6).toUpperCase()}</td>
                          <td className="py-3 px-2 font-medium">{h.restaurants?.name}</td>
                          <td className="py-3 px-2 text-stone-500">{h.address?.full_name}</td>
                          <td className="py-3 px-2 font-semibold text-stone-800">
                            ₹{h.total_amount}{" "}
                            <span className="text-[10px] text-stone-400 font-normal">
                              ({h.payment_method === "cash" ? "Cash" : "Online"})
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-600">₹{h.delivery_cost_share || 30}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                              Delivered ✓
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

      {/* ══ PAYMENT & DELIVERY CONFIRMATION POPUP MODAL ══ */}
      {settlementModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                <Banknote className="text-orange-600" size={20} />
                Payment & Handover Settle
              </div>
              <button
                onClick={() => setSettlementModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-5 space-y-4">
              {/* Order Info */}
              <div className="p-3.5 bg-stone-50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400">Order ID</span>
                  <p className="font-bold text-stone-900">#FD-{settlementModalOrder.id.slice(0, 6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-stone-400">Customer</span>
                  <p className="font-bold text-stone-900">{settlementModalOrder.address?.full_name}</p>
                </div>
              </div>

              {/* Payment Amount Card */}
              <div className={`p-4 rounded-2xl border ${
                settlementModalOrder.payment_method === "cash"
                  ? "bg-amber-50/80 border-amber-200"
                  : "bg-emerald-50/80 border-emerald-200"
              }`}>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">
                  {settlementModalOrder.payment_method === "cash" ? "Cash to Collect" : "Payment Status"}
                </span>
                <p className="text-2xl font-black text-stone-900 mt-1">
                  ₹{settlementModalOrder.total_amount}
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  {settlementModalOrder.payment_method === "cash"
                    ? "💵 Cash on Delivery (COD) - Must collect before delivering."
                    : "💳 Pre-paid online successfully."}
                </p>
              </div>

              {/* Confirmation Checkbox for Cash */}
              {settlementModalOrder.payment_method === "cash" ? (
                <label className="flex items-start gap-3 p-3.5 bg-stone-100/80 rounded-2xl cursor-pointer hover:bg-stone-100 transition border border-stone-200">
                  <input
                    type="checkbox"
                    checked={modalConfirmed}
                    onChange={(e) => setModalConfirmed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">
                      I have received exact ₹{settlementModalOrder.total_amount} in Cash
                    </p>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Confirming will mark order payment as PAID and settle the delivery.
                    </p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-800 font-semibold border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Online payment of ₹{settlementModalOrder.total_amount} verified. Ready to hand over!</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSettlementModalOrder(null)}
                className="flex-1 h-11 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndComplete}
                disabled={actionLoading !== null || (settlementModalOrder.payment_method === "cash" && !modalConfirmed)}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {actionLoading === settlementModalOrder.id ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <>
                    <CheckCircle size={15} />
                    {settlementModalOrder.payment_method === "cash"
                      ? "Payment Received & Done"
                      : "Complete Delivery"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
