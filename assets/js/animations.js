// Scroll-triggered fade-up animations.
// Each .fade-up element starts invisible and slides into view when it enters
// the viewport. Skill bars inside the revealed element are also triggered.
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          // skill-bars.js must be loaded first
          if (typeof animateSkillBars === 'function') {
            animateSkillBars(entry.target);
          }
        }, 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
})();
