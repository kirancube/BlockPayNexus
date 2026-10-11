import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Newspaper,
  ArrowLeftRight,
  BarChart3,
  Bot,
  ShieldAlert,
  Sliders,
  Terminal,
  Activity,
  FileCheck2,
  CheckCircle,
  Database,
  ExternalLink,
  Settings,
  Bell,
  LogOut,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNexus } from "../../context/NexusContext";

export function Sidebar() {
  const { user, isAuthenticated, logout, notifications } = useNexus();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter((n) => n.unread).length;

  const navSections = [
    {
      title: "Core Platform",
      items: [
        { name: "Command Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Digital Wallet", path: "/wallet", icon: Wallet },
        { name: "Financial Markets", path: "/markets", icon: TrendingUp },
        { name: "Investment Portfolio", path: "/portfolio", icon: PieChart },
        { name: "Financial News & Sentiment", path: "/news", icon: Newspaper },
        { name: "FX Exchange & Converter", path: "/exchange", icon: ArrowLeftRight },
        { name: "Deep Analytics", path: "/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Intelligence & Security",
      items: [
        { name: "Nexus AI Copilot", path: "/ai", icon: Bot, badge: "AI 2.0" },
        { name: "Security Center", path: "/security", icon: ShieldAlert },
        {
          name: "Notifications Hub",
          path: "/notifications",
          icon: Bell,
          badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined,
        },
      ],
    },
    {
      title: "Administration & Audit",
      items: [
        { name: "Admin Console", path: "/admin", icon: Sliders },
        { name: "Fraud Detection Engine", path: "/admin/fraud", icon: ShieldAlert, badge: "RULES" },
        { name: "Blockchain Audit Ledger", path: "/admin/blockchain", icon: FileCheck2, badge: "EVM" },
        { name: "Microservices Health", path: "/admin/services", icon: Activity },
        { name: "Testing Dashboard", path: "/admin/testing", icon: CheckCircle },
      ],
    },
    {
      title: "Platform Settings",
      items: [
        { name: "Account & Preferences", path: "/settings", icon: Settings },
        { name: "Sentinel Tactical HUD", path: "/sentinel", icon: Terminal, badge: "LEGACY" },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-[#080808]/75 backdrop-blur-md shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              {sec.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-white/10 text-white font-semibold border border-white/20 shadow-xs"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-white" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 bg-white/5 group-hover:border-white/30 group-hover:text-white transition-colors">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Telemetry Footer */}
      <div className="p-2.5 border-t border-border/80 bg-muted/20 text-[10px] font-mono space-y-1 text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            API Gateway
          </span>
          <span className="text-foreground font-semibold">Port 8000</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Relational Store</span>
          <span className="text-cyan-400">PostgreSQL 16</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Smart Contract</span>
          <span className="text-purple-400">Hardhat EVM</span>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-2.5 border-t border-border bg-card/60">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400 font-mono shrink-0">
                {user.username ? user.username.slice(0, 2).toUpperCase() : "NX"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate">{user.name || user.username}</span>
                <span className="text-[10px] text-cyan-400 font-mono leading-none">{user.role}</span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In to Terminal</span>
          </button>
        )}
      </div>
    </aside>
  );
}
