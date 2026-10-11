# BlockPay Nexus — Security Architecture & Threat Model

## 1. Zero-Trust Security Philosophy

BlockPay Nexus is engineered with a **defense-in-depth, zero-trust financial architecture**. All incoming network requests, microservice messages, and state transitions are authenticated, authorized, audited, and cryptographically anchored.

```
                    ┌────────────────────────────────────────┐
                    │          Untrusted Network             │
                    └───────────────────┬────────────────────┘
                                        │ TLS 1.3 / HTTPS
                                        ▼
                    ┌────────────────────────────────────────┐
                    │       Gateway Security Layer           │
                    │ - Rate Limiting (Redis Token Bucket)   │
                    │ - CORS & Secure Headers                │
                    │ - JWT Signature & Expiry Verification  │
                    └───────────────────┬────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ RBAC Access Matrix   │    │  Fraud Detection     │    │ Cryptographic Ledger │
│ - User / Officer     │    │  - Velocity Rule     │    │ - SHA-256 Merkle     │
│ - Admin Privilege    │    │  - Amount Threshold  │    │ - EVM Smart Contract │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

---

## 2. Authentication & Session Security

### A. Password Hashing & Key Derivation
- Passwords are never stored in plaintext or reversible formats.
- Credentials are hashed using PBKDF2 / Argon2id with unique cryptographic salts (100,000+ iterations).
- High entropy requirements: Minimum 8 characters, requiring alphanumeric and special characters.

### B. JWT Token Lifecycles & Rotation
- Access tokens use asymmetric or high-entropy HMAC-SHA256 signatures.
- Short lifespan: 15 minutes for access tokens; 7 days for secure refresh tokens.
- Tokens encode `user_id`, `role`, and `issuance_epoch`.

### C. Multi-Factor Authentication (2FA) & Transaction PIN
- **TOTP 2FA**: Time-based one-time password (RFC 6238) required for login from unrecognized devices and profile modifications.
- **6-Digit Transaction PIN**: Required as a secondary factor for all fund debits exceeding ₹10,000 or any outbound cryptocurrency transfer.
- Failed PIN attempts (3 consecutive) immediately initiate a 30-minute freeze on wallet transfers.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource / Endpoint | Standard User (`user`) | Compliance Officer (`compliance`) | Administrator (`admin`) |
| :--- | :---: | :---: | :---: |
| View Personal Wallet & Portfolio | ✅ | ✅ | ✅ |
| Initiate Transfers & Conversions | ✅ | ❌ | ❌ |
| View Global Transaction Ledgers | ❌ | ✅ | ✅ |
| Trigger Fraud Investigation & Flags| ❌ | ✅ | ✅ |
| Freeze / Unfreeze Any User Wallet | ❌ | ✅ | ✅ |
| Smart Contract Audit Admin | ❌ | ❌ | ✅ |
| Access Microservice Health & Metrics| ❌ | ❌ | ✅ |
| Run Tamper Detection Simulation | ❌ | ✅ | ✅ |

---

## 4. Chain-of-Responsibility Fraud Engine

Before any financial transaction is committed to the database, it passes through the `FraudDetectionEngine` (`blockpay/services/fraud_service.py`):

1. **Velocity Check**: Detects rapid, automated transaction bursts (> 3 transactions within 60 seconds).
2. **Single Transaction Ceiling**: Any transaction exceeding ₹5,00,000 triggers mandatory manual review or rejection.
3. **Blacklist / Sanctions Check**: Evaluates recipient addresses against flagged, sanctioned, or high-risk entity databases.
4. **Behavioral Anomaly Detector**: Flags transactions deviating significantly from the account's historical spending baseline.

Any flagged transaction is immediately blocked and logged to the compliance triage queue with a computed risk score (0–100).

---

## 5. Blockchain Immutability & Audit Trail

All completed transactions are batched, formatted into canonical JSON, and hashed using **SHA-256**. The resulting Merkle roots are committed to the **NexusAuditLedger** Ethereum smart contract (`blockpay/contracts/NexusAuditLedger.sol`).

- **Tamper Evidence**: If any row in the PostgreSQL relational database is maliciously modified, recalculating the SHA-256 hash immediately fails verification against the smart contract's immutable on-chain record.
- **Verification API**: External auditors can call `/api/blockchain/verify` at any time to mathematically verify ledger authenticity.

---

## 6. Emergency Kill-Switch & Account Lockdown

In the event of detected credential compromise or active attack:
- **User-Initiated Freeze**: Users can click "Freeze Wallet" in the Security Center (`/security`), instantly blocking all debit transfers and conversion executions.
- **Admin System Freeze**: Administrators can freeze individual accounts or place the entire gateway into read-only audit mode.

---

## 7. Vulnerability Disclosure Policy

If you discover a security vulnerability in BlockPay Nexus, please report it responsibly:
- **Email**: security@blockpay-nexus.internal
- Do not publicly disclose vulnerabilities until a fix has been verified and released.
