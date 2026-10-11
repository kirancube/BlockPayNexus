import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Activity,
  BarChart2,
  PieChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
} from "recharts";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Drawer } from "../components/ui/dialog";
import { formatINR, formatPct, formatCrypto } from "../lib/utils";

const ASSET_CHART_TIMEFRAMES = {
  "1H": [
    { t: "14:00", p: 100 },
    { t: "14:15", p: 100.8 },
    { t: "14:30", p: 100.4 },
    { t: "14:45", p: 101.2 },
    { t: "15:00", p: 101.9 },
  ],
  "1D": [
    { t: "09:30", p: 98.5 },
    { t: "11:00", p: 99.2 },
    { t: "12:30", p: 100.5 },
    { t: "14:00", p: 101.1 },
    { t: "15:30", p: 102.4 },
  ],
  "1W": [
    { t: "Mon", p: 95.0 },
    { t: "Tue", p: 96.8 },
    { t: "Wed", p: 98.2 },
    { t: "Thu", p: 97.4 },
    { t: "Fri", p: 102.4 },
  ],
  "1M": [
    { t: "W1", p: 91.0 },
    { t: "W2", p: 94.5 },
    { t: "W3", p: 98.0 },
    { t: "W4", p: 102.4 },
  ],
  "1Y": [
    { t: "Q1", p: 78.0 },
    { t: "Q2", p: 84.5 },
    { t: "Q3", p: 92.0 },
    { t: "Q4", p: 102.4 },
  ],
};

export function MarketsView() {
  const { markets, selectedAsset, setSelectedAsset, news } = useNexus();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartTf, setChartTf] = useState("1D");

  const categories = ["ALL", "Crypto", "Stocks", "ETFs", "Forex", "Commodities", "Indices"];

  const filteredMarkets = markets.filter((m) => {
    const matchesCat = activeCategory === "ALL" || m.category === activeCategory;
    const matchesSearch =
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate detailed chart points scaled to asset price
  const getScaledChartData = (asset) => {
    if (!asset) return [];
    const baseScale = ASSET_CHART_TIMEFRAMES[chartTf] || ASSET_CHART_TIMEFRAMES["1D"];
    const basePrice = asset.price;
    return baseScale.map((pt) => ({
      time: pt.t,
      price: Number((basePrice * (pt.p / 102.4)).toFixed(basePrice > 1000 ? 2 : 4)),
    }));
  };

  // Find news matching selected asset
  const relatedNews = selectedAsset
    ? news.filter((n) => n.affectedAssets.some((a) => a.includes(selectedAsset.symbol)))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Global Financial Markets Terminal
            <Badge variant="cyan">REAL-TIME FEED</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Streaming equities, digital assets, sovereign ETFs, foreign exchange currencies, and commodities.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search symbol, coin, asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-border/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Markets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase font-mono text-muted-foreground bg-muted/20">
                  <th className="py-3 px-4">Asset & Symbol</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Market Price</th>
                  <th className="py-3 px-3">24H Delta</th>
                  <th className="py-3 px-3">24H High / Low</th>
                  <th className="py-3 px-3">24H Volume</th>
                  <th className="py-3 px-3">Your Position</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-xs">
                {filteredMarkets.map((asset) => {
                  const isPositive = asset.changePct >= 0;
                  return (
                    <tr
                      key={asset.symbol}
                      onClick={() => setSelectedAsset(asset)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground text-xs">{asset.symbol}</div>
                        <div className="text-[11px] text-muted-foreground font-sans">{asset.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline">{asset.category}</Badge>
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {asset.symbol.includes("INR") || asset.category === "Forex"
                          ? `₹${asset.price}`
                          : formatINR(asset.price)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? "+" : ""}
                          {asset.changePct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        <div>H: {asset.high ? `₹${asset.high.toLocaleString("en-IN")}` : "—"}</div>
                        <div>L: {asset.low ? `₹${asset.low.toLocaleString("en-IN")}` : "—"}</div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {asset.volume || "—"}
                      </td>
                      <td className="py-3 px-3">
                        {asset.holdings ? (
                          <span className="text-cyan-400 font-semibold">
                            {asset.holdings} {asset.symbol}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-cyan-400 group-hover:underline">
                          Analysis &rarr;
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Asset Detail Drawer */}
      <Drawer
        open={!!selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
        title={`${selectedAsset?.symbol || ""} — ${selectedAsset?.name || ""}`}
      >
        {selectedAsset && (
          <div className="space-y-6">
            {/* Header Stats */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{selectedAsset.category}</span>
                <Badge variant={selectedAsset.changePct >= 0 ? "success" : "destructive"}>
                  {selectedAsset.changePct >= 0 ? "+" : ""}
                  {selectedAsset.changePct}% (24H)
                </Badge>
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatINR(selectedAsset.price)}
                </span>
                {selectedAsset.usdPrice && (
                  <span className="text-xs text-muted-foreground font-mono">
                    (${selectedAsset.usdPrice.toLocaleString("en-US")} USD)
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                  Historical Trajectory
                </span>
                <div className="flex items-center space-x-1 rounded bg-muted p-1">
                  {["1H", "1D", "1W", "1M", "1Y"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setChartTf(tf)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        chartTf === tf
                          ? "bg-card text-cyan-400 font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-48 w-full border border-border/60 rounded-xl p-2 bg-card">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getScaledChartData(selectedAsset)}>
                    <defs>
                      <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => `₹${v > 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#090d16",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(v) => [formatINR(v), selectedAsset.symbol]}
                    />
                    <Area type="monotone" dataKey="price" stroke="#00e5ff" fill="url(#assetGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fundamentals / Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">24H HIGH</span>
                <span className="text-foreground font-bold">{selectedAsset.high ? formatINR(selectedAsset.high) : "—"}</span>
              </div>
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">24H LOW</span>
                <span className="text-foreground font-bold">{selectedAsset.low ? formatINR(selectedAsset.low) : "—"}</span>
              </div>
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">MARKET CAPITALIZATION</span>
                <span className="text-foreground font-bold">{selectedAsset.marketCap || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[10px] text-muted-foreground block">24H AGGREGATE VOLUME</span>
                <span className="text-foreground font-bold">{selectedAsset.volume || "N/A"}</span>
              </div>
            </div>

            {/* ETF specific metrics */}
            {selectedAsset.category === "ETFs" && (
              <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/10 space-y-2 text-xs font-mono">
                <div className="font-bold text-cyan-400">ETF METRICS & HOLDINGS</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expense Ratio:</span>
                  <span className="text-foreground font-semibold">{selectedAsset.expenseRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total AUM:</span>
                  <span className="text-foreground font-semibold">{selectedAsset.aum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trailing Yield:</span>
                  <span className="text-emerald-400 font-semibold">{selectedAsset.yield}</span>
                </div>
              </div>
            )}

            {/* Related News & Sentiment */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Latest News & AI Sentiment
              </h4>
              {relatedNews.length === 0 ? (
                <div className="p-3 rounded-lg border border-border text-xs text-muted-foreground font-sans">
                  No direct headlines flagged for {selectedAsset.symbol} in the active cycle.
                </div>
              ) : (
                relatedNews.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg border border-border bg-card space-y-1 text-xs">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground">{n.source}</span>
                      <Badge variant={n.sentiment === "Bullish" ? "success" : "secondary"}>
                        {n.sentiment} ({n.confidence}%)
                      </Badge>
                    </div>
                    <div className="font-medium text-foreground line-clamp-2">{n.headline}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
