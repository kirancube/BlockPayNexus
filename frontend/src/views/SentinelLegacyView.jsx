import React, { useState, useEffect } from 'react';
import Dither from '../components/Dither/Dither';
import ModelVerificationConsole from '../components/ModelVerificationConsole';
import TacticalCameraGrid from '../components/TacticalCameraGrid';
import TelemetryChart from '../components/TelemetryChart';
import DitherControls, { DITHER_PALETTES } from '../components/DitherControls';
import IncidentDossierModal from '../components/IncidentDossierModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { Shield, Radio, ShieldAlert, Cpu, Activity, Clock, Terminal } from 'lucide-react';
import '../App.css';

export function SentinelLegacyView() {
  const [selectedCam, setSelectedCam] = useState('CAM_01');
  const [currentScore, setCurrentScore] = useState(0.024);
  const [worldSurprise, setWorldSurprise] = useState(0.031);
  const [activeAlert, setActiveAlert] = useState(null);
  const [autoThreatSync, setAutoThreatSync] = useState(true);

  // Dither Shader configuration from React Bits
  const [ditherConfig, setDitherConfig] = useState({
    waveSpeed: 0.05,
    waveFrequency: 3.0,
    waveAmplitude: 0.3,
    waveColor: DITHER_PALETTES.CYBER_CYAN.wave,
    backgroundColor: DITHER_PALETTES.CYBER_CYAN.bg,
    colorNum: 4,
    pixelSize: 2,
    disableAnimation: false,
    enableMouseInteraction: true,
    mouseRadius: 0.35
  });

  const [backendUrl, setBackendUrl] = useState(
    import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
  );

  const [utcTime, setUtcTime] = useState('');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [meshPriors, setMeshPriors] = useState({
    CAM_01: 0.04,
    CAM_02: 0.04,
    CAM_03: 0.04,
    CAM_04: 0.04
  });

  const handleTriggerScore = (newScore, status, priors, testDetails) => {
    setCurrentScore(newScore);
    if (priors) {
      setMeshPriors(priors);
    }
    if (newScore > 0.45) {
      setActiveAlert({
        id: 'INC-' + Math.floor(1000 + Math.random() * 9000),
        camera: selectedCam,
        score: newScore,
        status: status || 'CRITICAL_ANOMALY',
        timestamp: new Date().toLocaleTimeString(),
        details: testDetails || null
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-cyan-500/30">
      {/* 3D Dither Canvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <ErrorBoundary fallbackTitle="Tactical Spatial Visualizer Offline">
          <Dither
            waveSpeed={ditherConfig.waveSpeed}
            waveFrequency={ditherConfig.waveFrequency}
            waveAmplitude={ditherConfig.waveAmplitude}
            waveColor={ditherConfig.waveColor}
            colorNum={ditherConfig.colorNum}
            pixelSize={ditherConfig.pixelSize}
            disableAnimation={ditherConfig.disableAnimation}
            enableMouseInteraction={ditherConfig.enableMouseInteraction}
            mouseRadius={ditherConfig.mouseRadius}
          />
        </ErrorBoundary>
      </div>

      {/* Cyber Grid Lines & Vignette */}
      <div className="absolute inset-0 cyber-vignette pointer-events-none z-0"></div>

      {/* Legacy HUD Content Overlay */}
      <div className="relative z-10 flex flex-col p-4 space-y-4">
        {/* Header Ribbon */}
        <header className="flex flex-wrap items-center justify-between border-b border-cyan-500/30 pb-3 backdrop-blur-md bg-slate-950/60 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-8 w-8 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider font-mono text-cyan-400">
                SENTINELAI X &bull; TACTICAL OPERATIONS HUD
              </h1>
              <div className="text-[10px] text-slate-400 font-mono">
                Preserved Research Subsystem &bull; Classification: UNCLASSIFIED//RESEARCH
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{utcTime}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>INFERENCE ACTIVE</span>
            </div>
          </div>
        </header>

        {/* Tactical Controls & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <TacticalCameraGrid
              selectedCam={selectedCam}
              onSelectCam={setSelectedCam}
              meshPriors={meshPriors}
            />
            <TelemetryChart
              anomalyScore={currentScore}
              worldSurprise={worldSurprise}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <ModelVerificationConsole
              onTriggerScore={handleTriggerScore}
              backendUrl={backendUrl}
              autoThreatSync={autoThreatSync}
            />
            <DitherControls
              config={ditherConfig}
              onChangeConfig={setDitherConfig}
              autoThreatSync={autoThreatSync}
              onToggleAutoThreat={() => setAutoThreatSync(!autoThreatSync)}
            />
          </div>
        </div>

        {activeAlert && (
          <IncidentDossierModal
            alert={activeAlert}
            onClose={() => setActiveAlert(null)}
          />
        )}
      </div>
    </div>
  );
}
