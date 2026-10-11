# BlockPay Nexus — CI/CD Pipeline & Automation Architecture

## 1. Overview & Pipeline Philosophy

BlockPay Nexus utilizes **GitHub Actions** for automated continuous integration and continuous delivery. Every pull request and push to the `main` and `master` branches must pass a multi-gate verification pipeline before code is merged or deployed.

File Location: `.github/workflows/ci.yml`

```
┌────────────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS CI/CD PIPELINE                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│    Job 1: Tests     │  │    Job 2: Build     │  │    Job 3: Docker    │
│  - Python 3.9 Setup │  │  - Node.js 20 Setup │  │  - Compose Build    │
│  - Pytest (59/59)   │  │  - Vite Build       │  │  - Health Probes    │
│  - Postman Runner   │  │  - Asset Checks     │  │  - Tear Down        │
│  - E2E Test Runner  │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 2. Pipeline Stages & Jobs

### Job 1: Backend & Integration Tests (`backend-and-integration`)
- **Environment**: `ubuntu-latest`
- **Steps**:
  1. **Checkout Code**: Full repository checkout with submodules.
  2. **Python Setup**: Python 3.9 configured with pip caching.
  3. **Dependency Installation**: `pytest`, `fastapi`, `uvicorn`, `torch`, `torchvision`, `pydantic`.
  4. **Pytest Execution**: Runs all 59 tests across BlockPay microservices and legacy SentinelAI X anomaly detection suites.
     ```bash
     pytest tests/ -v --junitxml=reports/pytest-report.xml
     ```
  5. **Node.js Environment Setup**: Node.js 20 LTS configured.
  6. **Automated Postman API Tests**: Executes `scripts/run_postman.js` asserting all 13 API contract tests.
  7. **Automated E2E Suite**: Executes `scripts/run_e2e.js` validating all 8 cross-service flows.
  8. **Test Artifact Archival**: Saves JUnit XML reports for traceability.

### Job 2: Frontend Build & Bundle Verification (`frontend-build`)
- **Environment**: `ubuntu-latest`
- **Steps**:
  1. **Checkout Code**: Clones workspace.
  2. **Node.js Environment Setup**: Node 20 LTS.
  3. **Dependency Installation**: `npm ci` in `frontend/`.
  4. **Vite Production Compilation**: Runs `npm run build` validating TypeScript, Tailwind compilation, and chunk generation.
  5. **Asset Integrity Check**: Verifies `frontend/dist/index.html` exists and is non-empty.

### Job 3: Container Topology & Image Build (`docker-compose-build`)
- **Environment**: `ubuntu-latest`
- **Steps**:
  1. **Checkout Code**: Clones workspace.
  2. **Docker Compose Build**:
     ```bash
     docker compose build --parallel
     ```
  3. **Container Health Readiness**: Validates all service images compile cleanly without caching bugs or missing dependencies.

---

## 3. Pull Request Protection Rules & Merge Invariants

To maintain research and enterprise standards, the repository enforces the following rules on `main`:
1. **Require status checks to pass before merging**:
   - `backend-and-integration` (Must be Green)
   - `frontend-build` (Must be Green)
   - `docker-compose-build` (Must be Green)
2. **Zero Regressions on Legacy Sentinel Tests**: 43/43 legacy CV tests must always pass.
3. **Double-Entry Balance Integrity**: No merge permitted if wallet balance invariant tests fail.

---

## 4. Local Simulation of CI Pipeline

Developers can simulate the entire CI pipeline locally using a single script or sequential commands:

```bash
# 1. Run Backend Pytest Suite
py -3.9 -m pytest tests -v

# 2. Run API Contract Tests
node scripts/run_postman.js

# 3. Run E2E Financial Flow Tests
node scripts/run_e2e.js

# 4. Verify Frontend Production Build
cd frontend && npm run build && cd ..

# 5. Verify Docker Compose Build
docker-compose build
```
If all five exit with code `0`, the pull request is guaranteed to pass GitHub Actions CI.
