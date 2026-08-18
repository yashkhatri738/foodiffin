"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Loader2,
  DollarSign,
  TrendingDown,
  Info,
  ChevronRight,
  TrendingUpIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getFinancialSummary, type FinancialSummaryData, type PayoutRecord } from "@/lib/finance.action";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

export default function FinancePage() {
  const [data, setData] = useState<FinancialSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFinanceData();
  }, []);

  const loadFinanceData = async (start?: string, end?: string) => {
    setLoading(true);
    const res = await getFinancialSummary(start, end);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      toast.error(res.error || "Failed to load financial records.");
    }
    setLoading(false);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFinanceData(
      startDate ? new Date(startDate).toISOString() : undefined,
      endDate ? new Date(endDate).toISOString() : undefined
    );
  };

  const downloadCSV = () => {
    if (!data || !data.recentPayouts.length) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Gross Sales (INR)", "Platform Commission (INR)", "Delivery Cost Share (INR)", "Net Payout (INR)", "Status"];
    const rows = data.recentPayouts.map(p => [
      p.id,
      new Date(p.created_at).toLocaleDateString(),
      p.customer_name,
      p.total_amount,
      p.platform_commission_amount,
      p.delivery_cost_share,
      p.net_payout_amount,
      p.payout_status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `foodiffin_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial report exported successfully!");
  };

  if (loading && !data) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mb-3 mx-auto" size={36} />
          <p className="text-stone-500 font-medium">Compiling financial charts...</p>
        </div>
      </div>
    );
  }

  // Calculate SVG Chart dimensions
  const dailyData = data?.dailyData || [];
  const chartHeight = 220;
  const chartWidth = 650;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxVal = dailyData.length
    ? Math.max(...dailyData.map(d => Math.max(d.revenue, d.profit, d.costs)))
    : 1000;
  const yMax = maxVal * 1.1; // Add 10% safety padding top

  return (
    <section className="flex flex-col gap-5 min-w-0 flex-1">
      {/* Header */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            <TrendingUp size={14} />
            Financial Ledger
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sales & profit analytics
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
            Track daily profit margins, commissions, ingredient costs, and export payout ledger statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={downloadCSV}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-stone-950 px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-stone-900"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {/* Date Filters */}
      <form onSubmit={handleFilterSubmit} className="portal-glass grid gap-3 rounded-[20px] border border-white/70 p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-stone-500 uppercase">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition bg-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-stone-500 uppercase">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 px-5 text-sm font-bold text-white shadow-md transition disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin" size={14} />}
          Apply Filter
        </button>
      </form>

      {/* Financial stats cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Revenue */}
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5">
          <div className="flex items-start justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md">
              <Wallet size={19} />
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              Gross Sales
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400">Gross Sales</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-stone-850">
            ₹{data?.grossSales.toLocaleString("en-IN") || 0}
          </p>
        </article>

        {/* Commissions & Platform Cuts */}
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5">
          <div className="flex items-start justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-md">
              <TrendingDown size={19} />
            </span>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
              Platform Cuts
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400">Fees & Commissions</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-stone-850">
            ₹{data?.commissions.toLocaleString("en-IN") || 0}
          </p>
        </article>

        {/* Cost of Goods */}
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5">
          <div className="flex items-start justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
              <Info size={19} />
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              Food Cost (Est)
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400">Raw Ingredients Cost</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-stone-850">
            ₹{data?.estimatedCosts.toLocaleString("en-IN") || 0}
          </p>
        </article>

        {/* Net Profit */}
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 ring-2 ring-emerald-500/20">
          <div className="flex items-start justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
              <ArrowUpRight size={19} />
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              Net Profit
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400">Actual Earnings</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">
            ₹{data?.netProfit.toLocaleString("en-IN") || 0}
          </p>
        </article>
      </div>

      {/* Premium Recharts Chart & Details */}
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Recharts Area Chart card */}
        <div className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 min-w-0">
          <div className="mb-6">
            <h2 className="text-base font-bold text-stone-950">Daily margin trends</h2>
            <p className="text-xs text-stone-500">Comparison of Daily Revenue (Orange) vs Net Profit (Green)</p>
          </div>

          {!mounted ? (
            <div className="h-56 flex items-center justify-center text-stone-400 text-sm">
              Loading charts...
            </div>
          ) : dailyData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-stone-400 text-sm">
              No sales records in the selected period.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a3a3a3" 
                    fontSize={10} 
                    tickFormatter={(str) => {
                      if (!str) return "";
                      const parts = str.split("-");
                      return parts.length > 2 ? `${parts[2]}/${parts[1]}` : str;
                    }}
                  />
                  <YAxis stroke="#a3a3a3" fontSize={10} />
                  <ChartTooltip 
                    contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" name="Net Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend / Margin Analysis info */}
        <div className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3">Profitability Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50/70 rounded-xl">
                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">Platform Commission</p>
                  <p className="text-[10px] text-stone-500">Currently calculated at a fixed 15% marketplace platform cut.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Food Margin Goals</p>
                  <p className="text-[10px] text-stone-500">Maintain ingredient costs under 35% of selling price to secure 45%+ net margins.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50/70 rounded-xl">
                <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Logistics Share</p>
                  <p className="text-[10px] text-stone-500">Fixed ₹30 delivery share allocated per dispatched courier box.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-150 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-500">Margin Quality:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Optimal (48%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5">
        <div className="mb-4">
          <h2 className="text-base font-bold text-stone-950">Payout ledger statement</h2>
          <p className="text-xs text-stone-500">Recent completed transactions and settlement records.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-xs font-bold uppercase">
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2 text-right">Gross Sales</th>
                <th className="py-3 px-2 text-right">Platform Fee</th>
                <th className="py-3 px-2 text-right">Net Payout</th>
                <th className="py-3 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {data?.recentPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No payouts or sales settled yet.
                  </td>
                </tr>
              ) : (
                data?.recentPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-stone-850">
                      #FD-{p.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-2 font-medium">{p.customer_name}</td>
                    <td className="py-3.5 px-2 text-stone-500">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-2 text-right font-semibold">₹{p.total_amount}</td>
                    <td className="py-3.5 px-2 text-right text-red-500">-₹{p.platform_commission_amount + p.delivery_cost_share}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-emerald-600">₹{p.net_payout_amount}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                        {p.payout_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
