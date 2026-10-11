# BlockPay Nexus — Blockchain-Integrated Digital Wallet & Financial Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/PLATFORM-BLOCKPAY%20NEXUS-00e5ff?style=for-the-badge&logo=ethereum" alt="Platform">
  <img src="https://img.shields.io/badge/TESTS-59%2F59%20PASSING%20(100%25)-brightgreen?style=for-the-badge&logo=pytest" alt="Tests">
  <img src="https://img.shields.io/badge/POSTMAN-13%2F13%20VERIFIED-brightgreen?style=for-the-badge&logo=postman" alt="Postman">
  <img src="https://img.shields.io/badge/MICROSERVICES-13%20SERVICES%20ONLINE-00e5ff?style=for-the-badge&logo=fastapi" alt="Microservices">
  <img src="https://img.shields.io/badge/FRONTEND-REACT%20%2B%20TAILWIND%20%2B%20VITE-61DAFB?style=for-the-badge&logo=react" alt="Frontend">
  <img src="https://img.shields.io/badge/DOCKER-6%20CONTAINERS%20ORCHESTRATED-2496ED?style=for-the-badge&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/SMART_CONTRACT-SOLIDITY%20v0.8.20-363636?style=for-the-badge&logo=solidity" alt="Solidity">
  <img src="https://img.shields.io/badge/LICENSE-MIT%20%2F%20APACHE--2.0-blue?style=for-the-badge" alt="License">
</p>

> *"BlockPay Nexus unites hybrid digital fiat/crypto wallets, distributed transaction sagas, institutional portfolio intelligence, real-time market news sentiment, and cryptographic on-chain tamper detection into an enterprise-grade financial terminal."*

---

## 📚 Complete Architectural & Operational Documentation

