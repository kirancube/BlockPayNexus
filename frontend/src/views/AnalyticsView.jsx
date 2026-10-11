import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { formatINR } from "../lib/utils";

const MONTE_CARLO_PATHS = [
  { year: "2026", p10: 10.2, p50: 10.2, p90: 10.2 },
  { year: "2027", p10: 9.8, p50: 11.6, p90: 13.8 },
  { year: "2028", p10: 10.4, p50: 13.4, p90: 17.5 },
  { year: "2029", p10: 11.2, p50: 15.8, p90: 22.4 },
  { year: "2030", p10: 12.1, p50: 18.9, p90: 29.1 },
  { year: "2031", p10: 13.5, p50: 22.5, p90: 38.0 },
];

const CORRELATION_MATRIX = [
  { asset: "BTC", btc: 1.00, eth: 0.82, nifty: 0.18, gold: 0.04 },
  { asset: "ETH", btc: 0.82, eth: 1.00, nifty: 0.15, gold: 0.02 },
  { asset: "NIFTY", btc: 0.18, eth: 0.15, nifty: 1.00, gold: -0.12 },
  { asset: "GOLD", btc: 0.04, eth: 0.02, nifty: -0.12, gold: 1.00 },
];

export function AnalyticsView() {
  const { totalPortfolioValue } = useNexus();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Quantitative Portfolio Analytics
            <Badge variant="cyan">RISK MATRIX</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Parametric Value-at-Risk (VaR), Sharpe-Treynor ratios, cross-asset correlation, and stochastic projections.
          </p>
        </div>
      </div>

      {/* Quantitative KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">SHARPE RATIO (ANNUALIZED)</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground mt-1">1.84</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Risk-free rate: 6.8% &bull; Benchmark: NIFTY
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">PORTFOLIO BETA (&beta;)</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground mt-1">0.94</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Moderate systemic equity sensitivity
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">VALUE-AT-RISK (95% 1-DAY VAR)</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-rose-400 mt-1">-₹1,84,000</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            1.78% of total portfolio value
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">MAX HISTORICAL DRAWDOWN</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-amber-400 mt-1">-8.42%</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Peak to trough recovery in 18 days
          </CardContent>
        </Card>
      </div>

      {/* Monte Carlo Simulation Trajectory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">5-Year Stochastic Monte Carlo Wealth Projection (Cr INR)</CardTitle>
          <CardDescription>
            1,000 simulated Brownian motion trials: 10th percentile (bear), 50th percentile (median), 90th percentile (bull)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTE_CARLO_PATHS}>
                <defs>
                  <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v} Cr`} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                  formatter={(v) => [`₹${v} Crore INR`]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="p90" name="90th Percentile (Bull Case)" stroke="#10b981" fill="url(#bullGrad)" strokeWidth={2} />
                <Line type="monotone" dataKey="p50" name="50th Percentile (Expected Median)" stroke="#00e5ff" strokeWidth={2.5} />
                <Line type="monotone" dataKey="p10" name="10th Percentile (Bear Case)" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Matrix & Geographic Diversification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cross-Asset Pearson Correlation Matrix</CardTitle>
            <CardDescription>Degree of statistical co-movement across asset classes</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs font-mono text-center">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase text-muted-foreground">
                  <th className="py-2 text-left">Asset</th>
                  <th className="py-2">BTC</th>
                  <th className="py-2">ETH</th>
                  <th className="py-2">NIFTY</th>
                  <th className="py-2">GOLD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {CORRELATION_MATRIX.map((row) => (
                  <tr key={row.asset}>
                    <td className="py-2.5 text-left font-bold text-foreground">{row.asset}</td>
                    <td className="py-2.5 text-cyan-400">{row.btc.toFixed(2)}</td>
                    <td className="py-2.5 text-cyan-400">{row.eth.toFixed(2)}</td>
                    <td className="py-2.5 text-muted-foreground">{row.nifty.toFixed(2)}</td>
                    <td className="py-2.5 text-emerald-400">{row.gold.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[11px] text-muted-foreground font-sans">
              Low correlation between Gold and Equities (-0.12) serves as an effective hedge against systemic equity shocks.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Geographic Asset Distribution</CardTitle>
            <CardDescription>Sovereign domicile and jurisdiction exposure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            {[
              { region: "Decentralized (Global EVM / Bitcoin)", pct: 48.2, color: "#00e5ff" },
              { region: "India Domestic (NSE / BSE / INR)", pct: 38.6, color: "#f59e0b" },
              { region: "United States (US Equities & ETFs)", pct: 13.2, color: "#3b82f6" },
            ].map((geo) => (
              <div key={geo.region} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground">{geo.region}</span>
                  <span className="font-bold text-foreground">{geo.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${geo.pct}%`, backgroundColor: geo.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
