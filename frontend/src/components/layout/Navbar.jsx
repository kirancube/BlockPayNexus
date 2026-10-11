import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronDown,
  Terminal,
  LogOut,
  LogIn,
  Settings,
  UserPlus,
} from "lucide-react";
import { useNexus } from "../../context/NexusContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Drawer } from "../ui/dialog";
import { formatINR } from "../../lib/utils";

export function Navbar() {
  const {
    theme,
    toggleTheme,
    isAuthenticated,
    logout,
    user,
    switchRole,
    markets,
    notifications,
    markAllNotificationsRead,
    setCommandPaletteOpen,
    totalPortfolioValue,
  } = useNexus();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Filter major tickers for navbar pulse
  const tickerItems = markets.filter((m) =>
    ["NIFTY 50", "BTC", "ETH", "USD/INR", "GOLD (XAU)"].includes(m.symbol)
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-[#080808]/75 px-4 sm:px-6 backdrop-blur-md">
        {/* Left: Brand & Market Pulse */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-black text-xs font-mono shadow-md shadow-white/10">
              NX
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-sm flex items-center gap-1.5 font-sans">
                BLOCKPAY <span className="text-white font-semibold">NEXUS</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 tracking-wider">
                  AERIS
                </span>
              </span>
            </div>
          </Link>

          {/* Market Pulse Ticker */}
          <div className="hidden lg:flex items-center space-x-3 border-l border-border pl-4 text-xs">
            {tickerItems.map((ticker) => {
              const isPositive = ticker.changePct >= 0;
              return (
                <div key={ticker.symbol} className="flex items-center space-x-1.5 font-mono text-[11px]">
                  <span className="text-muted-foreground font-semibold">{ticker.symbol}:</span>
                  <span className="text-foreground">
                    {ticker.symbol === "BTC"
                      ? `₹${(ticker.price / 100000).toFixed(1)}L`
                      : ticker.symbol.includes("INR")
                      ? `₹${ticker.price}`
                      : ticker.price.toLocaleString("en-IN")}
                  </span>
                  <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                    {isPositive ? "+" : ""}
                    {ticker.changePct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Actions, Role Selector, Search, Notifications, Theme */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search / Command Palette */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center space-x-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:border-cyan-500/50 hover:text-foreground transition-all"
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search assets, commands...</span>
            <kbd className="rounded border border-border/70 bg-card px-1.5 py-0.5 text-[10px] font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-mono font-medium hover:border-slate-600 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span>ROLE: {user.role}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-border bg-card p-1.5 shadow-xl z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Select User Context
                </div>
                {["USER", "ADMIN", "AUDITOR"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                      user.role === r
                        ? "bg-cyan-500/10 text-cyan-400 font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{r}</span>
                    {user.role === r && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setNotifOpen(true)}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* User Profile Pill or Sign In / Register buttons */}
          {isAuthenticated ? (
            <div className="relative pl-2 border-l border-border">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted/40 transition-colors text-left"
              >
                <div className="h-7 w-7 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400 font-mono">
                  {user.username ? user.username.slice(0, 2).toUpperCase() : "NX"}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-foreground leading-none">{user.username}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {formatINR(totalPortfolioValue)}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl z-50 text-xs animate-fadeIn">
                  <div className="p-2 border-b border-border/60">
                    <div className="font-semibold text-foreground text-xs">{user.name || user.username}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{user.email || "user@blockpay.nexus"}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {user.role}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400">KYC ACTIVE</span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/security"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5 text-purple-400" />
                      <span>Security Center</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Bell className="h-3.5 w-3.5 text-amber-400" />
                      <span>Notification Hub</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-border/60">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                        navigate("/login");
                      }}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2 border-l border-border">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5 text-cyan-400" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Notifications Drawer */}
      <Drawer
        open={notifOpen}
        onOpenChange={setNotifOpen}
        title="Notifications & System Dispatch"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
            <span className="text-muted-foreground">{notifications.length} events logged</span>
            <button
              onClick={markAllNotificationsRead}
              className="text-cyan-400 hover:underline font-mono text-[11px]"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border text-xs transition-colors ${
                  notif.unread
                    ? "border-cyan-500/30 bg-cyan-500/5 text-foreground"
                    : "border-border/60 bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    {notif.type.includes("SECURITY") ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                    )}
                    {notif.title}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex justify-center">
            <Link
              to="/notifications"
              onClick={() => setNotifOpen(false)}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              Open Full Notification & Dispatch Center →
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
}
