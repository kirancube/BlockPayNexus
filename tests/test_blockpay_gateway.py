"""
Unit & Integration Tests for BlockPay Nexus - API Gateway Endpoints
Verifies REST endpoints for Auth, Wallets, Markets, Portfolio, and Blockchain Audit.
"""

import pytest
from blockpay.server import app

try:
    from fastapi.testclient import TestClient
    HAS_TESTCLIENT = True
except ImportError:
    HAS_TESTCLIENT = False


@pytest.mark.skipif(not HAS_TESTCLIENT or app is None, reason="TestClient or FastAPI not available")
def test_gateway_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["platform"] == "BlockPay Nexus"


@pytest.mark.skipif(not HAS_TESTCLIENT or app is None, reason="TestClient or FastAPI not available")
def test_gateway_markets_and_portfolio():
    client = TestClient(app)

    # Markets
    res_m = client.get("/api/v1/markets")
    assert res_m.status_code == 200
    assert len(res_m.json()["markets"]) > 0

    # Specific asset
    res_btc = client.get("/api/v1/markets/BTC")
    assert res_btc.status_code == 200
    assert res_btc.json()["asset"]["symbol"] == "BTC"

    # Portfolio
    res_p = client.get("/api/v1/portfolio")
    assert res_p.status_code == 200
    pdata = res_p.json()
    assert pdata["totalPortfolioValue"] > 0
    assert "riskMetrics" in pdata


@pytest.mark.skipif(not HAS_TESTCLIENT or app is None, reason="TestClient or FastAPI not available")
def test_gateway_blockchain_audit_records():
    client = TestClient(app)
    res = client.get("/api/v1/audit/records")
    assert res.status_code == 200
    data = res.json()
    assert "contractAddress" in data
    assert data["totalRecords"] >= 2
