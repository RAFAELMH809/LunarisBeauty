document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".hero-slider");
  const slides = document.querySelectorAll(".hero-slide");
  const prev = document.querySelector(".hero-arrow.left");
  const next = document.querySelector(".hero-arrow.right");
  const dotsContainer = document.querySelector(".hero-dots");
  let current = 0;
  let timer;

  // Crear puntos dinámicamente
  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    if (i === 0) btn.classList.add("active");
    dotsContainer.appendChild(btn);
    btn.addEventListener("click", () => goToSlide(i));
  });
  const dots = dotsContainer.querySelectorAll("button");

  // Mover a un slide específico
  function goToSlide(n) {
    current = (n + slides.length) % slides.length;
    slider.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetTimer();
  }

  // Actualiza estado visual de los puntos
  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  // Navegación con flechas
  prev.addEventListener("click", () => goToSlide(current - 1));
  next.addEventListener("click", () => goToSlide(current + 1));

  // Auto avance
  function autoPlay() {
    timer = setInterval(() => goToSlide(current + 1), 5000);
  }

  function resetTimer() {
    clearInterval(timer);
    autoPlay();
  }

  autoPlay();
  // Asegura que las flechas sean visibles
prev.style.display = "flex";
next.style.display = "flex";

});
