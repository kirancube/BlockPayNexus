import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DEMO_USER,
  INITIAL_FIAT_WALLET,
  INITIAL_CRYPTO_WALLETS,
  INITIAL_HOLDINGS,
  INITIAL_TRANSACTIONS,
  MARKET_DATA,
  FINANCIAL_NEWS,
  FRAUD_ALERTS_DATA,
  NOTIFICATIONS_DATA,
  SERVICE_HEALTH_DATA,
} from "../data/mockData";

const NexusContext = createContext(null);

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL !== undefined) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "3000") {
    return "http://localhost:8000";
  }
  return "";
};

export function NexusProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Default to true for instant demo exploration, or check persisted session
    return localStorage.getItem("nexus_auth") !== "false";
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nexus_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_USER;
  });
  const [transactionPin, setTransactionPin] = useState(() => {
    return localStorage.getItem("nexus_tx_pin") || "749201";
  });
  const [fiatWallet, setFiatWallet] = useState(INITIAL_FIAT_WALLET);
  const [cryptoWallets, setCryptoWallets] = useState(INITIAL_CRYPTO_WALLETS);
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [markets, setMarkets] = useState(MARKET_DATA);
  const [news, setNews] = useState(FINANCIAL_NEWS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [fraudAlerts, setFraudAlerts] = useState(FRAUD_ALERTS_DATA);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [servicesHealth, setServicesHealth] = useState(SERVICE_HEALTH_DATA);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  // Sync dark class on root html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Live market price tick simulation (runs every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((item) => {
          // slight random jitter between -0.15% and +0.15%
          const deltaPct = (Math.random() - 0.49) * 0.003;
          const newPrice = Number((item.price * (1 + deltaPct)).toFixed(item.price > 1000 ? 2 : 4));
          const newSparkline = [...item.sparkline.slice(1), newPrice];
          return {
            ...item,
            price: newPrice,
            change: Number((newPrice - item.sparkline[0]).toFixed(2)),
            changePct: Number((((newPrice - item.sparkline[0]) / item.sparkline[0]) * 100).toFixed(2)),
            sparkline: newSparkline,
          };
        })
      );
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Compute total portfolio value
  const totalFiat = fiatWallet.balance;
  const totalCryptoINR = cryptoWallets.reduce((acc, c) => acc + c.balance * c.inrPrice, 0);
  const totalStocksINR = holdings
    .filter((h) => h.type === "Stocks" || h.type === "ETF")
    .reduce((acc, h) => acc + h.qty * h.currentPrice, 0);
  const totalPortfolioValue = totalFiat + totalCryptoINR + totalStocksINR;

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Switch Role
  const switchRole = (newRole) => {
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  // Add Simulated Fiat Funds (Topup)
  const addFiatFunds = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: "Invalid amount" };
    if (fiatWallet.dailyTopupUsed + numAmount > fiatWallet.dailyTopupLimit) {
      return { success: false, error: "Exceeds daily top-up limit (₹2,00,000.00)" };
    }

    const txId = `tx_bpx_${Math.floor(100000 + Math.random() * 900000)}`;
    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const newTx = {
      id: txId,
      serviceTraceId: `trc-${txId}-topup`,
      type: "TOPUP",
      direction: "IN",
      sender: "Bank NetBanking Sim (Verified)",
      receiver: `${user.username} (You)`,
      amount: numAmount,
      currency: "INR",
      fee: 0.0,
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      riskScore: 2,
      fraudDecision: "ALLOW",
      blockchainHash: hash,
      blockchainStatus: "VERIFIED",
      blockNumber: 1984215 + transactions.length,
      gasUsed: 31200,
      timeline: [
        { step: "INITIATED", time: new Date().toLocaleTimeString(), ok: true },
        { step: "VALIDATED", time: new Date().toLocaleTimeString(), ok: true },
        { step: "RISK CHECK", time: new Date().toLocaleTimeString(), ok: true },
        { step: "PROCESSING", time: new Date().toLocaleTimeString(), ok: true },
        { step: "COMPLETED", time: new Date().toLocaleTimeString(), ok: true },
      ],
    };

    setFiatWallet((prev) => ({
      ...prev,
      balance: prev.balance + numAmount,
      availableBalance: prev.availableBalance + numAmount,
      dailyTopupUsed: prev.dailyTopupUsed + numAmount,
    }));

    setTransactions((prev) => [newTx, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        type: "TOPUP_SUCCESS",
        title: "Funds Added",
        message: `₹${numAmount.toLocaleString("en-IN")} credited to your Fiat INR Wallet.`,
        timestamp: "Just now",
        unread: true,
      },
      ...prev,
    ]);

    return { success: true, tx: newTx };
  };

  // Transaction PIN Management
  const verifyTransactionPin = (pinToTest) => {
    const activePin = transactionPin || "749201";
    return String(pinToTest).trim() === activePin;
  };

  const updateTransactionPin = (newPin) => {
    if (!/^\d{6}$/.test(newPin)) {
      return { success: false, error: "Transaction PIN must be exactly 6 numeric digits." };
    }
    setTransactionPin(newPin);
    localStorage.setItem("nexus_tx_pin", newPin);

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        type: "SECURITY_PIN_UPDATE",
        title: "Transaction PIN Updated",
        message: "Your 6-digit transaction authorization PIN has been securely updated.",
        timestamp: "Just now",
        unread: true,
      },
      ...prev,
    ]);

    return { success: true };
  };

  const setTxPin = updateTransactionPin;

  // Send Money (P2P Transfer)
  const sendMoney = ({ recipient, amount, currency, pin }) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: "Enter a valid transfer amount" };

    // PIN Authentication
    if (pin !== undefined && pin !== null) {
      if (!verifyTransactionPin(pin)) {
        return { success: false, error: "Authentication Failure: Incorrect 6-digit Transaction PIN." };
      }
    }

    if (fiatWallet.status === "FROZEN") {
      return { success: false, error: "Wallet is FROZEN. All outgoing debits are prohibited." };
    }

    if (currency === "INR") {
      if (numAmount > fiatWallet.availableBalance) {
        return { success: false, error: "Insufficient available balance in INR Fiat Wallet." };
      }
    } else {
      const cryptoItem = cryptoWallets.find((c) => c.asset === currency);
      if (!cryptoItem || numAmount > cryptoItem.available) {
        return { success: false, error: `Insufficient ${currency} available balance.` };
      }
    }

    // Evaluate Fraud Risk
    let riskScore = 14;
    let decision = "ALLOW";
    let status = "COMPLETED";
    let failReason = null;

    if (numAmount > 300000 || recipient.toLowerCase().includes("suspicious")) {
      riskScore = 88;
      decision = "BLOCK";
      status = "FAILED";
      failReason = "Transfer blocked by Nexus Fraud Rule: High Materiality & Counterparty Anomaly.";
    }

    const txId = `tx_bpx_${Math.floor(100000 + Math.random() * 900000)}`;
    const hash =
      decision === "ALLOW"
        ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
        : "0x0000000000000000000000000000000000000000000000000000000000000000";

    const newTx = {
      id: txId,
      serviceTraceId: `trc-${txId}-p2p`,
      type: "TRANSFER",
      direction: "OUT",
      sender: `${user.username} (You)`,
      receiver: recipient,
      amount: numAmount,
      currency: currency,
      fee: currency === "INR" ? 0.0 : 0.0001,
      status: status,
      failReason: failReason,
      timestamp: new Date().toISOString(),
      riskScore: riskScore,
      fraudDecision: decision,
      blockchainHash: hash,
      blockchainStatus: decision === "ALLOW" ? "VERIFIED" : "NOT_ANCHORED",
      blockNumber: decision === "ALLOW" ? 1984220 + transactions.length : null,
      gasUsed: decision === "ALLOW" ? 45200 : 0,
      timeline: [
        { step: "INITIATED", time: new Date().toLocaleTimeString(), ok: true },
        { step: "VALIDATED", time: new Date().toLocaleTimeString(), ok: true },
        {
          step: "RISK CHECK",
          time: new Date().toLocaleTimeString(),
          ok: decision === "ALLOW",
          note: decision !== "ALLOW" ? failReason : "Passed velocity & counterparty checks",
        },
        { step: "PROCESSING", time: new Date().toLocaleTimeString(), ok: decision === "ALLOW" },
        { step: status, time: new Date().toLocaleTimeString(), ok: decision === "ALLOW" },
      ],
    };

    if (decision === "ALLOW") {
      if (currency === "INR") {
        setFiatWallet((prev) => ({
          ...prev,
          balance: prev.balance - numAmount,
          availableBalance: prev.availableBalance - numAmount,
        }));
      } else {
        setCryptoWallets((prev) =>
          prev.map((c) => (c.asset === currency ? { ...c, balance: c.balance - numAmount, available: c.available - numAmount } : c))
        );
      }
    } else {
      // Create fraud alert
      setFraudAlerts((prev) => [
        {
          id: `frd_${Date.now()}`,
          transactionId: txId,
          timestamp: new Date().toISOString(),
          user: user.username,
          amount: `${currency} ${numAmount.toLocaleString()}`,
          riskScore: riskScore,
          decision: decision,
          rulesTriggered: ["HIGH_MATERIALITY_DEVIATION", "COUNTERPARTY_RISK_SURGE"],
          deviceFingerprint: "Win11 / Client Origin / Academic Test Node",
          status: "REVIEW_PENDING",
        },
        ...prev,
      ]);
    }

    setTransactions((prev) => [newTx, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        type: decision === "ALLOW" ? "TRANSFER_SUCCESS" : "SECURITY_ALERT",
        title: decision === "ALLOW" ? "Transfer Completed" : "Transfer Blocked by Risk Engine",
        message:
          decision === "ALLOW"
            ? `${currency} ${numAmount.toLocaleString()} sent to ${recipient}. Blockchain hash anchored.`
            : `Transfer of ${currency} ${numAmount.toLocaleString()} was blocked due to risk score (${riskScore}).`,
        timestamp: "Just now",
        unread: true,
      },
      ...prev,
    ]);

    return { success: decision === "ALLOW", tx: newTx, error: failReason };
  };

  // Convert Currency (Fiat <-> Crypto)
  const convertCurrency = ({ fromAsset, toAsset, amount, quoteRate, fee = 100 }) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: "Invalid amount" };

    if (fromAsset === "INR") {
      if (numAmount + fee > fiatWallet.availableBalance) {
        return { success: false, error: "Insufficient INR balance including conversion fee." };
      }
      const cryptoAmount = Number(((numAmount - fee) / quoteRate).toFixed(4));

      // Saga debit INR -> credit Crypto
      setFiatWallet((prev) => ({
        ...prev,
        balance: prev.balance - numAmount,
        availableBalance: prev.availableBalance - numAmount,
      }));

      setCryptoWallets((prev) =>
        prev.map((c) =>
          c.asset === toAsset
            ? { ...c, balance: c.balance + cryptoAmount, available: c.available + cryptoAmount }
            : c
        )
      );

      const txId = `tx_bpx_${Math.floor(100000 + Math.random() * 900000)}`;
      const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      const newTx = {
        id: txId,
        serviceTraceId: `trc-${txId}-conv-saga`,
        type: "CONVERSION",
        direction: "SWAP",
        sender: `${user.username} (Fiat INR)`,
        receiver: `${user.username} (Crypto ${toAsset})`,
        amount: numAmount,
        currency: `INR -> ${toAsset}`,
        receivedAmount: `${cryptoAmount} ${toAsset}`,
        rate: `1 ${toAsset} = ₹${quoteRate.toLocaleString("en-IN")}`,
        fee: fee,
        status: "COMPLETED",
        timestamp: new Date().toISOString(),
        riskScore: 11,
        fraudDecision: "ALLOW",
        blockchainHash: hash,
        blockchainStatus: "VERIFIED",
        blockNumber: 1984225 + transactions.length,
        gasUsed: 59400,
        timeline: [
          { step: "INITIATED", time: new Date().toLocaleTimeString(), ok: true },
          { step: "VALIDATED", time: new Date().toLocaleTimeString(), ok: true },
          { step: "RISK CHECK", time: new Date().toLocaleTimeString(), ok: true },
          { step: "PROCESSING", time: new Date().toLocaleTimeString(), ok: true },
          { step: "COMPLETED", time: new Date().toLocaleTimeString(), ok: true },
        ],
      };

      setTransactions((prev) => [newTx, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          type: "CONVERSION_SUCCESS",
          title: "Conversion Complete",
          message: `Converted ₹${numAmount.toLocaleString()} to ${cryptoAmount} ${toAsset}. Blockchain verified.`,
          timestamp: "Just now",
          unread: true,
        },
        ...prev,
      ]);

      return { success: true, tx: newTx, cryptoAmount };
    } else {
      // Crypto -> INR
      const cryptoItem = cryptoWallets.find((c) => c.asset === fromAsset);
      if (!cryptoItem || numAmount > cryptoItem.available) {
        return { success: false, error: `Insufficient ${fromAsset} available balance.` };
      }

      const inrAmount = Number((numAmount * quoteRate - fee).toFixed(2));

      setCryptoWallets((prev) =>
        prev.map((c) =>
          c.asset === fromAsset
            ? { ...c, balance: c.balance - numAmount, available: c.available - numAmount }
            : c
        )
      );

      setFiatWallet((prev) => ({
        ...prev,
        balance: prev.balance + inrAmount,
        availableBalance: prev.availableBalance + inrAmount,
      }));

      const txId = `tx_bpx_${Math.floor(100000 + Math.random() * 900000)}`;
      const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      const newTx = {
        id: txId,
        serviceTraceId: `trc-${txId}-conv-saga`,
        type: "CONVERSION",
        direction: "SWAP",
        sender: `${user.username} (Crypto ${fromAsset})`,
        receiver: `${user.username} (Fiat INR)`,
        amount: numAmount,
        currency: `${fromAsset} -> INR`,
        receivedAmount: `₹${inrAmount.toLocaleString("en-IN")}`,
        rate: `1 ${fromAsset} = ₹${quoteRate.toLocaleString("en-IN")}`,
        fee: fee,
        status: "COMPLETED",
        timestamp: new Date().toISOString(),
        riskScore: 9,
        fraudDecision: "ALLOW",
        blockchainHash: hash,
        blockchainStatus: "VERIFIED",
        blockNumber: 1984228 + transactions.length,
        gasUsed: 61000,
        timeline: [
          { step: "INITIATED", time: new Date().toLocaleTimeString(), ok: true },
          { step: "VALIDATED", time: new Date().toLocaleTimeString(), ok: true },
          { step: "RISK CHECK", time: new Date().toLocaleTimeString(), ok: true },
          { step: "PROCESSING", time: new Date().toLocaleTimeString(), ok: true },
          { step: "COMPLETED", time: new Date().toLocaleTimeString(), ok: true },
        ],
      };

      setTransactions((prev) => [newTx, ...prev]);

      return { success: true, tx: newTx, inrAmount };
    }
  };

  // Freeze / Unfreeze Wallet
  const setWalletStatus = (newStatus, reason = "User initiated request") => {
    setFiatWallet((prev) => ({ ...prev, status: newStatus }));
    setUser((prev) => ({ ...prev, walletStatus: newStatus }));

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        type: "SECURITY_ALERT",
        title: `Wallet Status Changed: ${newStatus}`,
        message: `Your wallet status is now ${newStatus}. Reason: ${reason}.`,
        timestamp: "Just now",
        unread: true,
      },
      ...prev,
    ]);
  };

  // Tamper Simulator (demonstrates blockchain tamper-evidence)
  const simulateTamperTransaction = (txId) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          return {
            ...tx,
            amount: tx.amount * 10, // Tampered amount
            blockchainStatus: "TAMPERED",
            tamperNotice: "Cryptographic Mismatch Detected: Stored payload does not match on-chain SHA-256 root!",
          };
        }
        return tx;
      })
    );
  };

  // Verify Transaction Integrity
  const verifyTransactionOnChain = (txId) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return { status: "NOT_FOUND" };
    if (!tx.blockchainHash || tx.blockchainHash.startsWith("0x00000000")) {
      return { status: "NOT_ANCHORED", message: "Transaction was not eligible for on-chain anchoring." };
    }
    if (tx.blockchainStatus === "TAMPERED") {
      return {
        status: "TAMPERED",
        message: "TAMPER DETECTED: Computed local payload SHA-256 does NOT match on-chain hash! Smart contract audit failed.",
      };
    }
    return {
      status: "VERIFIED",
      message: "CRYPTOGRAPHIC AUDIT VERIFIED: Local payload SHA-256 matches on-chain smart contract record 100%.",
      hash: tx.blockchainHash,
      blockNumber: tx.blockNumber,
    };
  };

  // Mark all notifications read
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateUserProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("nexus_user", JSON.stringify(updated));
      return updated;
    });
  };

  // Login action
  const login = async (identifier, password) => {
    // 1. Try real API gateway first
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const loggedUser = {
            id: data.user.userId || "usr_bpx_90214",
            username: data.user.username,
            email: data.user.email,
            name: data.user.fullName || data.user.username,
            role: data.user.role || "USER",
            twoFactorEnabled: true,
            pinConfigured: true,
            walletStatus: "ACTIVE",
            createdAt: new Date().toISOString(),
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          localStorage.setItem("nexus_auth", "true");
          localStorage.setItem("nexus_user", JSON.stringify(loggedUser));
          if (data.accessToken) {
            localStorage.setItem("nexus_token", data.accessToken);
          }
          return { success: true, user: loggedUser };
        }
      }
    } catch (e) {
      // API call failed or offline, fall back to deterministic accounts
    }

    // 2. Client-side deterministic seed accounts
    const idLower = (identifier || "").trim().toLowerCase();
    if ((idLower === "kiran_nexus" || idLower === "kiran@blockpay.nexus") && password === "NexusPass#2026") {
      const loggedUser = { ...DEMO_USER, role: "USER" };
      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem("nexus_auth", "true");
      localStorage.setItem("nexus_user", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } else if ((idLower === "admin_root" || idLower === "admin@blockpay.nexus") && password === "AdminSecure#2026") {
      const loggedUser = {
        id: "usr_bpx_90218",
        username: "admin_root",
        email: "admin@blockpay.nexus",
        name: "Nexus Administrator",
        role: "ADMIN",
        twoFactorEnabled: true,
        pinConfigured: true,
        walletStatus: "ACTIVE",
        createdAt: "2026-08-01T10:00:00Z",
      };
      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem("nexus_auth", "true");
      localStorage.setItem("nexus_user", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } else if ((idLower === "auditor_sec" || idLower === "auditor@blockpay.nexus") && password === "AuditorKey#2026") {
      const loggedUser = {
        id: "usr_bpx_90217",
        username: "auditor_sec",
        email: "auditor@blockpay.nexus",
        name: "Auditor Lead",
        role: "AUDITOR",
        twoFactorEnabled: true,
        pinConfigured: true,
        walletStatus: "ACTIVE",
        createdAt: "2026-08-01T10:00:00Z",
      };
      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem("nexus_auth", "true");
      localStorage.setItem("nexus_user", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    }

    // 3. Registered accounts in localStorage
    try {
      const localUsers = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
      const found = localUsers.find(
        (u) =>
          (u.username.toLowerCase() === idLower || u.email.toLowerCase() === idLower) &&
          u.password === password
      );
      if (found) {
        const loggedUser = {
          id: found.id,
          username: found.username,
          email: found.email,
          name: found.name,
          role: found.role || "USER",
          twoFactorEnabled: false,
          pinConfigured: true,
          walletStatus: "ACTIVE",
          createdAt: found.createdAt,
        };
        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem("nexus_auth", "true");
        localStorage.setItem("nexus_user", JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      }
    } catch (e) {}

    return {
      success: false,
      error: "Invalid credentials. Please enter a valid username/email and password.",
    };
  };

  // Logout action
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("nexus_auth", "false");
    localStorage.removeItem("nexus_token");
  };

  // Register action
  const register = async (userData) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return { success: true };
        }
      }
    } catch (e) {}

    // Local storage fallback
    try {
      const localUsers = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
      if (localUsers.some((u) => u.username.toLowerCase() === userData.username.toLowerCase())) {
        return { success: false, error: "Username already taken." };
      }
      if (localUsers.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, error: "Email already registered." };
      }
      const newUser = {
        id: `usr_bpx_${Date.now()}`,
        username: userData.username,
        email: userData.email,
        name: userData.fullName || userData.username,
        password: userData.password,
        role: userData.role || "USER",
        createdAt: new Date().toISOString(),
      };
      localUsers.push(newUser);
      localStorage.setItem("nexus_registered_users", JSON.stringify(localUsers));
      return { success: true };
    } catch (e) {
      return { success: false, error: "Failed to persist user profile." };
    }
  };

  return (
    <NexusContext.Provider
      value={{
        theme,
        toggleTheme,
        isAuthenticated,
        login,
        logout,
        register,
        updateUserProfile,
        deleteNotification,
        user,
        switchRole,
        fiatWallet,
        cryptoWallets,
        holdings,
        markets,
        news,
        transactions,
        fraudAlerts,
        notifications,
        servicesHealth,
        totalPortfolioValue,
        commandPaletteOpen,
        setCommandPaletteOpen,
        selectedAsset,
        setSelectedAsset,
        selectedTx,
        setSelectedTx,
        activeArticle,
        setActiveArticle,
        addFiatFunds,
        sendMoney,
        transactionPin,
        verifyTransactionPin,
        updateTransactionPin,
        setTransactionPin: updateTransactionPin,
        convertCurrency,
        setWalletStatus,
        simulateTamperTransaction,
        verifyTransactionOnChain,
        markAllNotificationsRead,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
}
