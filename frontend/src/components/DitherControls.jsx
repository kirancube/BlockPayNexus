import React from 'react';
import { Sliders, Eye, Sparkles } from 'lucide-react';

export const DITHER_PALETTES = {
  CYBER_CYAN: { name: 'Tactical Cyan', wave: [0.0, 0.75, 1.0], bg: [0.01, 0.03, 0.06] },
  EMERALD_DEFENSE: { name: 'Emerald Baseline', wave: [0.0, 0.9, 0.45], bg: [0.01, 0.04, 0.03] },
  CRIMSON_ALERT: { name: 'Crimson Alert', wave: [1.0, 0.1, 0.25], bg: [0.05, 0.01, 0.02] },
  RADAR_AMBER: { name: 'Radar Amber', wave: [1.0, 0.65, 0.0], bg: [0.04, 0.02, 0.0] },
  TACTICAL_MONO: { name: 'Monochrome Intel', wave: [0.5, 0.5, 0.5], bg: [0.0, 0.0, 0.0] }
};

export default function DitherControls({ ditherConfig, onChangeConfig, autoThreatSync, onToggleAutoSync }) {
  return (
    <div className="dither-controls-panel">
      <div className="panel-header">
        <div className="header-title">
          <Sliders size={18} className="icon-cyan" />
          <h3>DITHER SHADER CONFIGURATION (REACT BITS)</h3>
        </div>
        <button
          className={`sync-btn ${autoThreatSync ? 'active' : ''}`}
          onClick={onToggleAutoSync}
        >
          <Sparkles size={14} />
          {autoThreatSync ? 'AUTO-SYNC TO THREAT: ON' : 'AUTO-SYNC TO THREAT: OFF'}
        </button>
      </div>

      <div className="controls-grid">
        {/* Preset Palette Selector */}
        <div className="control-group">
          <label>TACTICAL PALETTE</label>
          <div className="palette-buttons">
            {Object.entries(DITHER_PALETTES).map(([key, val]) => (
              <button
                key={key}
                className={`palette-chip ${JSON.stringify(ditherConfig.waveColor) === JSON.stringify(val.wave) ? 'active' : ''}`}
                onClick={() => onChangeConfig({
                  ...ditherConfig,
                  waveColor: val.wave,
                  backgroundColor: val.bg
                })}
              >
                <span
                  className="color-swatch"
                  style={{
                    backgroundColor: `rgb(${val.wave[0] * 255}, ${val.wave[1] * 255}, ${val.wave[2] * 255})`
                  }}
                />
                {val.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="control-group">
          <div className="slider-label">
            <span>WAVE SPEED: {ditherConfig.waveSpeed}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.20"
            step="0.01"
            value={ditherConfig.waveSpeed}
            onChange={(e) => onChangeConfig({ ...ditherConfig, waveSpeed: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <div className="slider-label">
            <span>PIXEL SIZE: {ditherConfig.pixelSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={ditherConfig.pixelSize}
            onChange={(e) => onChangeConfig({ ...ditherConfig, pixelSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <div className="slider-label">
            <span>COLOR DITHER LEVELS: {ditherConfig.colorNum}</span>
          </div>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={ditherConfig.colorNum}
            onChange={(e) => onChangeConfig({ ...ditherConfig, colorNum: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group toggle-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={ditherConfig.enableMouseInteraction}
              onChange={(e) => onChangeConfig({ ...ditherConfig, enableMouseInteraction: e.target.checked })}
            />
            <span>ENABLE MOUSE RADAR INTERACTION</span>
          </label>
        </div>
      </div>
    </div>
  );
}
