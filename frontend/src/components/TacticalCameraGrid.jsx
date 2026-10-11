import React from 'react';
import { Video, ShieldAlert, Target, Eye, Network } from 'lucide-react';

const CAMERAS = [
  {
    id: 'CAM_01',
    name: 'NORTH GATE ENTRY',
    specs: '4K Ultra-HD // FOV: 90° // 30 FPS',
    module: 'MODULE_1: YOLOv8 Perception',
    badge: 'STATIC DEFENSE',
    target: 'PEDESTRIAN: 0.94'
  },
  {
    id: 'CAM_02',
    name: 'SECTOR WEST PERIMETER',
    specs: '1080p // PTZ Active 30x // 60 FPS',
    module: 'MODULE_2: C3D Spatiotemporal',
    badge: 'ACTIVE TRACKING',
    target: 'TRANSIT: 0.88'
  },
  {
    id: 'CAM_03',
    name: 'TRANSIT CHECKPOINT',
    specs: '1440p // ANPR Ready // 30 FPS',
    module: 'MODULE_3: MIL Ranking Engine',
    badge: 'VELOCITY INDEX',
    target: 'VEHICLE: 0.91'
  },
  {
    id: 'CAM_04',
    name: 'CONCOURSE EAST FOV',
    specs: '1080p // Wide 120° // 30 FPS',
    module: 'MODULE_4: SLWM World Model',
    badge: 'CROWD DENSITY',
    target: 'CONCOURSE: 0.82'
  }
];

export default function TacticalCameraGrid({ selectedCam, onSelectCam, threatLevel, activeIncident, meshPriors = {} }) {
  return (
    <div className="camera-grid-panel">
      <div className="panel-header">
        <div className="header-title">
          <Video size={18} className="icon-cyan" />
          <h3>CCTV SENSOR MESH (4 NODES ACTIVE)</h3>
        </div>
        <span className="mesh-tag">
          <Network size={12} style={{ display: 'inline', marginRight: 4 }} />
          TOPOLOGICAL GRAPH ACTIVE
        </span>
      </div>

      <div className="cameras-container">
        {CAMERAS.map((cam) => {
          const isSelected = selectedCam === cam.id;
          const isAlerted = (activeIncident && isSelected) || (activeIncident && cam.id === 'CAM_01');
          const prior = meshPriors[cam.id] || 0.04;
          const isPriorElevated = prior > 0.15;

          return (
            <div
              key={cam.id}
              className={`camera-card ${isSelected ? 'selected' : ''} ${isAlerted ? 'alerted' : ''}`}
              onClick={() => onSelectCam(cam.id)}
            >
              <div className="cam-topbar">
                <span className="cam-id">{cam.id} // {cam.name}</span>
                <span className={`cam-badge ${isPriorElevated ? 'text-amber' : ''}`}>
                  {isPriorElevated ? `PRIOR: ${(prior * 100).toFixed(0)}%` : cam.badge}
                </span>
              </div>

              <div className="cam-viewport">
                {/* Tactical HUD Reticles */}
                <div className="reticle-center"></div>
                <div className="reticle-corner tl"></div>
                <div className="reticle-corner tr"></div>
                <div className="reticle-corner bl"></div>
                <div className="reticle-corner br"></div>

                {/* Scanline Effect */}
                <div className="scanline"></div>

                {/* Simulated Target Reticle */}
                <div className={`target-reticle ${isAlerted ? 'target-alert' : ''}`}>
                  <Target size={14} />
                  <span>{isAlerted ? 'THREAT ANOMALY: 0.982' : cam.target}</span>
                </div>

                {isAlerted && (
                  <div className="alert-overlay-tag">
                    <ShieldAlert size={14} />
                    <span>PRIORITIZED TACTICAL INTERVENTION</span>
                  </div>
                )}
              </div>

              <div className="cam-bottombar">
                <span className="specs">{cam.specs}</span>
                <span className="module">{cam.module}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
