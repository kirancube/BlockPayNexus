// BlockPay Nexus Deterministic Simulation & Demo Data Store
// All assets, prices, and hashes are for academic demonstration and labeled "Demo Data"

export const DEMO_USER = {
  id: "usr_bpx_90214",
  username: "kiran_nexus",
  email: "kiran@blockpay.nexus",
  name: "P R Kiran Kumar Reddy",
  role: "USER", // USER | ADMIN | AUDITOR
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  twoFactorEnabled: true,
  pinConfigured: true,
  walletStatus: "ACTIVE", // ACTIVE | RESTRICTED | FROZEN
  createdAt: "2026-08-01T10:00:00Z"
};

export const OTHER_USERS = [
  { id: "usr_bpx_90215", username: "daniel_dev", email: "daniel@blockpay.nexus", name: "Daniel V" },
  { id: "usr_bpx_90216", username: "tirumala_k", email: "tirumala@blockpay.nexus", name: "Tirumala Vardhan" },
  { id: "usr_bpx_90217", username: "auditor_sec", email: "auditor@blockpay.nexus", name: "Auditor Lead" },
  { id: "usr_bpx_90218", username: "admin_root", email: "admin@blockpay.nexus", name: "Nexus Administrator" }
];

export const INITIAL_FIAT_WALLET = {
  walletId: "wlt_fiat_inr_001",
  currency: "INR",
  balance: 450000.00,
  availableBalance: 450000.00,
  pendingBalance: 0.00,
  dailyTopupLimit: 200000.00,
  dailyTopupUsed: 25000.00,
  status: "ACTIVE"
};

export const INITIAL_CRYPTO_WALLETS = [
  { asset: "BTC", name: "Bitcoin", balance: 0.8540, available: 0.8540, locked: 0.0000, inrPrice: 5890000.00, icon: "₿" },
  { asset: "ETH", name: "Ethereum", balance: 6.2500, available: 6.2500, locked: 0.0000, inrPrice: 284500.00, icon: "Ξ" },
  { asset: "USDT", name: "Tether USD", balance: 12450.00, available: 12450.00, locked: 0.0000, inrPrice: 85.50, icon: "₮" },
  { asset: "SOL", name: "Solana", balance: 42.5000, available: 42.5000, locked: 0.0000, inrPrice: 16800.00, icon: "◎" }
];

