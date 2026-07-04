// 3D particle-network background for the hero section.
// Pure canvas — no external libraries required.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const isMobile = window.innerWidth < 768;
  const NODE_COUNT = isMobile ? 45 : 80;
  const LINK_DIST  = isMobile ? 0.50 : 0.55;

  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Smooth mouse tracking (normalised to –1…1 from centre)
  let tMX = 0, tMY = 0, mX = 0, mY = 0;
  window.addEventListener('mousemove', e => {
    tMX = (e.clientX - W / 2) / W;
    tMY = (e.clientY - H / 2) / H;
  });

  // ── Node factory ──
  function makeNode() {
    return {
      x:  (Math.random() - 0.5) * 2.4,
      y:  (Math.random() - 0.5) * 2.4,
      z:  (Math.random() - 0.5) * 1.6,
      vx: (Math.random() - 0.5) * 0.00045,
      vy: (Math.random() - 0.5) * 0.00045,
      vz: (Math.random() - 0.5) * 0.00030,
      r:   Math.random() * 1.4 + 0.9,
      ph:  Math.random() * Math.PI * 2,
      sp:  Math.random() * 0.007 + 0.004
    };
  }
  const nodes = Array.from({ length: NODE_COUNT }, makeNode);

  // ── Project 3-D → 2-D (perspective division) ──
  function project(x, y, z) {
    const FOV = 3.2;
    const px = x + mX * 0.22;
    const py = y + mY * 0.22;
    const s  = FOV / (FOV + z);
    return {
      sx: W / 2 + px * s * W * 0.40,
      sy: H / 2 + py * s * H * 0.40,
      s,
      z
    };
  }

  // ── Main render loop ──
  function frame(ts) {
    const t = ts * 0.001;

    // Ease mouse toward target
    mX += (tMX - mX) * 0.04;
    mY += (tMY - mY) * 0.04;

    ctx.clearRect(0, 0, W, H);

    // Update & project nodes
    const pts = nodes.map(n => {
      n.x += n.vx; n.y += n.vy; n.z += n.vz;
      if (Math.abs(n.x) > 1.4) n.vx *= -1;
      if (Math.abs(n.y) > 1.4) n.vy *= -1;
      if (Math.abs(n.z) > 0.9) n.vz *= -1;
      return { n, ...project(n.x, n.y, n.z) };
    });

    // Draw edges
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const dx = a.n.x - b.n.x;
        const dy = a.n.y - b.n.y;
        const dz = a.n.z - b.n.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist >= LINK_DIST) continue;
        const depth = (a.s + b.s) * 0.5;
        const alpha = (1 - dist / LINK_DIST) * 0.38 * depth;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(13,148,136,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.9 * depth;
        ctx.stroke();
      }
    }

    // Draw nodes (front to back for depth illusion)
    pts.sort((a, b) => b.z - a.z);
    for (const p of pts) {
      const pulse = 1 + Math.sin(t * p.n.sp * 5.5 + p.n.ph) * 0.28;
      const r     = p.n.r * p.s * pulse;
      const alpha = 0.30 + 0.70 * ((p.z + 1) / 2);

      // Soft glow halo
      const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 6);
      grad.addColorStop(0, `rgba(13,148,136,${(alpha * 0.22).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(13,148,136,0)');
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,184,166,${alpha.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
