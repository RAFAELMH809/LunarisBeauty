document.addEventListener("DOMContentLoaded", () => {
  // Espera un momento para que el layout termine de acomodarse
  setTimeout(() => {
    const sections = document.querySelectorAll(".section-with-arrows");

    sections.forEach(section => {
      const grid = section.querySelector(".grid-products");
      if (!grid) return;

      const cards = Array.from(grid.querySelectorAll(".card"));
      if (cards.length === 0) return;

      // --- Limpiar flechas previas ---
      section.querySelectorAll(".arrow-btn.dynamic").forEach(btn => btn.remove());

      // --- Agrupar cards por fila según su top ---
      const rows = [];
      let currentTop = null;
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (currentTop === null || Math.abs(rect.top - currentTop) > 10) {
          rows.push([]);
          currentTop = rect.top;
        }
        rows[rows.length - 1].push(card);
      });

      const gridRect = grid.getBoundingClientRect();

      // --- Crear flechas alineadas por cada fila ---
      rows.forEach(row => {
        const rect = row[0].getBoundingClientRect();
        const offsetY = rect.top - gridRect.top + rect.height / 2;

        const leftArrow = document.createElement("button");
        leftArrow.className = "arrow-btn arrow-left dynamic";
        leftArrow.style.top = `${offsetY}px`;

        const rightArrow = document.createElement("button");
        rightArrow.className = "arrow-btn arrow-right dynamic";
        rightArrow.style.top = `${offsetY}px`;

        section.appendChild(leftArrow);
        section.appendChild(rightArrow);
      });
    });
  }, 300); // Espera 300 ms antes de calcular (importante)
});
