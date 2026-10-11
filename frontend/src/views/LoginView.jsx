import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileCheck2,
  Cpu,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function LoginView() {
  const { login } = useNexus();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleQuickFill = (u, p) => {
    setIdentifier(u);
    setPassword(p);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!identifier.trim() || !password) {
      setError("Please provide both username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        setSuccessMsg(`Access Granted. Welcome back, ${res.user.name || res.user.username}!`);
        setTimeout(() => {
          navigate("/");
        }, 600);
      } else {
        setError(res.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent text-foreground relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Platform Identity */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-black font-black text-xl mb-1 shadow-lg shadow-white/10 font-mono">
            NX
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            BLOCKPAY <span className="text-zinc-400">NEXUS</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            AERIS Precision Terminal &bull; ISO 20022 Digital Wallet &bull; EVM Audit
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="border-border bg-[#0F0F0F]/85 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Terminal Sign In</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-400">
                ZERO-TRUST SECURE
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Enter your credentials or click a pre-seeded account below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Quick Demo Login Presets */}
            <div className="space-y-1.5 pb-2 border-b border-border/60">
              <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                Instant Demo Quick-Fill:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill("kiran_nexus", "NexusPass#2026")}
                  className="px-2 py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-left transition-all"
                >
                  <div className="text-[11px] font-semibold text-foreground">User</div>
                  <div className="text-[9px] text-muted-foreground font-mono truncate">kiran_nexus</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin_root", "AdminSecure#2026")}
                  className="px-2 py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-purple-500/10 hover:border-purple-500/40 text-left transition-all"
                >
                  <div className="text-[11px] font-semibold text-purple-400">Admin</div>
                  <div className="text-[9px] text-muted-foreground font-mono truncate">admin_root</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("auditor_sec", "AuditorKey#2026")}
                  className="px-2 py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left transition-all"
                >
                  <div className="text-[11px] font-semibold text-emerald-400">Auditor</div>
                  <div className="text-[9px] text-muted-foreground font-mono truncate">auditor_sec</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Username or Email</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Required</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. kiran_nexus or kiran@blockpay.nexus"
                    className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-9 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500 bg-muted/30 h-3.5 w-3.5"
                  />
                  <span className="text-muted-foreground text-[11px]">Remember terminal session</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2 text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Authenticating Session...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-muted-foreground">Don't have an account?</span>
              <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
                Register New User
              </Link>
            </div>
            <div className="w-full text-center">
              <Link to="/" className="text-[11px] text-muted-foreground hover:text-foreground">
                ← Return to Platform (Guest Mode)
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Security & Infrastructure Footer */}
        <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-muted-foreground/80">
          <span className="flex items-center gap-1">
            <FileCheck2 className="h-3 w-3 text-cyan-400" /> EVM Ledger
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-400" /> PBKDF2 100k
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-purple-400" /> ISO 20022
          </span>
        </div>
      </div>
    </div>
  );
}
