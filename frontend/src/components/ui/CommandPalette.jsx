import React, { useState, useEffect } from "react";
import { Search, ArrowRight, Wallet, TrendingUp, Shield, Cpu, Newspaper, FileCode2, Lock, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const commands = [
    { id: "dash", title: "Overview Dashboard", category: "Navigation", icon: TrendingUp, action: () => navigate("/") },
    { id: "wallet", title: "Digital Wallet (Fiat & Crypto)", category: "Navigation", icon: Wallet, action: () => navigate("/wallet") },
    { id: "markets", title: "Financial Markets (Stocks & Crypto)", category: "Navigation", icon: TrendingUp, action: () => navigate("/markets") },
    { id: "portfolio", title: "Investment Portfolio & Risk", category: "Navigation", icon: TrendingUp, action: () => navigate("/portfolio") },
    { id: "news", title: "Financial News & Sentiment", category: "Navigation", icon: Newspaper, action: () => navigate("/news") },
    { id: "exchange", title: "Currency Converter & FX Rates", category: "Navigation", icon: ArrowRight, action: () => navigate("/exchange") },
    { id: "ai", title: "Nexus Financial Copilot", category: "Intelligence", icon: Cpu, action: () => navigate("/ai") },
    { id: "security", title: "Security Center & 2FA", category: "Security", icon: Shield, action: () => navigate("/security") },
    { id: "admin", title: "Admin Console & Fraud Engine", category: "Admin", icon: Lock, action: () => navigate("/admin") },
    { id: "services", title: "Microservices Health Dashboard", category: "System", icon: Terminal, action: () => navigate("/admin/services") },
    { id: "testing", title: "Testing Dashboard & Verification", category: "System", icon: FileCode2, action: () => navigate("/admin/testing") },
    { id: "sentinel", title: "Legacy Sentinel Tactical HUD", category: "Legacy", icon: Terminal, action: () => navigate("/sentinel") },
    
    // Quick Actions
    { id: "act-send", title: "Send Money / Transfer Funds", category: "Actions", icon: Wallet, action: () => navigate("/wallet?action=transfer") },
    { id: "act-topup", title: "Add Simulated Fiat Funds", category: "Actions", icon: Wallet, action: () => navigate("/wallet?action=topup") },
    { id: "act-btc", title: "Inspect Bitcoin (BTC) Price & Details", category: "Assets", icon: TrendingUp, action: () => navigate("/markets?asset=BTC") },
    { id: "act-eth", title: "Inspect Ethereum (ETH) Price & Details", category: "Assets", icon: TrendingUp, action: () => navigate("/markets?asset=ETH") },
    { id: "act-nifty", title: "Inspect NIFTY 50 Benchmark", category: "Assets", icon: TrendingUp, action: () => navigate("/markets?asset=NIFTY") },
    { id: "act-gold", title: "Inspect Gold BeES ETF", category: "Assets", icon: TrendingUp, action: () => navigate("/markets?asset=GOLDBEES") },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 text-cyan-400 shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Type a command, asset, or page... (e.g. 'Bitcoin', 'Transfer', 'AI')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onOpenChange(false);
                      item.action();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors group cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1 rounded bg-slate-800/80 text-cyan-400 group-hover:bg-cyan-500/20">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-slate-200">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border/50 bg-slate-900/50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>BlockPay Nexus Quick Terminal</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
