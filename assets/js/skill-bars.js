// Called by animations.js when a .fade-up element becomes visible.
// Finds any skill bar fills inside the element and animates them.
function animateSkillBars(container) {
  container.querySelectorAll('.skill-bar-fill').forEach(bar => {
    bar.style.width = bar.dataset.pct + '%';
  });
}