export const MARKET_DATA = [
  { symbol: "NIFTY 50", category: "Indices", name: "Nifty 50 Index", price: 25480.20, change: 185.40, changePct: 0.73, high: 25520.00, low: 25390.10, volume: "3.2B", sparkline: [25300, 25350, 25420, 25380, 25480] },
  { symbol: "SENSEX", category: "Indices", name: "BSE Sensex 30", price: 83120.50, change: 540.20, changePct: 0.65, high: 83250.00, low: 82890.00, volume: "1.8B", sparkline: [82600, 82800, 83000, 82950, 83120] },
  { symbol: "S&P 500", category: "Indices", name: "S&P 500 US", price: 5890.40, change: -12.30, changePct: -0.21, high: 5910.00, low: 5875.00, volume: "4.1B", sparkline: [5920, 5910, 5895, 5880, 5890] },
  { symbol: "NASDAQ", category: "Indices", name: "Nasdaq Composite", price: 18650.10, change: 64.80, changePct: 0.35, high: 18700.00, low: 18590.00, volume: "5.4B", sparkline: [18500, 18550, 18620, 18600, 18650] },

  // Crypto
  { symbol: "BTC", category: "Crypto", name: "Bitcoin", price: 5890000.00, usdPrice: 68900.00, change: 145000.00, changePct: 2.52, high: 5920000.00, low: 5740000.00, volume: "₹2.4T", marketCap: "₹116T", holdings: 0.8540, sparkline: [5720000, 5780000, 5820000, 5850000, 5890000] },
  { symbol: "ETH", category: "Crypto", name: "Ethereum", price: 284500.00, usdPrice: 3328.00, change: -3200.00, changePct: -1.11, high: 290000.00, low: 281000.00, volume: "₹1.1T", marketCap: "₹34T", holdings: 6.2500, sparkline: [289000, 287000, 286000, 283000, 284500] },
  { symbol: "SOL", category: "Crypto", name: "Solana", price: 16800.00, usdPrice: 196.50, change: 740.00, changePct: 4.61, high: 17100.00, low: 16020.00, volume: "₹450B", marketCap: "₹7.8T", holdings: 42.5000, sparkline: [15900, 16100, 16400, 16650, 16800] },
  { symbol: "BNB", category: "Crypto", name: "Binance Coin", price: 51200.00, usdPrice: 598.00, change: 350.00, changePct: 0.69, high: 51600.00, low: 50800.00, volume: "₹180B", marketCap: "₹7.4T", holdings: 0, sparkline: [50700, 50900, 51100, 51000, 51200] },
  { symbol: "USDT", category: "Crypto", name: "Tether USD", price: 85.50, usdPrice: 1.00, change: 0.05, changePct: 0.06, high: 85.60, low: 85.40, volume: "₹3.8T", marketCap: "₹9.8T", holdings: 12450.00, sparkline: [85.4, 85.5, 85.45, 85.52, 85.5] },

  // Stocks
  { symbol: "RELIANCE", category: "Stocks", name: "Reliance Industries", price: 2985.50, change: 34.20, changePct: 1.16, high: 2998.00, low: 2940.00, volume: "6.8M", marketCap: "₹20.2T", holdings: 120, sparkline: [2930, 2950, 2970, 2965, 2985.5] },
  { symbol: "TCS", category: "Stocks", name: "Tata Consultancy Services", price: 4150.00, change: -18.50, changePct: -0.44, high: 4190.00, low: 4130.00, volume: "2.4M", marketCap: "₹15.0T", holdings: 45, sparkline: [4180, 4170, 4155, 4140, 4150] },
  { symbol: "HDFCBANK", category: "Stocks", name: "HDFC Bank Ltd", price: 1690.00, change: 12.00, changePct: 0.71, high: 1698.00, low: 1675.00, volume: "14.2M", marketCap: "₹12.8T", holdings: 150, sparkline: [1670, 1678, 1684, 1680, 1690] },
  { symbol: "AAPL", category: "Stocks", name: "Apple Inc (US)", price: 19850.00, usdPrice: 232.40, change: 310.00, changePct: 1.59, high: 20010.00, low: 19600.00, volume: "42M", marketCap: "₹298T", holdings: 0, sparkline: [19500, 19650, 19700, 19800, 19850] },

  // ETFs
  { symbol: "NIFTYBEES", category: "ETFs", name: "Nippon India ETF Nifty BeES", price: 268.40, change: 1.90, changePct: 0.71, expenseRatio: "0.04%", aum: "₹28,400 Cr", yield: "1.12%", holdings: 1200, sparkline: [265, 266, 267.5, 267.8, 268.4] },
  { symbol: "GOLDBEES", category: "ETFs", name: "Nippon India ETF Gold BeES", price: 66.20, change: 0.45, changePct: 0.68, expenseRatio: "0.10%", aum: "₹14,200 Cr", yield: "0.00%", holdings: 800, sparkline: [65.4, 65.8, 66.0, 65.9, 66.2] },
  { symbol: "SPY", category: "ETFs", name: "SPDR S&P 500 ETF Trust", price: 49850.00, change: -95.00, changePct: -0.19, expenseRatio: "0.09%", aum: "₹48.2T", yield: "1.24%", holdings: 0, sparkline: [50100, 50000, 49900, 49800, 49850] },

  // Forex
  { symbol: "USD/INR", category: "Forex", name: "US Dollar / Indian Rupee", price: 85.42, change: -0.08, changePct: -0.09, high: 85.55, low: 85.38, sparkline: [85.52, 85.48, 85.45, 85.40, 85.42] },
  { symbol: "EUR/INR", category: "Forex", name: "Euro / Indian Rupee", price: 92.15, change: 0.22, changePct: 0.24, high: 92.30, low: 91.90, sparkline: [91.90, 92.05, 92.10, 92.00, 92.15] },
  { symbol: "GBP/INR", category: "Forex", name: "British Pound / Indian Rupee", price: 108.60, change: 0.40, changePct: 0.37, high: 108.85, low: 108.10, sparkline: [108.10, 108.35, 108.50, 108.45, 108.60] },

  // Commodities
  { symbol: "GOLD (XAU)", category: "Commodities", name: "Spot Gold (10g / INR)", price: 72400.00, change: 320.00, changePct: 0.44, high: 72600.00, low: 72050.00, sparkline: [71900, 72100, 72300, 72250, 72400] },
  { symbol: "CRUDE OIL", category: "Commodities", name: "Brent Crude ($/bbl)", price: 6520.00, change: -85.00, changePct: -1.29, high: 6630.00, low: 6490.00, sparkline: [6640, 6600, 6580, 6540, 6520] },
];

