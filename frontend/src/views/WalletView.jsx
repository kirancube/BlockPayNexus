import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  Layers,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog, Drawer } from "../components/ui/dialog";
import { SetTransactionPinModal } from "../components/SetTransactionPinModal";
import { formatINR, formatCrypto, formatUSD } from "../lib/utils";

export function WalletView() {
  const {
    fiatWallet,
    cryptoWallets,
    transactions,
    addFiatFunds,
    sendMoney,
    transactionPin,
    verifyTransactionPin,
    selectedTx,
    setSelectedTx,
    simulateTamperTransaction,
    verifyTransactionOnChain,
    setWalletStatus,
  } = useNexus();

  // Modals state
  const [topupOpen, setTopupOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [setPinOpen, setSetPinOpen] = useState(false);
  const [transferStep, setTransferStep] = useState("DETAILS"); // "DETAILS" | "PIN" | "PROCESSING"
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [topupAmount, setTopupAmount] = useState("25000");
  const [transferData, setTransferData] = useState({
    recipient: "daniel_dev",
    amount: "10000",
    currency: "INR",
  });
  const [txFilter, setTxFilter] = useState("ALL");
  const [txSearch, setTxSearch] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  // Verification state for active drawer
  const [verificationResult, setVerificationResult] = useState(null);

  const openTransferModal = () => {
    setTransferStep("DETAILS");
    setEnteredPin("");
    setPinError("");
    setIsProcessing(false);
    setTransferOpen(true);
  };

  const handleTopupSubmit = (e) => {
    e.preventDefault();
    const res = addFiatFunds(topupAmount);
    if (res.success) {
      setActionMessage({ type: "success", text: `Successfully added ${formatINR(Number(topupAmount))} to Fiat Wallet!` });
      setTopupOpen(false);
    } else {
      setActionMessage({ type: "error", text: res.error });
    }
  };

  const handleProceedToPin = (e) => {
    e.preventDefault();
    const numAmount = Number(transferData.amount);
    if (!transferData.recipient.trim()) {
      setActionMessage({ type: "error", text: "Please provide a valid recipient username or email." });
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setActionMessage({ type: "error", text: "Please enter a valid transfer amount greater than zero." });
      return;
    }
    if (transferData.currency === "INR" && numAmount > fiatWallet.availableBalance) {
      setActionMessage({ type: "error", text: `Insufficient INR balance. Available: ${formatINR(fiatWallet.availableBalance)}` });
      return;
    }
    if (transferData.currency !== "INR") {
      const cryptoItem = cryptoWallets.find((c) => c.asset === transferData.currency);
      if (!cryptoItem || numAmount > cryptoItem.available) {
        setActionMessage({ type: "error", text: `Insufficient ${transferData.currency} balance.` });
        return;
      }
    }

    setPinError("");
    setEnteredPin("");
    setTransferStep("PIN");
  };

  const handlePinDigit = (digit) => {
    if (enteredPin.length < 6) {
      const updated = enteredPin + digit;
      setEnteredPin(updated);
      setPinError("");
    }
  };

  const handlePinBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError("");
  };

  const handlePinClear = () => {
    setEnteredPin("");
    setPinError("");
  };

  const handleVerifyPinAndSend = () => {
    if (enteredPin.length !== 6) {
      setPinError("Please enter your complete 6-digit Transaction PIN.");
      return;
    }

    if (!verifyTransactionPin(enteredPin)) {
      setPinError("Incorrect Transaction PIN. Please check and try again.");
      setEnteredPin("");
      return;
    }

    setPinError("");
    setIsProcessing(true);
    setTransferStep("PROCESSING");

    setTimeout(() => {
      const res = sendMoney({ ...transferData, pin: enteredPin });
      setIsProcessing(false);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: `PIN Verified! Transferred ${transferData.currency} ${transferData.amount} to ${transferData.recipient}. Blockchain hash anchored!`,
        });
        setTransferOpen(false);
        setTransferStep("DETAILS");
        setEnteredPin("");
      } else {
        setActionMessage({ type: "error", text: res.error || "Transfer failed." });
        setTransferOpen(false);
        setTransferStep("DETAILS");
        setEnteredPin("");
      }
    }, 600);
  };

  const handleVerify = (txId) => {
    const res = verifyTransactionOnChain(txId);
    setVerificationResult(res);
  };

  const handleTamper = (txId) => {
    simulateTamperTransaction(txId);
    setVerificationResult({
      status: "TAMPERED",
      message: "ALERT: Transaction amount was maliciously altered in local database! On-chain SHA-256 hash does not match root state.",
    });
  };

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    const matchesFilter = txFilter === "ALL" || tx.type === txFilter;
    const matchesSearch =
      tx.id.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.sender.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.receiver.toLowerCase().includes(txSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Digital Multi-Asset Wallet
            <Badge variant="cyan">DUAL-LEDGER</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sovereign simulated fiat currency & cryptographic digital assets with immutable double-entry book-keeping.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setTopupOpen(true)}
            className="flex items-center space-x-1"
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span>Top-up INR</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openTransferModal}
            className="flex items-center space-x-1"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>P2P Transfer</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSetPinOpen(true)}
            className="flex items-center space-x-1 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10"
          >
            <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
            <span>Set Security PIN</span>
          </Button>
          {fiatWallet.status === "ACTIVE" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setWalletStatus("FROZEN", "User manual security toggle")}
              className="flex items-center space-x-1"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Freeze Wallet</span>
            </Button>
          ) : (
            <Button
              variant="emerald"
              size="sm"
              onClick={() => setWalletStatus("ACTIVE", "User security unlock")}
              className="flex items-center space-x-1"
            >
              <Unlock className="h-3.5 w-3.5" />
              <span>Unfreeze Wallet</span>
            </Button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            actionMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/40 bg-rose-500/10 text-rose-400"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-mono text-xs opacity-70 hover:opacity-100">
            DISMISS
          </button>
        </div>
      )}

      {/* Fiat & Crypto Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fiat Wallet Card */}
        <Card className="border-cyan-500/40 bg-gradient-to-br from-card via-card to-cyan-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-semibold">SOVEREIGN FIAT WALLET</span>
              <Badge variant={fiatWallet.status === "ACTIVE" ? "success" : "destructive"}>
                {fiatWallet.status}
              </Badge>
            </CardDescription>
            <CardTitle className="text-3xl font-mono font-bold text-foreground mt-2">
              {formatINR(fiatWallet.balance)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Available to Transact:</span>
              <span className="font-mono text-foreground font-semibold">{formatINR(fiatWallet.availableBalance)}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Pending in Settlement:</span>
              <span className="font-mono text-muted-foreground">{formatINR(fiatWallet.pendingBalance)}</span>
            </div>
            <div className="flex justify-between pb-1 text-[11px]">
              <span className="text-muted-foreground">24h Top-Up Utilized:</span>
              <span className="font-mono text-amber-400 font-semibold">
                {formatINR(fiatWallet.dailyTopupUsed)} / {formatINR(fiatWallet.dailyTopupLimit)}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <Button size="sm" variant="terminal" onClick={() => setTopupOpen(true)} className="w-full">
                Add Simulated INR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Wallets (BTC & ETH) */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span className="font-mono text-purple-400 font-semibold">MAJOR CRYPTO POOL</span>
              <Badge variant="purple">LAYER-1</Badge>
            </CardDescription>
            <div className="mt-2 space-y-3">
              {cryptoWallets.slice(0, 2).map((cw) => (
                <div key={cw.asset} className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 font-bold text-cyan-400">
                      {cw.icon}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{cw.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">1 {cw.asset} = {formatINR(cw.inrPrice)}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-foreground">{formatCrypto(cw.balance, cw.asset)}</div>
                    <div className="text-[10px] text-muted-foreground">{formatINR(cw.balance * cw.inrPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
              <span>Secured by:</span>
              <span className="text-cyan-400">Deterministic Key Vault</span>
            </div>
          </CardContent>
        </Card>

        {/* Stablecoin & Alt Crypto (USDT & SOL) */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span className="font-mono text-emerald-400 font-semibold">STABLECOIN & ALT ASSETS</span>
              <Badge variant="outline">HIGH-VELOCITY</Badge>
            </CardDescription>
            <div className="mt-2 space-y-3">
              {cryptoWallets.slice(2).map((cw) => (
                <div key={cw.asset} className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 font-bold text-emerald-400">
                      {cw.icon}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{cw.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">1 {cw.asset} = {formatINR(cw.inrPrice)}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-foreground">{formatCrypto(cw.balance, cw.asset)}</div>
                    <div className="text-[10px] text-muted-foreground">{formatINR(cw.balance * cw.inrPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
              <span>Locked for conversions:</span>
              <span className="text-foreground">0.0000 (Available 100%)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History & Filter Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Immutable Ledger Transaction Records</CardTitle>
              <CardDescription>
                Auditable financial transitions with cryptographic blockchain anchoring hashes
              </CardDescription>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center space-x-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter tx, sender, recipient..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>

              <div className="flex items-center rounded-lg bg-muted p-1">
                {["ALL", "TRANSFER", "CONVERSION", "TOPUP"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxFilter(type)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded ${
                      txFilter === type
                        ? "bg-card text-cyan-400 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase font-mono text-muted-foreground bg-muted/20">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Sender &bull; Receiver</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Fraud Risk</th>
                  <th className="py-2.5 px-3">On-Chain Audit</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-xs">
                {filteredTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setVerificationResult(null);
                    }}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-semibold text-cyan-400">{tx.id}</td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px]">
                      {new Date(tx.timestamp).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline">{tx.type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-foreground">
                      <span className="text-muted-foreground">{tx.sender}</span> &rarr;{" "}
                      <span className="font-semibold">{tx.receiver}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {tx.currency === "INR" ? formatINR(tx.amount) : `${tx.amount} ${tx.currency}`}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={tx.status === "COMPLETED" ? "success" : "destructive"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <span className={tx.riskScore > 50 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {tx.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          tx.blockchainStatus === "VERIFIED"
                            ? "success"
                            : tx.blockchainStatus === "TAMPERED"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {tx.blockchainStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-cyan-400 group-hover:underline">
                        View &rarr;
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top-up Dialog */}
      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Add Simulated Funds (Fiat INR)</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Top up your simulated wallet balance. Daily limit is ₹2,00,000.00.
            </p>
          </div>
          <form onSubmit={handleTopupSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Top-up Amount (INR)
              </label>
              <Input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                min="100"
                max="200000"
                required
              />
            </div>
            <div className="flex gap-2">
              {["10000", "25000", "50000", "100000"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTopupAmount(preset)}
                  className="rounded border border-border px-2 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted"
                >
                  +{formatINR(Number(preset))}
                </button>
              ))}
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setTopupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Execute Top-up
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Transfer Dialog with 2-Step PIN Verification */}
      <Dialog
        open={transferOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTransferOpen(false);
            setTransferStep("DETAILS");
            setEnteredPin("");
            setPinError("");
          }
        }}
      >
        <div className="space-y-4">
          {transferStep === "DETAILS" && (
            <>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Peer-to-Peer Transfer</span>
                  <Badge variant="cyan" className="text-[9px] font-mono">SAGA S-1</Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Instant settlement across registered Nexus users with real-time fraud scoring.
                </p>
              </div>

              <form onSubmit={handleProceedToPin} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Recipient Username / Email
                  </label>
                  <Input
                    type="text"
                    value={transferData.recipient}
                    onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value })}
                    required
                  />
                  <div className="flex gap-2 mt-1.5 text-[10px] text-muted-foreground font-mono">
                    <span>Presets:</span>
                    <button
                      type="button"
                      onClick={() => setTransferData({ ...transferData, recipient: "daniel_dev" })}
                      className="text-cyan-400 hover:underline"
                    >
                      daniel_dev
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => setTransferData({ ...transferData, recipient: "tirumala_k" })}
                      className="text-cyan-400 hover:underline"
                    >
                      tirumala_k
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => setTransferData({ ...transferData, recipient: "suspicious_proxy_bot" })}
                      className="text-rose-400 hover:underline"
                    >
                      suspicious_bot (Fraud Test)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Currency</label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs font-mono"
                      value={transferData.currency}
                      onChange={(e) => setTransferData({ ...transferData, currency: e.target.value })}
                    >
                      <option value="INR">INR (Fiat)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="USDT">USDT (Tether)</option>
                      <option value="SOL">SOL (Solana)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Amount</label>
                    <Input
                      type="number"
                      step="any"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-black/40 p-3 text-[11px] font-mono space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Transfer Fee:</span>
                    <span className="text-white font-semibold">₹0.00 (Zero Network Fee)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fraud Rule Check:</span>
                    <span className="text-zinc-300">Chain of Responsibility Active</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Security Protocol:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Lock className="h-3 w-3" /> PIN Required on Step 2
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setTransferOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs">
                    Continue to PIN Verification →
                  </Button>
                </div>
              </form>
            </>
          )}

          {transferStep === "PIN" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-border flex items-center justify-center text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-white">Transaction PIN Verification</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">ISO 20022 2-Factor Payment Authorization</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-border text-zinc-400 text-[10px] font-mono tracking-wider">
                  STEP 2 OF 2
                </Badge>
              </div>

              {/* Transfer Summary Badge */}
              <div className="p-3 rounded-lg bg-black/40 border border-border space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Transfer Recipient:</span>
                  <span className="text-white font-semibold">{transferData.recipient}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Debit Amount:</span>
                  <span className="text-white font-bold">
                    {transferData.currency === "INR" ? formatINR(Number(transferData.amount)) : `${transferData.amount} ${transferData.currency}`}
                  </span>
                </div>
              </div>

              {/* PIN Prompt & Visual Boxes */}
              <div className="text-center space-y-2">
                <label className="text-xs font-mono font-medium text-zinc-300 flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-white" />
                  <span>Enter 6-Digit Transaction PIN</span>
                </label>

                {/* 6 Digit Boxes */}
                <div className="flex justify-center gap-2 py-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const hasDigit = enteredPin.length > idx;
                    const isCurrent = idx === enteredPin.length;
                    return (
                      <div
                        key={idx}
                        className={`h-11 w-11 rounded-lg border flex items-center justify-center text-xl font-bold font-mono transition-all select-none ${
                          hasDigit
                            ? "border-white bg-white/10 text-white shadow-xs"
                            : isCurrent
                            ? "border-zinc-500 bg-white/5 text-transparent ring-1 ring-white/20 animate-pulse"
                            : "border-border bg-black/40 text-transparent"
                        }`}
                      >
                        {hasDigit ? "●" : ""}
                      </div>
                    );
                  })}
                </div>

                {/* Secret text input for physical keyboard entry */}
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 6) {
                      setEnteredPin(val);
                      setPinError("");
                    }
                  }}
                  autoFocus
                  className="opacity-0 h-0 w-0 absolute pointer-events-none"
                  id="wallet-pin-input"
                />

                {/* PIN Management Link */}
                <div className="flex items-center justify-between px-1 pt-1 text-[11px] font-mono">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-white" /> 6-digit authorization required
                  </span>
                  <button
                    type="button"
                    onClick={() => setSetPinOpen(true)}
                    className="text-zinc-300 hover:text-white hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <KeyRound className="h-3 w-3" /> Set / Reset PIN
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {pinError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn font-mono">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Interactive On-Screen Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinDigit(String(num))}
                    className="h-10 rounded-lg border border-border bg-[#18181B] hover:bg-zinc-800 active:scale-95 text-sm font-semibold font-mono text-white transition-all shadow-xs"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePinClear}
                  className="h-10 rounded-lg border border-border bg-black/40 hover:bg-zinc-900 active:scale-95 text-[11px] font-mono text-muted-foreground hover:text-white transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handlePinDigit("0")}
                  className="h-10 rounded-lg border border-border bg-[#18181B] hover:bg-zinc-800 active:scale-95 text-sm font-semibold font-mono text-white transition-all shadow-xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="h-10 rounded-lg border border-border bg-black/40 hover:bg-zinc-900 active:scale-95 text-xs font-mono text-muted-foreground hover:text-white transition-all flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex justify-between items-center border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTransferStep("DETAILS");
                    setPinError("");
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={handleVerifyPinAndSend}
                  disabled={enteredPin.length !== 6 || isProcessing}
                  className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wide"
                >
                  {isProcessing ? "Authenticating & Anchoring..." : "Verify PIN & Send Funds"}
                </Button>
              </div>
            </div>
          )}

          {transferStep === "PROCESSING" && (
            <div className="py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-lg border-2 border-white border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold tracking-tight text-white">Executing Saga Transfer</h4>
                <p className="text-xs text-muted-foreground font-mono">
                  Evaluating fraud rules • Debiting ledger • Anchoring SHA-256 block...
                </p>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Transaction Details & Blockchain Verification Drawer */}
      <Drawer
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        title={`Transaction Dossier: ${selectedTx?.id || ""}`}
      >
        {selectedTx && (
          <div className="space-y-5">
            {/* Header Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">STATUS</span>
                <div className="font-bold text-sm text-foreground flex items-center gap-2 mt-0.5">
                  <Badge variant={selectedTx.status === "COMPLETED" ? "success" : "destructive"}>
                    {selectedTx.status}
                  </Badge>
                  <span className="font-mono text-xs">{selectedTx.type}</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-muted-foreground uppercase">AMOUNT</span>
                <div className="font-bold text-base text-foreground">
                  {selectedTx.currency === "INR" ? formatINR(selectedTx.amount) : `${selectedTx.amount} ${selectedTx.currency}`}
                </div>
              </div>
            </div>

            {/* Lifecycle State Machine Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                Saga State Machine Timeline
              </h4>
              <div className="space-y-2 font-mono text-xs border-l-2 border-border pl-4">
                {selectedTx.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                        step.ok ? "bg-emerald-400" : "bg-rose-500"
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${step.ok ? "text-foreground" : "text-rose-400"}`}>
                        {step.step}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{step.time}</span>
                    </div>
                    {step.note && <div className="text-[11px] text-rose-300 mt-0.5">{step.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Core Metadata */}
            <div className="rounded-lg border border-border p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Trace ID:</span>
                <span className="text-cyan-400">{selectedTx.serviceTraceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sender:</span>
                <span className="text-foreground">{selectedTx.sender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receiver:</span>
                <span className="text-foreground">{selectedTx.receiver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fraud Risk Score:</span>
                <span className={selectedTx.riskScore > 50 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {selectedTx.riskScore} / 100 ({selectedTx.fraudDecision})
                </span>
              </div>
              {selectedTx.failReason && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                  <strong>Failure Diagnostic:</strong> {selectedTx.failReason}
                </div>
              )}
            </div>

            {/* Blockchain Tamper-Evident Audit Section */}
            <div className="rounded-lg border border-cyan-500/40 bg-slate-900/60 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4" />
                  BLOCKCHAIN AUDIT PROOF
                </span>
                <Badge
                  variant={
                    selectedTx.blockchainStatus === "VERIFIED"
                      ? "success"
                      : selectedTx.blockchainStatus === "TAMPERED"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {selectedTx.blockchainStatus}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block">ON-CHAIN TRANSACTION HASH (SHA-256 ROOT)</span>
                <p className="text-[11px] text-cyan-300 break-all select-all bg-slate-950 p-2 rounded border border-slate-800 mt-1">
                  {selectedTx.blockchainHash}
                </p>
              </div>

              {selectedTx.blockNumber && (
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Anchored Block Height: #{selectedTx.blockNumber}</span>
                  <span>Gas Consumed: {selectedTx.gasUsed} Gwei</span>
                </div>
              )}

              {/* Verification Feedback Banner */}
              {verificationResult && (
                <div
                  className={`p-3 rounded border text-xs ${
                    verificationResult.status === "VERIFIED"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1">
                    {verificationResult.status === "VERIFIED" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    )}
                    {verificationResult.status}
                  </div>
                  <p className="text-[11px] leading-relaxed">{verificationResult.message}</p>
                </div>
              )}

              {/* Action Buttons for Verification & Tampering Proof */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="terminal"
                  size="sm"
                  onClick={() => handleVerify(selectedTx.id)}
                  className="w-full text-xs"
                >
                  Verify On-Chain Hash
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleTamper(selectedTx.id)}
                  className="w-full text-xs"
                >
                  Simulate DB Tampering
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Set / Update Transaction PIN Modal */}
      <SetTransactionPinModal
        isOpen={setPinOpen}
        onClose={() => setSetPinOpen(false)}
        onSuccess={(newPin) => {
          if (transferStep === "PIN") {
            setEnteredPin(newPin);
            setPinError("");
          }
          setActionMessage({
            type: "success",
            text: "Transaction PIN configured successfully! Use this 6-digit PIN to authorize transfers.",
          });
        }}
      />
    </div>
  );
}
