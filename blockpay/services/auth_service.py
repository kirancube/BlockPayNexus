"""
BlockPay Nexus - Authentication & Identity Microservice
Implements secure user registration, password policy verification,
salted key derivation, JWT issuance, and cool-down account lockout.
"""

import os
import time
import hmac
import hashlib
import base64
import json
import re
from typing import Dict, Any, Optional, Tuple
from blockpay.events.bus import event_bus, EventTopics

JWT_SECRET = os.getenv("JWT_SECRET", "bpx_super_secure_jwt_secret_key_2026_fintech_token_99x")
ACCESS_TOKEN_EXPIRY = 900       # 15 minutes
REFRESH_TOKEN_EXPIRY = 604800   # 7 days


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Derives a salted cryptographic key using PBKDF2-HMAC-SHA256 (100k rounds)."""
    if not salt:
        salt = base64.b64encode(os.urandom(16)).decode('utf-8')
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
    hash_str = base64.b64encode(key).decode('utf-8')
    return hash_str, salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(stored_hash, new_hash)


def validate_password_policy(password: str) -> Tuple[bool, Optional[str]]:
    """Enforces SRS BR-02: >=10 chars, upper, lower, digit, special char."""
    if len(password) < 10:
        return False, "Password must be at least 10 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."
    return True, None


def create_jwt(payload: Dict[str, Any], expiry_seconds: int = ACCESS_TOKEN_EXPIRY) -> str:
    """Creates a signed HMAC-SHA256 JWT."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {**payload, "iat": now, "exp": now + expiry_seconds}

    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{header_b64}.{payload_b64}".encode()

    sig = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    """Validates signature and expiration of JWT."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        # Verify signature
        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
        
        # Add back base64 padding
        padding = 4 - (len(sig_b64) % 4)
        if padding != 4:
            sig_b64 += "=" * padding
        actual_sig = base64.urlsafe_b64decode(sig_b64.encode())

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        # Decode payload
        payload_padding = 4 - (len(payload_b64) % 4)
        if payload_padding != 4:
            payload_b64 += "=" * payload_padding
        payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        payload = json.loads(payload_json)

        # Check expiration
        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


class AuthService:
    def __init__(self):
        # In-memory user store for mock/seed data
        self.users: Dict[str, Dict[str, Any]] = {}
        self.failed_attempts: Dict[str, int] = {}
        self.lockout_until: Dict[str, float] = {}
        # Hashed 6-digit transaction PINs with per-user salt and velocity lockout
        self.user_pins: Dict[str, Dict[str, Any]] = {}

        # Seed default deterministic users
        self._seed_default_users()

    def _seed_default_users(self):
        # Demo user
        h, s = hash_password("NexusPass#2026")
        self.users["kiran_nexus"] = {
            "userId": "usr_bpx_90214",
            "username": "kiran_nexus",
            "email": "kiran@blockpay.nexus",
            "fullName": "P R Kiran Kumar Reddy",
            "passwordHash": h,
            "salt": s,
            "role": "USER",
            "createdAt": "2026-08-01T10:00:00Z"
        }
        # Seed default PIN 749201 securely hashed
        pin_h, pin_s = hash_password("749201")
        self.user_pins["usr_bpx_90214"] = {
            "pinHash": pin_h,
            "salt": pin_s,
            "failedAttempts": 0,
            "lockedUntil": 0,
            "updatedAt": "2026-08-01T10:00:00Z"
        }
        self.user_pins["kiran_nexus"] = self.user_pins["usr_bpx_90214"]
        # Admin
        h, s = hash_password("AdminSecure#2026")
        self.users["admin_root"] = {
            "userId": "usr_bpx_90218",
            "username": "admin_root",
            "email": "admin@blockpay.nexus",
            "fullName": "Nexus Administrator",
            "passwordHash": h,
            "salt": s,
            "role": "ADMIN",
            "createdAt": "2026-08-01T10:00:00Z"
        }
        # Auditor
        h, s = hash_password("AuditorKey#2026")
        self.users["auditor_sec"] = {
            "userId": "usr_bpx_90217",
            "username": "auditor_sec",
            "email": "auditor@blockpay.nexus",
            "fullName": "Auditor Lead",
            "passwordHash": h,
            "salt": s,
            "role": "AUDITOR",
            "createdAt": "2026-08-01T10:00:00Z"
        }

    def register(self, username: str, email: str, password: str, full_name: str, role: str = "USER") -> Dict[str, Any]:
        """Registers a new user account."""
        if username in self.users:
            return {"success": False, "error": "Username already taken."}
        
        # Check email uniqueness
        for u in self.users.values():
            if u["email"].lower() == email.lower():
                return {"success": False, "error": "Email already registered."}

        # Password policy
        valid, msg = validate_password_policy(password)
        if not valid:
            return {"success": False, "error": msg}

        p_hash, salt = hash_password(password)
        user_id = f"usr_bpx_{int(time.time())}"
        user_record = {
            "userId": user_id,
            "username": username,
            "email": email,
            "fullName": full_name,
            "passwordHash": p_hash,
            "salt": salt,
            "role": role if role in ["USER", "ADMIN", "AUDITOR"] else "USER",
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        self.users[username] = user_record

        # Publish event
        event_bus.publish(EventTopics.USER_REGISTERED, {
            "userId": user_id,
            "username": username,
            "email": email,
            "role": user_record["role"]
        })

        return {"success": True, "userId": user_id, "username": username, "role": user_record["role"]}

    def login(self, username_or_email: str, password: str) -> Dict[str, Any]:
        """Authenticates user and returns JWT access + refresh tokens."""
        now = time.time()
        # Find user
        user = None
        for u in self.users.values():
            if u["username"].lower() == username_or_email.lower() or u["email"].lower() == username_or_email.lower():
                user = u
                break

        if not user:
            return {"success": False, "error": "Invalid credentials provided."}

        uname = user["username"]

        # Check account lockout (FR-AUTH-010)
        if self.lockout_until.get(uname, 0) > now:
            remaining = int(self.lockout_until[uname] - now)
            return {"success": False, "error": f"Account locked due to consecutive failed attempts. Retry in {remaining}s."}

        if not verify_password(password, user["passwordHash"], user["salt"]):
            attempts = self.failed_attempts.get(uname, 0) + 1
            self.failed_attempts[uname] = attempts
            if attempts >= 5:
                self.lockout_until[uname] = now + 900  # 15 minutes lockout
                self.failed_attempts[uname] = 0
                return {"success": False, "error": "Account temporarily locked due to 5 consecutive failed attempts."}
            return {"success": False, "error": "Invalid credentials provided."}

        # Reset failed attempts
        self.failed_attempts[uname] = 0

        # Issue tokens
        claims = {
            "sub": user["userId"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
        access_token = create_jwt(claims, ACCESS_TOKEN_EXPIRY)
        refresh_token = create_jwt({"sub": user["userId"], "type": "refresh"}, REFRESH_TOKEN_EXPIRY)

        return {
            "success": True,
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "tokenType": "Bearer",
            "expiresIn": ACCESS_TOKEN_EXPIRY,
            "user": {
                "userId": user["userId"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "fullName": user["fullName"]
            }
        }

    def get_user(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Resolves user by username, email, or userId."""
        for u in self.users.values():
            if u["username"].lower() == identifier.lower() or u["email"].lower() == identifier.lower() or u["userId"] == identifier:
                return u
        return None

    def set_transaction_pin(self, user_identifier: str, new_pin: str) -> Dict[str, Any]:
        """Hashes 6-digit PIN with PBKDF2-HMAC-SHA256 and unique cryptographic salt."""
        if not new_pin or not re.match(r"^\d{6}$", str(new_pin).strip()):
            return {"success": False, "error": "Transaction PIN must be exactly 6 numeric digits."}
        
        pin_clean = str(new_pin).strip()
        p_hash, salt = hash_password(pin_clean)
        pin_record = {
            "pinHash": p_hash,
            "salt": salt,
            "failedAttempts": 0,
            "lockedUntil": 0,
            "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        self.user_pins[user_identifier] = pin_record
        user = self.get_user(user_identifier)
        if user:
            self.user_pins[user["userId"]] = pin_record
            self.user_pins[user["username"]] = pin_record

        return {
            "success": True,
            "message": "6-digit Transaction PIN hashed and secured on server with PBKDF2-HMAC-SHA256."
        }

    def verify_transaction_pin(self, user_identifier: str, pin: str) -> Dict[str, Any]:
        """Constant-time verification of 6-digit transaction PIN with velocity lockout."""
        if not pin or len(str(pin).strip()) != 6:
            return {"success": False, "error": "Invalid PIN format. Exactly 6 numeric digits required."}

        now = time.time()
        record = self.user_pins.get(user_identifier)
        if not record:
            user = self.get_user(user_identifier)
            if user:
                record = self.user_pins.get(user["userId"]) or self.user_pins.get(user["username"])

        if not record:
            # Seed default 749201 for backward compatibility
            self.set_transaction_pin(user_identifier, "749201")
            record = self.user_pins.get(user_identifier)

        # Velocity lockout check (FR-AUTH-010)
        if record.get("lockedUntil", 0) > now:
            remaining = int(record["lockedUntil"] - now)
            return {
                "success": False,
                "error": f"Transaction PIN locked due to excessive failed attempts. Try again in {remaining}s.",
                "locked": True,
                "lockoutRemaining": remaining
            }

        pin_clean = str(pin).strip()
        if not verify_password(pin_clean, record["pinHash"], record["salt"]):
            attempts = record.get("failedAttempts", 0) + 1
            record["failedAttempts"] = attempts
            if attempts >= 3:
                record["lockedUntil"] = now + 900  # 15 minutes lockout
                record["failedAttempts"] = 0
                return {
                    "success": False,
                    "error": "Security Alert: Transaction PIN locked for 15 minutes after 3 failed attempts.",
                    "locked": True,
                    "attemptsRemaining": 0
                }
            return {
                "success": False,
                "error": f"Incorrect Transaction PIN. {3 - attempts} attempt(s) remaining.",
                "attemptsRemaining": 3 - attempts
            }

        # Success - reset attempts
        record["failedAttempts"] = 0
        record["lockedUntil"] = 0
        return {"success": True, "message": "Transaction PIN verified successfully."}


auth_service = AuthService()