export const INITIAL_HOLDINGS = [
  { id: "hld_1", asset: "BTC", name: "Bitcoin", type: "Crypto", qty: 0.8540, avgPrice: 5240000.00, currentPrice: 5890000.00, value: 5030060.00, pnl: 555100.00, pnlPct: 12.40, allocation: 28.2 },
  { id: "hld_2", asset: "ETH", name: "Ethereum", type: "Crypto", qty: 6.2500, avgPrice: 245000.00, currentPrice: 284500.00, value: 1778125.00, pnl: 246875.00, pnlPct: 16.12, allocation: 10.0 },
  { id: "hld_3", asset: "RELIANCE", name: "Reliance Industries", type: "Stocks", qty: 120, avgPrice: 2740.00, currentPrice: 2985.50, value: 358260.00, pnl: 29460.00, pnlPct: 8.96, allocation: 2.0 },
  { id: "hld_4", asset: "TCS", name: "Tata Consultancy Services", type: "Stocks", qty: 45, avgPrice: 3820.00, currentPrice: 4150.00, value: 186750.00, pnl: 14850.00, pnlPct: 8.64, allocation: 1.0 },
  { id: "hld_5", asset: "HDFCBANK", name: "HDFC Bank Ltd", type: "Stocks", qty: 150, avgPrice: 1580.00, currentPrice: 1690.00, value: 253500.00, pnl: 16500.00, pnlPct: 6.96, allocation: 1.4 },
  { id: "hld_6", asset: "NIFTYBEES", name: "Nifty BeES ETF", type: "ETF", qty: 1200, avgPrice: 235.00, currentPrice: 268.40, value: 322080.00, pnl: 40080.00, pnlPct: 14.21, allocation: 1.8 },
  { id: "hld_7", asset: "GOLDBEES", name: "Gold BeES ETF", type: "ETF", qty: 800, avgPrice: 58.50, currentPrice: 66.20, value: 52960.00, pnl: 6160.00, pnlPct: 13.16, allocation: 0.3 },
  { id: "hld_8", asset: "USDT", name: "Tether USD", type: "Crypto", qty: 12450.00, avgPrice: 84.10, currentPrice: 85.50, value: 1064475.00, pnl: 17430.00, pnlPct: 1.66, allocation: 6.0 },
  { id: "hld_9", asset: "SOL", name: "Solana", type: "Crypto", qty: 42.5000, avgPrice: 13200.00, currentPrice: 16800.00, value: 714000.00, pnl: 153000.00, pnlPct: 27.27, allocation: 4.0 },
  { id: "hld_10", asset: "INR_CASH", name: "Simulated Fiat Cash", type: "Cash", qty: 450000.00, avgPrice: 1.00, currentPrice: 1.00, value: 450000.00, pnl: 0.00, pnlPct: 0.00, allocation: 2.5 }
];

