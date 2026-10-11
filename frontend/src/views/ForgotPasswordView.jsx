import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";

export function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent text-foreground relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-black font-black text-xl mb-1 shadow-lg shadow-white/10 font-mono">
            NX
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Account Recovery
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Cryptographic Key Reset & Multi-Factor Verification
          </p>
        </div>

        <Card className="border-border bg-[#0F0F0F]/85 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Reset Password</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email address to receive password reset instructions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {submitted ? (
              <div className="space-y-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Recovery Instructions Dispatched</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We have dispatched an ephemeral password recovery token to <strong className="text-foreground">{email}</strong>. Please check your inbox and authenticate the request within 15 minutes.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-mono text-xs"
                  >
                    <ArrowLeft className="h-3 w-3" /> Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kiran@blockpay.nexus"
                      className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2 text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/60 text-xs justify-center">
            <Link to="/login" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
