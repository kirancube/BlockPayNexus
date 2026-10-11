# BlockPay Nexus — Database Architecture & Schema Specification

## 1. Architectural Philosophy: Database-per-Service

In strict adherence to microservice domain boundaries, BlockPay Nexus prohibits monolithic shared database access. Each service maintains exclusive ownership over its logical schema in PostgreSQL 18:

```text
PostgreSQL 18 Cluster (bpx-db: 5432)
  ├── auth_schema          -> Managed by Auth & Identity Service
  ├── fiat_wallet_schema   -> Managed by Fiat Wallet Service
  ├── crypto_wallet_schema -> Managed by Crypto Wallet Service
  ├── payment_schema       -> Managed by Payment & Transfer Service
  ├── conversion_schema    -> Managed by Currency Exchange Service
  ├── fraud_schema         -> Managed by Fraud Detection Service
  ├── audit_schema         -> Managed by Blockchain Audit Service
  └── notification_schema  -> Managed by Notification Service
```

---

## 2. Table DDL Definitions

### 2.1 Authentication (`auth_schema.users`)
```sql
CREATE TABLE auth_schema.users (
    user_id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'AUDITOR')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Sovereign Fiat Wallet (`fiat_wallet_schema.wallets` & `ledger_entries`)
```sql
CREATE TABLE fiat_wallet_schema.wallets (
    wallet_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    balance NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00), -- BR-03 Invariant
    available_balance NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0.00),
    pending_balance NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    daily_topup_limit NUMERIC(18, 2) DEFAULT 200000.00,
    daily_topup_used NUMERIC(18, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESTRICTED', 'FROZEN')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fiat_wallet_schema.ledger_entries (
    entry_id VARCHAR(64) PRIMARY KEY,
    wallet_id VARCHAR(64) NOT NULL REFERENCES fiat_wallet_schema.wallets(wallet_id),
    user_id VARCHAR(64) NOT NULL,
    type VARCHAR(30) NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    balance_after NUMERIC(18, 2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Cryptocurrency Wallets (`crypto_wallet_schema.wallets` & `ledger_entries`)
```sql
CREATE TABLE crypto_wallet_schema.wallets (
    wallet_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    asset VARCHAR(10) NOT NULL, -- 'BTC', 'ETH', 'USDT', 'SOL'
    balance NUMERIC(24, 8) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    available_balance NUMERIC(24, 8) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0.00),
    locked_balance NUMERIC(24, 8) NOT NULL DEFAULT 0.00 CHECK (locked_balance >= 0.00),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_asset UNIQUE (user_id, asset)
);

CREATE TABLE crypto_wallet_schema.ledger_entries (
    entry_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    amount NUMERIC(24, 8) NOT NULL,
    balance_after NUMERIC(24, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.4 Payment Transactions (`payment_schema.transactions`)
```sql
CREATE TABLE payment_schema.transactions (
    transaction_id VARCHAR(64) PRIMARY KEY,
    service_trace_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    fee NUMERIC(18, 4) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CHECK (status IN ('INITIATED', 'VALIDATED', 'RISK_CHECK', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED')),
    risk_score INT NOT NULL,
    fraud_decision VARCHAR(20) NOT NULL,
    blockchain_hash VARCHAR(66),
    block_number BIGINT,
    gas_used INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Data Integrity & Retention Constraints
- **Zero Arbitrary Updates:** Balance fields are updated exclusively via transactional ledger entry creation inside database transactions.
- **Fixed-Point Precision:** Monetary values use `NUMERIC(18, 2)` (fiat) and `NUMERIC(24, 8)` (crypto). Floating point types (`FLOAT`, `DOUBLE`) are strictly prohibited to eliminate rounding discrepancies.
- **Immutable Financial Records:** Transaction and ledger entries are permanently retained without hard deletes. Corrective actions are recorded as compensating entries.
