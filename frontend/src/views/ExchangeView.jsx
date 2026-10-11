import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  TrendingUp,
  Shield,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { formatINR } from "../lib/utils";

const FX_HISTORICAL = [
  { day: "Day 1", usdInr: 85.12, eurInr: 91.80, gbpInr: 107.90 },
  { day: "Day 2", usdInr: 85.25, eurInr: 91.95, gbpInr: 108.10 },
  { day: "Day 3", usdInr: 85.38, eurInr: 92.05, gbpInr: 108.35 },
  { day: "Day 4", usdInr: 85.30, eurInr: 91.90, gbpInr: 108.20 },
  { day: "Day 5", usdInr: 85.45, eurInr: 92.10, gbpInr: 108.50 },
  { day: "Day 6", usdInr: 85.40, eurInr: 92.00, gbpInr: 108.45 },
  { day: "Day 7", usdInr: 85.42, eurInr: 92.15, gbpInr: 108.60 },
];

export function ExchangeView() {
  const { fiatWallet, cryptoWallets, convertCurrency, transactions } = useNexus();

  const [fromAsset, setFromAsset] = useState("INR");
  const [toAsset, setToAsset] = useState("BTC");
  const [amount, setAmount] = useState("50000");
  const [countdown, setCountdown] = useState(30);
  const [conversionResult, setConversionResult] = useState(null);
  const [rateAlerts, setRateAlerts] = useState([
    { id: "alt_1", pair: "USD/INR", condition: "Exceeds", target: "₹86.00", active: true },
    { id: "alt_2", pair: "EUR/INR", condition: "Drops below", target: "₹91.50", active: true },
  ]);
  const [newAlertPair, setNewAlertPair] = useState("USD/INR");
  const [newAlertTarget, setNewAlertTarget] = useState("85.80");

  // Get current simulated conversion rates
  const getRate = (crypto) => {
    const item = cryptoWallets.find((c) => c.asset === crypto);
    return item ? item.inrPrice : 5890000;
  };

  const activeRate = toAsset === "INR" ? getRate(fromAsset) : getRate(toAsset);

  // 30-second quote validity countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSwapAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setConversionResult(null);
  };

  const calculateOutput = () => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return "0.00";
    if (fromAsset === "INR") {
      const net = Math.max(0, num - 125); // fee ₹125
      return (net / activeRate).toFixed(4);
    } else {
      const netINR = Math.max(0, num * activeRate - 125);
      return netINR.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }
  };

  const handleExecuteConversion = (e) => {
    e.preventDefault();
    const res = convertCurrency({
      fromAsset,
      toAsset,
      amount: Number(amount),
      quoteRate: activeRate,
      fee: 125,
    });
    setConversionResult(res);
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    setRateAlerts((prev) => [
      ...prev,
      {
        id: `alt_${Date.now()}`,
        pair: newAlertPair,
        condition: "Exceeds",
        target: `₹${newAlertTarget}`,
        active: true,
      },
    ]);
    setNewAlertTarget("");
  };

  const conversionTxs = transactions.filter((t) => t.type === "CONVERSION");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            FX & Cryptocurrency Exchange
            <Badge variant="cyan">ATOMIC SAGA</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bidirectional atomic swaps between sovereign INR and digital crypto tokens with real-time quote locking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-cyan-400">
            Quote Validity Window: 30s
          </Badge>
        </div>
      </div>

      {/* Main Converter & Rates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Converter Form (7 Cols) */}
        <Card className="lg:col-span-7 border-cyan-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Atomic Currency Converter</CardTitle>
                <CardDescription>
                  Two-leg Saga transaction coordinated with compensating rollbacks
                </CardDescription>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                <span>Quote Refreshes in: <strong>{countdown}s</strong></span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleExecuteConversion} className="space-y-4">
              {/* From & To Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase">You Send (From)</label>
                  <div className="flex rounded-md border border-input bg-card overflow-hidden">
                    <select
                      value={fromAsset}
                      onChange={(e) => {
                        setFromAsset(e.target.value);
                        if (e.target.value !== "INR") setToAsset("INR");
                        setConversionResult(null);
                      }}
                      className="bg-transparent px-3 py-2 text-xs font-mono text-foreground font-semibold focus:outline-none w-full"
                    >
                      <option value="INR">INR (Fiat)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="USDT">USDT (Tether)</option>
                      <option value="SOL">SOL (Solana)</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-1 flex justify-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSwapAssets}
                    className="rounded-full h-8 w-8 hover:border-cyan-400 hover:text-cyan-400"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase">You Receive (To)</label>
                  <div className="flex rounded-md border border-input bg-card overflow-hidden">
                    <select
                      value={toAsset}
                      onChange={(e) => {
                        setToAsset(e.target.value);
                        if (e.target.value !== "INR") setFromAsset("INR");
                        setConversionResult(null);
                      }}
                      className="bg-transparent px-3 py-2 text-xs font-mono text-foreground font-semibold focus:outline-none w-full"
                    >
                      {fromAsset === "INR" ? (
                        <>
                          <option value="BTC">BTC (Bitcoin)</option>
                          <option value="ETH">ETH (Ethereum)</option>
                          <option value="USDT">USDT (Tether)</option>
                          <option value="SOL">SOL (Solana)</option>
                        </>
                      ) : (
                        <option value="INR">INR (Fiat)</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">AMOUNT TO CONVERT</span>
                  <span className="text-cyan-400">
                    Available: {fromAsset === "INR" ? formatINR(fiatWallet.availableBalance) : `${cryptoWallets.find((c) => c.asset === fromAsset)?.available || 0} ${fromAsset}`}
                  </span>
                </div>
                <Input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setConversionResult(null);
                  }}
                  className="font-mono text-sm py-2"
                  required
                />
              </div>

              {/* Quote Breakdown Card */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Current Locked Quote Rate:</span>
                  <span className="text-foreground font-semibold">
                    1 {fromAsset === "INR" ? toAsset : fromAsset} = {formatINR(activeRate)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Transparent Network & Protocol Fee:</span>
                  <span className="text-foreground">₹125.00 INR (Flat Rate)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/60 text-sm font-bold text-foreground">
                  <span>Estimated Output:</span>
                  <span className="text-cyan-400">
                    {calculateOutput()} {toAsset}
                  </span>
                </div>
              </div>

              {conversionResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    conversionResult.success
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {conversionResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {conversionResult.success ? "Conversion Completed" : "Conversion Failed"}
                  </div>
                  <p className="mt-1 text-[11px]">
                    {conversionResult.success
                      ? `Anchored to blockchain hash ${conversionResult.tx?.blockchainHash.slice(0, 16)}...`
                      : conversionResult.error}
                  </p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full text-xs font-mono font-bold tracking-wider">
                CONFIRM ATOMIC CONVERSION &bull; 30S LOCK
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Live FX Rates & Rate Alerts (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sovereign FX Benchmark Rates</CardTitle>
              <CardDescription>Simulated central bank interbank reference rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 font-mono text-xs">
              {[
                { pair: "USD/INR", rate: 85.42, chg: "-0.09%" },
                { pair: "EUR/INR", rate: 92.15, chg: "+0.24%" },
                { pair: "GBP/INR", rate: 108.60, chg: "+0.37%" },
                { pair: "AED/INR", rate: 23.25, chg: "+0.01%" },
                { pair: "JPY/INR", rate: 0.56, chg: "-0.15%" },
              ].map((fx) => (
                <div key={fx.pair} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="font-bold text-foreground">{fx.pair}</span>
                  <div className="text-right">
                    <span className="text-foreground">₹{fx.rate.toFixed(2)}</span>
                    <span className={`ml-2 ${fx.chg.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {fx.chg}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rate Alerts Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>FX Rate Notification Alerts</span>
                <Bell className="h-4 w-4 text-cyan-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="space-y-1.5">
                {rateAlerts.map((alt) => (
                  <div key={alt.id} className="flex items-center justify-between p-2 rounded border border-border/60 bg-muted/20">
                    <div>
                      <span className="font-bold text-foreground">{alt.pair}</span>
                      <span className="text-muted-foreground ml-1.5 text-[11px]">{alt.condition} {alt.target}</span>
                    </div>
                    <Badge variant="cyan">ACTIVE</Badge>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAlert} className="flex gap-2 pt-1">
                <select
                  value={newAlertPair}
                  onChange={(e) => setNewAlertPair(e.target.value)}
                  className="rounded border border-input bg-card px-2 text-[11px] font-mono text-foreground"
                >
                  <option value="USD/INR">USD/INR</option>
                  <option value="EUR/INR">EUR/INR</option>
                  <option value="GBP/INR">GBP/INR</option>
                </select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Target Rate"
                  value={newAlertTarget}
                  onChange={(e) => setNewAlertTarget(e.target.value)}
                  className="text-[11px] h-8"
                  required
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 text-[11px]">
                  Set Alert
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical FX Rates Trajectory Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Historical Foreign Exchange Trajectory (7-Day Rolling Trend)</CardTitle>
          <CardDescription>Simulated interbank exchange rate volatility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FX_HISTORICAL}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[84.5, 86.0]} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="usdInr" name="USD/INR" stroke="#00e5ff" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
