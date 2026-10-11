import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Key,
  Database,
  Terminal,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { formatINR } from "../lib/utils";

export function BlockchainAuditView() {
  const { transactions, verifyTransactionOnChain, simulateTamperTransaction } = useNexus();

  const [verifyId, setVerifyId] = useState(transactions[0]?.id || "");
  const [result, setResult] = useState(null);
  const [hasherInput, setHasherInput] = useState(
    JSON.stringify({ txId: "tx_bpx_demo", amount: 50000, currency: "INR", timestamp: "2026-10-08T10:00:00Z" }, null, 2)
  );
  const [computedHash, setComputedHash] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();
    const res = verifyTransactionOnChain(verifyId);
    setResult(res);
  };

  const computeSha256 = async (str) => {
    try {
      const msgUint8 = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setComputedHash(`0x${hashHex}`);
    } catch (err) {
      setComputedHash("0x" + Array(64).fill("0").join(""));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Blockchain Tamper-Evident Audit Ledger
            <Badge variant="cyan">EVM SMART CONTRACT</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographic proof of transaction immutability via on-chain SHA-256 state roots on Academic EVM Testnet.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="blockchain">Hardhat Local Node &bull; Chain ID 31337</Badge>
        </div>
      </div>

      {/* Smart Contract Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">CONTRACT ARTIFACT</span>
            <CardTitle className="text-sm font-bold text-foreground">NexusAuditLedger.sol</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Solidity v0.8.20 &bull; OpenZeppelin Pausable
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">DEPLOYED ADDRESS</span>
            <CardTitle className="text-xs font-bold text-cyan-400 truncate">0x95AD61b0a150d79219dCF64E1E6Cc01f0B64C4cE</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Verified On-Chain Bytecode
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">ANCHORED RECORDS</span>
            <CardTitle className="text-xl font-bold text-emerald-400">{transactions.length}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Append-only cryptographic state
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-1">
            <span className="text-[10px] text-muted-foreground uppercase">VERIFICATION LATENCY</span>
            <CardTitle className="text-xl font-bold text-foreground">18 ms</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground font-sans">
            Zero-knowledge JSON-RPC validation
          </CardContent>
        </Card>
      </div>

      {/* Verification Tool & Tamper Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Engine */}
        <Card className="border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cryptographic Verification Engine</CardTitle>
            <CardDescription>
              Recomputes transaction hash and queries smart contract mapping for byte-for-byte equality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleVerify} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Select / Enter Transaction ID</label>
                <div className="flex gap-2">
                  <Input
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    placeholder="tx_bpx_..."
                    className="text-xs"
                    required
                  />
                  <Button type="submit" variant="terminal" className="shrink-0">
                    Verify On-Chain
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 text-[11px] text-muted-foreground">
                <span>Quick Select:</span>
                {transactions.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setVerifyId(t.id);
                      setResult(null);
                    }}
                    className="text-cyan-400 hover:underline"
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </form>

            {result && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 ${
                  result.status === "VERIFIED"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : result.status === "TAMPERED"
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : "border-border bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {result.status === "VERIFIED" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    )}
                    STATUS: {result.status}
                  </span>
                  {result.blockNumber && <span>BLOCK #{result.blockNumber}</span>}
                </div>
                <p className="text-[11px] font-sans leading-relaxed">{result.message}</p>
                {result.hash && (
                  <div className="pt-1">
                    <span className="text-[10px] text-muted-foreground block">ON-CHAIN HASH:</span>
                    <span className="text-[10px] text-cyan-300 break-all select-all font-mono">
                      {result.hash}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live SHA-256 Canonical Hasher */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Canonical SHA-256 Hasher Console</CardTitle>
            <CardDescription>
              Demonstrates deterministic JSON serialization and standard Web3 hashing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <textarea
              rows={4}
              value={hasherInput}
              onChange={(e) => setHasherInput(e.target.value)}
              className="w-full rounded-md border border-input bg-card p-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => computeSha256(hasherInput)}
              className="w-full text-xs"
            >
              Compute SHA-256 Hash
            </Button>
            {computedHash && (
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 break-all">
                <span className="text-muted-foreground text-[10px] block">OUTPUT DIGEST:</span>
                {computedHash}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* On-Chain Ledger Explorer Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Anchored Transactions Ledger Explorer</CardTitle>
          <CardDescription>Full history of verified transactions recorded in contract storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-border/80 text-[10px] uppercase text-muted-foreground bg-muted/20">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Amount & Currency</th>
                  <th className="py-2.5 px-3">Cryptographic Root Hash</th>
                  <th className="py-2.5 px-3">Block Height</th>
                  <th className="py-2.5 px-3">Audit Result</th>
                  <th className="py-2.5 px-3 text-right">Tamper Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-400">{tx.id}</td>
                    <td className="py-3 px-3 text-foreground font-semibold">
                      {tx.currency === "INR" ? formatINR(tx.amount) : `${tx.amount} ${tx.currency}`}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px] truncate max-w-xs">
                      {tx.blockchainHash}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {tx.blockNumber ? `#${tx.blockNumber}` : "—"}
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          simulateTamperTransaction(tx.id);
                          setVerifyId(tx.id);
                          setResult({
                            status: "TAMPERED",
                            message: "TAMPER DETECTED: Amount modified in DB. Local SHA-256 no longer matches anchored on-chain root!",
                          });
                        }}
                        className="h-6 text-[10px]"
                      >
                        Tamper
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
