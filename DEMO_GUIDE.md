# BlockPay Nexus — Evaluator & Examiner Demo Walkthrough Guide

## 1. Introduction & Overview

Welcome to the evaluator walkthrough for **BlockPay Nexus** — an academic, research-grade, blockchain-integrated hybrid digital wallet and financial intelligence platform built upon a microservices architecture.

This guide provides step-by-step instructions for testing and reviewing all 12 key use cases (UC-01 through UC-12) within 15–20 minutes.

---

## 2. Quick Environment Setup

### Option A: Local Dev Mode (Recommended for Live Review)
1. **Launch the Backend API Gateway**:
   ```bash
   py -3.9 -m uvicorn blockpay.server:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Launch the Frontend SPA**:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open browser at: `http://localhost:5173`
4. Swagger API Documentation available at: `http://localhost:8000/docs`

### Option B: Docker Compose Deployment
```bash
docker-compose up -d --build
```
Open browser at: `http://localhost:5173` (or `http://localhost:8000`)

---

## 3. Demonstration Scenarios (Use Cases 1–12)

### UC-01: Institutional Financial Terminal & Market Pulse (Dashboard)
1. Navigate to `/` (**Dashboard**).
2. **Observe**:
   - Header greeting: `"Good morning, Alex Chen"`.
   - Total Portfolio Value: `₹18,45,200.00` with daily P&L indicator (+₹24,850.00).
   - Top ticker banner showing real-time price oscillations across NIFTY 50, S&P 500, BTC, ETH, and USD/INR.
   - Interactive Portfolio Performance Chart with timeframe selectors (`1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, `1Y`, `ALL`).
   - Asset Allocation breakdown (Stocks 42%, Crypto 28%, ETFs 15%, Gold 10%, Cash 5%).
   - Top Gainers / Losers and real-time AI Portfolio Insight badge.
   - Preserved notice clearly indicating simulated market data for academic demonstration.

---

### UC-02: Hybrid Digital Wallet & Cryptographic Timeline (Wallet)
1. Click **Wallet** in the sidebar (or navigate to `/wallet`).
2. **Inspect Balances**:
   - Fiat balance: ₹2,45,000.00 | $12,500.00 USD.
   - Crypto balance: 0.4520 BTC | 4.8500 ETH.
3. **Execute Funds Top-up**:
   - Click the green **"Add Funds"** button.
   - Select Currency (`INR`), enter amount (e.g. `10000`), choose method (`UPI / IMPS`), click **"Confirm Deposit"**.
   - Notice instant balance update and audit transaction recorded in the transaction list.
4. **Inspect Transaction Drawer**:
   - Click on any row in the **Transaction History** table.
   - Observe the slide-over detail drawer displaying the double-entry accounting ledger entries, cryptographic SHA-256 hash, and on-chain verification seal.

---

### UC-03: Saga Distributed Transfer with Double-Entry Ledger (Wallet)
1. In the **Send & Transfer** card on `/wallet`:
   - Recipient ID: `priya.patel@nexus.id`
   - Select Asset: `INR`
   - Amount: `5000`
   - Enter 6-digit Transaction PIN: `749201`
   - Click **"Execute Transfer"**.
2. **Result**:
   - The transfer executes via the Saga orchestrator.
   - Balance decreases by ₹5,000.00.
   - An on-chain SHA-256 transaction hash is generated and linked.

---

### UC-04: Fraud Engine Interception & Kill-Switch (Fraud Detection)
1. On `/wallet`, attempt to send an excessive amount that violates single-transaction ceiling:
   - Recipient: `suspicious-actor@darknet.io`
   - Asset: `INR`
   - Amount: `750000` (exceeds ₹5,00,000 rule threshold)
   - Click **"Execute Transfer"**.
2. **Result**:
   - The system intercepts the transaction with an alert: `TRANSACTION FLAGGED BY FRAUD ENGINE (Risk Score: 92/100)`.
   - The transaction is blocked and queued into the Compliance Triage Queue.
3. Switch role to **Compliance Officer** in top navbar dropdown:
   - Navigate to `/admin` -> **Fraud Engine** tab.
   - Inspect the flagged transaction in the real-time triage queue with rule trigger explanations.

---

### UC-05: Multi-Asset Financial Markets & Deep-Dive Drawer (Markets)
1. Navigate to `/markets`.
2. Toggle between asset classes: **Overview**, **Crypto**, **Stocks**, **ETFs**, **Forex**, **Commodities**, **Indices**.
3. In the Crypto tab, click on **Bitcoin (BTC)**:
   - A deep-dive drawer slides open showing 24h high/low, circulating supply, live orderbook depth, market sentiment indicator, and personalized portfolio exposure stats.

---

### UC-06: Portfolio Analytics & Benchmark Comparison (Portfolio & Analytics)
1. Navigate to `/portfolio` and `/analytics`.
2. Observe institutional metrics:
   - **Sharpe Ratio**: 1.84 (Strong risk-adjusted return).
   - **Portfolio Beta**: 0.92 (Lower volatility than market index).
   - **Value at Risk (VaR 95%)**: 2.4% daily.
   - **Max Drawdown**: -12.4%.
3. View the **Comparative Benchmark Chart**:
   - Overlay user's portfolio performance vs NIFTY 50, S&P 500, and BTC.
4. View the **Monte Carlo 5-Year Stochastic Projection**:
   - 90th percentile optimistic, median expected, and 10th percentile stress-test trajectory.

---

### UC-07: Financial News Portal & Portfolio ↔ News Connection (News)
1. Navigate to `/news`.
2. Inspect the **"Breaking News"** banner and news categories.
3. Review the **"News Affecting Your Portfolio"** filter:
   - Observe how articles for BTC, Reliance, and NIFTY highlight portfolio exposure (e.g., `"BTC exposure: 28% - Sentiment: Bullish"`).
4. Click any article card to open the AI Summary drawer, displaying:
   - Bulleted summary.
   - "Why this matters to your portfolio".
   - Market impact confidence score.

---

### UC-08: Foreign Exchange Atomic Conversion (Exchange)
1. Navigate to `/exchange`.
2. Select **Convert From**: `USD` -> **To**: `INR`.
3. Enter Amount: `1000`.
4. Click **"Lock Quote"**:
   - A 30-second cryptographic lock token timer counts down.
   - Guaranteed exchange rate is locked against market slippage.
5. Click **"Execute Conversion"**:
   - USD balance debited, INR balance credited atomically.

---

### UC-09: AI Financial Copilot & Guarded Action Confirmation (AI Copilot)
1. Navigate to `/copilot`.
2. Click one of the pre-built prompt pills:
   - *"Analyze my portfolio risk and crypto exposure"* or
   - *"Suggest rebalancing from crypto into ETFs"*.
3. Observe the AI assistant's structured response with financial breakdown.
4. Test the **Guarded Action Card**:
   - The copilot generates an action card (e.g., *"Convert 0.1 BTC to INR"*).
   - The user must explicitly click the authorization button before any transaction is executed, preventing unprompted agentic transfers.

---

### UC-10: Blockchain Audit Trail & Tamper-Detection Lab (Blockchain Audit)
1. Navigate to `/admin` -> **Blockchain Audit** tab (or direct route `/blockchain`).
2. Inspect the **Solidity Smart Contract Explorer** (`NexusAuditLedger.sol`).
3. Click the **"Run Tamper Simulation"** button:
   - The simulator alters a simulated database record off-chain.
   - The SHA-256 Merkle root recalculation fails against the smart contract hash.
   - The UI displays an alert: `CRYPTO INTEGRITY BREACH DETECTED: Tampered Record Block #1048`.
   - Demonstrates academic research grade tamper-evidence.

---

### UC-11: Service Health & Testing Telemetry (Service Health / Testing)
1. Navigate to `/health` (**Service Health**):
   - Real-time heartbeat dashboard monitoring all 13 microservices, latencies (<15ms), memory usage, and PostgreSQL connection pool.
2. Navigate to `/testing` (**Testing Dashboard**):
   - Shows live passing counts for Pytest (59/59), Newman API tests (13/13), and Vite frontend build.

---

### UC-12: Preserved Legacy SentinelAI X Tactical Subsystem (Sentinel Legacy)
1. Navigate to `/sentinel` (or click the **"Sentinel HUD"** link in sidebar).
2. **Observe**:
   - The original computer-vision anomaly detection Tactical HUD is preserved.
   - Real-time 3D Dither shader, confidence sliders, bounding-box anomaly feed, and model verification matrix are functional.
   - Proves zero regression of original coursework capabilities.

---

## 4. Evaluator Assessment Checklist

- [x] **Zero Regressions**: All 43 original Python tests pass (`py -3.9 -m pytest tests`).
- [x] **New Test Coverage**: 16 new BlockPay microservice tests pass (59 total).
- [x] **Postman Verification**: 13 automated API contract requests pass (`node scripts/run_postman.js`).
- [x] **E2E Automation**: 8 cross-service end-to-end flows pass (`node scripts/run_e2e.js`).
- [x] **Frontend Polish**: Free `shadcndashboard` transformed into institutional financial SaaS terminal.
- [x] **Smart Contract Integrity**: EVM Solidity smart contract with tamper detection demonstration.
- [x] **Free-Only Compliance**: Verified MIT/Apache licenses in `THIRD_PARTY_LICENSES.md`.
