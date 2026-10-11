import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
  Search,
  Filter,
  CheckCheck,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function NotificationsView() {
  const { notifications, markAllNotificationsRead, deleteNotification } = useNexus();

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifs = notifications.filter((n) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "SECURITY" && (n.type.includes("SECURITY") || n.type.includes("FRAUD"))) ||
      (activeFilter === "TRANSFERS" && (n.type.includes("TRANSFER") || n.type.includes("WALLET"))) ||
      (activeFilter === "MARKET" && n.type.includes("MARKET"));

    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Notification & Dispatch Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time event logging, security alerts, and financial transaction dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllNotificationsRead}
              className="text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5 text-cyan-400" />
              Mark all as read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "SECURITY", "TRANSFERS", "MARKET"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeFilter === cat
                  ? "bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full rounded-lg border border-border bg-muted/20 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No notifications found</p>
              <p className="text-xs">No alerts currently match your selected filter criteria.</p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const isSecurity = n.type.includes("SECURITY") || n.type.includes("FRAUD");
              return (
                <div
                  key={n.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    n.unread ? "bg-cyan-500/5 hover:bg-cyan-500/10" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSecurity
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {isSecurity ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-foreground">{n.title}</h4>
                        {n.unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        )}
                        <Badge variant="outline" className="text-[9px] font-mono border-border">
                          {n.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      <span className="text-[10px] font-mono text-muted-foreground/70">{n.timestamp}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Dismiss alert"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
