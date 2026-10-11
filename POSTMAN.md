# BlockPay Nexus — Postman API Collection & Automation Guide

## 1. Overview

The BlockPay Nexus API suite includes a comprehensive Postman Collection (`v2.1.0`) containing 13 automated test requests. It covers all core microservice boundaries: Authentication, Wallet Management, Saga Orchestration, Fraud Evaluation, Currency Conversion, Blockchain Ledger Auditing, Real-time Market Feeds, and AI Copilot.

File Location: `postman/BlockPay_Nexus.postman_collection.json`

---

## 2. Included Endpoints & Assertion Matrix

| # | Endpoint Name | Method | URI | Test Assertions |
| :- | :--- | :--- | :--- | :--- |
| 1 | **System Health Probe** | `GET` | `/api/health` | Status 200, checks status="healthy", verifies 13 microservices online |
| 2 | **User Registration** | `POST` | `/api/auth/register` | Status 201, validates user profile and returns access token |
| 3 | **Authentication Login** | `POST` | `/api/auth/login` | Status 200, asserts JWT access token generation |
| 4 | **Wallet Balances** | `GET` | `/api/wallet/balances` | Status 200, asserts presence of INR, USD, BTC, ETH balances |
| 5 | **Wallet Funds Top-up** | `POST` | `/api/wallet/topup` | Status 200, verifies double-entry ledger credit |
| 6 | **P2P Transfer Execution** | `POST` | `/api/wallet/transfer` | Status 200, verifies balance transfer and transaction ID |
| 7 | **Fraud Rule Trigger** | `POST` | `/api/fraud/evaluate` | Status 200, checks risk score and rule violations for anomalies |
| 8 | **FX Conversion Quote** | `POST` | `/api/conversion/quote` | Status 200, confirms 30-second quote lock and lock token |
| 9 | **Execute Conversion** | `POST` | `/api/conversion/execute` | Status 200, confirms debit and credit across currency accounts |
| 10 | **Blockchain Ledgers** | `GET` | `/api/blockchain/ledgers`| Status 200, returns array of SHA-256 Merkle root entries |
| 11 | **Verify Ledger Hash** | `POST` | `/api/blockchain/verify` | Status 200, validates cryptographic ledger proof authenticity |
| 12 | **Market Snapshot** | `GET` | `/api/markets/snapshot` | Status 200, returns multi-asset price quotes (Crypto, Stocks, Forex) |
| 13 | **AI Copilot Analysis** | `POST` | `/api/ai/copilot` | Status 200, asserts structured financial response & action proposal |

---

## 3. How to Run via Newman CLI

Newman is the command-line companion runner for Postman.

### Prerequisites
Install Newman globally (or use via npx):
```bash
npm install -g newman
```

### Execution Command
Run the collection against the running API Gateway (`http://localhost:8000`):
```bash
newman run postman/BlockPay_Nexus.postman_collection.json \
  --global-var "baseUrl=http://localhost:8000" \
  --reporters cli,json \
  --reporter-json-export reports/newman-results.json
```

---

## 4. Automated Headless Runner (No Dependencies Required)

For environments without global Newman installed, BlockPay Nexus includes a zero-dependency automated Node.js test runner:

```bash
node scripts/run_postman.js
```

This runner parses `postman/BlockPay_Nexus.postman_collection.json`, verifies every assertion script against the API gateway (or falls back to mock validation if gateway is offline), and outputs a summary.

---

## 5. Importing into Postman Desktop Application

1. Open Postman.
2. Click **Import** in the upper left corner.
3. Drag and drop or browse to `postman/BlockPay_Nexus.postman_collection.json`.
4. Click **Import**.
5. Set the collection variable `baseUrl` to `http://localhost:8000` (or `https://your-production-url.com`).
6. Click **Run Collection** to execute all 13 requests in automated sequence.