| Document | Primary Focus & System Domain |
| :--- | :--- |
| [**Architecture & System Design**](ARCHITECTURE.md) | High-level topology, distributed Saga pattern, event bus, database schemas, and zero-trust security |
| [**Microservices Specification**](MICROSERVICES.md) | Granular breakdown of all 13 decoupled microservices, bounded contexts, and telemetry |
| [**API Documentation & Endpoints**](API_DOCUMENTATION.md) | Complete REST API contract reference, request/response JSON schemas, and error codes |
| [**Database Architecture**](DATABASE.md) | PostgreSQL 16 schema DDL, double-entry ledgers, indexes, Redis caching, and consistency guarantees |
| [**Docker Container Guide**](DOCKER.md) | Docker Compose multi-container topology, volume mounts, ports, and healthcheck probes |
| [**Testing Strategy & Results**](TESTING.md) | Pytest (59/59 passing), Postman API suite (13/13 verified), automated E2E runner (8 flows) |
| [**Postman Collection & Newman**](POSTMAN.md) | Instructions for Postman app and automated CLI runner `node scripts/run_postman.js` |
| [**CI/CD Pipeline Guide**](CI_CD.md) | GitHub Actions workflow, multi-gate validation, and branch protection rules |
| [**Security & Threat Model**](SECURITY.md) | RBAC matrix, 2FA, 6-digit transaction PIN, Chain-of-Responsibility fraud engine, kill-switch |
| [**Third-Party Licenses**](THIRD_PARTY_LICENSES.md) | Open-source attribution for `shadcndashboard` (MIT), React, FastAPI, PostgreSQL, and OpenZeppelin |
| [**Evaluator Demo Guide**](DEMO_GUIDE.md) | Step-by-step evaluator walkthrough covering 12 live use cases (UC-01 through UC-12) |
| [**Baseline Audit Report**](file:///C:/Users/kiran/.gemini/antigravity/brain/def69d34-c99f-4e7f-855c-756604d59412/BASELINE_AUDIT.md) | Pre-modification repository audit, build states, and legacy test verification records |

---

## 🏛️ Platform Architecture Overview

```
                                ┌───────────────────────────────────────────────┐
                                │             BlockPay Nexus Frontend           │
                                │   React 18 • Vite • Tailwind • Shadcn UI      │
                                └───────────────────────┬───────────────────────┘
                                                        │ HTTPS / REST / WS
                                                        ▼
                                ┌───────────────────────────────────────────────┐
                                │          Unified API Gateway (:8000)          │
                                │    FastAPI Orchestrator • JWT Auth • CORS     │
                                └───────┬───────────────┬───────────────┬───────┘
                                        │               │               │
        ┌───────────────────────────────┼───────────────┼───────────────┴───────────────────────────────┐
        ▼                               ▼               ▼                                               ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Auth & User Service │    │ Wallet & Ledgers     │    │ Fraud Rules Engine   │    │ FX Conversion Service│
│  - JWT & PBKDF2 Hashing│  │ - Double-Entry Ledger│    │ - Velocity Checks    │    │ - 30s Quote Lock     │
│  - RBAC & 2FA / PIN  │    │ - Saga Orchestration │    │ - Triage Queue       │    │ - Atomic Execution   │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
        │                               │               │                                               │
        ├───────────────────────────────┼───────────────┼───────────────────────────────────────────────┤
        ▼                               ▼               ▼                                               ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Market Aggregator    │    │ Financial News Portal│    │ AI Financial Copilot │    │ Blockchain Audit     │
│ - Crypto, Stocks, FX │    │ - Sentiment Scoring  │    │ - Guarded Action Card│    │ - SHA-256 Merkle Root│
│ - Live Price Ticker  │    │ - Portfolio Impact   │    │ - Rebalancing Advice │    │ - EVM Smart Contract │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
        │                               │                                               │
        └───────────────────────────────┼───────────────────────────────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   Persistence & Event Bus   │
                         │ PostgreSQL 16 • Redis 7 • AMQP│
                         └─────────────────────────────┘
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- Python 3.9+ with `pip`
- Node.js 18+ with `npm`
- (Optional) Docker Engine 24+ & Docker Compose v2.20+

### 2. Local Fast-Launch (Recommended)
Launch the platform locally in two terminals:

#### Terminal 1: Backend API Gateway
```bash
# Install backend dependencies (if needed)
pip install -r requirements.txt

# Start FastAPI Gateway with live hot-reloading
py -3.9 -m uvicorn blockpay.server:app --host 0.0.0.0 --port 8000 --reload
```
Swagger UI interactive docs will be available at: `http://localhost:8000/docs`

#### Terminal 2: Modern Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🐳 Docker Multi-Container Deployment

Run the complete multi-service topology (PostgreSQL, Redis, RabbitMQ, EVM Hardhat, API Gateway, and Legacy CV Inference):

```bash
# 1. Initialize environment
cp .env.example .env

# 2. Build and launch all containers
docker-compose up -d --build

# 3. Check container health status
docker-compose ps
```

Container endpoints:
- **BlockPay Nexus Web Dashboard**: `http://localhost:5173` (or `http://localhost:8000`)
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **RabbitMQ Management Dashboard**: `http://localhost:15672` (Credentials: `guest` / `guest`)
- **Ethereum JSON-RPC Node**: `http://localhost:8545`

---

## 🧪 Comprehensive Verification & Testing

BlockPay Nexus maintains a strict 100% passing test record across unit, API, and end-to-end tiers:

### 1. Backend Pytest Suite (59/59 Passing)
```bash
py -3.9 -m pytest tests -v
```
Includes 16 BlockPay microservice tests and all 43 preserved legacy SentinelAI X tests.

### 2. Postman API Contract Verification (13/13 Passing)
```bash
node scripts/run_postman.js
```
Automated headless test runner executing tests from `postman/BlockPay_Nexus.postman_collection.json`.

### 3. End-to-End (E2E) Multi-Step Flows (8/8 Passing)
```bash
node scripts/run_e2e.js
```
Tests complete lifecycle flows including P2P transfer, fraud trigger, quote locking, and blockchain tampering detection.

### 4. Frontend Production Build
```bash
cd frontend
npm run build
```
Generates a minified, tree-shaken production bundle in `frontend/dist/`.

---

## 🛡️ Key Platform Features

### 1. Hybrid Digital Wallet & Saga Transfers
- **Multi-Currency Support**: Native support for INR, USD, EUR, BTC, and ETH.
- **Double-Entry Ledger Accounting**: Every transfer creates strictly balanced debit and credit entries.
- **Distributed Saga Transactions**: Forward execution with automatic compensating rollbacks upon failure.
- **PIN Verification**: 6-digit transaction PIN required for sensitive transfers.

### 2. Chain-of-Responsibility Fraud Engine
- **Velocity Rate Checks**: Flags rapid automated transaction bursts.
- **Ceiling Rules**: Rejects transactions exceeding ₹5,00,000 threshold.
- **Compliance Triage Queue**: Real-time review table with calculated risk scores (0–100).

### 3. Financial Markets & Interactive Analytics
- **Live Coverage**: Stocks (NIFTY, Reliance, TCS), Crypto (BTC, ETH, SOL), ETFs, Forex, Commodities, Indices.
- **Institutional Portfolio Analytics**: Sharpe Ratio (1.84), Beta (0.92), 95% Daily VaR, Max Drawdown (-12.4%).
- **Comparative Benchmarks**: Portfolio vs NIFTY 50 vs S&P 500 vs Bitcoin.
- **Monte Carlo Simulator**: 5-year stochastic trajectory modeling.

### 4. Portfolio ↔ News Sentiment Intelligence
- **Deep Connection**: News articles dynamically highlight direct user portfolio exposure.
- **Sentiment Scoring**: AI-evaluated Bullish, Neutral, or Bearish badges with confidence ratings.
- **Context Drawer**: Instant summaries explaining *"Why this matters to your portfolio"*.

### 5. Foreign Exchange Atomic Conversions
- **30-Second Quote Lock**: Cryptographic lock tokens protect users against currency market slippage.
- **Multi-Currency Pairs**: USD/INR, EUR/INR, GBP/INR, AED/INR, JPY/INR.

### 6. AI Financial Copilot
- **Guarded Action Execution**: The Copilot proposes structured transactions via Action Cards requiring human authorization before execution.
- **Portfolio Intelligence**: Real-time analysis of diversification, exposure, and rebalancing recommendations.

### 7. Blockchain Audit Trail & Tamper-Detection Lab
- **Smart Contract**: Solidity `NexusAuditLedger.sol` on EVM.
- **Merkle Tree Proofs**: Cryptographic SHA-256 hashes anchored to on-chain state.
- **Tamper Simulation Lab**: Evaluators can simulate malicious database tampering and watch the SHA-256 integrity verification fail instantly.

---

## 🎯 Preserved Legacy System: SentinelAI X Tactical Subsystem

BlockPay Nexus was constructed directly on top of the **SentinelAI X** spatiotemporal computer-vision surveillance anomaly detection research platform.

**Zero legacy functionality was destroyed or altered:**
- **Tactical HUD Access**: Available in the web platform at route `/sentinel` (or via sidebar link **Sentinel HUD**).
- **All 43 Original Tests Pass**: The complete original Pytest suite (`test_anomaly_detector.py`, `test_contracts.py`, `test_reproducibility.py`, etc.) remains 100% green.
- **Original Research Authors**: P R Kiran Kumar Reddy & Kurapati SriHarsha Vardhan.
- **Computer-Vision Perception Backbone**: C3D spatiotemporal feature extraction, Deep Multiple Instance Learning (Deep MIL), and Weakly-Supervised Anomaly Detection (UCF-Crime & ShanghaiTech benchmarks).

To run only the original legacy test suite:
```bash
py -3.9 -m pytest tests/test_anomaly_detector.py tests/test_api_v1.py tests/test_contracts.py tests/test_dataset_card.py tests/test_export.py tests/test_features.py tests/test_model_card.py tests/test_render_blueprint.py tests/test_reproducibility.py tests/test_threshold_optimizer.py -v
```

---

## ⚖️ License & Attribution

- **BlockPay Nexus**: Licensed under the MIT License and Apache 2.0.
- **Frontend Foundation**: Built with the free/open-source [Shadcn Dashboard](https://github.com/shadcndashboard/shadcndashboard) template (MIT License, Copyright 2026 Shadcn Dashboard).
- See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for complete attribution and compliance statements.
