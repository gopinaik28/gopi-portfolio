// Auto-play gopi-audio.mp3 on first user interaction
(function () {
  let played = false;
  function startAudio() {
    if (played) return;
    played = true;
    const audio = document.getElementById('bg-audio');
    if (!audio) return;
    audio.volume = 0.40;
    audio.play().catch(() => {});
    window.removeEventListener('click',  startAudio);
    window.removeEventListener('scroll', startAudio);
    window.removeEventListener('keydown', startAudio);
  }
  window.addEventListener('click',  startAudio);
  window.addEventListener('scroll', startAudio);
  window.addEventListener('keydown', startAudio);
})();

// Scroll progress bar
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
})();

// Hero parallax: shifts the radial glow upward as the user scrolls down,
// creating a subtle depth effect. Runs on every scroll event (passive).
(function () {
  window.addEventListener('scroll', () => {
    const glow = document.querySelector('.hero-glow');
    if (glow) glow.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }, { passive: true });
})();

// Scroll-driven timeline line fill + car vehicle with direction awareness
(function () {
  function initTimeline() {
    const container = document.getElementById('act-timeline');
    const fill      = document.getElementById('act-line-fill');
    const vehicle   = document.getElementById('act-vehicle');
    if (!container || !fill) return;

    let prevPct = 0;

    function update() {
      const rect    = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const start   = rect.top    - windowH * 0.10;
      const end     = rect.bottom - windowH * 0.50;
      const pct     = Math.min(Math.max(-start / (end - start), 0), 1) * 100;

      fill.style.height = pct + '%';

      if (vehicle) {
        vehicle.style.top = pct + '%';

        // Update direction class only when movement is significant
        if (pct > prevPct + 0.15) {
          vehicle.classList.remove('going-up');
          vehicle.classList.add('going-down');
        } else if (pct < prevPct - 0.15) {
          vehicle.classList.remove('going-down');
          vehicle.classList.add('going-up');
        }
        prevPct = pct;
      }
    }

    // Default direction on load
    if (vehicle) vehicle.classList.add('going-down');

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeline);
  } else {
    initTimeline();
  }
})();

// Hero stats count-up animation — triggers 400ms after page load.
(function () {
  function runCountUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const useComma = el.dataset.comma === '1';
    const duration = 1500;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out: fast start, smooth finish
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = (useComma ? current.toLocaleString() : current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      document.querySelectorAll('.hero-stat-num[data-target]').forEach(runCountUp);
    }, 400);
  });
})();
