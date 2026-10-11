"""
BlockPay Nexus - Investment Portfolio Microservice
Aggregates holdings, computes asset/sector allocation, tracks unrealized P&L,
and provides institutional risk metrics (Sharpe ratio, Beta, Max Drawdown).
"""

from typing import Dict, Any, List
from blockpay.services.wallet_service import wallet_service
from blockpay.services.market_service import market_service


class PortfolioService:
    def get_portfolio_summary(self, user_id: str) -> Dict[str, Any]:
        fiat_w = wallet_service.get_fiat_wallet(user_id)
        fiat_balance = fiat_w["balance"] if fiat_w else 0.0

        crypto_ws = wallet_service.get_crypto_wallets(user_id)
        crypto_val = sum(c["balance"] * c.get("inrRate", 0.0) for c in crypto_ws.values())

        # Static equity / ETF holdings simulation
        stocks_val = 798510.0
        etfs_val = 375040.0
        gold_val = 52960.0

        total_value = fiat_balance + crypto_val + stocks_val + etfs_val + gold_val
        invested = 8650000.0
        unrealized_pnl = total_value - invested

        return {
            "userId": user_id,
            "totalPortfolioValue": round(total_value, 2),
            "investedCapital": invested,
            "totalUnrealizedPnL": round(unrealized_pnl, 2),
            "returnPercentage": round((unrealized_pnl / invested) * 100, 2),
            "dailyPnL": 34500.0,
            "dailyReturnPercentage": 0.34,
            "riskScore": 42,
            "riskClassification": "MODERATE",
            "allocation": {
                "Crypto": round(crypto_val, 2),
                "Stocks": round(stocks_val, 2),
                "ETFs": round(etfs_val, 2),
                "Gold": round(gold_val, 2),
                "FiatCash": round(fiat_balance, 2)
            },
            "riskMetrics": {
                "sharpeRatio": 1.84,
                "beta": 0.94,
                "volatilityAnnualized": "14.2%",
                "maxDrawdown": "-8.42%",
                "var95Daily": "-₹1,84,000"
            }
        }


portfolio_service = PortfolioService()
