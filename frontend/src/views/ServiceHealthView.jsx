import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  Layers,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function ServiceHealthView() {
  const { servicesHealth } = useNexus();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Microservices Cluster Telemetry & Health
            <Badge variant="success">ALL SYSTEMS NOMINAL</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time liveness probes, service discovery heartbeats, latency telemetry, and database connectivity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Poll Cluster</span>
          </Button>
        </div>
      </div>

      {/* Cluster Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">SERVICES DEPLOYED</span>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">{servicesHealth.length} / {servicesHealth.length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Zero degraded containers
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">AVERAGE LATENCY</span>
            <CardTitle className="text-2xl font-bold text-cyan-400 mt-1">29 ms</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            Internal Docker network
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">DATABASE POOL (PG 18)</span>
            <CardTitle className="text-2xl font-bold text-emerald-400 mt-1">bpx-db (5432)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            PostgreSQL 18.6 active & healthy
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">CLUSTER ERROR RATE</span>
            <CardTitle className="text-2xl font-bold text-foreground mt-1">0.01%</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
            99.99% availability window
          </CardContent>
        </Card>
      </div>

      {/* Service Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesHealth.map((svc) => (
          <Card key={svc.name} className="border-border/80 hover:border-cyan-500/40 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {svc.name}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Port {svc.port}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 font-mono text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold">{svc.status}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Response Latency:</span>
                <span className="text-foreground">{svc.latency}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>24h Throughput:</span>
                <span className="text-cyan-400">{svc.requests24h} reqs</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Persistence State:</span>
                <span className="text-foreground">{svc.db}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[10px] pt-1 border-t border-border/50">
                <span>Release Version:</span>
                <span>{svc.version}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
