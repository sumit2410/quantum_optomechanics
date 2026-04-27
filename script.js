/* ─────────────────────────────────────────────────────────
   Sumit Kumar — site interactions (interactive page only)
   - Custom cursor + ring
   - Spacetime grid that warps near cursor
   - Click ripples
   - Animated waveform
   - Rotating "current focus" display
   ───────────────────────────────────────────────────────── */

// ── CUSTOM CURSOR ──
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = -100, my = -100;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  }
  if (cursorRing) {
    cursorRing.style.left = mx + 'px';
    cursorRing.style.top = my + 'px';
  }
});

// ── SPACETIME CANVAS ──
const canvas = document.getElementById('spacetime');
const ctx = canvas.getContext('2d');
let W, H, cols, rows, points = [];
const SPACING = 55;
const WARP_RADIUS = 220;
const WARP_STRENGTH = 28;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cols = Math.ceil(W / SPACING) + 2;
  rows = Math.ceil(H / SPACING) + 2;
  buildGrid();
}

function buildGrid() {
  points = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({ bx: (c - 1) * SPACING, by: (r - 1) * SPACING });
    }
    points.push(row);
  }
}

let time = 0;
function drawGrid() {
  ctx.clearRect(0, 0, W, H);
  time += 0.016;
  const waveT = time * 2.5;

  // Horizontal lines
  for (let r = 0; r < rows; r++) {
    ctx.beginPath();
    for (let c = 0; c < cols; c++) {
      const { bx, by } = points[r][c];
      const dx = bx - mx, dy = by - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const influence = Math.max(0, 1 - dist / WARP_RADIUS);
      const ease = influence * influence * (3 - 2*influence);
      const warpX = -dx * ease * WARP_STRENGTH / (dist + 1);
      const warpY = -dy * ease * WARP_STRENGTH / (dist + 1);
      const wave = ease * Math.sin(dist * 0.045 - waveT) * 4;
      const px = bx + warpX + wave * (dx / (dist + 1));
      const py = by + warpY + wave * (dy / (dist + 1));
      if (c === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    const inf = getRowInfluence(r);
    ctx.strokeStyle = `rgba(201,168,76,${0.07 + inf * 0.3})`;
    ctx.lineWidth = 0.5 + inf * 1;
    ctx.stroke();
  }

  // Vertical lines
  for (let c = 0; c < cols; c++) {
    ctx.beginPath();
    for (let r = 0; r < rows; r++) {
      const { bx, by } = points[r][c];
      const dx = bx - mx, dy = by - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const influence = Math.max(0, 1 - dist / WARP_RADIUS);
      const ease = influence * influence * (3 - 2*influence);
      const warpX = -dx * ease * WARP_STRENGTH / (dist + 1);
      const warpY = -dy * ease * WARP_STRENGTH / (dist + 1);
      const wave = ease * Math.sin(dist * 0.045 - waveT) * 4;
      const px = bx + warpX + wave * (dx / (dist + 1));
      const py = by + warpY + wave * (dy / (dist + 1));
      if (r === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    const inf = getColInfluence(c);
    ctx.strokeStyle = `rgba(201,168,76,${0.07 + inf * 0.3})`;
    ctx.lineWidth = 0.5 + inf * 1;
    ctx.stroke();
  }

  // Cursor glow
  if (mx > 0 && mx < W) {
    const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
    grd.addColorStop(0, 'rgba(201,168,76,0.12)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(mx, my, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawGrid);
}

function getRowInfluence(r) {
  const by = (r - 1) * SPACING;
  const dist = Math.abs(by - my);
  return Math.max(0, 1 - dist / WARP_RADIUS) ** 2;
}
function getColInfluence(c) {
  const bx = (c - 1) * SPACING;
  const dist = Math.abs(bx - mx);
  return Math.max(0, 1 - dist / WARP_RADIUS) ** 2;
}

window.addEventListener('resize', resize);
resize();
drawGrid();

// ── CLICK RIPPLES ──
document.addEventListener('click', e => {
  const d = document.getElementById('ripples');
  if (!d) return;
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = e.clientX + 'px';
  r.style.top = e.clientY + 'px';
  r.style.width = '60px'; r.style.height = '60px';
  d.appendChild(r);
  setTimeout(() => r.remove(), 1500);
});

// ── ROTATING FOCUS DISPLAY ──
const focusEl = document.getElementById('focus-rotator');
if (focusEl) {
  const themes = [
    'Superfluid optomechanics',
    'Cavity optomechanics',
    'HF gravitational waves',
    'MEMS / NEMS quantum sensing',
    'Analogue cosmology'
  ];
  let fi = 0;
  setInterval(() => {
    fi = (fi + 1) % themes.length;
    focusEl.style.opacity = '0';
    setTimeout(() => {
      focusEl.textContent = themes[fi];
      focusEl.style.opacity = '1';
    }, 200);
  }, 3200);
}
