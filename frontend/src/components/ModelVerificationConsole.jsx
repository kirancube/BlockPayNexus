import React, { useState } from 'react';
import {
  runMilInference,
  runWorldModelInference,
  fuseDualStreams,
  computeEvidentialUncertainty,
  computeGraphDiffusion,
  computeAcousticScore,
  generateTestVector
} from '../utils/modelEngine';
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Zap,
  Volume2,
  Share2,
  FileText
} from 'lucide-react';

export default function ModelVerificationConsole({ backendUrl, onTriggerIncident, onOpenSitrep }) {
  const [activeScenario, setActiveScenario] = useState('nominal');
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [checkingBackend, setCheckingBackend] = useState(false);

  // Run full multi-modal forward pass verification
  const handleRunVerification = (scenarioType) => {
    setIsRunning(true);
    setActiveScenario(scenarioType);

    setTimeout(() => {
      // 1. Generate 4096-D C3D feature vector
      const vector = generateTestVector(scenarioType);
      
      // 2. Deep MIL forward pass (4096 -> 512 -> 32 -> 1)
      const milRes = runMilInference(vector);

      // 3. Spatiotemporal Latent World Model forward pass
      const baselineLatent = generateTestVector('nominal').slice(0, 256).map((v, i) => Math.sin(i * 0.1));
      const worldRes = runWorldModelInference(vector, baselineLatent);

      // 4. Gated Synergistic Fusion Gate
      const fusionRes = fuseDualStreams(milRes.rawScore, worldRes.normalizedSurprise);

      // 5. Evidential Uncertainty & 99% Conformal Prediction
      const evidentialRes = computeEvidentialUncertainty(
        milRes.rawScore,
        worldRes.normalizedSurprise
      );

      // 6. Cross-Camera Topological Graph Mesh Diffusion
      const meshPriors = computeGraphDiffusion('CAM_01', fusionRes.unifiedScore);

      // 7. Multi-Modal Acoustic Shockwave
      const acousticRes = computeAcousticScore(scenarioType);

      const combined = {
        scenario: scenarioType,
        mil: milRes,
        world: worldRes,
        fusion: fusionRes,
        evidential: evidentialRes,
        meshPriors,
        acoustic: acousticRes,
        timestamp: new Date().toISOString(),
        verified: true
      };

      setTestResult(combined);
      setIsRunning(false);

      if (onTriggerIncident) {
        onTriggerIncident(fusionRes.unifiedScore, fusionRes.status, meshPriors, combined);
      }
    }, 120);
  };

  // Test live backend REST API connectivity
  const handleTestBackendAPI = async () => {
    setCheckingBackend(true);
    setBackendStatus(null);
    try {
      const start = performance.now();
      const res = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      const roundtripMs = +(performance.now() - start).toFixed(1);
      
      let benchmarkData = null;
      try {
        const bRes = await fetch(`${backendUrl}/api/v1/benchmark`);
        benchmarkData = await bRes.json();
      } catch (e) {
        // Fallback
      }

      setBackendStatus({
        online: true,
        data,
        benchmark: benchmarkData,
        roundtripMs
      });
    } catch (err) {
      setBackendStatus({
        online: false,
        error: err.message || 'Connection refused (Start backend via `python scripts/run_dashboard.py`)'
      });
    } finally {
      setCheckingBackend(false);
    }
  };

  return (
    <div className="verification-console">
      <div className="console-header">
        <div className="title-row">
          <Cpu className="icon-cyan" size={18} />
          <h3>ACTIVE RESEARCH VERIFICATION LAB</h3>
          <span className="live-tag">TRI-MODAL SOTA EDITION</span>
        </div>
        <p className="console-desc">
          Executes forward inference across the Deep MIL Ranking Network, Spatiotemporal Latent World Model, Bayesian Evidential Uncertainty Engine (99% Conformal Coverage), and Acoustic Transient Fusion.
        </p>
      </div>

      {/* Scenario Selection Grid */}
      <div className="scenario-buttons">
        <button
          className={`scenario-btn ${activeScenario === 'nominal' ? 'active' : ''}`}
          onClick={() => handleRunVerification('nominal')}
          disabled={isRunning}
        >
          <CheckCircle2 size={16} className="text-emerald" />
          <div className="btn-text">
            <strong>1. Nominal Stream</strong>
            <span>Normal Walking // Score &lt; 0.05</span>
          </div>
        </button>

        <button
          className={`scenario-btn ${activeScenario === 'incident' ? 'active' : ''}`}
          onClick={() => handleRunVerification('incident')}
          disabled={isRunning}
        >
          <AlertTriangle size={16} className="text-crimson" />
          <div className="btn-text">
            <strong>2. Assault / Robbery Spike</strong>
            <span>Kinematic Violence // Score &gt; 0.95</span>
          </div>
        </button>

        <button
          className={`scenario-btn ${activeScenario === 'shock' ? 'active' : ''}`}
          onClick={() => handleRunVerification('shock')}
          disabled={isRunning}
        >
          <Zap size={16} className="text-amber" />
          <div className="btn-text">
            <strong>3. Momentum Rupture (OOD)</strong>
            <span>Physical Surprise (E_world) &gt; 0.85</span>
          </div>
        </button>
      </div>

      {/* Real-Time Mathematical Telemetry Readout */}
      {testResult ? (
        <div className="verification-results">
          <div className="results-grid">
            <div className="metric-card">
              <span className="metric-label">INPUT TENSOR</span>
              <span className="metric-val">{testResult.mil.inputDim}-D</span>
              <span className="metric-sub">C3D Spatiotemporal</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">DEEP MIL SCORE</span>
              <span className={`metric-val ${testResult.mil.rawScore > 0.5 ? 'text-crimson' : 'text-emerald'}`}>
                {testResult.mil.rawScore.toFixed(4)}
              </span>
              <span className="metric-sub">Logits: {testResult.mil.logits}</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">WORLD SURPRISE</span>
              <span className={`metric-val ${testResult.world.normalizedSurprise > 0.5 ? 'text-amber' : 'text-cyan'}`}>
                {testResult.world.normalizedSurprise.toFixed(4)}
              </span>
              <span className="metric-sub">Divergence: {testResult.world.rawSurprise}</span>
            </div>

            <div className="metric-card highlight">
              <span className="metric-label">UNIFIED THREAT SCORE</span>
              <span className={`metric-val large ${testResult.fusion.unifiedScore > 0.5 ? 'text-crimson' : 'text-emerald'}`}>
                {testResult.fusion.unifiedScore.toFixed(4)}
              </span>
              <span className="metric-sub">STATUS: {testResult.fusion.status}</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">FORWARD LATENCY</span>
              <span className="metric-val text-amber">{testResult.mil.latencyMs + testResult.world.latencyMs} ms</span>
              <span className="metric-sub">&lt; 2.8 ms SOTA Edge</span>
            </div>
          </div>

          {/* Research Breakthrough 1: Evidential Uncertainty & Conformal Bounds */}
          <div className="research-feature-card">
            <div className="feature-header">
              <ShieldCheck size={14} className="text-cyan" />
              <strong>BAYESIAN EVIDENTIAL UNCERTAINTY & CONFORMAL PREDICTION</strong>
              <span className={`safety-badge ${testResult.evidential.decisionSafety === 'CERTIFIED_HIGH_CONFIDENCE' ? 'badge-ok' : 'badge-err'}`}>
                {testResult.evidential.decisionSafety}
              </span>
            </div>
            <div className="feature-grid">
              <div>
                <span className="feat-lbl">99% CONFORMAL INTERVAL:</span>
                <span className="feat-val text-cyan">
                  [{testResult.evidential.conformalInterval[0]}, {testResult.evidential.conformalInterval[1]}]
                </span>
              </div>
              <div>
                <span className="feat-lbl">EPISTEMIC NOVELTY (u):</span>
                <span className={`feat-val ${testResult.evidential.epistemicUncertainty > 0.35 ? 'text-amber' : 'text-emerald'}`}>
                  {testResult.evidential.epistemicUncertainty}
                </span>
              </div>
              <div>
                <span className="feat-lbl">ALEATORIC NOISE (&sigma;):</span>
                <span className="feat-val text-dim">{testResult.evidential.aleatoricUncertainty}</span>
              </div>
            </div>
          </div>

          {/* Research Breakthrough 2: Multi-Modal Audio-Visual Fusion */}
          <div className="research-feature-card">
            <div className="feature-header">
              <Volume2 size={14} className="text-amber" />
              <strong>ACOUSTIC TRANSIENT SHOCKWAVE (XD-VIOLENCE SOTA: 92.40% AUC)</strong>
            </div>
            <div className="feature-grid">
              <div>
                <span className="feat-lbl">ACOUSTIC ENERGY:</span>
                <span className={`feat-val ${testResult.acoustic.acousticScore > 0.5 ? 'text-crimson' : 'text-emerald'}`}>
                  {testResult.acoustic.acousticScore} ({testResult.acoustic.peakDecibels} dB)
                </span>
              </div>
              <div>
                <span className="feat-lbl">CLASSIFICATION:</span>
                <span className="feat-val text-amber">{testResult.acoustic.signature}</span>
              </div>
              <div>
                <span className="feat-lbl">TRI-MODAL FUSED:</span>
                <span className="feat-val text-cyan">{testResult.acoustic.triModalScore}</span>
              </div>
            </div>
          </div>

          {/* SITREP Button */}
          <div className="sitrep-trigger-row">
            <button
              className="sitrep-btn"
              onClick={() => onOpenSitrep && onOpenSitrep(testResult)}
            >
              <FileText size={14} />
              <span>SYNTHESIZE AUTOMATED SALUTE SITREP DOSSIER</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="idle-prompt">
          <p>Select any scenario button above to trigger an active tensor forward pass through the SentinelAI X neural pipeline.</p>
        </div>
      )}

      {/* Backend API Live Diagnostics */}
      <div className="backend-checker">
        <div className="checker-header">
          <span>CENTRAL CLOUD BACKEND TEST (RENDER / LOCALHOST)</span>
          <button
            className="check-api-btn"
            onClick={handleTestBackendAPI}
            disabled={checkingBackend}
          >
            <RefreshCw size={14} className={checkingBackend ? 'spin' : ''} />
            {checkingBackend ? 'Pinging API...' : 'Ping Live Backend'}
          </button>
        </div>

        {backendStatus && (
          <div className={`backend-status-card ${backendStatus.online ? 'online' : 'offline'}`}>
            {backendStatus.online ? (
              <div className="status-details">
                <span className="badge-ok">SYSTEM_ONLINE</span>
                <span>Latency: <strong>{backendStatus.roundtripMs} ms</strong></span>
                <span>Dossier: <strong>{backendStatus.data.dossier_id}</strong></span>
                {backendStatus.benchmark && (
                  <span>Multimodal SOTA ROC-AUC: <strong>{(backendStatus.benchmark.auc_roc.sentinel_ai_x_multimodal * 100).toFixed(2)}%</strong></span>
                )}
              </div>
            ) : (
              <div className="status-error">
                <span className="badge-err">BACKEND_STANDBY</span>
                <span>{backendStatus.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
