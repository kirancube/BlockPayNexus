import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NexusProvider } from "./context/NexusContext";
import { Layout } from "./components/layout/Layout";
import { BackgroundVideo } from "./components/layout/BackgroundVideo";
import "./index.css";

// Precision Engineered Loader for Code-Split Chunks (A E R I S standard)
function AerisViewLoader() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fadeIn">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-lg border-2 border-white/10 animate-ping" />
        <div className="h-10 w-10 rounded-lg border-2 border-white border-t-transparent animate-spin shadow-lg shadow-white/5" />
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-mono tracking-widest text-white uppercase font-bold">
          A E R I S &bull; PRECISION SYSTEM
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Mounting financial subsystem chunk...
        </div>
      </div>
    </div>
  );
}

// Route-Based Code-Splitting (Optimizes Initial Bundle & FCP)
const LoginView = lazy(() => import("./views/LoginView").then((m) => ({ default: m.LoginView })));
const RegisterView = lazy(() => import("./views/RegisterView").then((m) => ({ default: m.RegisterView })));
const ForgotPasswordView = lazy(() => import("./views/ForgotPasswordView").then((m) => ({ default: m.ForgotPasswordView })));

const DashboardView = lazy(() => import("./views/DashboardView").then((m) => ({ default: m.DashboardView })));
const WalletView = lazy(() => import("./views/WalletView").then((m) => ({ default: m.WalletView })));
const MarketsView = lazy(() => import("./views/MarketsView").then((m) => ({ default: m.MarketsView })));
const PortfolioView = lazy(() => import("./views/PortfolioView").then((m) => ({ default: m.PortfolioView })));
const NewsView = lazy(() => import("./views/NewsView").then((m) => ({ default: m.NewsView })));
const ExchangeView = lazy(() => import("./views/ExchangeView").then((m) => ({ default: m.ExchangeView })));
const AnalyticsView = lazy(() => import("./views/AnalyticsView").then((m) => ({ default: m.AnalyticsView })));

const AiCopilotView = lazy(() => import("./views/AiCopilotView").then((m) => ({ default: m.AiCopilotView })));
const SecurityView = lazy(() => import("./views/SecurityView").then((m) => ({ default: m.SecurityView })));
const NotificationsView = lazy(() => import("./views/NotificationsView").then((m) => ({ default: m.NotificationsView })));
const SettingsView = lazy(() => import("./views/SettingsView").then((m) => ({ default: m.SettingsView })));

const AdminView = lazy(() => import("./views/AdminView").then((m) => ({ default: m.AdminView })));
const FraudEngineView = lazy(() => import("./views/AdminView").then((m) => ({ default: m.FraudEngineView })));
const BlockchainAuditView = lazy(() => import("./views/BlockchainAuditView").then((m) => ({ default: m.BlockchainAuditView })));
const ServiceHealthView = lazy(() => import("./views/ServiceHealthView").then((m) => ({ default: m.ServiceHealthView })));
const TestingDashboardView = lazy(() => import("./views/TestingDashboardView").then((m) => ({ default: m.TestingDashboardView })));
const SentinelLegacyView = lazy(() => import("./views/SentinelLegacyView").then((m) => ({ default: m.SentinelLegacyView })));

export default function App() {
  return (
    <NexusProvider>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <BackgroundVideo />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Suspense fallback={<AerisViewLoader />}>
              <Routes>
                {/* Standalone Authentication Routes */}
                <Route path="/login" element={<LoginView />} />
                <Route path="/signin" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<RegisterView />} />
                <Route path="/signup" element={<Navigate to="/register" replace />} />
                <Route path="/forgot-password" element={<ForgotPasswordView />} />

                {/* Main Authenticated Platform Frame */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<DashboardView />} />

                  {/* Wallet Subroutes */}
                  <Route path="wallet" element={<WalletView />} />
                  <Route path="wallet/fiat" element={<WalletView />} />
                  <Route path="wallet/crypto" element={<WalletView />} />
                  <Route path="wallet/transfers" element={<WalletView />} />
                  <Route path="wallet/transactions" element={<WalletView />} />

                  {/* Markets Subroutes */}
                  <Route path="markets" element={<MarketsView />} />
                  <Route path="markets/overview" element={<MarketsView />} />
                  <Route path="markets/stocks" element={<MarketsView />} />
                  <Route path="markets/crypto" element={<MarketsView />} />
                  <Route path="markets/etfs" element={<MarketsView />} />
                  <Route path="markets/forex" element={<MarketsView />} />
                  <Route path="markets/commodities" element={<MarketsView />} />
                  <Route path="markets/indices" element={<MarketsView />} />

                  {/* Portfolio, News & Exchange */}
                  <Route path="portfolio" element={<PortfolioView />} />
                  <Route path="news" element={<NewsView />} />
                  <Route path="exchange" element={<ExchangeView />} />
                  <Route path="analytics" element={<AnalyticsView />} />

                  {/* AI Copilot & Security */}
                  <Route path="ai" element={<AiCopilotView />} />
                  <Route path="copilot" element={<Navigate to="/ai" replace />} />
                  <Route path="security" element={<SecurityView />} />
                  <Route path="notifications" element={<NotificationsView />} />
                  <Route path="settings" element={<SettingsView />} />

                  {/* Administration & Testing */}
                  <Route path="admin" element={<AdminView />} />
                  <Route path="admin/fraud" element={<FraudEngineView />} />
                  <Route path="admin/blockchain" element={<BlockchainAuditView />} />
                  <Route path="admin/services" element={<ServiceHealthView />} />
                  <Route path="admin/testing" element={<TestingDashboardView />} />

                  {/* Preserved Legacy Research HUD */}
                  <Route path="sentinel" element={<SentinelLegacyView />} />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </NexusProvider>
  );
}
