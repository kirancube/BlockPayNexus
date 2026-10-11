import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatUSD(val) {
  if (val === null || val === undefined || isNaN(val)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatCrypto(val, symbol = "BTC") {
  if (val === null || val === undefined || isNaN(val)) return `0.0000 ${symbol}`;
  const decimals = symbol === "USDT" ? 2 : 4;
  return `${Number(val).toFixed(decimals)} ${symbol}`;
}

export function formatPct(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.00%";
  const sign = val >= 0 ? "+" : "";
  return `${sign}${Number(val).toFixed(2)}%`;
}
