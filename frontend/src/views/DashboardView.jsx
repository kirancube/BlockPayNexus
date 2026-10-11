import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ShieldCheck,
  Bot,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  Layers,
  Terminal,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { formatINR, formatPct } from "../lib/utils";

const TIMEFRAME_DATA = {
  "1D": [
    { time: "09:15", val: 10180000 },
    { time: "10:30", val: 10195000 },
    { time: "11:45", val: 10230000 },
    { time: "13:00", val: 10210000 },
    { time: "14:15", val: 10255000 },
    { time: "15:30", val: 10292660 },
  ],
  "1W": [
    { time: "Mon", val: 10020000 },
    { time: "Tue", val: 10110000 },
    { time: "Wed", val: 10080000 },
    { time: "Thu", val: 10190000 },
    { time: "Fri", val: 10292660 },
  ],
  "1M": [
    { time: "W1", val: 9850000 },
    { time: "W2", val: 9940000 },
    { time: "W3", val: 10120000 },
    { time: "W4", val: 10292660 },
  ],
  "3M": [
    { time: "Aug", val: 9400000 },
    { time: "Sep", val: 9800000 },
    { time: "Oct", val: 10292660 },
  ],
  "1Y": [
    { time: "Q1", val: 8200000 },
    { time: "Q2", val: 8900000 },
    { time: "Q3", val: 9600000 },
    { time: "Q4", val: 10292660 },
  ],
  "ALL": [
    { time: "2024", val: 5400000 },
    { time: "2025", val: 7800000 },
    { time: "2026", val: 10292660 },
  ],
};

// A E R I S Precision Monochrome Palette
const ALLOCATION_COLORS = ["#FFFFFF", "#D4D4D8", "#A1A1AA", "#71717A", "#3F3F46"];

