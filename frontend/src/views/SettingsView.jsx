import React, { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
  Copy,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { SetTransactionPinModal } from "../components/SetTransactionPinModal";

export function SettingsView() {
  const { user, updateUserProfile, theme, toggleTheme, transactionPin, updateTransactionPin, verifyTransactionPin } = useNexus();

  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user.name || user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled ?? true);
  const [apiKey, setApiKey] = useState("bpx_live_sec_89f0293da74e11b32948c201");
  const [savedMsg, setSavedMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  // Transaction PIN change state
  const [showPinChange, setShowPinChange] = useState(false);
  const [setPinModalOpen, setSetPinModalOpen] = useState(false);
  const [directPinMode, setDirectPinMode] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinFormError, setPinFormError] = useState("");
  const [pinFormSuccess, setPinFormSuccess] = useState("");

  const handleUpdatePin = (e) => {
    e.preventDefault();
    setPinFormError("");
    setPinFormSuccess("");

    if (!directPinMode) {
      if (!verifyTransactionPin(currentPinInput)) {
        setPinFormError("Current PIN is incorrect.");
        return;
      }
    }
    if (!/^\d{6}$/.test(newPinInput)) {
      setPinFormError("New PIN must be exactly 6 numeric digits.");
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinFormError("New PIN confirmation does not match.");
      return;
    }

    updateTransactionPin(newPinInput);
    setPinFormSuccess("Transaction PIN updated and secured successfully!");
    setCurrentPinInput("");
    setNewPinInput("");
    setConfirmPinInput("");
    setTimeout(() => {
      setShowPinChange(false);
      setPinFormSuccess("");
    }, 2000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email, twoFactorEnabled: twoFactor });
    setSavedMsg("Profile settings updated successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleRegenerateKey = () => {
    const newKey = `bpx_live_sec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    setSavedMsg("New API Key generated successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Platform Settings & Preferences
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your digital identity, cryptographic keys, notifications, and base currency.
          </p>
        </div>
        {savedMsg && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono animate-fadeIn">
            <CheckCircle2 className="h-4 w-4" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1">
          <TabsTrigger value="profile" className="text-xs flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Profile & Identity
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Preferences & Display
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Security & 2FA
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notification Rules
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" /> Developer API Keys
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Identity */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">User Profile & KYC Verification</CardTitle>
                  <CardDescription className="text-xs">
                    Your institutional trader identity and cryptographic identifier.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-mono">
                  KYC TIER 3 VERIFIED
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-border/60">
                  <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center text-xl font-bold text-cyan-400 font-mono shadow-md shadow-cyan-500/20">
                    {user.username?.slice(0, 2).toUpperCase() || "NX"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{user.name || user.username}</h3>
                    <p className="text-xs text-muted-foreground font-mono">User ID: {user.id || "usr_bpx_90214"}</p>
                    <span className="text-[10px] font-mono text-cyan-400">ROLE: {user.role || "USER"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Username</label>
                    <input
                      type="text"
                      value={user.username || ""}
                      disabled
                      className="w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground font-mono cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Phone Number</label>
                    <input
                      type="text"
                      defaultValue="+91 98765 43210"
                      className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Preferences & Display */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Terminal Preferences</CardTitle>
              <CardDescription className="text-xs">
                Configure base valuation currency, numerical formats, and display themes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Base Currency</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="INR">INR (₹) - Indian Rupee (Default)</option>
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Terminal Theme</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={theme !== "dark" ? toggleTheme : undefined}
                      className="flex-1 text-xs"
                    >
                      Dark Mode (Trading Desk)
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={theme !== "light" ? toggleTheme : undefined}
                      className="flex-1 text-xs"
                    >
                      Light Mode
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Security & 2FA */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Policies & Multi-Factor Auth</CardTitle>
              <CardDescription className="text-xs">
                Manage your TOTP 2FA, 6-digit transaction PIN, and session security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Two-Factor Authentication (TOTP)</h4>
                    <p className="text-[11px] text-muted-foreground">Requires an authenticator app code for sensitive operations.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="rounded border-border text-cyan-500 focus:ring-cyan-500 h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">6-Digit Transaction PIN</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Status: <strong className="text-emerald-400 font-mono">CONFIGURED & ENFORCED (● ● ● ● ● ●)</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setSetPinModalOpen(true)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-7 shadow-xs"
                    >
                      Set with Keypad
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPinChange(!showPinChange);
                        setPinFormError("");
                        setPinFormSuccess("");
                      }}
                      className="text-xs h-7"
                    >
                      {showPinChange ? "Hide Form" : "Custom Form"}
                    </Button>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                      ENFORCED
                    </Badge>
                  </div>
                </div>

                {showPinChange && (
                  <form onSubmit={handleUpdatePin} className="pt-3 border-t border-border/60 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Configure 6-Digit Transaction PIN</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setDirectPinMode(true)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            directPinMode ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Direct Set / Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirectPinMode(false)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            !directPinMode ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Verify Current
                        </button>
                      </div>
                    </div>

                    {pinFormError && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{pinFormError}</span>
                      </div>
                    )}
                    {pinFormSuccess && (
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{pinFormSuccess}</span>
                      </div>
                    )}

                    <div className={`grid grid-cols-1 ${!directPinMode ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
                      {!directPinMode && (
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">Current PIN</label>
                          <input
                            type="password"
                            maxLength={6}
                            value={currentPinInput}
                            onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ""))}
                            placeholder="Current 6 digits"
                            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs font-mono tracking-widest text-foreground focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">New 6-Digit PIN</label>
                        <input
                          type="password"
                          maxLength={6}
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="6 digits"
                          className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs font-mono tracking-widest text-foreground focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Confirm New PIN</label>
                        <input
                          type="password"
                          maxLength={6}
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ""))}
                          placeholder="Re-enter 6 digits"
                          className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs font-mono tracking-widest text-foreground focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPinChange(false)}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7"
                      >
                        Save & Activate PIN
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Subscriptions</CardTitle>
              <CardDescription className="text-xs">
                Select which system and financial alerts you receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "High-Value Transaction Alerts", desc: "Notify when transfers exceed ₹50,000", defaultChecked: true },
                { title: "Fraud & Security Dispatches", desc: "Real-time alerts for login attempts and velocity checks", defaultChecked: true },
                { title: "Market Volatility & Price Alerts", desc: "Breaking price moves on owned assets (BTC, ETH, NIFTY)", defaultChecked: true },
                { title: "Smart Contract On-Chain Anchors", desc: "Confirmation when transactions are sealed in EVM block", defaultChecked: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
                  <div>
                    <h4 className="text-xs font-medium text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: API Keys */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Developer API Access & Webhooks</CardTitle>
              <CardDescription className="text-xs">
                Authenticate programmatically with the BlockPay Nexus microservices gateway.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Active Secret API Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-cyan-400 select-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyKey}
                    className="shrink-0 text-xs flex items-center gap-1.5"
                  >
                    {copiedKey ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateKey}
                    className="shrink-0 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Roll Key
                  </Button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Keep this key confidential. Anyone with this key can initiate ISO 20022 transfers within your daily limits.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SetTransactionPinModal
        isOpen={setPinModalOpen}
        onClose={() => setSetPinModalOpen(false)}
        onSuccess={() => {
          setSavedMsg("Transaction PIN configured and activated successfully!");
          setTimeout(() => setSavedMsg(""), 3000);
        }}
      />
    </div>
  );
}
