import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Smartphone,
  Lock,
  Unlock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Laptop,
  Layers,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch, Progress } from "../components/ui/skeleton";
import { SetTransactionPinModal } from "../components/SetTransactionPinModal";

export function SecurityView() {
  const { user, fiatWallet, setWalletStatus } = useNexus();
  const [twoFactor, setTwoFactor] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: "sess_1",
      device: "Windows 11 (Chrome 128)",
      ip: "103.112.44.18 (Bengaluru, IN)",
      current: true,
      lastActive: "Active now",
    },
    {
      id: "sess_2",
      device: "Apple iPhone 15 Pro (Safari Mobile)",
      ip: "49.207.210.95 (Chennai, IN)",
      current: false,
      lastActive: "2 hours ago",
    },
  ]);
  const [notice, setNotice] = useState(null);

  const securityScore = (twoFactor ? 40 : 0) + (pinEnabled ? 30 : 0) + (fiatWallet.status === "ACTIVE" ? 15 : 30);

  const terminateSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setNotice("Session successfully revoked.");
  };

  const handleToggleFreeze = () => {
    if (fiatWallet.status === "ACTIVE") {
      setWalletStatus("FROZEN", "Emergency Freeze triggered from Security Center");
      setNotice("Emergency Freeze activated: All outgoing transactions locked.");
    } else {
      setWalletStatus("ACTIVE", "Security unlock verified");
      setNotice("Wallets unfrozen: Normal operations resumed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Security & Identity Command Center
            <Badge variant="cyan">ZERO-TRUST</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographic key management, dual-factor authentication, device fingerprinting, and session isolation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {fiatWallet.status === "ACTIVE" ? (
            <Button variant="destructive" size="sm" onClick={handleToggleFreeze} className="flex items-center space-x-1">
              <Lock className="h-3.5 w-3.5" />
              <span>Emergency Freeze</span>
            </Button>
          ) : (
            <Button variant="emerald" size="sm" onClick={handleToggleFreeze} className="flex items-center space-x-1">
              <Unlock className="h-3.5 w-3.5" />
              <span>Unfreeze Wallets</span>
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs flex justify-between items-center">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-mono text-xs opacity-70 hover:opacity-100">
            DISMISS
          </button>
        </div>
      )}

      {/* Security Health Score Card */}
      <Card className="border-cyan-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Security Posture Index</CardTitle>
              <CardDescription>
                Calculated on cryptographic configuration and active risk mitigation policies
              </CardDescription>
            </div>
            <div className="text-right font-mono">
              <span className="text-2xl font-bold text-cyan-400">{securityScore}/100</span>
              <span className="text-[10px] text-muted-foreground block uppercase">HARDENED</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={securityScore} max={100} barClassName="bg-cyan-400" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>BCrypt Salt Work Factor: 12</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>JWT Secret Entropy: 256-bit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>EVM Smart Contract Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication & PIN Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA & PIN Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Two-Factor Authentication & Verification PIN</CardTitle>
            <CardDescription>Multi-factor verification on fund withdrawals and conversions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-cyan-400" />
                  Time-based One-Time Password (TOTP 2FA)
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Requires 6-digit authenticator code on sensitive operations
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-cyan-400" />
                  6-Digit Cryptographic Transaction PIN
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Mandatory PIN authorization for P2P transfers and conversions
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPinModalOpen(true)}
                  className="text-xs h-7 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10"
                >
                  Set / Change PIN
                </Button>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  ENFORCED
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-muted-foreground">
              <span>Failed Login Cool-down:</span>
              <span className="text-foreground">Lock after 5 failed attempts (SRS FR-AUTH-010)</span>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Wallet Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Emergency Wallet Kill-Switch</CardTitle>
            <CardDescription>Instant freeze of all fiat & crypto debit gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Wallet Operational State:</span>
                <Badge variant={fiatWallet.status === "ACTIVE" ? "success" : "destructive"}>
                  {fiatWallet.status}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                When FROZEN, all debit transfers, conversions, and withdrawals are immediately rejected by the API Gateway before any ledger entry is created.
              </p>
            </div>

            <Button
              variant={fiatWallet.status === "ACTIVE" ? "destructive" : "emerald"}
              size="sm"
              onClick={handleToggleFreeze}
              className="w-full text-xs font-mono"
            >
              {fiatWallet.status === "ACTIVE" ? "TRIGGER EMERGENCY FREEZE" : "AUTHORIZE UNFREEZE"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Device Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Active Authorized Sessions</CardTitle>
          <CardDescription>Devices and client runtimes currently authenticated under your JWT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-muted/60 text-cyan-400">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground flex items-center gap-2">
                    {s.device}
                    {s.current && <Badge variant="cyan">CURRENT</Badge>}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{s.ip} &bull; {s.lastActive}</div>
                </div>
              </div>

              {!s.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => terminateSession(s.id)}
                  className="text-xs hover:border-rose-500 hover:text-rose-400"
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <SetTransactionPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={() => setNotice("Transaction PIN updated and secured successfully.")}
      />
    </div>
  );
}
