import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function SetTransactionPinModal({ isOpen, onClose, onSuccess }) {
  const { transactionPin, updateTransactionPin } = useNexus();

  // If a pin is already configured in storage, allow changing it or resetting it
  const [mode, setMode] = useState("SET"); // "SET" | "CHANGE"
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPlainPin, setShowPlainPin] = useState(false);
  const [activeField, setActiveField] = useState("NEW"); // "CURRENT" | "NEW" | "CONFIRM"
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setErrorMsg("");
      setSuccessMsg("");
      setIsSubmitting(false);
      setActiveField("NEW");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    setErrorMsg("");
    if (activeField === "CURRENT") {
      if (currentPin.length < 6) setCurrentPin((prev) => prev + digit);
    } else if (activeField === "NEW") {
      if (newPin.length < 6) {
        const next = newPin + digit;
        setNewPin(next);
        if (next.length === 6) setActiveField("CONFIRM");
      }
    } else if (activeField === "CONFIRM") {
      if (confirmPin.length < 6) setConfirmPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setErrorMsg("");
    if (activeField === "CURRENT") {
      setCurrentPin((prev) => prev.slice(0, -1));
    } else if (activeField === "NEW") {
      setNewPin((prev) => prev.slice(0, -1));
    } else if (activeField === "CONFIRM") {
      if (confirmPin.length === 0) {
        setActiveField("NEW");
      } else {
        setConfirmPin((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleClear = () => {
    setErrorMsg("");
    if (activeField === "CURRENT") setCurrentPin("");
    else if (activeField === "NEW") setNewPin("");
    else if (activeField === "CONFIRM") setConfirmPin("");
  };

  const handleSavePin = (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (mode === "CHANGE") {
      if (currentPin.length !== 6) {
        setErrorMsg("Please enter your current 6-digit PIN.");
        setActiveField("CURRENT");
        return;
      }
      if (currentPin !== transactionPin) {
        setErrorMsg("Current PIN is incorrect.");
        setActiveField("CURRENT");
        return;
      }
    }

    if (!/^\d{6}$/.test(newPin)) {
      setErrorMsg("New PIN must be exactly 6 numeric digits.");
      setActiveField("NEW");
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg("PIN confirmation does not match the new PIN.");
      setActiveField("CONFIRM");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = updateTransactionPin(newPin);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg("Transaction PIN successfully set and activated!");
        setTimeout(() => {
          onSuccess?.(newPin);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || "Failed to update Transaction PIN.");
      }
    }, 400);
  };

  const renderPinDots = (val, fieldName, isFocused) => {
    return (
      <div
        onClick={() => {
          setActiveField(fieldName);
          setErrorMsg("");
        }}
        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
          isFocused
            ? "border-white bg-white/5 shadow-xs ring-1 ring-white/20"
            : "border-border bg-card/60 hover:border-zinc-700"
        }`}
      >
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const hasDigit = val.length > idx;
          const isCurr = isFocused && idx === val.length;
          return (
            <div
              key={idx}
              className={`h-9 w-9 rounded-md border flex items-center justify-center font-mono text-sm font-bold transition-all ${
                hasDigit
                  ? "border-white/80 bg-white/10 text-white"
                  : isCurr
                  ? "border-zinc-500 bg-white/5 animate-pulse text-transparent"
                  : "border-border/60 bg-black/40 text-transparent"
              }`}
            >
              {hasDigit ? (showPlainPin ? val[idx] : "●") : ""}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-[#0F0F0F] p-6 shadow-2xl text-foreground space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/5 border border-border flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                Set Transaction PIN
                <Badge variant="outline" className="border-border text-zinc-400 text-[10px] font-mono tracking-wider">
                  6-DIGIT SECURE
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Required to authorize debit transfers, P2P sends, and conversions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-lg border border-border p-1 bg-black/40">
          <button
            type="button"
            onClick={() => {
              setMode("SET");
              setActiveField("NEW");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
              mode === "SET"
                ? "bg-[#18181B] text-white font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Direct Set / Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("CHANGE");
              setActiveField("CURRENT");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
              mode === "CHANGE"
                ? "bg-[#18181B] text-white font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Verify Current & Change
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-3">
          {mode === "CHANGE" && (
            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-zinc-300 flex justify-between">
                <span>1. Current 6-Digit PIN</span>
                {activeField === "CURRENT" && (
                  <span className="text-[10px] text-white font-mono uppercase tracking-wider">EDITING</span>
                )}
              </label>
              {renderPinDots(currentPin, "CURRENT", activeField === "CURRENT")}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-1.5">
                <span>{mode === "CHANGE" ? "2. New 6-Digit PIN" : "New 6-Digit PIN"}</span>
                {activeField === "NEW" && (
                  <span className="text-[10px] text-white font-mono uppercase tracking-wider">EDITING</span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setShowPlainPin(!showPlainPin)}
                className="text-[11px] font-mono text-muted-foreground hover:text-white flex items-center gap-1"
              >
                {showPlainPin ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPlainPin ? "Hide" : "Show"} Digits
              </button>
            </div>
            {renderPinDots(newPin, "NEW", activeField === "NEW")}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-zinc-300 flex justify-between">
              <span>{mode === "CHANGE" ? "3. Re-enter New PIN" : "Confirm New 6-Digit PIN"}</span>
              {activeField === "CONFIRM" && (
                <span className="text-[10px] text-white font-mono uppercase tracking-wider">EDITING</span>
              )}
            </label>
            {renderPinDots(confirmPin, "CONFIRM", activeField === "CONFIRM")}
          </div>
        </div>

        {/* Numeric Keypad */}
        <div className="pt-1">
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(String(num))}
                className="h-10 rounded-lg border border-border bg-[#18181B] hover:bg-zinc-800 active:scale-95 text-sm font-semibold font-mono text-white transition-all shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-10 rounded-lg border border-border bg-black/40 hover:bg-zinc-900 active:scale-95 text-[11px] font-mono text-muted-foreground hover:text-white transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit("0")}
              className="h-10 rounded-lg border border-border bg-[#18181B] hover:bg-zinc-800 active:scale-95 text-sm font-semibold font-mono text-white transition-all shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-10 rounded-lg border border-border bg-black/40 hover:bg-zinc-900 active:scale-95 text-xs font-mono text-muted-foreground hover:text-white transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSavePin}
            disabled={
              isSubmitting ||
              newPin.length !== 6 ||
              confirmPin.length !== 6 ||
              (mode === "CHANGE" && currentPin.length !== 6)
            }
            className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wide"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" /> Saving PIN...
              </span>
            ) : (
              "Save & Activate PIN"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
