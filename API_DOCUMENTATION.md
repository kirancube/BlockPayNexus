# BlockPay Nexus — Comprehensive API Documentation

## 1. Overview & Base URLs

All public client requests and service-to-service interactions pass through the **API Gateway** on port `8080`.

- **Base URL:** `http://localhost:8080`
- **Interactive Swagger UI:** `http://localhost:8080/docs`
- **ReDoc:** `http://localhost:8080/redoc`
- **OpenAPI 3.0 JSON:** `http://localhost:8080/openapi.json`
- **Standard Protocol:** HTTPS/REST with JSON payloads
- **Authentication Scheme:** `Authorization: Bearer <jwt_access_token>`

---

## 2. API Endpoints Catalog

### 2.1 Cluster Health & Ingress

#### `GET /health` or `GET /api/v1/health`
Checks API Gateway status and service liveness.
- **Request:** None
- **Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "platform": "BlockPay Nexus",
  "version": "2.4.0",
  "architecture": "Microservices with Saga Orchestration & EVM Audit",
  "timestamp": 1728384910.12
}
```

#### `GET /api/v1/services`
Retrieves live heartbeat and latency metrics across all 13 microservices.
- **Response (200 OK):**
```json
{
  "gateway": { "port": 8080, "status": "Healthy", "latency": "14ms" },
  "auth": { "port": 8081, "status": "Healthy", "latency": "22ms" },
  "fiatWallet": { "port": 8082, "status": "Healthy", "latency": "28ms" },
  "cryptoWallet": { "port": 8083, "status": "Healthy", "latency": "31ms" },
  "payment": { "port": 8084, "status": "Healthy", "latency": "35ms" },
  "conversion": { "port": 8085, "status": "Healthy", "latency": "19ms" },
  "market": { "port": 8086, "status": "Healthy", "latency": "16ms" },
  "portfolio": { "port": 8087, "status": "Healthy", "latency": "42ms" },
  "news": { "port": 8088, "status": "Healthy", "latency": "48ms" },
  "fraud": { "port": 8089, "status": "Healthy", "latency": "24ms" },
  "blockchain": { "port": 8090, "status": "Healthy", "latency": "54ms" },
  "notification": { "port": 8091, "status": "Healthy", "latency": "18ms" },
  "ai": { "port": 8092, "status": "Healthy", "latency": "65ms" }
}
```

---

### 2.2 Authentication & User Identity (FR-AUTH)

#### `POST /api/v1/auth/register`
Registers a new user account.
- **Request Body:**
```json
{
  "username": "kiran_nexus",
  "email": "kiran@blockpay.nexus",
  "password": "ValidSecurePass#2026",
  "fullName": "P R Kiran Kumar Reddy",
  "role": "USER"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "userId": "usr_bpx_90214",
  "username": "kiran_nexus",
  "role": "USER"
}
```

#### `POST /api/v1/auth/login`
Authenticates credentials and returns 256-bit signed JWT access + refresh tokens.
- **Request Body:**
```json
{
  "username": "kiran_nexus",
  "password": "NexusPass#2026"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "userId": "usr_bpx_90214",
    "username": "kiran_nexus",
    "email": "kiran@blockpay.nexus",
    "role": "USER",
    "fullName": "P R Kiran Kumar Reddy"
  }
}
```

---

### 2.3 Fiat & Crypto Wallets (FR-WALLET, FR-CRYPTO)

#### `GET /api/v1/wallets/fiat`
Retrieves current INR balance, daily limits, and status (`ACTIVE`, `RESTRICTED`, `FROZEN`).
- **Query Param:** `userId` (string)
- **Response (200 OK):**
```json
{
  "wallet": {
    "walletId": "wlt_fiat_inr_001",
    "userId": "usr_bpx_90214",
    "currency": "INR",
    "balance": 450000.0,
    "availableBalance": 450000.0,
    "pendingBalance": 0.0,
    "dailyTopupLimit": 200000.0,
    "dailyTopupUsed": 25000.0,
    "status": "ACTIVE"
  }
}
```

#### `POST /api/v1/wallets/fiat/topup`
Adds simulated INR funds, validating daily and single-transaction limit invariants.
- **Request Body:**
```json
{
  "userId": "usr_bpx_90214",
  "amount": 25000.0
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "balance": 475000.0,
  "ledgerEntry": {
    "entryId": "ldg_fiat_14",
    "walletId": "wlt_fiat_inr_001",
    "type": "TOPUP",
    "amount": 25000.0,
    "balanceAfter": 475000.0,
    "timestamp": "2026-10-08T10:00:00Z"
  }
}
```

#### `GET /api/v1/wallets/crypto`
Retrieves multi-asset crypto holdings (BTC, ETH, USDT, SOL) distinguishing available and locked balances.
- **Query Param:** `userId` (string)
- **Response (200 OK):**
```json
{
  "wallets": [
    { "asset": "BTC", "balance": 0.8540, "available": 0.8540, "locked": 0.0000, "inrRate": 5890000.0 },
    { "asset": "ETH", "balance": 6.2500, "available": 6.2500, "locked": 0.0000, "inrRate": 284500.0 },
    { "asset": "USDT", "balance": 12450.0, "available": 12450.0, "locked": 0.0000, "inrRate": 85.5 },
    { "asset": "SOL", "balance": 42.5000, "available": 42.5000, "locked": 0.0000, "inrRate": 16800.0 }
  ]
}
```

---

### 2.4 Payment & Transfer Sagas (FR-PAYMENT)

#### `POST /api/v1/payments`
Executes peer-to-peer transfer through the distributed Saga State Machine.
- **Request Body:**
```json
{
  "senderId": "usr_bpx_90214",
  "receiverId": "daniel_dev",
  "amount": 10000.0,
  "currency": "INR"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "transaction": {
    "id": "tx_bpx_881920",
    "serviceTraceId": "trc-tx_bpx_881920-saga",
    "type": "TRANSFER",
    "direction": "OUT",
    "sender": "usr_bpx_90214",
    "receiver": "daniel_dev",
    "amount": 10000.0,
    "currency": "INR",
    "status": "COMPLETED",
    "riskScore": 14,
    "fraudDecision": "ALLOW",
    "blockchainHash": "0x7f49a8c2b7e19d458632ea9b43c68df123490b8e72a45610bcde890f12a34bc1",
    "blockchainStatus": "VERIFIED",
    "blockNumber": 1984211,
    "gasUsed": 45200,
    "timeline": [
      { "step": "INITIATED", "ok": true },
      { "step": "VALIDATED", "ok": true },
      { "step": "RISK_CHECK", "ok": true },
      { "step": "PROCESSING", "ok": true },
      { "step": "COMPLETED", "ok": true }
    ]
  }
}
```

---

### 2.5 Currency Exchange & Quotes (FR-CONVERSION)

#### `POST /api/v1/conversions/quote`
Retrieves a locked exchange quote valid for 30 seconds.
- **Request Body:**
```json
{
  "fromAsset": "INR",
  "toAsset": "BTC"
}
```
- **Response (200 OK):**
```json
{
  "quoteId": "quot_1728384912000",
  "fromAsset": "INR",
  "toAsset": "BTC",
  "rate": 5890000.0,
  "validForSeconds": 30,
  "feePercentage": 0.25,
  "feeFlatINR": 125.0
}
```

#### `POST /api/v1/conversions`
Atomically executes fiat-crypto swap using the locked quote and Saga pattern.
- **Request Body:**
```json
{
  "userId": "usr_bpx_90214",
  "fromAsset": "INR",
  "toAsset": "BTC",
  "amount": 50000.0,
  "quoteId": "quot_1728384912000"
}
```

---

### 2.6 Blockchain Audit & Verification (FR-BLOCKCHAIN)

#### `POST /api/v1/audit/verify/{txId}`
Recomputes candidate canonical SHA-256 and compares byte-for-byte against smart contract root.
- **Request Body:** Candidate transaction attributes payload
- **Response (200 OK):**
```json
{
  "status": "VERIFIED",
  "message": "CRYPTOGRAPHIC AUDIT PASSED: Canonical SHA-256 digest matches on-chain state root 100%.",
  "txRef": "tx_bpx_881920",
  "anchoredHash": "0x7f49a8c2b7e19d458632ea9b43c68df123490b8e72a45610bcde890f12a34bc1",
  "blockNumber": 1984211,
  "contractAddress": "0x95AD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  "network": "Academic Hardhat EVM (Local Node, Chain ID 31337)"
}
```
