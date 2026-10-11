import React, { useState } from "react";
import {
  Newspaper,
  Sparkles,
  Bookmark,
  Share2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Shield,
  Layers,
} from "lucide-react";
import { useNexus } from "../context/NexusContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Drawer } from "../components/ui/dialog";

export function NewsView() {
  const { news, activeArticle, setActiveArticle } = useNexus();
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const categories = [
    "ALL",
    "For You",
    "Crypto",
    "India",
    "Global",
    "Economy",
    "Markets",
  ];

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredNews = news.filter((item) => {
    const matchesCat =
      activeTab === "ALL" ||
      (activeTab === "For You" && item.portfolioExposure !== "0.0%") ||
      item.category === activeTab;
    const matchesSearch =
      item.headline.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.affectedAssets.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const breakingNews = news[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Financial Intelligence & News Portal
            <Badge variant="cyan">NLP SENTIMENT</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time macroeconomic feeds, regulatory dispatches, and automated portfolio exposure linking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search news, tickers, macro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Breaking News Banner */}
      {breakingNews && (
        <div
          onClick={() => setActiveArticle(breakingNews)}
          className="relative overflow-hidden rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-card p-4 transition-all hover:border-rose-400 cursor-pointer shadow-lg"
        >
          <div className="flex items-center space-x-2 mb-2 text-rose-400 font-mono text-[11px] font-bold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>BREAKING DISPATCH</span>
            <span>&bull;</span>
            <span className="text-muted-foreground">{breakingNews.timestamp}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
            {breakingNews.headline}
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {breakingNews.summary}
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px] font-mono">
            <div className="flex items-center space-x-2">
              <Badge variant="success">Sentiment: {breakingNews.sentiment} ({breakingNews.confidence}%)</Badge>
              <span className="text-cyan-400 font-semibold">{breakingNews.affectedAssets.join(" ")}</span>
            </div>
            <span className="text-cyan-400 underline">Read Full Analysis &rarr;</span>
          </div>
        </div>
      )}

      {/* Categories Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-border/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === cat
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Portfolio Linked News Section */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 font-mono">
            <Sparkles className="h-4 w-4" />
            <span>PORTFOLIO ↔ NEWS BI-DIRECTIONAL CONNECTION</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Active Holdings Filter Applied
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The articles below directly influence assets held in your active digital wallet (BTC, ETH, RELIANCE, TCS, HDFCBANK).
          Impact and sentiment are synthesized via the Nexus AI Inference Service.
        </p>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);
          return (
            <Card
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="flex flex-col justify-between hover:border-cyan-500/40 cursor-pointer transition-all hover:shadow-lg group"
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-cyan-400 font-semibold">{item.source}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => toggleBookmark(item.id, e)}
                      className="p-1 rounded text-muted-foreground hover:text-cyan-400"
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-cyan-400 text-cyan-400" : ""}`} />
                    </button>
                  </div>
                </div>

                <CardTitle className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                  {item.headline}
                </CardTitle>

                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </CardHeader>

              <CardContent className="p-4 pt-2 border-t border-border/40 mt-2 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <Badge variant={item.sentiment === "Bullish" ? "success" : "secondary"}>
                    {item.sentiment} ({item.confidence}%)
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Exposure: <strong className="text-foreground">{item.portfolioExposure}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[150px]">Assets: {item.affectedAssets.join(", ")}</span>
                  <span>{item.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Article Detail Drawer */}
      <Drawer
        open={!!activeArticle}
        onOpenChange={(open) => !open && setActiveArticle(null)}
        title={activeArticle?.category ? `${activeArticle.category} Dispatch` : "Article Reader"}
      >
        {activeArticle && (
          <div className="space-y-5 font-sans">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
                <span>{activeArticle.source} &bull; {activeArticle.readTime}</span>
                <span>{activeArticle.timestamp}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground leading-snug">
                {activeArticle.headline}
              </h2>
            </div>

            {/* AI Sentiment & Impact Banner */}
            <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-slate-900/70 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  AI SENTIMENT & IMPACT ASSESSMENT
                </span>
                <Badge variant={activeArticle.sentiment === "Bullish" ? "success" : "secondary"}>
                  {activeArticle.sentiment} ({activeArticle.confidence}%)
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Market Volatility Impact:</span>
                  <span className="text-foreground font-bold">{activeArticle.marketImpact}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Your Portfolio Exposure:</span>
                  <span className="text-cyan-300 font-bold">{activeArticle.portfolioExposure}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-muted-foreground font-sans">
                <strong className="text-cyan-300 font-mono">Why This Matters:</strong> {activeArticle.aiAnalysis}
              </div>

              <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
                * Note: Analysis generated automatically by Nexus AI Sentiment Model. Clearly distinguished from source reporting.
              </div>
            </div>

            {/* Verbatim Story Content */}
            <div className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              <p>{activeArticle.fullContent}</p>
              <p>
                Market liquidity indicators tracked by the platform illustrate tightening cross-spreads as hedge funds and institutional desk algorithms adapt to the revised policy constraints.
              </p>
            </div>

            {/* Affected Assets Tags */}
            <div className="pt-3 border-t border-border">
              <span className="text-xs font-mono text-muted-foreground block mb-2">Affected Assets:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeArticle.affectedAssets.map((asset) => (
                  <Badge key={asset} variant="outline" className="text-cyan-400 border-cyan-500/30">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
