"""
Unit & Integration Tests for BlockPay Nexus - Wallet & Balance Invariants
Verifies double-entry ledgering, zero-negative invariants, and balance locking.
"""

import pytest
from blockpay.services.wallet_service import WalletService


def test_fiat_topup_and_limits():
    ws = WalletService()
    uid = "usr_test_wallet"
    ws.ensure_user_wallets(uid)

    # Valid topup
    res = ws.topup_fiat(uid, 50000.0)
    assert res["success"]
    assert res["balance"] == 50000.0

    # Negative topup rejected
    bad = ws.topup_fiat(uid, -100.0)
    assert not bad["success"]

    # Daily limit check (Limit 200,000)
    over = ws.topup_fiat(uid, 160000.0)
    assert not over["success"]
    assert "Daily top-up limit exceeded" in over["error"]


def test_fiat_debit_non_negative_invariant():
    ws = WalletService()
    uid = "usr_test_debit"
    ws.ensure_user_wallets(uid)
    ws.topup_fiat(uid, 10000.0)

    # Valid debit
    d_res = ws.debit_fiat(uid, 4000.0)
    assert d_res["success"]
    assert d_res["balance"] == 6000.0

    # Overdraft attempt (invariant BR-03: balance cannot go negative)
    overdraft = ws.debit_fiat(uid, 7000.0)
    assert not overdraft["success"]
    assert "Insufficient" in overdraft["error"]

    # Balance remains unchanged
    w = ws.get_fiat_wallet(uid)
    assert w["balance"] == 6000.0


def test_frozen_wallet_prohibits_debits():
    ws = WalletService()
    uid = "usr_frozen_test"
    ws.ensure_user_wallets(uid)
    ws.topup_fiat(uid, 20000.0)
    ws.set_fiat_status(uid, "FROZEN", "Suspicious velocity")

    debit_attempt = ws.debit_fiat(uid, 1000.0)
    assert not debit_attempt["success"]
    assert "FROZEN" in debit_attempt["error"]


def test_crypto_locking_and_release():
    ws = WalletService()
    uid = "usr_crypto_test"
    ws.ensure_user_wallets(uid)
    ws.credit_crypto(uid, "BTC", 1.0)

    lock_res = ws.lock_crypto_balance(uid, "BTC", 0.4)
    assert lock_res["success"]
    assert lock_res["available"] == 0.6
    assert lock_res["locked"] == 0.4

    # Release back
    rel_res = ws.release_crypto_balance(uid, "BTC", 0.4)
    assert rel_res["success"]
    assert rel_res["available"] == 1.0
    assert rel_res["locked"] == 0.0
