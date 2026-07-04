// Holographic card-tilt + hero avatar 3D tilt.
// On mouse-move, cards rotate toward the cursor using CSS perspective + rotateX/Y.
// A radial glare follows the cursor for a reflective sheen.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const TILT = 16; // max degrees of rotation

  document.querySelectorAll('.project-card, .skill-card, .test-card')
    .forEach(card => {
      // Inject glare overlay
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);

      let raf = null;

      card.addEventListener('mouseenter', () => {
        // Snap quickly into tracking mode
        card.style.transition = 'transform 0.08s ease, box-shadow 0.15s ease';
      });

      card.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r  = card.getBoundingClientRect();
          const x  = (e.clientX - r.left) / r.width;   // 0 → 1
          const y  = (e.clientY - r.top)  / r.height;  // 0 → 1
          const rX = (y - 0.5) * -TILT;
          const rY = (x - 0.5) *  TILT;

          card.style.transform =
            `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(14px)`;
          card.style.boxShadow =
            `0 24px 60px rgba(0,0,0,0.45), 0 0 30px rgba(13,148,136,0.18)`;

          glare.style.opacity = '1';
          glare.style.background =
            `radial-gradient(circle at ${x * 100}% ${y * 100}%, ` +
            `rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)`;
        });
      });

      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        // Spring back smoothly
        card.style.transition =
          'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
        card.style.transform  = '';
        card.style.boxShadow  = '';
        glare.style.opacity   = '0';
      });
    });
})();

// ── AVATAR 3D TILT (gentler — 10° max, tilt follows cursor over the whole hero) ──
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const avatar = document.getElementById('hero-avatar');
  const hero   = document.getElementById('hero');
  if (!avatar || !hero) return;

  const TILT = 10;
  let raf = null;

  hero.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r  = hero.getBoundingClientRect();
      const x  = (e.clientX - r.left)  / r.width;
      const y  = (e.clientY - r.top)   / r.height;
      const rX = (y - 0.5) * -TILT;
      const rY = (x - 0.5) *  TILT;
      avatar.style.transform =
        `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg)`;
      avatar.style.transition = 'transform 0.12s ease';
    });
  });

  hero.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf);
    avatar.style.transition = 'transform 0.8s cubic-bezier(0.23,1,0.32,1)';
    avatar.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
})();
