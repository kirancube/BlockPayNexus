"""
BlockPay Nexus - Financial Market Data Microservice
Provides real-time streaming quotes, sparklines, and order-book telemetry
across Equities, Cryptocurrencies, ETFs, Foreign Exchange, and Commodities.
"""

import time
import math
import random
from typing import Dict, Any, List, Optional

STATIC_MARKETS = [
    {"symbol": "NIFTY 50", "category": "Indices", "name": "Nifty 50 Index", "price": 25480.20, "changePct": 0.73, "volume": "3.2B"},
    {"symbol": "SENSEX", "category": "Indices", "name": "BSE Sensex 30", "price": 83120.50, "changePct": 0.65, "volume": "1.8B"},
    {"symbol": "S&P 500", "category": "Indices", "name": "S&P 500 US", "price": 5890.40, "changePct": -0.21, "volume": "4.1B"},
    {"symbol": "BTC", "category": "Crypto", "name": "Bitcoin", "price": 5890000.00, "usdPrice": 68900.00, "changePct": 2.52, "volume": "₹2.4T", "marketCap": "₹116T"},
    {"symbol": "ETH", "category": "Crypto", "name": "Ethereum", "price": 284500.00, "usdPrice": 3328.00, "changePct": -1.11, "volume": "₹1.1T", "marketCap": "₹34T"},
    {"symbol": "SOL", "category": "Crypto", "name": "Solana", "price": 16800.00, "usdPrice": 196.50, "changePct": 4.61, "volume": "₹450B", "marketCap": "₹7.8T"},
    {"symbol": "USDT", "category": "Crypto", "name": "Tether USD", "price": 85.50, "usdPrice": 1.00, "changePct": 0.06, "volume": "₹3.8T", "marketCap": "₹9.8T"},
    {"symbol": "RELIANCE", "category": "Stocks", "name": "Reliance Industries", "price": 2985.50, "changePct": 1.16, "volume": "6.8M", "marketCap": "₹20.2T"},
    {"symbol": "TCS", "category": "Stocks", "name": "Tata Consultancy Services", "price": 4150.00, "changePct": -0.44, "volume": "2.4M", "marketCap": "₹15.0T"},
    {"symbol": "HDFCBANK", "category": "Stocks", "name": "HDFC Bank Ltd", "price": 1690.00, "changePct": 0.71, "volume": "14.2M", "marketCap": "₹12.8T"},
    {"symbol": "NIFTYBEES", "category": "ETFs", "name": "Nippon India ETF Nifty BeES", "price": 268.40, "changePct": 0.71, "expenseRatio": "0.04%", "aum": "₹28,400 Cr"},
    {"symbol": "GOLDBEES", "category": "ETFs", "name": "Nippon India ETF Gold BeES", "price": 66.20, "changePct": 0.68, "expenseRatio": "0.10%", "aum": "₹14,200 Cr"},
    {"symbol": "USD/INR", "category": "Forex", "name": "US Dollar / Indian Rupee", "price": 85.42, "changePct": -0.09},
    {"symbol": "EUR/INR", "category": "Forex", "name": "Euro / Indian Rupee", "price": 92.15, "changePct": 0.24},
    {"symbol": "GOLD (XAU)", "category": "Commodities", "name": "Spot Gold (10g / INR)", "price": 72400.00, "changePct": 0.44},
]


class MarketService:
    def __init__(self):
        self._assets = {m["symbol"]: dict(m) for m in STATIC_MARKETS}

    def get_all_assets(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        assets = list(self._assets.values())
        if category and category != "ALL":
            assets = [a for a in assets if a.get("category") == category]
        return assets

    def get_asset_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        return self._assets.get(symbol.upper())

    def get_historical_curve(self, symbol: str, timeframe: str = "1D") -> List[Dict[str, Any]]:
        asset = self.get_asset_by_symbol(symbol)
        base = asset["price"] if asset else 100.0

        points = 24 if timeframe == "1D" else 30
        data = []
        for i in range(points):
            jitter = (math.sin(i * 0.4) + random.uniform(-0.02, 0.02)) * 0.02
            data.append({
                "index": i,
                "price": round(base * (1 + jitter), 2)
            })
        return data


market_service = MarketService()
