"""
Unit & Integration Tests for BlockPay Nexus - Auth & Identity Service
Verifies PBKDF2 hashing, password policy validation, JWT creation/verification, and account lockout.
"""

import pytest
from blockpay.services.auth_service import (
    hash_password,
    verify_password,
    validate_password_policy,
    create_jwt,
    verify_jwt,
    AuthService,
)


def test_password_policy_enforcement():
    # Too short (<10)
    ok, err = validate_password_policy("Short1!")
    assert not ok
    assert "at least 10 characters" in err

    # Missing uppercase
    ok, err = validate_password_policy("lowercase123!@")
    assert not ok
    assert "uppercase" in err

    # Missing lowercase
    ok, err = validate_password_policy("UPPERCASE123!@")
    assert not ok
    assert "lowercase" in err

    # Missing digit
    ok, err = validate_password_policy("NoDigitsHere!@#")
    assert not ok
    assert "digit" in err

    # Missing special char
    ok, err = validate_password_policy("NoSpecialChar123")
    assert not ok
    assert "special character" in err

    # Valid password
    ok, err = validate_password_policy("ValidSecurePass#2026")
    assert ok
    assert err is None


def test_password_hashing_and_verification():
    password = "MyComplexPasscode#99"
    h, salt = hash_password(password)
    assert h != password
    assert verify_password(password, h, salt)
    assert not verify_password("WrongPassword#99", h, salt)


def test_jwt_generation_and_validation():
    payload = {"sub": "usr_test_101", "role": "USER", "username": "alice"}
    token = create_jwt(payload, expiry_seconds=60)
    assert isinstance(token, str)
    assert token.count(".") == 2

    decoded = verify_jwt(token)
    assert decoded is not None
    assert decoded["sub"] == "usr_test_101"
    assert decoded["username"] == "alice"
    assert decoded["role"] == "USER"

    # Corrupt token
    assert verify_jwt(token + "corrupt") is None


def test_auth_service_registration_and_lockout():
    svc = AuthService()
    reg = svc.register("charlie", "charlie@test.nexus", "SecurePass#2026", "Charlie Brown")
    assert reg["success"]
    assert reg["username"] == "charlie"

    # Duplicate username
    reg_dup = svc.register("charlie", "charlie2@test.nexus", "SecurePass#2026", "Charlie Brown")
    assert not reg_dup["success"]

    # Successful login
    login_res = svc.login("charlie", "SecurePass#2026")
    assert login_res["success"]
    assert "accessToken" in login_res

    # 5 consecutive failed logins trigger lockout
    for _ in range(4):
        bad = svc.login("charlie", "WrongPass#2026")
        assert not bad["success"]
        assert "Account temporarily locked" not in bad["error"]

    bad_5 = svc.login("charlie", "WrongPass#2026")
    assert not bad_5["success"]
    assert "locked" in bad_5["error"].lower()


def test_transaction_pin_verification_and_lockout():
    svc = AuthService()
    user_id = "usr_bpx_90214"

    # Default PIN seeded
    verify_ok = svc.verify_transaction_pin(user_id, "749201")
    assert verify_ok["success"]

    # Set new 6-digit PIN
    set_res = svc.set_transaction_pin(user_id, "123456")
    assert set_res["success"]

    # Verify new PIN
    assert svc.verify_transaction_pin(user_id, "123456")["success"]

    # Invalid non-6-digit PIN rejection
    bad_fmt = svc.set_transaction_pin(user_id, "123")
    assert not bad_fmt["success"]

    # Failed PIN attempts trigger velocity lockout at 3
    bad_1 = svc.verify_transaction_pin(user_id, "999999")
    assert not bad_1["success"]
    assert bad_1["attemptsRemaining"] == 2

    bad_2 = svc.verify_transaction_pin(user_id, "999999")
    assert not bad_2["success"]
    assert bad_2["attemptsRemaining"] == 1

    bad_3 = svc.verify_transaction_pin(user_id, "999999")
    assert not bad_3["success"]
    assert bad_3.get("locked")
    assert "locked" in bad_3["error"].lower()

