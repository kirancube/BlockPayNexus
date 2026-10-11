"""
BlockPay Nexus - Blockchain Audit & Verification Microservice
Implements deterministic SHA-256 canonical hashing of transaction payloads,
local EVM smart contract anchor simulation, and cryptographic tamper detection.
"""

import hashlib
import json
import time
from typing import Dict, Any, Optional, Tuple
from blockpay.events.bus import event_bus, EventTopics

SMART_CONTRACT_ADDRESS = "0x95AD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"
NETWORK_NAME = "Academic Hardhat EVM (Local Node, Chain ID 31337)"


def canonical_json_bytes(payload: Dict[str, Any]) -> bytes:
    """Serializes payload into canonical JSON (sorted keys, compact delimiters) for deterministic hashing."""
    return json.dumps(payload, sort_keys=True, separators=(',', ':')).encode('utf-8')


def compute_transaction_hash(payload: Dict[str, Any]) -> str:
    """Computes SHA-256 state root over canonical transaction representation (BC-003)."""
    raw_bytes = canonical_json_bytes(payload)
    digest = hashlib.sha256(raw_bytes).hexdigest()
    return f"0x{digest}"


class BlockchainAuditService:
    def __init__(self):
        # txRef -> { rootHash, timestamp, blockNumber, gasUsed, asset, amount }
        self._on_chain_ledger: Dict[str, Dict[str, Any]] = {}
        self.contract_address = SMART_CONTRACT_ADDRESS
        self.network = NETWORK_NAME
        self.current_block = 1984210

        self._seed_default_anchors()

    def _seed_default_anchors(self):
        # Seed default txs
        tx1 = {
            "txId": "tx_bpx_881920",
            "sender": "kiran_nexus",
            "receiver": "daniel_dev",
            "amount": 15000.0,
            "currency": "INR",
            "timestamp": "2026-10-08T10:14:22Z"
        }
        h1 = compute_transaction_hash(tx1)
        self.anchor_transaction("tx_bpx_881920", h1, 15000.0, "INR")

        tx2 = {
            "txId": "tx_bpx_881919",
            "sender": "kiran_nexus",
            "receiver": "kiran_nexus",
            "amount": 100000.0,
            "currency": "INR -> BTC",
            "timestamp": "2026-10-08T09:42:05Z"
        }
        h2 = compute_transaction_hash(tx2)
        self.anchor_transaction("tx_bpx_881919", h2, 100000.0, "INR")

    def anchor_transaction(self, tx_ref: str, root_hash: str, amount: float, asset: str) -> Dict[str, Any]:
        """Anchors transaction hash to smart contract on local EVM node (BC-001, BC-004)."""
        self.current_block += 1
        record = {
            "txReference": tx_ref,
            "rootHash": root_hash,
            "amount": amount,
            "asset": asset,
            "timestamp": int(time.time()),
            "blockNumber": self.current_block,
            "gasUsed": 45200,
            "contractAddress": self.contract_address,
            "network": self.network,
        }
        self._on_chain_ledger[tx_ref] = record

        event_bus.publish(EventTopics.AUDIT_RECORDED, record)
        return record

    def verify_transaction(self, tx_ref: str, candidate_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cryptographic verification:
        Recomputes candidate SHA-256 and compares byte-for-byte against on-chain record (BC-005).
        Returns VERIFIED, TAMPERED, or NOT_ANCHORED.
        """
        if tx_ref not in self._on_chain_ledger:
            return {
                "status": "NOT_ANCHORED",
                "message": "Transaction was not anchored to the blockchain audit ledger.",
                "txRef": tx_ref,
            }

        anchored_record = self._on_chain_ledger[tx_ref]
        candidate_hash = compute_transaction_hash(candidate_payload)

        is_match = (candidate_hash.lower() == anchored_record["rootHash"].lower())

        if is_match:
            return {
                "status": "VERIFIED",
                "message": "CRYPTOGRAPHIC AUDIT PASSED: Canonical SHA-256 digest matches on-chain state root 100%.",
                "txRef": tx_ref,
                "anchoredHash": anchored_record["rootHash"],
                "candidateHash": candidate_hash,
                "blockNumber": anchored_record["blockNumber"],
                "contractAddress": self.contract_address,
                "network": self.network,
            }
        else:
            return {
                "status": "TAMPERED",
                "message": "SECURITY ALERT: Payload discrepancy detected! Stored database attributes do not match anchored root.",
                "txRef": tx_ref,
                "anchoredHash": anchored_record["rootHash"],
                "candidateHash": candidate_hash,
                "blockNumber": anchored_record["blockNumber"],
                "contractAddress": self.contract_address,
                "network": self.network,
            }

    def get_audit_record(self, tx_ref: str) -> Optional[Dict[str, Any]]:
        return self._on_chain_ledger.get(tx_ref)

    def get_all_audit_records(self) -> Dict[str, Any]:
        return {
            "contractAddress": self.contract_address,
            "network": self.network,
            "totalRecords": len(self._on_chain_ledger),
            "records": list(self._on_chain_ledger.values())
        }


blockchain_service = BlockchainAuditService()
