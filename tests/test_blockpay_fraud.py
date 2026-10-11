"""
Unit & Integration Tests for BlockPay Nexus - Fraud & Blockchain Services
Verifies Chain of Responsibility evaluation, risk scores, canonical SHA-256 hashing,
and cryptographic tamper detection.
"""

import pytest
from blockpay.services.fraud_service import FraudService
from blockpay.services.blockchain_service import (
    BlockchainAuditService,
    compute_transaction_hash,
    canonical_json_bytes
)


def test_fraud_chain_of_responsibility_scoring():
    fs = FraudService()

    # Normal transaction -> ALLOW
    normal = fs.evaluate_transaction({
        "txId": "tx_normal_01",
        "userId": "usr_kiran",
        "recipient": "daniel_dev",
        "amount": 5000.0,
        "currency": "INR"
    })
    assert normal["decision"] == "ALLOW"
    assert normal["riskScore"] < 40

    # Materiality threshold (> 300,000) -> REVIEW / BLOCK
    high_mat = fs.evaluate_transaction({
        "txId": "tx_high_02",
        "userId": "usr_kiran",
        "recipient": "daniel_dev",
        "amount": 400000.0,
        "currency": "INR"
    })
    assert "HIGH_MATERIALITY_DEVIATION" in high_mat["rulesTriggered"]
    assert high_mat["riskScore"] >= 45

    # Counterparty anomaly rule -> BLOCK
    bad_party = fs.evaluate_transaction({
        "txId": "tx_bad_03",
        "userId": "usr_kiran",
        "recipient": "suspicious_proxy_bot",
        "amount": 350000.0,
        "currency": "INR"
    })
    assert bad_party["decision"] == "BLOCK"
    assert bad_party["riskScore"] >= 75
    assert len(fs.get_all_alerts()) >= 1


def test_blockchain_canonical_hashing_and_tamper_detection():
    bs = BlockchainAuditService()

    payload = {
        "txId": "tx_bpx_test_verify",
        "sender": "alice",
        "receiver": "bob",
        "amount": 25000.0,
        "currency": "INR",
        "timestamp": "2026-10-08T12:00:00Z"
    }

    # Deterministic hashing (keys ordered)
    h1 = compute_transaction_hash(payload)
    h2 = compute_transaction_hash(dict(reversed(list(payload.items()))))
    assert h1 == h2
    assert h1.startswith("0x")
    assert len(h1) == 66  # 0x + 64 hex characters

    # Anchor to ledger
    bs.anchor_transaction("tx_bpx_test_verify", h1, 25000.0, "INR")

    # 1. Verify unmodified payload -> VERIFIED
    verify_good = bs.verify_transaction("tx_bpx_test_verify", payload)
    assert verify_good["status"] == "VERIFIED"
    assert verify_good["candidateHash"] == h1

    # 2. Tamper payload (amount modified) -> TAMPERED
    tampered_payload = {**payload, "amount": 250000.0}
    verify_tampered = bs.verify_transaction("tx_bpx_test_verify", tampered_payload)
    assert verify_tampered["status"] == "TAMPERED"
    assert verify_tampered["candidateHash"] != verify_tampered["anchoredHash"]

    # 3. Non-anchored reference -> NOT_ANCHORED
    verify_none = bs.verify_transaction("tx_non_existent", payload)
    assert verify_none["status"] == "NOT_ANCHORED"