export const BENCHMARK_HISTORY = [
  { time: "2026-03", portfolio: 8200000, nifty: 22800, sp500: 5100, btc: 4600000 },
  { time: "2026-04", portfolio: 8650000, nifty: 23200, sp500: 5240, btc: 4950000 },
  { time: "2026-05", portfolio: 8900000, nifty: 23600, sp500: 5310, btc: 5120000 },
  { time: "2026-06", portfolio: 9450000, nifty: 24100, sp500: 5480, btc: 5380000 },
  { time: "2026-07", portfolio: 9780000, nifty: 24700, sp500: 5620, btc: 5540000 },
  { time: "2026-08", portfolio: 10120000, nifty: 25100, sp500: 5780, btc: 5720000 },
  { time: "2026-09", portfolio: 10210210, nifty: 25480, sp500: 5890, btc: 5890000 }
];

export const FINANCIAL_NEWS = [
  {
    id: "news_101",
    headline: "Reserve Bank of India Signals Neutral Policy Stance as Core CPI Stabilizes at 3.9%",
    source: "Bloomberg Financial",
    category: "India",
    timestamp: "28 mins ago",
    readTime: "3 min read",
    sentiment: "Bullish",
    confidence: 94,
    marketImpact: "High",
    affectedAssets: ["NIFTY 50", "HDFCBANK", "USD/INR"],
    portfolioExposure: "3.4%",
    summary: "The Monetary Policy Committee voted to keep the benchmark repo rate unchanged while shifting the policy stance to neutral, citing anchored inflation expectations and steady GDP growth.",
    aiAnalysis: "Eased monetary conditions historically bolster domestic banking equity valuations (HDFCBANK) while keeping sovereign bond yields stable. Demonstrates macroeconomic resilience.",
    fullContent: "MUMBAI — The Reserve Bank of India maintained the key policy repo rate while altering its stance to neutral, paving the way for eventual liquidity easing as headline consumer inflation cooled within the target 4% band. Governor noted that domestic industrial capex continues to exhibit high momentum across infrastructure and technology supply chains."
  },
  {
    id: "news_102",
    headline: "Institutional Bitcoin ETF Inflows Surpass $1.4B in Weekly High as Treasury Allocations Climb",
    source: "CoinDesk Market Terminal",
    category: "Crypto",
    timestamp: "1 hour ago",
    readTime: "4 min read",
    sentiment: "Bullish",
    confidence: 91,
    marketImpact: "High",
    affectedAssets: ["BTC", "ETH", "SOL"],
    portfolioExposure: "42.2%",
    summary: "Spot cryptocurrency ETF vehicles saw aggregate net inflows expand to record highs driven by multi-asset sovereign wealth and pension fund diversification strategies.",
    aiAnalysis: "DIRECT PORTFOLIO IMPACT: You hold 0.8540 BTC and 6.2500 ETH, constituting 38.2% of your portfolio. Sustained ETF absorption decreases liquid spot supply, driving upward price elasticity.",
    fullContent: "Global asset managers reported sustained institutional demand for regulated crypto exchange-traded products. Analysts attribute the surge to macroeconomic hedge demand and clearer global audit regulations under ISO 20022 and blockchain-anchored custody verification protocols."
  },
  {
    id: "news_103",
    headline: "US Tech Megacaps Rally on Enterprise AI Infrastructure Buildout and Hyperscale Capex",
    source: "Financial Times",
    category: "Global",
    timestamp: "2 hours ago",
    readTime: "5 min read",
    sentiment: "Bullish",
    confidence: 88,
    marketImpact: "Medium",
    affectedAssets: ["NASDAQ", "S&P 500", "TCS"],
    portfolioExposure: "1.0%",
    summary: "Hyperscalers reported expanded quarterly capital expenditure guidance exceeding $210B annually, boosting semiconductor demand and global enterprise digital transformation contracts.",
    aiAnalysis: "Positive demand spillover for Indian IT tier-1 service providers including TCS as Fortune 500 enterprises accelerate migration to specialized agentic and cloud intelligence architectures.",
    fullContent: "Tech valuations registered broad advances across US and Asian bourses following strong forward demand guidance for data center accelerators and specialized inference servers."
  },
  {
    id: "news_104",
    headline: "Central Banks Expand Sovereign Gold Reserves by 380 Metric Tonnes in Q3 Diversification Wave",
    source: "World Gold Intelligence",
    category: "Economy",
    timestamp: "4 hours ago",
    readTime: "3 min read",
    sentiment: "Bullish",
    confidence: 96,
    marketImpact: "Medium",
    affectedAssets: ["GOLD (XAU)", "GOLDBEES"],
    portfolioExposure: "0.3%",
    summary: "Sovereign reserve managers continued reallocating from foreign debt holdings into physical gold bullion to mitigate geopolitical fragmentation and currency volatility.",
    aiAnalysis: "Provides a defensive floor under physical bullion and Gold BeES ETF holdings, insulating overall portfolio volatility during equity pullbacks.",
    fullContent: "Official sector buying reached its highest quarterly pace in three years, with emerging central banks leading acquisitions. Physical spot gold traded firmly above ₹72,000 per 10 grams."
  },
  {
    id: "news_105",
    headline: "Crude Oil Drops 2.8% on Heightened Non-OPEC Production and Resilient Supply Channels",
    source: "Reuters Energy",
    category: "Markets",
    timestamp: "6 hours ago",
    readTime: "2 min read",
    sentiment: "Neutral",
    confidence: 82,
    marketImpact: "Low",
    affectedAssets: ["CRUDE OIL", "RELIANCE"],
    portfolioExposure: "2.0%",
    summary: "Brent crude declined toward $76 per barrel as Atlantic basin shipments matched demand forecasts and refining margins normalized across East Asian hubs.",
    aiAnalysis: "Lower energy feedstock input costs reduce headline domestic transport inflation, supporting consumer demand while slightly compressing refining margins for downstream conglomerates.",
    fullContent: "Energy commodities experienced mild selling pressure as market participants balanced geopolitical risk premia against robust inventory levels across OECD terminals."
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx_bpx_881920",
    serviceTraceId: "trc-881920-gateway-core",
    type: "TRANSFER",
    direction: "OUT",
    sender: "kiran_nexus (You)",
    receiver: "daniel_dev",
    amount: 15000.00,
    currency: "INR",
    fee: 0.00,
    status: "COMPLETED",
    timestamp: "2026-10-08T10:14:22Z",
    riskScore: 12,
    fraudDecision: "ALLOW",
    blockchainHash: "0x7f49a8c2b7e19d458632ea9b43c68df123490b8e72a45610bcde890f12a34bc1",
    blockchainStatus: "VERIFIED",
    blockNumber: 1984210,
    gasUsed: 42100,
    timeline: [
      { step: "INITIATED", time: "10:14:22.012", ok: true },
      { step: "VALIDATED", time: "10:14:22.045", ok: true },
      { step: "RISK CHECK", time: "10:14:22.080", ok: true },
      { step: "PROCESSING", time: "10:14:22.190", ok: true },
      { step: "COMPLETED", time: "10:14:22.310", ok: true }
    ]
  },
  {
    id: "tx_bpx_881919",
    serviceTraceId: "trc-881919-gateway-conv",
    type: "CONVERSION",
    direction: "SWAP",
    sender: "kiran_nexus (Fiat INR)",
    receiver: "kiran_nexus (Crypto BTC)",
    amount: 100000.00,
    currency: "INR -> BTC",
    receivedAmount: "0.01697 BTC",
    rate: "1 BTC = ₹58,90,000.00",
    fee: 250.00,
    status: "COMPLETED",
    timestamp: "2026-10-08T09:42:05Z",
    riskScore: 18,
    fraudDecision: "ALLOW",
    blockchainHash: "0x3ab8290f14cd56a789ef01bc89de4567123984018274619abced489012345678",
    blockchainStatus: "VERIFIED",
    blockNumber: 1984205,
    gasUsed: 65400,
    timeline: [
      { step: "INITIATED", time: "09:42:05.100", ok: true },
      { step: "VALIDATED", time: "09:42:05.130", ok: true },
      { step: "RISK CHECK", time: "09:42:05.170", ok: true },
      { step: "PROCESSING", time: "09:42:05.320", ok: true },
      { step: "COMPLETED", time: "09:42:05.450", ok: true }
    ]
  },
  {
    id: "tx_bpx_881918",
    serviceTraceId: "trc-881918-topup-saga",
    type: "TOPUP",
    direction: "IN",
    sender: "Bank Simulation (HDFC)",
    receiver: "kiran_nexus (You)",
    amount: 50000.00,
    currency: "INR",
    fee: 0.00,
    status: "COMPLETED",
    timestamp: "2026-10-07T18:20:10Z",
    riskScore: 5,
    fraudDecision: "ALLOW",
    blockchainHash: "0x91823746abcedf0129384756acbdef9812734650192837465abc102938475612",
    blockchainStatus: "VERIFIED",
    blockNumber: 1984180,
    gasUsed: 38200,
    timeline: [
      { step: "INITIATED", time: "18:20:10.020", ok: true },
      { step: "VALIDATED", time: "18:20:10.050", ok: true },
      { step: "RISK CHECK", time: "18:20:10.090", ok: true },
      { step: "PROCESSING", time: "18:20:10.210", ok: true },
      { step: "COMPLETED", time: "18:20:10.350", ok: true }
    ]
  },
  {
    id: "tx_bpx_881917",
    serviceTraceId: "trc-881917-fraud-flagged",
    type: "TRANSFER",
    direction: "OUT",
    sender: "kiran_nexus (You)",
    receiver: "unknown_proxy_99",
    amount: 350000.00,
    currency: "INR",
    fee: 50.00,
    status: "FAILED",
    failReason: "Risk score threshold exceeded (82/100). Velocity and anomalous recipient rule triggered.",
    timestamp: "2026-10-07T14:10:00Z",
    riskScore: 82,
    fraudDecision: "BLOCK",
    blockchainHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    blockchainStatus: "NOT_ANCHORED",
    blockNumber: null,
    gasUsed: 0,
    timeline: [
      { step: "INITIATED", time: "14:10:00.010", ok: true },
      { step: "VALIDATED", time: "14:10:00.040", ok: true },
      { step: "RISK CHECK", time: "14:10:00.090", ok: false, note: "Rule Trigger: High Velocity & Rapid Off-ramping" },
      { step: "PROCESSING", time: "14:10:00.095", ok: false },
      { step: "FAILED", time: "14:10:00.120", ok: false }
    ]
  }
];

