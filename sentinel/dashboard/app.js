/**
 * SentinelAI X Tactical HUD Operations Command Frontend
 * Real-time spatiotemporal diagnostic curve renderer and operator loop.
 */

// Canvas & Diagnostic Chart State
const canvas = document.getElementById('anomalyCanvas');
const ctx = canvas.getContext('2d');

let currentFrame = 0;
const maxFrames = 16000;
const historyPoints = [];
const maxHistoryLength = 140;

// Anomaly Window definition matching Page 12 benchmark
const anomalyStartFrame = 8500;
const anomalyEndFrame = 10300;

let currentScore = 0.02;
let isAnomalyActive = false;
let activeAlertCount = 0;

// Initialize alerts list
const alertsList = document.getElementById('alertsList');
const threatBadge = document.getElementById('threatBadge');
const scoreIndicator = document.getElementById('scoreIndicator');
const latencyVal = document.getElementById('latencyVal');
const targetBox1 = document.getElementById('targetBox1');
const feedbackStatus = document.getElementById('feedbackFeedback');

function updateClock() {
  const now = new Date();
  const utcStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  document.getElementById('hudClock').textContent = utcStr;
}
setInterval(updateClock, 1000);
updateClock();

// Pre-fill initial alerts
addAlert({
  alert_id: 'ALT-8F92A1',
  timestamp: Date.now() - 36000,
  camera_id: 'CAM_01',
  severity: 'CRITICAL',
  category: 'Fighting / Assault',
  anomaly_score: 0.985,
  description: 'Spatiotemporal anomaly spike detected. Physical contact dynamics verified.'
});

function addAlert(alert) {
  activeAlertCount++;
  const item = document.createElement('div');
  item.className = 'alert-item';
  item.id = `alert-${alert.alert_id}`;
  item.innerHTML = `
    <div class="alert-header">
      <span class="alert-id">${alert.alert_id} [${alert.severity}]</span>
      <span class="alert-time">${alert.camera_id} &bull; ${new Date(alert.timestamp).toLocaleTimeString()}</span>
    </div>
    <div class="alert-desc"><strong>${alert.category}</strong> (Score: ${alert.anomaly_score.toFixed(3)}) &bull; ${alert.description}</div>
  `;
  alertsList.prepend(item);
}

// Compute deterministic score matching Page 12
function calculateScore(frame) {
  const norm = frame % maxFrames;
  if (norm >= anomalyStartFrame && norm <= anomalyEndFrame) {
    if (norm < 8800) {
      return 0.03 + 0.95 * (1.0 / (1.0 + Math.exp(-(norm - 8650) / 40)));
    } else if (norm > 10000) {
      return 0.03 + 0.95 * (1.0 / (1.0 + Math.exp((norm - 10150) / 40)));
    } else {
      return 0.982 + 0.01 * Math.sin(norm * 0.1);
    }
  }
  return 0.02 + 0.015 * Math.sin(norm * 0.015);
}

