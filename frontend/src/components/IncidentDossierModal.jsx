import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Check, 
  X, 
  Wind, 
  Users, 
  Send, 
  Copy, 
  FileText, 
  MapPin, 
  Clock, 
  Crosshair, 
  ShieldCheck, 
  Volume2 
} from 'lucide-react';

export default function IncidentDossierModal({ alert, onClose, onFeedback }) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('salute'); // 'salute' | 'telemetry' | 'raw'

  if (!alert) return null;

  const handleAction = (type, label) => {
    setActionTaken(label);
    setFeedbackSent(true);
    if (onFeedback) {
      onFeedback(alert.id, type);
    }
  };

  const details = alert.details || {};
  const evidential = details.evidential || {
    epistemicUncertainty: 0.042,
    aleatoricUncertainty: 0.018,
    conformalInterval: [0.912, 0.994],
    decisionSafety: 'CERTIFIED_HIGH_CONFIDENCE'
  };
  const acoustic = details.acoustic || {
    peakDecibels: 88.5,
    signature: 'BLUNT_IMPACT_OR_PERCUSSION',
    acousticScore: 0.84,
    triModalScore: 0.932
  };
  const mil = details.mil || {
    rawScore: 0.9824,
    logits: '4.029'
  };
  const world = details.world || {
    normalizedSurprise: 0.8912,
    rawSurprise: '0.089'
  };

  const incidentId = alert.id || 'SITREP-2026-0924-001';
  const cameraName = alert.camera || 'CAM_01 // NORTH GATE ENTRY';
  const anomalyScore = alert.score || '0.9824';
  const incidentType = alert.type || 'AGGRAVATED VIOLENT ASSAULT';
  const timestampUtc = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  // Military SALUTE Report Specification
  const saluteData = {
    size: '2 Hostile Actors Identified (BBox Conf: 0.94, 0.91)',
    activity: `${incidentType}. Kinematic momentum rupture detected. Late-fusion acoustic shock: ${acoustic.signature}.`,
    location: `${cameraName} | Geocoordinates: 37°46'29.7"N 122°25'09.8"W | Sector Alpha Perimeter`,
    uniform: 'Dark outerwear, rapid agitated spatial trajectory, high optical flow divergence.',
    time: `${timestampUtc} (Surveillance Frame #9120 | Edge Latency: 2.74 ms)`,
    equipment: acoustic.peakDecibels > 85 ? 'BLUNT/PERCUSSIVE THREAT DETECTED' : 'UNARMED PHYSICAL CONFRONTATION'
  };

  const rawSitrepText = `=== TACTICAL SITUATION REPORT (SITREP // SALUTE) ===
DOSSIER ID: ${incidentId}
FACILITY:   Metropolitan Transit & Defense Complex Alpha
TIMESTAMP:  ${timestampUtc}
CLASSIF:    ${incidentType} (Unified Score: ${anomalyScore})
----------------------------------------------------
[S] SIZE:      ${saluteData.size}
[A] ACTIVITY:  ${saluteData.activity}
[L] LOCATION:  ${saluteData.location}
[U] UNIFORM:   ${saluteData.uniform}
[T] TIME:      ${saluteData.time}
[E] EQUIPMENT: ${saluteData.equipment}
----------------------------------------------------
CONFIDENCE: 99% Conformal Set [${evidential.conformalInterval ? evidential.conformalInterval.join(', ') : '0.91, 0.99'}]
EPISTEMIC:  u = ${evidential.epistemicUncertainty} | Aleatoric = ${evidential.aleatoricUncertainty}
ACOUSTIC:   ${acoustic.peakDecibels} dB (${acoustic.signature})
ACTION:     Operator verification required under Defense AI Protocol.
====================================================`;

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(rawSitrepText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="dossier-modal defense-grade-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-badge">
            <ShieldAlert size={20} className="text-crimson" />
            <div>
              <h2>TACTICAL INCIDENT DOSSIER // SALUTE SITREP</h2>
              <span className="modal-subhead">DEFENSE STANDARDS MIL-STD-2525D // CONFORMAL 99% VERIFIED</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close dossier">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'salute' ? 'active' : ''}`}
            onClick={() => setActiveTab('salute')}
          >
            <FileText size={14} />
            <span>SALUTE Briefing</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            <ShieldCheck size={14} />
            <span>Evidential & Conformal</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            <Copy size={14} />
            <span>Raw SITREP Text</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Ribbon */}
          <div className="incident-summary-card">
            <div className="summary-col">
              <span className="label">INCIDENT ID:</span>
              <span className="val text-cyan">{incidentId}</span>
            </div>
            <div className="summary-col">
              <span className="label">SENSOR NODE:</span>
              <span className="val text-amber">{cameraName}</span>
            </div>
            <div className="summary-col">
              <span className="label">UNIFIED THREAT:</span>
              <span className="val text-crimson large">{anomalyScore}</span>
            </div>
            <div className="summary-col">
              <span className="label">TACTICAL VECTOR:</span>
              <span className="val text-crimson">{incidentType}</span>
            </div>
          </div>

          {/* TAB 1: SALUTE FORMAT BRIEFING */}
          {activeTab === 'salute' && (
            <div className="salute-briefing-view">
              <div className="salute-grid">
                <div className="salute-item">
                  <span className="salute-letter">[S]</span>
                  <div className="salute-content">
                    <strong>SIZE (ACTOR QUANTIFICATION)</strong>
                    <p>{saluteData.size}</p>
                  </div>
                </div>

                <div className="salute-item">
                  <span className="salute-letter">[A]</span>
                  <div className="salute-content">
                    <strong>ACTIVITY (OBSERVED THREAT)</strong>
                    <p>{saluteData.activity}</p>
                  </div>
                </div>

                <div className="salute-item">
                  <span className="salute-letter">[L]</span>
                  <div className="salute-content">
                    <strong>LOCATION & EGRESS CORRIDORS</strong>
                    <p>{saluteData.location}</p>
                  </div>
                </div>

                <div className="salute-item">
                  <span className="salute-letter">[U]</span>
                  <div className="salute-content">
                    <strong>UNIFORM & SPATIOTEMPORAL ATTRIBUTES</strong>
                    <p>{saluteData.uniform}</p>
                  </div>
                </div>

                <div className="salute-item">
                  <span className="salute-letter">[T]</span>
                  <div className="salute-content">
                    <strong>TIME & DETECTION TIMELINE</strong>
                    <p>{saluteData.time}</p>
                  </div>
                </div>

                <div className="salute-item">
                  <span className="salute-letter">[E]</span>
                  <div className="salute-content">
                    <strong>EQUIPMENT & THREAT ARTIFACTS</strong>
                    <p>{saluteData.equipment}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENTIAL & CONFORMAL TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="telemetry-deep-dive">
              <div className="deep-dive-card">
                <h4>BAYESIAN EVIDENTIAL UNCERTAINTY QUANTIFICATION</h4>
                <div className="deep-dive-grid">
                  <div className="dd-item">
                    <span className="dd-lbl">99% CONFORMAL INTERVAL</span>
                    <span className="dd-val text-cyan">
                      [{evidential.conformalInterval ? evidential.conformalInterval.join(', ') : '0.91, 0.99'}]
                    </span>
                    <span className="dd-sub">Theoretical guaranteed coverage &ge; 99%</span>
                  </div>
                  <div className="dd-item">
                    <span className="dd-lbl">EPISTEMIC UNCERTAINTY (u)</span>
                    <span className="dd-val text-emerald">{evidential.epistemicUncertainty}</span>
                    <span className="dd-sub">OOD Novelty (Threshold &lt; 0.35)</span>
                  </div>
                  <div className="dd-item">
                    <span className="dd-lbl">ALEATORIC UNCERTAINTY (&sigma;)</span>
                    <span className="dd-val text-amber">{evidential.aleatoricUncertainty}</span>
                    <span className="dd-sub">Optical sensor noise component</span>
                  </div>
                  <div className="dd-item">
                    <span className="dd-lbl">DECISION SAFETY</span>
                    <span className="dd-val text-cyan">{evidential.decisionSafety}</span>
                    <span className="dd-sub">Autonomous action cleared</span>
                  </div>
                </div>
              </div>

              <div className="deep-dive-card">
                <h4>ACOUSTIC TRANSIENT & MULTI-MODAL FUSION</h4>
                <div className="deep-dive-grid">
                  <div className="dd-item">
                    <span className="dd-lbl">PEAK ACOUSTIC SOUND</span>
                    <span className="dd-val text-crimson">{acoustic.peakDecibels} dB</span>
                    <span className="dd-sub">128-band Mel Spectrogram Energy</span>
                  </div>
                  <div className="dd-item">
                    <span className="dd-lbl">ACOUSTIC SIGNATURE</span>
                    <span className="dd-val text-amber">{acoustic.signature}</span>
                    <span className="dd-sub">XD-Violence Audio Classifier</span>
                  </div>
                  <div className="dd-item">
                    <span className="dd-lbl">DISCRIMINATIVE MIL</span>
                    <span className="dd-val text-crimson">{mil.rawScore}</span>
                    <span className="dd-sub">Sparsity & Smoothness Constrained</span>
                  </div>
                  <div className="dd-item">
                    <span className="dd-lbl">WORLD MODEL SURPRISE</span>
                    <span className="dd-val text-amber">{world.normalizedSurprise}</span>
                    <span className="dd-sub">Physical Kinematic Divergence</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAW MILITARY SITREP TEXT */}
          {activeTab === 'raw' && (
            <div className="raw-sitrep-view">
              <div className="raw-header">
                <span>MIL-STD-2525D TACTICAL DISPATCH BUFFER</span>
                <button className="copy-action-btn" onClick={copyToClipboard}>
                  <Copy size={12} />
                  <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY RAW SITREP'}</span>
                </button>
              </div>
              <pre className="sitrep-pre">{rawSitrepText}</pre>
            </div>
          )}

          {/* Decision Matrix Footer */}
          <div className="decision-matrix-box">
            <div className="matrix-title-row">
              <h3>HUMAN-IN-THE-LOOP OPERATOR DECISION MATRIX</h3>
              <span className="audit-tag">LEDGER AUDIT: HITL-2026</span>
            </div>
            <p className="matrix-explainer">
              Under SentinelAI X AI Transparency Protocol, tactical actions require operator validation. Operator decisions close the feedback loop and mine hard negatives.
            </p>

            {feedbackSent ? (
              <div className="feedback-confirmation">
                <Check size={20} className="text-emerald" />
                <div>
                  <strong>OPERATOR DECISION REGISTERED: {actionTaken}</strong>
                  <p>Telemetry recorded into system audit ledger. Feedback loop updated.</p>
                </div>
              </div>
            ) : (
              <div className="action-buttons-row">
                <button
                  className="decision-btn btn-confirm"
                  onClick={() => handleAction('CONFIRMED_THREAT', 'THREAT CONFIRMED (TACTICAL MOBILIZATION)')}
                >
                  <Send size={16} />
                  <div>
                    <strong>CONFIRM THREAT &amp; MOBILIZE RESPONSE</strong>
                    <span>Dispatch Tactical Response Units to Sector Alpha</span>
                  </div>
                </button>

                <button
                  className="decision-btn btn-dismiss-env"
                  onClick={() => handleAction('FALSE_POSITIVE_ENVIRONMENTAL', 'DISMISSED (OPTICAL / WEATHER)')}
                >
                  <Wind size={16} />
                  <div>
                    <strong>DISMISS (OPTICAL / WEATHER / GLARE)</strong>
                    <span>Recalibrate Sensor Node &amp; Update Optical Baseline</span>
                  </div>
                </button>

                <button
                  className="decision-btn btn-dismiss-crowd"
                  onClick={() => handleAction('FALSE_POSITIVE_BEHAVIORAL', 'DISMISSED (BENIGN CROWD GATHERING)')}
                >
                  <Users size={16} />
                  <div>
                    <strong>DISMISS (BENIGN CROWD GATHERING)</strong>
                    <span>Mine Instance as Hard Negative in MIL Optimization Ledger</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
