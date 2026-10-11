"""
Unit & Integration Tests for BlockPay Nexus - Payment Saga & Conversion
Verifies distributed transaction lifecycle, compensating rollbacks, and quote validity windows.
"""

import pytest
from blockpay.services.payment_service import PaymentService, TransactionStatus
from blockpay.services.conversion_service import ConversionService
from blockpay.services.wallet_service import wallet_service


def test_payment_saga_successful_lifecycle():
    ps = PaymentService()
    sender = "usr_bpx_90214"
    receiver = "daniel_dev"
    wallet_service.topup_fiat(sender, 50000.0)

    res = ps.execute_transfer(sender, receiver, 12000.0, "INR")
    assert res["success"]
    tx = res["transaction"]
    assert tx["status"] == TransactionStatus.COMPLETED
    assert tx["blockchainStatus"] == "VERIFIED"
    assert tx["blockchainHash"].startswith("0x")
    assert len(tx["timeline"]) == 5


def test_payment_saga_insufficient_balance_rejection():
    ps = PaymentService()
    sender = "usr_poor_user"
    receiver = "daniel_dev"
    wallet_service.ensure_user_wallets(sender)

    res = ps.execute_transfer(sender, receiver, 999999.0, "INR")
    assert not res["success"]
    tx = res["transaction"]
    assert tx["status"] == TransactionStatus.FAILED
    assert "Insufficient" in tx["failReason"]


def test_conversion_quote_locking_and_execution():
    cs = ConversionService()
    uid = "usr_bpx_90214"
    wallet_service.topup_fiat(uid, 100000.0)

    # Fetch 30-sec quote
    quote = cs.get_quote("INR", "BTC")
    assert quote["fromAsset"] == "INR"
    assert quote["toAsset"] == "BTC"
    assert quote["validForSeconds"] == 30
    assert quote["quoteId"].startswith("quot_")

    # Execute conversion using quote
    conv_res = cs.execute_conversion(uid, "INR", "BTC", 50000.0, quote_id=quote["quoteId"])
    assert conv_res["success"]
    c = conv_res["conversion"]
    assert c["outputAmount"] > 0
    assert c["blockchainHash"].startswith("0x")


def test_payment_saga_idempotency_prevents_double_spend():
    ps = PaymentService()
    sender = "usr_bpx_90214"
    receiver = "daniel_dev"
    wallet_service.topup_fiat(sender, 50000.0)

    initial_bal = wallet_service.get_fiat_wallet(sender)["availableBalance"]
    idem_key = "idemp_test_unique_key_12345"

    # First request
    res1 = ps.execute_transfer(sender, receiver, 5000.0, "INR", idempotency_key=idem_key)
    assert res1["success"]
    bal_after_first = wallet_service.get_fiat_wallet(sender)["availableBalance"]
    assert bal_after_first == initial_bal - 5000.0

    # Duplicate request with same idempotency key
    res2 = ps.execute_transfer(sender, receiver, 5000.0, "INR", idempotency_key=idem_key)
    assert res2["success"]
    assert res2["transaction"]["id"] == res1["transaction"]["id"]

    # Balance must NOT be debited twice!
    bal_after_duplicate = wallet_service.get_fiat_wallet(sender)["availableBalance"]
    assert bal_after_duplicate == bal_after_first


def test_payment_saga_pin_verification():
    ps = PaymentService()
    sender = "usr_bpx_90214"
    receiver = "daniel_dev"
    wallet_service.topup_fiat(sender, 50000.0)

    # Transfer with valid PIN
    res_ok = ps.execute_transfer(sender, receiver, 2000.0, "INR", pin="749201")
    assert res_ok["success"]

    # Transfer with invalid PIN
    res_bad = ps.execute_transfer(sender, receiver, 2000.0, "INR", pin="000000")
    assert not res_bad["success"]
    assert "PIN" in res_bad["error"]

