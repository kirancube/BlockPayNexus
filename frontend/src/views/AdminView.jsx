import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  ShieldAlert,
  Wallet,
  Activity,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  CheckCircle,
  Database,
  Lock,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { OTHER_USERS } from "../data/mockData";
import { formatINR } from "../lib/utils";

export function AdminView() {
  const { user, fraudAlerts, transactions, servicesHealth, totalPortfolioValue } = useNexus();
  const navigate = useNavigate();

  const totalUsers = 42;
  const activeUsers = 38;
  const totalVolume24h = 14500000;
  const onlineServices = servicesHealth.filter((s) => s.status === "Healthy").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Administrator Command Console
            <Badge variant="purple">ADMIN ROOT</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Global ledger governance, multi-service orchestration, fraud review dispatch, and system integrity telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="terminal" onClick={() => navigate("/admin/fraud")}>
            Open Fraud Engine &rarr;
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/services")}>
            Service Health &rarr;
          </Button>
        </div>
      </div>

      {/* Admin KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">TOTAL REGISTERED USERS</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-foreground mt-1">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-mono">
            {activeUsers} Active (90.4% Daily Active)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">24H AGGREGATE VOLUME</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              {formatINR(totalVolume24h)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-mono">
            328 Transactions Settled
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">PENDING FRAUD ALERTS</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-rose-400 mt-1">
              {fraudAlerts.filter((f) => f.status === "REVIEW_PENDING").length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-mono">
            High Velocity / Anomaly Flags
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[10px]">MICROSERVICES ONLINE</CardDescription>
            <CardTitle className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {onlineServices} / {servicesHealth.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-mono">
            Mean Cluster Latency: 31ms
          </CardContent>
        </Card>
      </div>

      {/* User Management & Security Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Registered Accounts & Access Roles</CardTitle>
          <CardDescription>Role-based access control (RBAC): USER, ADMIN, and AUDITOR policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase text-muted-foreground bg-muted/20">
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Wallet State</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                <tr className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-cyan-400">{user.id}</td>
                  <td className="py-3 px-3 font-bold text-foreground">{user.username} (You)</td>
                  <td className="py-3 px-3 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-3">
                    <Badge variant="cyan">{user.role}</Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={user.walletStatus === "ACTIVE" ? "success" : "destructive"}>
                      {user.walletStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Inspect
                    </Button>
                  </td>
                </tr>
                {OTHER_USERS.map((ou) => (
                  <tr key={ou.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 text-muted-foreground">{ou.id}</td>
                    <td className="py-3 px-3 font-medium text-foreground">{ou.username}</td>
                    <td className="py-3 px-3 text-muted-foreground">{ou.email}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline">
                        {ou.username.includes("admin") ? "ADMIN" : ou.username.includes("auditor") ? "AUDITOR" : "USER"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="success">ACTIVE</Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Inspect
                      </Button>
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

export function FraudEngineView() {
  const { fraudAlerts, setFraudAlerts } = useNexus();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleUpdateAlert = (id, newStatus) => {
    setFraudAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Chain of Responsibility Fraud Engine
            <Badge variant="destructive">RULE PIPELINE</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rule-based & ML-assisted anomaly scoring, velocity checks, and policy-driven wallet restriction.
          </p>
        </div>
      </div>

      {/* Rules Pipeline Description */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">RULE 1</span>
            <CardTitle className="text-sm font-bold text-foreground">Velocity Surge</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Flags &gt; 5 transactions within a 60-second window. Risk weight: +35.
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">RULE 2</span>
            <CardTitle className="text-sm font-bold text-foreground">High Materiality</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Transactions exceeding ₹3,00,000 threshold without prior KYC history. Risk weight: +40.
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">RULE 3</span>
            <CardTitle className="text-sm font-bold text-foreground">Counterparty Blacklist</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Checks recipient address against known fraudulent clusters. Risk weight: +50.
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">POLICY ACTION</span>
            <CardTitle className="text-sm font-bold text-rose-400">Score &gt; 75 &rarr; BLOCK</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Automatically prohibits settlement and alerts compliance reviewer.
          </CardContent>
        </Card>
      </div>

      {/* Fraud Incidents Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Flagged Transactions & Anomaly Incidents</CardTitle>
          <CardDescription>Real-time queue of transactions triaged by the scoring engine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase text-muted-foreground bg-muted/20">
                  <th className="py-2.5 px-3">Alert ID</th>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Automated Decision</th>
                  <th className="py-2.5 px-3">Rules Triggered</th>
                  <th className="py-2.5 px-3">Review Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {fraudAlerts.map((fa) => (
                  <tr key={fa.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-rose-400">{fa.id}</td>
                    <td className="py-3 px-3 text-cyan-400">{fa.transactionId}</td>
                    <td className="py-3 px-3 text-foreground font-bold">{fa.user}</td>
                    <td className="py-3 px-3 text-foreground font-bold">{fa.amount}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-400">{fa.riskScore} / 100</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="destructive">{fa.decision}</Badge>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-muted-foreground">
                      {fa.rulesTriggered.join(", ")}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          fa.status === "REVIEW_PENDING"
                            ? "warning"
                            : fa.status === "CONFIRMED_FRAUD"
                            ? "destructive"
                            : "success"
                        }
                      >
                        {fa.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateAlert(fa.id, "CONFIRMED_FRAUD")}
                        className="h-7 text-[10px]"
                      >
                        Confirm Fraud
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateAlert(fa.id, "FALSE_POSITIVE")}
                        className="h-7 text-[10px]"
                      >
                        Dismiss
                      </Button>
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
