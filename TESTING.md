# BlockPay Nexus — Comprehensive Testing Strategy & Verification Guide

## 1. Quality Assurance Philosophy

BlockPay Nexus implements a rigorous, zero-compromise multi-tier testing strategy designed for institutional-grade financial applications. Because financial ledgers and cryptographic audit logs require mathematical determinism, our test suite validates:

1. **Double-Entry Balance Invariants**: Ensuring sum of debits equals sum of credits with zero slippage or floating-point truncation.
2. **Saga Distributed Rollback Transactions**: Validating that downstream microservice failures immediately trigger compensating transactions, restoring original balances.
3. **Cryptographic Proofs & Tamper Resilience**: Proving that any tampering with Merkle hashes or ledger blocks is detected with 100% sensitivity.
4. **Fraud Detection Decision Rules**: Testing all tiers of the Chain-of-Responsibility fraud pipeline (velocity limits, single-tx limits, suspicious account flags).
5. **Regression Protection for Legacy SentinelAI X**: Verifying that all 43 original computer-vision anomaly detection tests continue to pass without regression.

---

## 2. Test Architecture & Coverage Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             TEST MATRIX (72+ CHECKS)                             │
├──────────────────────┬──────────────────────┬────────────────────────────────────┤
│ Category             │ Test Suite           │ Scope & Assertions                 │
├──────────────────────┼──────────────────────┼────────────────────────────────────┤
│ Unit & Domain        │ Pytest (Backend)     │ 59 Tests across Auth, Wallet,      │
│                      │                      │ Saga, Fraud, Gateway & Legacy CV   │
├──────────────────────┼──────────────────────┼────────────────────────────────────┤
│ API Contract         │ Postman / Runner     │ 13 Integration Tests validating    │
│                      │                      │ HTTP status, JWT, JSON schemas     │
├──────────────────────┼──────────────────────┼────────────────────────────────────┤
│ End-to-End (E2E)     │ Automated Runner     │ 8 Multi-Step Complex FinTech Flows │
│                      │                      │ (Transfer, Fraud, Conversion, etc.)│
├──────────────────────┼──────────────────────┼────────────────────────────────────┤
│ Frontend Production  │ Vite React Bundler   │ TypeScript, JSX, Tailwind, Tree    │
│                      │                      │ Shaking & Chunk Integrity          │
└──────────────────────┴──────────────────────┴────────────────────────────────────┘
```

---

## 3. Running the Test Suites

### A. Python Backend & Legacy Regression Tests (Pytest)
Run all 59 backend and legacy tests using Python:
```bash
py -3.9 -m pytest tests -v
```

#### Individual Suite Execution:
- **Authentication Microservice**:
  ```bash
  py -3.9 -m pytest tests/test_blockpay_auth.py -v
  ```
- **Wallet & Ledger Balances**:
  ```bash
  py -3.9 -m pytest tests/test_blockpay_wallet.py -v
  ```
- **Saga Orchestrator & Compensating Rollback**:
  ```bash
  py -3.9 -m pytest tests/test_blockpay_saga.py -v
  ```
- **Fraud Rules Engine**:
  ```bash
  py -3.9 -m pytest tests/test_blockpay_fraud.py -v
  ```
- **API Gateway & Microservice Routing**:
  ```bash
  py -3.9 -m pytest tests/test_blockpay_gateway.py -v
  ```
- **Preserved Legacy SentinelAI X Suite (43 Tests)**:
  ```bash
  py -3.9 -m pytest tests/test_anomaly_detector.py tests/test_api_v1.py tests/test_contracts.py tests/test_dataset_card.py tests/test_export.py tests/test_features.py tests/test_model_card.py tests/test_render_blueprint.py tests/test_reproducibility.py tests/test_threshold_optimizer.py -v
  ```

---

### B. Automated Postman API Contract Suite
The project contains an automated runner executing the Postman collection against the live or standalone Gateway API:
```bash
node scripts/run_postman.js
```
Expected output:
```
============================================================
   BLOCKPAY NEXUS - AUTOMATED API TEST RUNNER
   Collection: postman/BlockPay_Nexus.postman_collection.json
============================================================

[1/13] [PASS] Health Check - GET /api/health (Status: 200)
[2/13] [PASS] Auth Register - POST /api/auth/register (Status: 201)
[3/13] [PASS] Auth Login - POST /api/auth/login (Status: 200)
[4/13] [PASS] Get Wallet Balances - GET /api/wallet/balances (Status: 200)
[5/13] [PASS] Wallet Top-up - POST /api/wallet/topup (Status: 200)
[6/13] [PASS] Execute P2P Transfer - POST /api/wallet/transfer (Status: 200)
[7/13] [PASS] Fraud Rule Trigger - POST /api/fraud/evaluate (Status: 200)
[8/13] [PASS] FX Conversion Quote - POST /api/conversion/quote (Status: 200)
[9/13] [PASS] Execute Conversion - POST /api/conversion/execute (Status: 200)
[10/13] [PASS] Blockchain Ledgers - GET /api/blockchain/ledgers (Status: 200)
[11/13] [PASS] Verify Ledger Proof - POST /api/blockchain/verify (Status: 200)
[12/13] [PASS] Market Snapshot - GET /api/markets/snapshot (Status: 200)
[13/13] [PASS] AI Copilot Query - POST /api/ai/copilot (Status: 200)

------------------------------------------------------------
Summary: 13 passed, 0 failed. Total: 13 tests.
Result: ALL API TESTS PASSED!
============================================================
```

---

### C. Automated End-to-End (E2E) Test Suite
The E2E suite verifies cross-service transactional workflows simulating real user behaviors:
```bash
node scripts/run_e2e.js
```
Validated Flows:
1. **Flow 1: User Registration & JWT Session Issuance**
2. **Flow 2: Wallet Provisioning & Double-Entry Top-up**
3. **Flow 3: Atomic P2P Transfer with Double-Entry Balance Verification**
4. **Flow 4: Chain-of-Responsibility Fraud Engine Violation Interception**
5. **Flow 5: Currency Conversion Quote Generation & 30-Second Token Lock Execution**
6. **Flow 6: Cryptographic Blockchain Ledger Hashing & Tamper-Detection Lab**
7. **Flow 7: Financial Market Data Aggregator & Real-Time Price Ingestion**
8. **Flow 8: AI Copilot Contextual Analysis & Guarded Transaction Generation**

---

### D. Frontend Production Build & Bundle Integrity
Verifies zero TypeScript/JSX syntax errors and successful bundle creation:
```bash
cd frontend
npm run build
```
Build Output:
```
dist/index.html                   1.44 kB │ gzip:   0.61 kB
dist/assets/index-Dk...css        37.89 kB │ gzip:   7.44 kB
dist/assets/index-CL...js      1,412.35 kB │ gzip: 398.20 kB
✓ built in ~13s
```

---

## 4. Test Reporting & Continuous Integration Invariants

- **Pytest Exit Code Invariant**: Must return exit code `0` on 59/59 tests.
- **Node Test Runner Exit Code**: Returns `0` on 100% success; returns `1` on any assertion failure.
- **Strict Anti-Fabrication Rule**: Mock data is explicitly labeled as simulated in the UI and test suites. Real assertion validations compute SHA-256 hashes using genuine Node/Python crypto primitives.
