// Extra transitions (on scroll or load)
document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll('.fade-text');
  faders.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.3}s`;
  });
});
//com