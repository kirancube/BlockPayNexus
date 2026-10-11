import React, { useRef, useEffect } from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export default function TelemetryChart({ currentScore, worldSurprise, isSimulating }) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Initialize buffer if empty
    if (historyRef.current.length === 0) {
      for (let i = 0; i < 150; i++) {
        historyRef.current.push({
          score: 0.02 + 0.015 * Math.sin(i * 0.1),
          surprise: 0.03 + 0.01 * Math.cos(i * 0.1)
        });
      }
    }

    const render = () => {
      // Push new data point
      historyRef.current.push({
        score: currentScore,
        surprise: worldSurprise
      });
      if (historyRef.current.length > 200) {
        historyRef.current.shift();
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark HUD background
      ctx.fillStyle = 'rgba(6, 12, 19, 0.95)';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y <= height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x <= width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Threshold Line (Score = 0.50)
      const thresholdY = height * 0.50;
      ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(width, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label threshold
      ctx.fillStyle = 'rgba(255, 170, 0, 0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('THRESHOLD: 0.50 [ALERT DISPATCH]', 10, thresholdY - 6);

      // Draw World Model Surprise Curve (Cyan / Amber)
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const stepX = width / 200;
      historyRef.current.forEach((pt, idx) => {
        const x = idx * stepX;
        const y = height - pt.surprise * (height - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw Deep MIL Score Curve (Crimson if high, Emerald if low)
      const isHigh = currentScore > 0.5;
      ctx.strokeStyle = isHigh ? '#ff003c' : '#00ff88';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      historyRef.current.forEach((pt, idx) => {
        const x = idx * stepX;
        const y = height - pt.score * (height - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw Head Glow Point
      const lastX = (historyRef.current.length - 1) * stepX;
      const lastY = height - currentScore * (height - 20) - 10;
      ctx.fillStyle = isHigh ? '#ff003c' : '#00ff88';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentScore, worldSurprise]);

  return (
    <div className="telemetry-chart-panel">
      <div className="panel-header">
        <div className="header-title">
          <Activity size={18} className="icon-cyan" />
          <h3>LIVE SPATIOTEMPORAL TRAJECTORY MONITOR</h3>
        </div>
        <div className="legend">
          <span className="legend-item">
            <span className="dot dot-score"></span> f(Vi) MIL Score
          </span>
          <span className="legend-item">
            <span className="dot dot-surprise"></span> E_world Surprise Metric
          </span>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={200} className="telemetry-canvas" />
      </div>

      <div className="chart-footer">
        <div className="footer-metric">
          <span className="label">INSTANTANEOUS SCORE:</span>
          <span className={`val ${currentScore > 0.5 ? 'text-crimson' : 'text-emerald'}`}>
            {currentScore.toFixed(4)}
          </span>
        </div>
        <div className="footer-metric">
          <span className="label">STATUS:</span>
          <span className={`val ${currentScore > 0.5 ? 'text-crimson' : 'text-emerald'}`}>
            {currentScore > 0.85 ? 'CRITICAL_ALERT' : (currentScore > 0.5 ? 'WARNING_ANOMALY' : 'NOMINAL_BASELINE')}
          </span>
        </div>
        <div className="footer-metric">
          <span className="label">SAMPLING RATE:</span>
          <span className="val text-cyan">16 Frames @ 30 FPS</span>
        </div>
      </div>
    </div>
  );
}
