import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  User,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function RegisterView() {
  const { register } = useNexus();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    acceptTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation rules
  const passwordCriteria = [
    { label: "At least 10 characters", valid: formData.password.length >= 10 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(formData.password) },
    { label: "At least one digit (0-9)", valid: /\d/.test(formData.password) },
    { label: "At least one special character (!@#$...)", valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const isPasswordValid = passwordCriteria.every((c) => c.valid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all security policy requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.acceptTerms) {
      setError("Please accept the Platform Terms of Service to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(res.error || "Registration failed. Username or email may already be registered.");
      }
    } catch (err) {
      setError("An unexpected error occurred during account provisioning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent text-foreground relative overflow-hidden py-12">
      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-black font-black text-xl mb-1 shadow-lg shadow-white/10 font-mono">
            NX
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Register for <span className="text-zinc-400">BlockPay Nexus</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Provision ISO 20022 Multi-Asset Wallet & FinTech Identity
          </p>
        </div>

        <Card className="border-border bg-[#0F0F0F]/85 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Create Account</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-400">
                FOSS COMPLIANT
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Fill in your details below to activate your cryptographic ledger.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Account provisioned successfully! Redirecting to sign in...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. alex_nexus"
                    className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@nexus.fintech"
                    className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Account Role & Access Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "USER", label: "Trader / User", desc: "Digital Wallet & Portfolio" },
                    { id: "ADMIN", label: "Admin", desc: "Platform Operations" },
                    { id: "AUDITOR", label: "Auditor", desc: "Compliance & Fraud" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        formData.role === r.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-foreground">{r.label}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 pr-9 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
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

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password Policy Checklist */}
              <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">
                  SRS BR-02 Password Standards:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono">
                  {passwordCriteria.map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 ${
                        c.valid ? "text-emerald-400" : "text-muted-foreground/70"
                      }`}
                    >
                      {c.valid ? <Check className="h-3 w-3 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0 ml-1 mr-0.5" />}
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500 bg-muted/30 h-3.5 w-3.5"
                  />
                  <span className="text-muted-foreground text-[11px]">
                    I agree to the <span className="text-foreground underline">Terms of Service</span> and acknowledge non-custodial EVM ledger rules.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2 text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                {loading ? "Provisioning Ledger Account..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-2 border-t border-border/60 text-xs">
            <span className="text-muted-foreground">Already have an account?</span>
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In Instead
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
