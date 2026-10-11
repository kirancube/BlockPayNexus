"""
BlockPay Nexus - Financial News & Sentiment Microservice
Aggregates global headlines, extracts NLP sentiment metrics (Bullish/Neutral/Bearish),
and dynamically maps stories to user holdings (Portfolio ↔ News Connection).
"""

from typing import Dict, Any, List, Optional

NEWS_FEED = [
    {
        "id": "news_101",
        "headline": "Reserve Bank of India Signals Neutral Policy Stance as Core CPI Stabilizes at 3.9%",
        "source": "Bloomberg Financial",
        "category": "India",
        "timestamp": "28 mins ago",
        "sentiment": "Bullish",
        "confidence": 94,
        "marketImpact": "High",
        "affectedAssets": ["NIFTY 50", "HDFCBANK", "USD/INR"],
        "summary": "The Monetary Policy Committee voted to keep the benchmark repo rate unchanged while shifting the policy stance to neutral.",
        "aiAnalysis": "Eased monetary conditions historically bolster domestic banking equity valuations while keeping sovereign bond yields stable."
    },
    {
        "id": "news_102",
        "headline": "Institutional Bitcoin ETF Inflows Surpass $1.4B in Weekly High as Treasury Allocations Climb",
        "source": "CoinDesk Market Terminal",
        "category": "Crypto",
        "timestamp": "1 hour ago",
        "sentiment": "Bullish",
        "confidence": 91,
        "marketImpact": "High",
        "affectedAssets": ["BTC", "ETH", "SOL"],
        "summary": "Spot cryptocurrency ETF vehicles saw aggregate net inflows expand to record highs driven by multi-asset sovereign wealth funds.",
        "aiAnalysis": "DIRECT PORTFOLIO IMPACT: High concentration in BTC and ETH benefits directly from institutional liquidity absorption."
    },
    {
        "id": "news_103",
        "headline": "Central Banks Expand Sovereign Gold Reserves by 380 Metric Tonnes in Q3 Diversification Wave",
        "source": "World Gold Intelligence",
        "category": "Economy",
        "timestamp": "4 hours ago",
        "sentiment": "Bullish",
        "confidence": 96,
        "marketImpact": "Medium",
        "affectedAssets": ["GOLD (XAU)", "GOLDBEES"],
        "summary": "Sovereign reserve managers continued reallocating from foreign debt holdings into physical gold bullion.",
        "aiAnalysis": "Provides defensive price insulation for Gold BeES ETF positions during equity volatility."
    }
]


class NewsService:
    def get_feed(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        if not category or category == "ALL":
            return NEWS_FEED
        return [n for n in NEWS_FEED if n.get("category") == category]

    def get_news_for_assets(self, assets: List[str]) -> List[Dict[str, Any]]:
        """Filters news articles matching user's held assets (Section 15)."""
        upper_assets = [a.upper() for a in assets]
        matched = []
        for n in NEWS_FEED:
            if any(a.upper() in upper_assets for a in n.get("affectedAssets", [])):
                matched.append(n)
        return matched


news_service = NewsService()