export const FRAUD_ALERTS_DATA = [
  {
    id: "frd_901",
    transactionId: "tx_bpx_881917",
    timestamp: "2026-10-07T14:10:00Z",
    user: "kiran_nexus",
    amount: "₹3,50,000.00",
    riskScore: 82,
    decision: "BLOCK",
    rulesTriggered: ["VELOCITY_THRESHOLD_SURGE", "HIGH_MATERIALITY_DEVIATION", "NEW_UNVERIFIED_COUNTERPARTY"],
    deviceFingerprint: "Win11 / Chrome / Unknown ASN (Tor Exit Node simulated)",
    status: "REVIEW_PENDING"
  },
  {
    id: "frd_902",
    transactionId: "tx_bpx_881880",
    timestamp: "2026-10-06T22:04:12Z",
    user: "tirumala_k",
    amount: "₹1,20,000.00",
    riskScore: 68,
    decision: "REVIEW",
    rulesTriggered: ["CONSECUTIVE_RAPID_SWAPS", "UNUSUAL_TIME_WINDOW"],
    deviceFingerprint: "macOS / Safari / IP: 49.207.112.44 (Chennai)",
    status: "CONFIRMED_LEGITIMATE"
  }
];

export const NOTIFICATIONS_DATA = [
  { id: "notif_1", type: "TRANSFER_SUCCESS", title: "Transfer Successful", message: "₹15,000.00 sent to daniel_dev. Blockchain anchor verified.", timestamp: "28 mins ago", unread: true },
  { id: "notif_2", type: "CONVERSION_SUCCESS", title: "Currency Conversion", message: "Converted ₹1,00,000.00 to 0.01697 BTC at ₹58,90,000.00/BTC.", timestamp: "1 hour ago", unread: true },
  { id: "notif_3", type: "SECURITY_ALERT", title: "High Risk Transfer Blocked", message: "Transfer of ₹3,50,000.00 was blocked by Nexus Fraud Engine (Risk score: 82).", timestamp: "1 day ago", unread: false },
  { id: "notif_4", type: "PORTFOLIO_MILESTONE", title: "Portfolio Milestone Reached", message: "Your total portfolio value crossed ₹1,00,00,000 (1 Crore INR).", timestamp: "2 days ago", unread: false }
];

