# BlockPay Nexus — Docker Deployment & Container Topology Guide

## 1. Overview & Architecture

BlockPay Nexus utilizes an isolated multi-container topology orchestrated via **Docker Compose**. This topology isolates transactional persistence (PostgreSQL 16), caching/in-memory lock orchestration (Redis 7), asynchronous message broker (RabbitMQ 3.12), smart contract execution testbed (Hardhat Ethereum node), the unified API gateway, and legacy computer-vision surveillance inference.

```
                    ┌────────────────────────────┐
                    │      Host Network / UI     │
                    │   Vite React SPA (5173)    │
                    └──────────────┬─────────────┘
                                   │ HTTP / REST
                                   ▼
                    ┌────────────────────────────┐
                    │     bpx-gateway (:8000)    │
                    │ FastAPI Orchestrator & API │
                    └──────┬──────┬──────┬───────┘
                           │      │      │
       ┌───────────────────┘      │      └───────────────────┐
       ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐          ┌───────────────────┐
│ bpx-postgres │          │  bpx-redis   │          │   bpx-rabbitmq    │
│  PostgreSQL  │          │ In-Memory DB │          │    AMQP Broker    │
│  Port: 5432  │          │  Port: 6379  │          │ Port: 5672, 15672 │
└──────────────┘          └──────────────┘          └───────────────────┘
       │
       ▼
┌──────────────┐
│ bpx-hardhat  │
│ EVM Hardhat  │
│  Port: 8545  │
└──────────────┘
```

---

## 2. Service Definitions

| Container Name | Service ID | Base Image | Internal Port | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bpx-gateway` | `gateway` | `python:3.9-slim` | 8000 | 8000 | Core microservices orchestrator, REST gateway, Swagger UI |
| `bpx-postgres` | `postgres` | `postgres:16-alpine` | 5432 | 5432 | Persistent relational store for users, wallets, ledgers, fraud logs |
| `bpx-redis` | `redis` | `redis:7-alpine` | 6379 | 6379 | FX lock token cache (30s quotes), rate limit tracking, session tokens |
| `bpx-rabbitmq` | `rabbitmq` | `rabbitmq:3.12-management-alpine` | 5672, 15672 | 5672, 15672 | Asynchronous domain event broker (AMQP) & web management console |
| `bpx-hardhat` | `hardhat` | `node:20-alpine` | 8545 | 8545 | Ethereum local JSON-RPC testbed for `NexusAuditLedger.sol` contract |
| `sentinel-command` | `sentinel` | `python:3.9-slim` | 8080 | 8080 | Legacy computer-vision surveillance anomaly inference engine |

---

## 3. Persistent Volumes & Networks

### Volumes
1. `bpx_pgdata`: Bound to `/var/lib/postgresql/data` inside `bpx-postgres`. Ensures transactional persistence across restarts.
2. `bpx_redisdata`: Bound to `/data` inside `bpx-redis`. Supports AOF/RDB persistence.
3. `bpx_rabbitmqdata`: Bound to `/var/lib/rabbitmq` inside `bpx-rabbitmq`. Persists queue state, durable bindings, and dead-letter topics.

### Networks
- `bpx-network`: Custom bridge network (`driver: bridge`) enabling inter-container DNS discovery using service names (e.g. `http://bpx-postgres:5432`).

---

## 4. Quick Start Commands

### Prerequisites
- Docker Engine 24.0+
- Docker Compose v2.20+

### Step-by-Step Instructions

#### 1. Configuration Setup
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

#### 2. Start Core Infrastructure Services
Launch databases, cache, and message queues in detached mode:
```bash
docker-compose up -d postgres redis rabbitmq hardhat
```

#### 3. Build & Launch API Gateway
Build the Python 3.9 microservices container and start the platform:
```bash
docker-compose up -d --build gateway
```

#### 4. Launch Entire Stack (All Services)
```bash
docker-compose up -d --build
```

#### 5. Verify Running Containers
```bash
docker-compose ps
```
Expected output:
```
NAME               IMAGE                             STATUS         PORTS
bpx-gateway        sentinel-aix-gateway             Up (healthy)   0.0.0.0:8000->8000/tcp
bpx-postgres       postgres:16-alpine                Up (healthy)   0.0.0.0:5432->5432/tcp
bpx-redis          redis:7-alpine                    Up (healthy)   0.0.0.0:6379->6379/tcp
bpx-rabbitmq       rabbitmq:3.12-management-alpine   Up (healthy)   0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
bpx-hardhat        node:20-alpine                    Up (healthy)   0.0.0.0:8545->8545/tcp
```

#### 6. Inspect Gateway Logs
```bash
docker-compose logs -f gateway
```

#### 7. Stop and Clean Up
Stop all containers while preserving volume data:
```bash
docker-compose down
```
To purge all volumes (reset database to zero):
```bash
docker-compose down -v
```

---

## 5. Health Checks & Readiness Probes

All compose services define robust healthcheck probes:

- **PostgreSQL**: `pg_isready -U postgres -d blockpay_nexus` (Interval: 10s, Retries: 5)
- **Redis**: `redis-cli ping` (Interval: 10s, Retries: 3)
- **RabbitMQ**: `rabbitmq-diagnostics -q ping` (Interval: 15s, Retries: 5)
- **Gateway**: `curl -f http://localhost:8000/api/health` (Interval: 10s, Retries: 3)

The API Gateway depends on database and message broker health:
```yaml
depends_on:
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
  rabbitmq:
    condition: service_healthy
```

---

## 6. Accessing Container UIs

- **BlockPay Nexus API Swagger Docs**: `http://localhost:8000/docs`
- **RabbitMQ Management Dashboard**: `http://localhost:15672` (Credentials: `guest` / `guest`)
- **Ethereum JSON-RPC Node**: `http://localhost:8545`