export function DashboardView() {
  const {
    user,
    fiatWallet,
    cryptoWallets,
    holdings,
    markets,
    news,
    transactions,
    totalPortfolioValue,
    setSelectedAsset,
    setSelectedTx,
    setActiveArticle,
  } = useNexus();

  const [timeframe, setTimeframe] = useState("1M");
  const navigate = useNavigate();

  // Financial Metrics
  const dailyPnL = 34500.0;
  const dailyPnLPct = 0.34;
  const totalPnL = 1642000.0;
  const totalPnLPct = 19.0;
  const availableCash = fiatWallet.availableBalance;
  const cryptoTotalINR = cryptoWallets.reduce((acc, c) => acc + c.balance * c.inrPrice, 0);
  const cryptoExposurePct = Number(((cryptoTotalINR / totalPortfolioValue) * 100).toFixed(1));
  const fiatExposurePct = Number(((availableCash / totalPortfolioValue) * 100).toFixed(1));

  // Allocation pie data
  const allocationData = [
    { name: "Crypto", value: cryptoTotalINR },
    { name: "Stocks", value: 798510 },
    { name: "ETFs", value: 375040 },
    { name: "Gold", value: 52960 },
    { name: "Cash (INR)", value: availableCash },
  ];

  // Top gainers & losers
  const sortedMovers = [...markets]
    .filter((m) => m.category !== "Indices")
    .sort((a, b) => b.changePct - a.changePct);
  const topGainers = sortedMovers.slice(0, 3);
  const topLosers = [...sortedMovers].reverse().slice(0, 3);

  // Portfolio-relevant news (only news mentioning user's held assets)
  const userAssetSymbols = ["BTC", "ETH", "RELIANCE", "TCS", "HDFCBANK", "GOLDBEES"];
  const portfolioNews = news.filter((n) =>
    n.affectedAssets.some((a) => userAssetSymbols.includes(a))
  );

  return (
    <div className="space-y-6">
      {/* =====================================================================
          A E R I S — PRECISION ENGINEERED HERO & STATUS SECTION
          ===================================================================== */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Ambient Precision Radial Grid Backdrop */}
        <div className="absolute inset-0 bg-aeris-grid opacity-50 pointer-events-none" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-semibold tracking-widest text-zinc-400 uppercase">
                A E R I S PLATFORM RESEARCH // PRECISION FINANCIAL ARCHITECTURE
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                EVM ANCHORED
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.04]">
              Engineered at the atomic level.
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed max-w-xl">
              Next-generation cryptographic settlement, immutable dual-ledger accounting, and real-time sovereign financial intelligence.
            </p>
          </div>

          {/* Quick Precision Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate("/wallet?action=topup")}
              className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs h-9 px-4 rounded-lg shadow-sm"
            >
              <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
              <span>Add Funds</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/wallet?action=transfer")}
              className="border-white/20 bg-zinc-900/60 hover:bg-zinc-800 text-white font-medium text-xs h-9 px-4 rounded-lg"
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              <span>P2P Transfer</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/exchange")}
              className="border-white/20 bg-zinc-900/60 hover:bg-zinc-800 text-white font-medium text-xs h-9 px-4 rounded-lg"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
              <span>Instant Swap</span>
            </Button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PRIMARY KPI MATRIX (High-Density Modular Bento Cards)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Portfolio Value */}
        <Card className="border-white/10 bg-[#0E0E0E] hover:border-white/20 transition-all rounded-lg">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
              <span>TOTAL VALUATION MATRIX</span>
              <TrendingUp className="h-4 w-4 text-white" />
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-white mt-1 tracking-tight">
              {formatINR(totalPortfolioValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-emerald-400 flex items-center font-semibold">
                +{formatINR(dailyPnL)} ({formatPct(dailyPnLPct)})
              </span>
              <span className="text-zinc-500 text-[11px]">Today</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 font-mono">
              All-Time P&L: <span className="text-white">+{formatINR(totalPnL)} ({formatPct(totalPnLPct)})</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Available Cash (Fiat Reserve) */}
        <Card className="border-white/10 bg-[#0E0E0E] hover:border-white/20 transition-all rounded-lg">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
              <span>SOVEREIGN FIAT RESERVE</span>
              <Wallet className="h-4 w-4 text-zinc-300" />
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-white mt-1 tracking-tight">
              {formatINR(availableCash)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Reserve Weight:</span>
              <span className="text-white font-semibold">{fiatExposurePct}%</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 font-mono">
              Status: <span className="text-emerald-400 font-semibold">{fiatWallet.status}</span> &bull; Daily Cap: ₹2.0L
            </div>
          </CardContent>
        </Card>

        {/* 3. Cryptographic Vault Allocation */}
        <Card className="border-white/10 bg-[#0E0E0E] hover:border-white/20 transition-all rounded-lg">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
              <span>CRYPTOGRAPHIC ASSET VAULT</span>
              <span className="font-mono text-white font-bold">₿ / Ξ</span>
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-white mt-1 tracking-tight">
              {formatINR(cryptoTotalINR)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Crypto Exposure:</span>
              <span className="text-white font-semibold">{cryptoExposurePct}%</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 font-mono">
              Holdings: 0.8540 BTC &bull; 6.2500 ETH &bull; 42.5 SOL
            </div>
          </CardContent>
        </Card>

        {/* 4. Dual-Ledger Invariant Audit */}
        <Card className="border-white/10 bg-[#0E0E0E] hover:border-white/20 transition-all rounded-lg">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
              <span>DUAL-LEDGER INVARIANT</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-xl font-mono font-bold text-emerald-400 mt-1">
              TAMPER-EVIDENT OK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-400 space-y-1 font-mono text-[11px]">
              <div>Smart Contract: <span className="text-zinc-200">0x95AD...C4cE</span></div>
              <div>Audit Integrity: <span className="text-emerald-400">100% VERIFIED</span></div>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Hardhat local EVM testnet anchor active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================================
          MAIN INTERACTIVE PERFORMANCE CURVE & ALLOCATION BENTO
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Valuation Trajectory Curve */}
        <Card className="lg:col-span-2 border-white/10 bg-[#0E0E0E] rounded-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
            <div>
              <CardTitle className="text-base text-white font-medium">Portfolio Valuation Trajectory</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Precision mark-to-market performance curve across dual ledgers
              </CardDescription>
            </div>
            {/* Timeframe selector */}
            <div className="flex items-center space-x-1 rounded-lg border border-white/10 bg-zinc-950 p-1">
              {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-all ${
                    timeframe === tf
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TIMEFRAME_DATA[timeframe] || TIMEFRAME_DATA["1M"]}>
                  <defs>
                    <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#52525B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#27272A" }}
                  />
                  <YAxis
                    stroke="#52525B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#27272A" }}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    domain={["auto", "auto"]}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#080808",
                      borderColor: "#27272A",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#FFFFFF",
                    }}
                    formatter={(val) => [formatINR(val), "Valuation"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#valGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center text-xs font-mono">
              <div>
                <span className="text-zinc-500 text-[10px] block">SHARPE RATIO</span>
                <span className="text-white font-bold text-sm">1.84</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">ANNUALIZED VOL</span>
                <span className="text-zinc-300 font-bold text-sm">14.2%</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">MAX DRAWDOWN</span>
                <span className="text-rose-400 font-bold text-sm">-8.4%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Allocation Donut & AI Insight */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-[#0E0E0E] rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-white">
                <span>PORTFOLIO ALLOCATION</span>
                <PieIcon className="h-4 w-4 text-zinc-300" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#080808",
                        borderColor: "#27272A",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "#FFFFFF",
                      }}
                      formatter={(v) => [formatINR(v), "Weight"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 text-xs font-mono">
                {allocationData.map((item, idx) => {
                  const pct = ((item.value / totalPortfolioValue) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }}
                        />
                        <span className="text-zinc-400">{item.name}</span>
                      </div>
                      <span className="text-white font-semibold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Portfolio Insight Card */}
          <Card className="border-white/10 bg-[#0E0E0E] rounded-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 text-white text-xs font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>NEXUS AI PORTFOLIO INSIGHT</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Your portfolio holds <strong className="text-white font-semibold">84.2% in liquid digital assets</strong> (BTC + ETH) exhibiting high correlation with macro liquidity cycles.
              </p>
              <div className="rounded-lg border border-white/10 bg-zinc-950 p-2.5 text-[11px] text-zinc-400 font-mono">
                <strong className="text-white">Rebalancing Strategy:</strong> Consider routing 6% of weekly conversion yields into sovereign Gold BeES ETF to dampen downside volatility.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/ai")}
                className="w-full text-xs mt-1 border-white/20 text-white hover:bg-zinc-800"
              >
                Open Nexus Financial Copilot &rarr;
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* =====================================================================
          MARKET MOVERS & PORTFOLIO NEWS BENTO
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers */}
        <Card className="border-white/10 bg-[#0E0E0E] rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center justify-between">
              <span>MARKET PULSE: TOP MOVERS</span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/markets")} className="text-xs text-zinc-400 hover:text-white">
                View All &rarr;
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2 font-semibold">
                Top Gainers
              </span>
              <div className="space-y-2">
                {topGainers.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      navigate("/markets");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-zinc-950/60 hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{asset.symbol}</div>
                      <div className="text-[10px] text-zinc-400">{asset.name}</div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-white">₹{asset.price.toLocaleString("en-IN")}</div>
                      <div className="text-emerald-400 font-semibold">+{asset.changePct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2 font-semibold">
                Top Losers
              </span>
              <div className="space-y-2">
                {topLosers.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      navigate("/markets");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-zinc-950/60 hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{asset.symbol}</div>
                      <div className="text-[10px] text-zinc-400">{asset.name}</div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-white">₹{asset.price.toLocaleString("en-IN")}</div>
                      <div className="text-rose-400 font-semibold">{asset.changePct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Portfolio News */}
        <Card className="border-white/10 bg-[#0E0E0E] rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center justify-between">
              <span>NEWS AFFECTING YOUR HOLDINGS</span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/news")} className="text-xs text-zinc-400 hover:text-white">
                News Portal &rarr;
              </Button>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              AI-matched headlines filtered specifically by assets in your active portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioNews.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveArticle(item);
                  navigate("/news");
                }}
                className="p-3 rounded-lg border border-white/10 hover:border-white/20 bg-zinc-950/60 hover:bg-zinc-900 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-white font-semibold">{item.affectedAssets.join(", ")}</span>
                  <Badge variant={item.sentiment === "Bullish" ? "success" : "secondary"}>
                    {item.sentiment} ({item.confidence}%)
                  </Badge>
                </div>
                <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 leading-snug">
                  {item.headline}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  <span>{item.source}</span>
                  <span>Impact: <strong className="text-white">{item.marketImpact}</strong> &bull; Exposure: {item.portfolioExposure}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* =====================================================================
          RECENT IMMUTABLE TRANSACTIONS & ON-CHAIN AUDIT STATE
          ===================================================================== */}
      <Card className="border-white/10 bg-[#0E0E0E] rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm text-white font-medium">Recent Ledger Activity & Audit State</CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Immutable state transitions anchored to academic Ethereum testnet
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/wallet")} className="border-white/20 text-white hover:bg-zinc-800 text-xs">
            Full History
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase font-mono text-zinc-500">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Counterparty</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Lifecycle Status</th>
                  <th className="py-2.5 px-3">Fraud Score</th>
                  <th className="py-2.5 px-3">Blockchain Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {transactions.slice(0, 4).map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      navigate("/wallet");
                    }}
                    className="hover:bg-zinc-900/60 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-semibold text-white">{tx.id}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="border-white/20 text-zinc-300">{tx.type}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {tx.direction === "IN" ? tx.sender : tx.receiver}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {tx.currency === "INR" ? formatINR(tx.amount) : `${tx.amount} ${tx.currency}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={tx.status === "COMPLETED" ? "success" : "destructive"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={tx.riskScore > 50 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {tx.riskScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500 text-[11px]">
                      {tx.blockchainHash ? `${tx.blockchainHash.slice(0, 10)}...` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
