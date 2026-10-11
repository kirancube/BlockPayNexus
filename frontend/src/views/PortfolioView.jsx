import React, { useState } from "react";
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Sliders,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatINR, formatPct } from "../lib/utils";

const BENCHMARK_CURVES = [
  { month: "Apr", portfolio: 100, nifty: 100, sp500: 100, btc: 100 },
  { month: "May", portfolio: 104.2, nifty: 101.8, sp500: 102.5, btc: 108.4 },
  { month: "Jun", portfolio: 107.5, nifty: 103.4, sp500: 104.1, btc: 112.0 },
  { month: "Jul", portfolio: 112.1, nifty: 106.2, sp500: 107.8, btc: 116.5 },
  { month: "Aug", portfolio: 115.8, nifty: 108.5, sp500: 110.2, btc: 122.1 },
  { month: "Sep", portfolio: 119.0, nifty: 111.4, sp500: 112.9, btc: 128.4 },
];

const SECTOR_DATA = [
  { sector: "Crypto Layer-1", pct: 42.2 },
  { sector: "Energy & Petrochem", pct: 22.4 },
  { sector: "Banking & Financials", pct: 15.8 },
  { sector: "Information Tech", pct: 11.6 },
  { sector: "Sovereign Gold / ETFs", pct: 8.0 },
];

export function PortfolioView() {
  const { holdings, totalPortfolioValue } = useNexus();
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("value");
  const [sortAsc, setSortAsc] = useState(false);

  const totalInvested = 8650000.0;
  const totalPnL = totalPortfolioValue - totalInvested;
  const returnPct = ((totalPnL / totalInvested) * 100).toFixed(2);
  const todaysPnL = 34500.0;
  const riskScore = 42; // Moderate

  const filteredHoldings = holdings
    .filter((h) => {
      const matchType = filterType === "ALL" || h.type === filterType;
      const matchSearch =
        h.asset.toLowerCase().includes(search.toLowerCase()) ||
        h.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      const multiplier = sortAsc ? 1 : -1;
      return (a[sortField] > b[sortField] ? 1 : -1) * multiplier;
    });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Investment Portfolio & Risk Analytics
            <Badge variant="cyan">INSTITUTIONAL</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time asset allocation, risk factor decomposition, and comparative benchmark tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="blockchain" className="py-1 px-3">
            RISK RATING: MODERATE ({riskScore}/100)
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-cyan-500/30">
          <CardHeader className="pb-1 p-4">
            <CardDescription className="text-[10px]">TOTAL PORTFOLIO VALUE</CardDescription>
            <CardTitle className="text-lg sm:text-xl font-mono font-bold text-foreground mt-1">
              {formatINR(totalPortfolioValue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-1 p-4">
            <CardDescription className="text-[10px]">TOTAL INVESTED CAPITAL</CardDescription>
            <CardTitle className="text-lg sm:text-xl font-mono font-bold text-foreground mt-1">
              {formatINR(totalInvested)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-1 p-4">
            <CardDescription className="text-[10px]">TOTAL UNREALIZED P&L</CardDescription>
            <CardTitle className="text-lg sm:text-xl font-mono font-bold text-emerald-400 mt-1">
              +{formatINR(totalPnL)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-1 p-4">
            <CardDescription className="text-[10px]">TOTAL RETURN %</CardDescription>
            <CardTitle className="text-lg sm:text-xl font-mono font-bold text-emerald-400 mt-1">
              +{returnPct}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="pb-1 p-4">
            <CardDescription className="text-[10px]">TODAY&apos;S P&L</CardDescription>
            <CardTitle className="text-lg sm:text-xl font-mono font-bold text-emerald-400 mt-1">
              +{formatINR(todaysPnL)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Asset Holdings Inventory</CardTitle>
              <CardDescription>
                Detailed breakdown of positions, average acquisition costs, and current unrealized return
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative w-44 sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter holdings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>

              <div className="flex items-center rounded-lg bg-muted p-1">
                {["ALL", "Crypto", "Stocks", "ETF", "Cash"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded ${
                      filterType === t
                        ? "bg-card text-cyan-400 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase font-mono text-muted-foreground bg-muted/20">
                  <th className="py-2.5 px-4">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Position Qty</th>
                  <th className="py-2.5 px-3">Avg Acquisition</th>
                  <th className="py-2.5 px-3">Current Price</th>
                  <th className="py-2.5 px-3">Market Value</th>
                  <th className="py-2.5 px-3">Unrealized P&L</th>
                  <th className="py-2.5 px-3">P&L %</th>
                  <th className="py-2.5 px-4 text-right">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-xs">
                {filteredHoldings.map((h) => {
                  const isPositive = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">{h.asset}</div>
                        <div className="text-[10px] text-muted-foreground font-sans">{h.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline">{h.type}</Badge>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {h.qty.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {formatINR(h.avgPrice)}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {formatINR(h.currentPrice)}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {formatINR(h.value)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={isPositive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                          {isPositive ? "+" : ""}{formatINR(h.pnl)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={isPositive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                          {isPositive ? "+" : ""}{h.pnlPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-cyan-400">
                        {h.allocation}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Comparison & Sector Diversification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benchmark Trajectory (Portfolio vs NIFTY vs S&P 500 vs BTC) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Comparative Benchmark Performance (Rebased to 100)</CardTitle>
            <CardDescription>
              Portfolio vs. NIFTY 50 vs. S&P 500 vs. Bitcoin &bull; Clearly labeled Simulated Benchmark Feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={BENCHMARK_CURVES}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[95, 135]} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line type="monotone" dataKey="portfolio" name="BlockPay Nexus" stroke="#00e5ff" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="nifty" name="NIFTY 50" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="sp500" name="S&P 500" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="btc" name="Bitcoin (BTC)" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Exposure Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sector Allocation Weights</CardTitle>
            <CardDescription>Concentration across economic industries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            {SECTOR_DATA.map((s) => (
              <div key={s.sector} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground">{s.sector}</span>
                  <span className="text-cyan-400 font-bold">{s.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${s.pct * 2}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-border/60">
              <div className="p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-950/20 text-[11px] font-sans text-muted-foreground">
                <strong className="text-cyan-300">Rebalancing Note:</strong> Digital Assets constitute the largest single factor beta.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals Tracker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>FINANCIAL TARGETS & GOALS TRACKER</span>
            <Target className="h-4 w-4 text-cyan-400" />
          </CardTitle>
          <CardDescription>Automated milestone tracking against target asset targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Sovereign 1 BTC Goal</span>
                <Badge variant="cyan">85.4% Done</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Held: 0.8540 BTC / 1.0000 BTC Target
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: "85.4%" }} />
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">₹50L Liquid Equity</span>
                <Badge variant="success">Completed</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Held: ₹58.9L / ₹50.0L Target
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Emergency Reserve INR</span>
                <Badge variant="warning">90.0% Done</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Held: ₹4.50L / ₹5.00L Target
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