export const SERVICE_HEALTH_DATA = [
  { name: "API Gateway", port: 8080, status: "Healthy", latency: "14ms", requests24h: "142,800", errorRate: "0.01%", db: "Redis OK", version: "v2.4.0" },
  { name: "Auth & Identity Service", port: 8081, status: "Healthy", latency: "22ms", requests24h: "38,400", errorRate: "0.00%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Fiat Wallet Service", port: 8082, status: "Healthy", latency: "28ms", requests24h: "62,100", errorRate: "0.02%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Crypto Wallet Service", port: 8083, status: "Healthy", latency: "31ms", requests24h: "44,900", errorRate: "0.01%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Payment & Saga Service", port: 8084, status: "Healthy", latency: "35ms", requests24h: "29,800", errorRate: "0.03%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Currency Exchange Service", port: 8085, status: "Healthy", latency: "19ms", requests24h: "51,200", errorRate: "0.00%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Market Data Engine", port: 8086, status: "Healthy", latency: "16ms", requests24h: "480,200", errorRate: "0.00%", db: "Redis OK", version: "v2.4.0" },
  { name: "Portfolio Intelligence", port: 8087, status: "Healthy", latency: "42ms", requests24h: "88,400", errorRate: "0.01%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Financial News & Sentiment", port: 8088, status: "Healthy", latency: "48ms", requests24h: "36,000", errorRate: "0.00%", db: "Postgres OK", version: "v2.4.0" },
  { name: "Fraud Detection Engine", port: 8089, status: "Healthy", latency: "24ms", requests24h: "29,800", errorRate: "0.00%", db: "Redis OK", version: "v2.4.0" },
  { name: "Blockchain Audit Service", port: 8090, status: "Healthy", latency: "54ms", requests24h: "18,400", errorRate: "0.02%", db: "Hardhat RPC OK", version: "v2.4.0" },
  { name: "Notification Service", port: 8091, status: "Healthy", latency: "18ms", requests24h: "62,900", errorRate: "0.00%", db: "RabbitMQ OK", version: "v2.4.0" },
  { name: "Nexus AI Copilot Service", port: 8092, status: "Healthy", latency: "65ms", requests24h: "14,500", errorRate: "0.00%", db: "Postgres OK", version: "v2.4.0" }
];
