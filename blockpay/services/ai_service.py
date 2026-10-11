"""
BlockPay Nexus - AI Copilot Microservice
Provides conversational research assistance, natural language portfolio insights,
and policy-governed guarded action proposals requiring explicit human confirmation.
"""

from typing import Dict, Any, List, Optional
from blockpay.services.portfolio_service import portfolio_service
from blockpay.services.wallet_service import wallet_service


class AiService:
    def process_query(self, query: str, user_id: str = "usr_bpx_90214") -> Dict[str, Any]:
        lower = query.lower()
        portfolio = portfolio_service.get_portfolio_summary(user_id)

        if "why did my portfolio" in lower or "rise" in lower:
            answer = (
                f"Your portfolio gained +₹34,500 (+0.34%) today, driven primarily by Solana (+4.61%), "
                f"Bitcoin (+2.52%), and Reliance Industries (+1.16%). Institutional ETF inflows into digital assets "
                f"provided the primary macro tailwind."
            )
            return {"answer": answer, "guardedAction": None}

        elif "crypto exposure" in lower or "highest exposure" in lower:
            crypto_val = portfolio["allocation"]["Crypto"]
            tot = portfolio["totalPortfolioValue"]
            pct = round((crypto_val / tot) * 100, 1)
            answer = (
                f"Your digital asset allocation stands at ₹{crypto_val:,} ({pct}% of total wealth). "
                f"Bitcoin represents your largest single holding (28.2%), followed by Ethereum (10.0%). "
                f"Under institutional guidelines, exposure exceeding 25% requires active risk monitoring."
            )
            return {"answer": answer, "guardedAction": None}

        elif "freeze" in lower and "wallet" in lower:
            answer = "Emergency wallet freeze proposal generated. Under the Nexus Safety Protocol, explicit human confirmation is required."
            action = {
                "type": "FREEZE_WALLET",
                "title": "Guarded Action: Immediate Wallet Freeze",
                "description": "Lock all outgoing transfers, withdrawals, and conversions across Fiat and Crypto wallets.",
                "actionName": "Confirm Emergency Freeze"
            }
            return {"answer": answer, "guardedAction": action}

        elif "send" in lower or "transfer" in lower:
            answer = "P2P transfer proposal generated. Financial operations require human authorization under Dual-Control standards."
            action = {
                "type": "TRANSFER",
                "title": "Guarded Action: Send Funds",
                "description": "Execute transfer with on-chain cryptographic anchor on academic EVM node.",
                "actionName": "Confirm & Execute Transfer"
            }
            return {"answer": answer, "guardedAction": action}

        else:
            answer = (
                f"I have evaluated your request against the BlockPay Nexus microservices data layer. "
                f"Total active portfolio valuation: ₹{portfolio['totalPortfolioValue']:,}. "
                f"Risk classification: {portfolio['riskClassification']} (Score: {portfolio['riskScore']}/100)."
            )
            return {"answer": answer, "guardedAction": None}


ai_service = AiService()