// Draw Diagnostic Canvas Chart (Mirrors Page 12: Live Anomaly Scoring)
function drawChart() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background Grid
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 30; y < h - 25; y += 40) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }
  for (let x = 40; x < w - 20; x += 65) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, h - 25);
    ctx.stroke();
  }

  // Draw Threshold Line (0.50)
  const thresholdY = h - 25 - (0.50 * (h - 55));
  ctx.strokeStyle = 'rgba(255, 42, 75, 0.6)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(40, thresholdY);
  ctx.lineTo(w - 20, thresholdY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Axis Labels
  ctx.fillStyle = '#6b8299';
  ctx.font = '10px "JetBrains Mono"';
  ctx.textAlign = 'right';
  ctx.fillText('1.0', 35, 30);
  ctx.fillText('0.5', 35, thresholdY + 3);
  ctx.fillText('0.0', 35, h - 25);

  ctx.textAlign = 'center';
  ctx.fillText('0', 45, h - 10);
  ctx.fillText('4000', 170, h - 10);
  ctx.fillText('8000', 310, h - 10);
  ctx.fillText('12000', 470, h - 10);
  ctx.fillText('16000', w - 30, h - 10);
  ctx.fillText('Frames (C3D 16-frame steps)', w / 2, h - 2);

  // Plot Global Background Reference Curve (showing full 16,000 frames)
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
  ctx.lineWidth = 1.5;

  const totalSteps = 200;
  for (let s = 0; s <= totalSteps; s++) {
    const f = (s / totalSteps) * maxFrames;
    const scoreVal = calculateScore(f);
    const px = 40 + (s / totalSteps) * (w - 60);
    const py = (h - 25) - scoreVal * (h - 55);
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Active Anomaly Shading in Anomaly Region
  const startX = 40 + (anomalyStartFrame / maxFrames) * (w - 60);
  const endX = 40 + (anomalyEndFrame / maxFrames) * (w - 60);
  ctx.fillStyle = 'rgba(255, 42, 75, 0.12)';
  ctx.fillRect(startX, 25, endX - startX, h - 50);

  // Draw Current Tracking Indicator Needle
  const normFrame = currentFrame % maxFrames;
  const currX = 40 + (normFrame / maxFrames) * (w - 60);
  ctx.strokeStyle = currentScore >= 0.5 ? '#ff2a4b' : '#00e5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(currX, 20);
  ctx.lineTo(currX, h - 25);
  ctx.stroke();

  // Plot live point on current needle
  const currY = (h - 25) - currentScore * (h - 55);
  ctx.fillStyle = currentScore >= 0.5 ? '#ff2a4b' : '#00ff88';
  ctx.beginPath();
  ctx.arc(currX, currY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
}

// Tick Simulation Loop
function tick() {
  currentFrame += 48; // Advance frame stream
  currentScore = calculateScore(currentFrame);
  isAnomalyActive = currentScore >= 0.50;

  // Update Telemetry Header & Badges
  if (isAnomalyActive) {
    threatBadge.className = 'threat-status-badge critical';
    threatBadge.innerHTML = '<span class="pulse-dot"></span><span>SYSTEM_ALERT // CRITICAL</span>';
    scoreIndicator.className = 'tag alert-tag critical';
    scoreIndicator.textContent = `SCORE: ${currentScore.toFixed(3)} [CRITICAL]`;
    targetBox1.className = 'target-box active';
  } else {
    threatBadge.className = 'threat-status-badge';
    threatBadge.innerHTML = '<span class="pulse-dot"></span><span>SYSTEM_ONLINE // NOMINAL</span>';
    scoreIndicator.className = 'tag alert-tag';
    scoreIndicator.textContent = `SCORE: ${currentScore.toFixed(3)} [NOMINAL]`;
    targetBox1.className = 'target-box';
  }

  // Update dynamic sub-5ms latency readout
  const jitter = (3.4 + Math.random() * 0.8).toFixed(1);
  latencyVal.textContent = `${jitter} ms`;

  drawChart();
  requestAnimationFrame(tick);
}

// Operator Decision Feedback Loop (Page 3 & Page 14)
window.operatorFeedback = function(feedbackType) {
  let message = '';
  if (feedbackType === 'CONFIRMED_THREAT') {
    message = '✔ DISPATCH CONFIRMED: Tactical units mobilized. Alert archived to incident record.';
    feedbackStatus.style.color = '#ff4d6d';
  } else if (feedbackType === 'FALSE_POSITIVE_ENVIRONMENTAL') {
    message = '🌧 ENVIRONMENTAL TAGGED: Low-light / occlusion recorded. C3D weights flagged for recalibration.';
    feedbackStatus.style.color = '#ffbb33';
  } else if (feedbackType === 'FALSE_POSITIVE_BEHAVIORAL') {
    message = '👥 BEHAVIORAL TAGGED: Crowd rush flagged as normal activity. Negative bag updated.';
    feedbackStatus.style.color = '#00e5ff';
  }
  feedbackStatus.textContent = message;

  // Send to backend API if live
  fetch('/api/v1/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alert_id: 'ALT-8F92A1',
      feedback_type: feedbackType,
      operator_id: 'OP-CHIEF-01',
      notes: message
    })
  }).catch(() => {
    // Standalone fallback
  });
};

// Start animation loop
tick();
