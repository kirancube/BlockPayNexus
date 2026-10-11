import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Wallet,
  Lock,
  Layers,
  HelpCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { SetTransactionPinModal } from "../components/SetTransactionPinModal";
import { formatINR } from "../lib/utils";

const SAMPLE_PROMPTS = [
  "Why did my portfolio rise today?",
  "Summarize today's crypto news.",
  "What is my crypto exposure?",
  "Compare my portfolio against NIFTY.",
  "Explain USD/INR movement.",
  "Freeze my wallet immediately",
  "Send ₹5,000 to daniel_dev",
];

export function AiCopilotView() {
  const {
    totalPortfolioValue,
    fiatWallet,
    cryptoWallets,
    holdings,
    news,
    sendMoney,
    setWalletStatus,
    transactionPin,
    verifyTransactionPin,
  } = useNexus();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "msg_1",
      sender: "copilot",
      text: "Greetings. I am Nexus Financial Copilot — your autonomous research intelligence engine. I can synthesize macro news, analyze asset concentrations, track risk exposures, and formulate portfolio rebalancing strategies. How may I assist your portfolio today?",
      timestamp: "10:00 AM",
      guardedAction: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [configurePinModalOpen, setConfigurePinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [copilotPin, setCopilotPin] = useState("");
  const [copilotPinError, setCopilotPinError] = useState("");

  const handleSendMessage = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let botResponse = "";
      let guarded = null;

      const lower = query.toLowerCase();

      if (lower.includes("why did my portfolio") || lower.includes("rise today")) {
        botResponse = `Your portfolio gained approximately +₹34,500 (+0.34%) today. The dominant tailwinds were:
1. **Solana (SOL)** rallied +4.61% to ₹16,800 on surge in DeFi volume.
2. **Bitcoin (BTC)** appreciated +2.52% to ₹58,90,000 following record institutional ETF inflows ($1.4B).
3. **Reliance Industries** advanced +1.16% to ₹2,985.50 on upstream oil refining recovery.
Minor drag came from Ethereum (-1.11%) and TCS (-0.44%).`;
      } else if (lower.includes("crypto exposure") || lower.includes("highest exposure")) {
        const cryptoTotal = cryptoWallets.reduce((acc, c) => acc + c.balance * c.inrPrice, 0);
        const cryptoPct = ((cryptoTotal / totalPortfolioValue) * 100).toFixed(1);
        botResponse = `Your portfolio has a significant concentration in digital assets:
- **Total Crypto Valuation:** ${formatINR(cryptoTotal)} (${cryptoPct}% of total portfolio)
- **Top Asset:** Bitcoin (0.8540 BTC valued at ₹50.3L, representing 28.2% of your wealth)
- **Second Asset:** Ethereum (6.2500 ETH valued at ₹17.8L, representing 10.0%)

**Risk Advisory:** Under institutional guidelines, crypto allocations exceeding 25% introduce heightened drawdowns during liquidity contraction.`;
      } else if (lower.includes("summarize") || lower.includes("news")) {
        botResponse = `Here is the synthesis of top market headlines right now:
1. **RBI Policy Stance:** Neutral stance adopted as core CPI cools to 3.9%, supporting domestic banking liquidity.
2. **Spot Crypto ETFs:** Weekly net inflows hit $1.4B, with global sovereign funds initiating spot allocations.
3. **Central Bank Gold Reserves:** Q3 sovereign gold purchases surged 380 tonnes, providing a solid floor for physical bullion and Gold BeES.`;
      } else if (lower.includes("compare") || lower.includes("nifty")) {
        botResponse = `**Benchmark Comparison Analysis (Trailing 6 Months):**
- **BlockPay Nexus Portfolio:** +19.0% return &bull; Sharpe Ratio: 1.84 &bull; Beta: 0.94
- **NIFTY 50 Benchmark:** +11.4% return &bull; Sharpe Ratio: 1.42
- **S&P 500 (INR Terms):** +12.9% return
- **Bitcoin Spot:** +28.4% return

Your hybrid allocation has outpaced the domestic NIFTY 50 benchmark by +7.6% due to disciplined crypto weighting while maintaining an emergency fiat liquidity buffer.`;
      } else if (lower.includes("usd/inr") || lower.includes("forex")) {
        botResponse = `**USD/INR Analysis:**
- Current Spot Rate: ₹85.42 (down -0.09% today).
- Driver: Interbank dollar sales and elevated foreign institutional inflows into Indian equities have anchored the rupee within the 85.35–85.55 corridor.`;
      } else if (lower.includes("freeze") && lower.includes("wallet")) {
        botResponse = `You requested an emergency wallet freeze. Under the Nexus Safety Protocol, AI cannot execute financial state locks unilaterally. Please review and confirm below:`;
        guarded = {
          type: "FREEZE_WALLET",
          title: "Guarded Action: Immediate Wallet Freeze",
          description: "All outgoing transfers, conversions, and withdrawals from your Fiat and Crypto wallets will be locked.",
          actionName: "Confirm Emergency Freeze",
          execute: () => setWalletStatus("FROZEN", "Requested via AI Copilot"),
        };
      } else if (lower.includes("send") || lower.includes("transfer")) {
        botResponse = `You requested a transfer of ₹5,000 to user 'daniel_dev'. Financial transfer operations require explicit human authorization under the Nexus Dual-Control Architecture.`;
        guarded = {
          type: "TRANSFER",
          title: "Guarded Action: Send Funds",
          description: "Transfer ₹5,000.00 INR to daniel_dev. Blockchain anchor will be created on local EVM node.",
          actionName: "Authorize & Send ₹5,000",
          execute: (pin) => sendMoney({ recipient: "daniel_dev", amount: 5000, currency: "INR", pin }),
        };
      } else {
        botResponse = `I have analyzed your query against the BlockPay Nexus microservices data mesh.
- Current Portfolio Value: ${formatINR(totalPortfolioValue)}
- Active Wallets: Fiat (INR ${fiatWallet.status}) + Crypto (4 Assets Active)
- Blockchain Audit: 100% verified on Hardhat EVM local node.
Feel free to ask about any specific stock, ETF, or news sentiment correlation!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: "copilot",
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guardedAction: guarded,
        },
      ]);
      setLoading(false);
    }, 600);
  };

  const handleExecuteGuarded = (msgIndex, guardedAction) => {
    if (guardedAction.type === "TRANSFER") {
      setPendingAction({ idx: msgIndex, guardedAction });
      setCopilotPin("");
      setCopilotPinError("");
      setPinModalOpen(true);
      return;
    }

    guardedAction.execute();
    setMessages((prev) =>
      prev.map((m, idx) =>
        idx === msgIndex
          ? {
              ...m,
              guardedAction: {
                ...m.guardedAction,
                executed: true,
              },
            }
          : m
      )
    );
  };

  const handleConfirmCopilotPin = () => {
    if (copilotPin.length !== 6) {
      setCopilotPinError("Please enter your complete 6-digit Transaction PIN.");
      return;
    }
    if (!verifyTransactionPin(copilotPin)) {
      setCopilotPinError("Incorrect Transaction PIN. Verification failed.");
      setCopilotPin("");
      return;
    }

    if (pendingAction) {
      pendingAction.guardedAction.execute(copilotPin);
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === pendingAction.idx
            ? {
                ...m,
                guardedAction: {
                  ...m.guardedAction,
                  executed: true,
                },
              }
            : m
        )
      );
      setPinModalOpen(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Nexus Financial Copilot
            <Badge variant="cyan">GUARDED AUTONOMY</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Natural language financial research assistant with policy-enforced human confirmation checkpoints.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-cyan-400">
            Audit State: Guardrails Active
          </Badge>
        </div>
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-muted-foreground text-[10px] shrink-0 font-semibold uppercase">Quick Prompts:</span>
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSendMessage(p)}
            className="rounded-lg border border-border/80 bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground hover:border-cyan-500/50 hover:text-cyan-400 whitespace-nowrap cursor-pointer transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Copilot Chat Window */}
      <Card className="h-[520px] flex flex-col justify-between border-cyan-500/30">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-mono text-muted-foreground">
                {m.sender === "copilot" ? (
                  <>
                    <Bot className="h-3 w-3 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold">NEXUS FINANCIAL COPILOT</span>
                  </>
                ) : (
                  <span>YOU</span>
                )}
                <span>&bull;</span>
                <span>{m.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-cyan-500 text-slate-950 font-medium"
                    : "bg-muted/40 border border-border text-foreground font-sans"
                }`}
              >
                {m.text}

                {/* Guarded Action Confirmation Card */}
                {m.guardedAction && (
                  <div className="mt-3 p-3 rounded-lg border border-amber-500/40 bg-amber-950/20 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4" />
                        {m.guardedAction.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        CONFIRMATION REQUIRED
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      {m.guardedAction.description}
                    </p>

                    {m.guardedAction.executed ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold pt-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Operation Executed & Authorized by User
                      </div>
                    ) : (
                      <div className="pt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleExecuteGuarded(idx, m.guardedAction)}
                          className="text-xs"
                        >
                          {m.guardedAction.actionName}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 animate-pulse">
              <Bot className="h-3.5 w-3.5" />
              <span>Analyzing macroeconomic telemetry & portfolio vectors...</span>
            </div>
          )}
        </CardContent>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center space-x-2"
          >
            <Input
              placeholder="Ask financial copilot... (e.g. 'Why did my portfolio move?', 'Compare to NIFTY', 'Freeze wallet')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-xs"
            />
            <Button type="submit" size="sm" className="h-9 px-4">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </Card>

      {/* PIN Verification Modal for Guarded Transfers */}
      <Dialog
        open={pinModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPinModalOpen(false);
            setPendingAction(null);
            setCopilotPin("");
            setCopilotPinError("");
          }
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Transaction PIN Required</h3>
              <p className="text-[11px] text-muted-foreground">Authorize AI Copilot Guarded Transfer</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/80 space-y-1 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Transfer Recipient:</span>
              <span className="text-foreground font-semibold">daniel_dev</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Amount:</span>
              <span className="text-cyan-400 font-bold">₹5,000.00 INR</span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <label className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Enter 6-Digit Transaction PIN</span>
            </label>

            <div className="flex justify-center gap-2 py-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const hasDigit = copilotPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`h-11 w-11 rounded-lg border flex items-center justify-center text-xl font-bold font-mono transition-all select-none ${
                      hasDigit
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-400 shadow-sm shadow-cyan-500/25"
                        : "border-border/70 bg-muted/20 text-muted-foreground/30"
                    }`}
                  >
                    {hasDigit ? "●" : ""}
                  </div>
                );
              })}
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={copilotPin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 6) {
                  setCopilotPin(val);
                  setCopilotPinError("");
                }
              }}
              autoFocus
              className="opacity-0 h-0 w-0 absolute pointer-events-none"
              id="copilot-pin-input"
            />

            <div className="flex items-center justify-between px-1 pt-1 text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-cyan-400" /> Enter 6-digit PIN
              </span>
              <button
                type="button"
                onClick={() => setConfigurePinModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <KeyRound className="h-3 w-3" /> Set / Reset PIN
              </button>
            </div>
          </div>

          {copilotPinError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{copilotPinError}</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  if (copilotPin.length < 6) {
                    setCopilotPin(copilotPin + num);
                    setCopilotPinError("");
                  }
                }}
                className="h-9 rounded-lg border border-border bg-card hover:bg-muted/70 active:scale-95 text-xs font-semibold font-mono text-foreground transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCopilotPin("");
                setCopilotPinError("");
              }}
              className="h-9 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 text-[11px] font-mono text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                if (copilotPin.length < 6) {
                  setCopilotPin(copilotPin + "0");
                  setCopilotPinError("");
                }
              }}
              className="h-9 rounded-lg border border-border bg-card hover:bg-muted/70 active:scale-95 text-xs font-semibold font-mono text-foreground"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => {
                setCopilotPin((prev) => prev.slice(0, -1));
                setCopilotPinError("");
              }}
              className="h-9 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              ⌫
            </button>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPinModalOpen(false);
                setPendingAction(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCopilotPin}
              disabled={copilotPin.length !== 6}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Verify PIN & Authorize
            </Button>
          </div>
        </div>
      </Dialog>

      <SetTransactionPinModal
        isOpen={configurePinModalOpen}
        onClose={() => setConfigurePinModalOpen(false)}
        onSuccess={(newPin) => {
          setCopilotPin(newPin);
          setCopilotPinError("");
        }}
      />
    </div>
  );
}
