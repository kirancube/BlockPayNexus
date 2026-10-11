# BlockPay Nexus — Architecture Specification

## 1. High-Level System Architecture

BlockPay Nexus is an enterprise-grade, academic hybrid digital wallet and financial intelligence platform. It coordinates 13 distributed microservices behind a unified API Gateway, supporting dual-ledger fiat (INR) and crypto (BTC, ETH, USDT, SOL) custody, distributed Sagas, real-time market data, portfolio intelligence, NLP news sentiment, rule-based fraud triage, and EVM-anchored cryptographic audit logs.

```mermaid
flowchart TD
    subgraph CLIENT["Client Layer (React 19 / Vite / Tailwind / Shadcn)"]
        SPA["BlockPay Nexus SPA\nFinancial Terminal & HUD"]
    end

    subgraph INGRESS["API Gateway & Ingress Layer (Port 8080)"]
        GW["FastAPI / Spring Cloud Gateway\nJWT Bearer & RBAC\nRate Limiter & Correlation ID"]
    end

    subgraph SERVICES["Domain Microservices Mesh"]
        AUTH["Auth & Identity Service\nPBKDF2 / BCrypt + JWT"]
        WALLET["Fiat Wallet Service\nDouble-Entry INR Ledger"]
        CRYPTO["Crypto Wallet Service\nMulti-Asset BTC/ETH/USDT/SOL"]
        PAYMENT["Payment & Transfer Service\nSaga Orchestrator"]
        CONV["Currency Exchange Service\n30s Quote Lock & Strategy Pattern"]
        MARKET["Market Data Engine\nStreaming Equities & Forex"]
        PORTFOLIO["Portfolio Intelligence\nRisk Ratios & Benchmarks"]
        NEWS["Financial News & Sentiment\nNLP Sentiment Engine"]
        FRAUD["Fraud Detection Engine\nChain of Responsibility"]
        AUDIT["Blockchain Audit Service\nCanonical SHA-256 Hasher"]
        NOTIF["Notification Service\nIn-App & Asynchronous Dispatch"]
        AI["Nexus AI Copilot\nGuarded Financial Operations"]
    end

    subgraph DATA["Persistence & Event Mesh"]
        PG[("PostgreSQL 18 Cluster\nDatabase-per-Service (Port 5432)")]
        REDIS[("Redis 7.2 Cache\nSessions & Rate Limits (Port 6379)")]
        MQ{{"RabbitMQ / In-Memory Event Bus\nAsynchronous Topics (Port 5672)"}}
        EVM[("Local Hardhat EVM Node\nNexusAuditLedger.sol (Port 8545)")]
    end

    SPA -->|HTTPS / REST & WebSockets| GW
    GW --> AUTH
    GW --> WALLET
    GW --> CRYPTO
    GW --> PAYMENT
    GW --> CONV
    GW --> MARKET
    GW --> PORTFOLIO
    GW --> NEWS
    GW --> FRAUD
    GW --> AUDIT
    GW --> NOTIF
    GW --> AI

    SERVICES -.->|Read / Write| PG
    SERVICES -.->|Session Cache| REDIS
    SERVICES -.->|Publish / Subscribe| MQ
    AUDIT -.->|JSON-RPC State Roots| EVM
```

---

## 2. Distributed Transaction Saga Pattern (UC-04 & UC-05)

Financial operations spanning multiple microservices (e.g. converting INR to BTC or sending funds) utilize an orchestrated Saga pattern with automated compensating actions on partial failures.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / User
    participant GW as API Gateway
    participant Saga as Payment / Saga Service
    participant Fraud as Fraud Detection Engine
    participant Fiat as Fiat Wallet Service
    participant Crypto as Crypto Wallet Service
    participant Audit as Blockchain Audit Service
    participant EVM as Hardhat EVM Node

    User->>GW: POST /api/v1/conversions (INR -> BTC)
    GW->>Saga: Route Conversion Request
    Saga->>Fraud: Evaluate Risk (Chain of Responsibility)
    alt Risk Score >= 75
        Fraud-->>Saga: BLOCK Decision
        Saga-->>GW: HTTP 403 / Risk Policy Block
        GW-->>User: Transaction Blocked by Nexus Fraud Rule
    else Risk Score < 75
        Fraud-->>Saga: ALLOW Decision
        Saga->>Fiat: Leg 1: Debit INR Amount + Fee
        alt Insufficient Fiat Funds
            Fiat-->>Saga: Debit Failure
            Saga-->>User: HTTP 400 Insufficient Funds
        else Debit Approved
            Fiat-->>Saga: Leg 1 OK (New Balance)
            Saga->>Crypto: Leg 2: Credit Target Asset (BTC)
            alt Downstream Failure
                Crypto-->>Saga: Credit Error
                Saga->>Fiat: Compensating Action: Credit INR Back
                Saga-->>User: HTTP 500 Transaction Rolled Back
            else Credit Successful
                Crypto-->>Saga: Leg 2 OK (BTC Credited)
                Saga->>Audit: Submit Canonical Transaction Payload
                Audit->>Audit: Compute Deterministic SHA-256
                Audit->>EVM: anchorTransaction(txRef, rootHash, amount, asset)
                EVM-->>Audit: Block Receipt (Hash Anchored)
                Audit-->>Saga: Audit State: VERIFIED
                Saga-->>GW: HTTP 200 Conversion Complete
                GW-->>User: Updated Balances & Blockchain Anchor Hash
            end
        end
    end
```

---

## 3. Blockchain Tamper-Evident Audit Mechanism

```mermaid
flowchart LR
    A["Off-Chain Transaction Record\n(txId, amount, currency, timestamp)"] --> B["Canonical JSON Serializer\n(Keys Sorted, Compact)"]
    B --> C["SHA-256 Hasher Engine"]
    C --> D["Candidate Hash Digested"]
    
    E["NexusAuditLedger.sol\nSmart Contract Storage"] --> F["On-Chain Anchored Root"]
    
    D & F --> G{"Byte-for-Byte\nEquality Comparator"}
    G -->|Exact Match| H["VERIFIED (100% Authentic)"]
    G -->|Mismatch| I["TAMPERED (DB Tamper Detected!)"]
    G -->|Not in Storage| J["NOT_ANCHORED (No Chain Record)"]
```

---

## 4. Chain of Responsibility Fraud Detection Architecture

```mermaid
flowchart TD
    TX["Incoming Transaction Payload"] --> R1["Rule 1: Materiality Threshold (> ₹3,00,000)"]
    R1 -->|Evaluated| R2["Rule 2: Velocity Surge (> 4 txs in 60s)"]
    R2 -->|Evaluated| R3["Rule 3: Counterparty Anomaly (Blacklist / Bot)"]
    R3 --> AGG["Aggregate Numeric Score (0–100)"]
    
    AGG --> C1{"Score Evaluation"}
    C1 -->|< 40| DEC1["ALLOW: Fast-Path Settlement"]
    C1 -->|40 – 74| DEC2["REVIEW: Flagged in Admin Queue"]
    C1 -->|>= 75| DEC3["BLOCK: Automatic Freeze Triggered"]
```
