# BlockPay Nexus — Microservices Catalog & Data Ownership

BlockPay Nexus implements the **Database-per-Service** architectural pattern. No service queries another service's private tables directly; all cross-service data needs are fulfilled through synchronous REST APIs or asynchronous domain events.

---

## 1. Microservice Registry

| Service Name | Port | Primary Responsibilities | Data Store | Key Design Patterns |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `8080` | Unified ingress, JWT verification, rate limiting, correlation IDs, OpenAPI aggregated docs, SPA serving | Redis (Cache) | API Gateway |
| **Auth & Identity Service** | `8081` | User registration, PBKDF2/BCrypt hashing, JWT generation, RBAC policies, account lockout | `users_db` (Postgres) | MVC, RBAC |
| **Fiat Wallet Service** | `8082` | Double-entry sovereign INR ledger, balance top-ups, daily transaction limit validation, freeze states | `fiat_wallet_db` (Postgres) | Database-per-Service |
| **Crypto Wallet Service** | `8083` | Multi-asset crypto custody (BTC, ETH, USDT, SOL), available vs. locked balance tracking | `crypto_wallet_db` (Postgres) | Database-per-Service |
| **Payment & Transfer Service**| `8084` | Peer-to-peer transfers, state transitions (`INITIATED` &rarr; `COMPLETED`), compensating Saga rollbacks | `payments_db` (Postgres) | Saga, State Machine, Builder |
| **Currency Exchange Service** | `8085` | Bidirectional swaps, 30s locked exchange quotes, transparent fee deductions | `conversion_db` (Postgres) | Strategy Pattern, Saga |
| **Market Data Service** | `8086` | Real-time prices, high/low sparklines, multi-timeframe curves across equities, crypto, ETFs, forex | Redis / In-Memory Cache | Adapter Pattern |
| **Portfolio Intelligence** | `8087` | Consolidated net worth, asset allocation weights, Sharpe ratio, Beta, Value-at-Risk, benchmarks | `portfolio_db` (Postgres) | Aggregator |
| **Financial News & Sentiment**| `8088` | Macro news categorization, NLP sentiment scoring, holdings bi-directional linkage | `news_db` (Postgres) | Observer / Event-Driven |
| **Fraud Detection Engine** | `8089` | Sequential rule pipeline, velocity tracking, 0–100 risk scoring, automated wallet freezing | Redis / In-Memory Cache | Chain of Responsibility |
| **Blockchain Audit Service** | `8090` | Canonical JSON serialization, SHA-256 state root hashing, EVM smart contract anchoring & verification | Local EVM Hardhat Node | Facade, Adapter |
| **Notification Service** | `8091` | Asynchronous event consumption, in-app notification queries, dispatch history | `notifications_db` (Postgres)| Observer / Pub-Sub |
| **Nexus AI Copilot** | `8092` | Macro research synthesis, natural language portfolio queries, guarded action checkpoints | Model Inference Cache | Guarded Autonomy |

---

## 2. Event Bus Communication Schema

All asynchronous events flow over the distributed event bus (`blockpay.events.bus`):

```json
{
  "eventId": "evt_4f9a12c8b0e1",
  "topic": "TRANSACTION_COMPLETED",
  "timestamp": 1728384910.12,
  "payload": {
    "id": "tx_bpx_881920",
    "sender": "kiran_nexus",
    "receiver": "daniel_dev",
    "amount": 15000.0,
    "currency": "INR",
    "blockchainHash": "0x7f49a8c2b7e19d458632ea9b43c68df123490b8e72a45610bcde890f12a34bc1",
    "status": "COMPLETED"
  }
}
```

### Event Catalog:
- `USER_REGISTERED`: Published upon new account creation. Triggers automatic creation of zero-balance Fiat and Crypto wallets.
- `TRANSACTION_INITIATED`: Published when transfer or swap workflow begins.
- `TRANSACTION_COMPLETED`: Triggers notification creation and updates portfolio balances.
- `TRANSACTION_FAILED`: Emitted when an operation is rejected by balance constraints or fraud rules.
- `FRAUD_ALERT_CREATED`: Emitted when risk score &ge; 40. Alerts compliance auditor.
- `AUDIT_RECORDED`: Emitted when a state root is successfully anchored to the EVM smart contract.
