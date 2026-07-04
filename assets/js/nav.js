// Sticky nav: darkens background after 60px of scroll.
(function () {
  const nav = document.querySelector('nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  function syncNavGlass() {
    const isLight = document.body.classList.contains('light');
    nav.style.background = window.scrollY > 60
      ? (isLight ? 'rgba(255,255,255,0.76)' : 'rgba(6,12,20,0.64)')
      : (isLight ? 'rgba(255,255,255,0.62)' : 'rgba(6,12,20,0.46)');
  }

  window.addEventListener('scroll', syncNavGlass);
  window.syncNavGlass = syncNavGlass;

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Theme toggle — dark is default (no class). Light mode adds 'light' class.
function toggleTheme() {
  document.body.classList.toggle('light');
  const btn = document.querySelector('.dark-toggle');
  btn.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
  if (typeof window.syncNavGlass === 'function') window.syncNavGlass();
}
