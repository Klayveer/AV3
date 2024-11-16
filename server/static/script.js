document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const residueTypeSelect = document.getElementById("residue-type");
  const startDateSelect = document.getElementById("start-date");
  const endDateSelect = document.getElementById("end-date");
  const generateGraphsButton = document.getElementById("generate-graphs");
  const images = document.querySelectorAll(".residue-image");

  // Função para filtrar as imagens
  function filterImages() {
    const residueType = residueTypeSelect.value.toLowerCase();
    const startDate = parseInt(startDateSelect.value) || null;
    const endDate = parseInt(endDateSelect.value) || null;

    // Itera sobre todas as imagens e aplica os filtros
    images.forEach((image) => {
      const imageResidue = image.alt.toLowerCase();
      const imageYear = parseInt(image.dataset.year);

      // Verifica se a imagem corresponde aos filtros
      const matchesResidue =
        residueType === "all" || imageResidue === residueType;
      const matchesYear =
        (!startDate || imageYear >= startDate) &&
        (!endDate || imageYear <= endDate);

      // Mostra ou oculta a imagem com base nos filtros
      image.style.display = matchesResidue && matchesYear ? "block" : "none";
    });
  }

  // Evento para o botão de gerar gráficos
  generateGraphsButton.addEventListener("click", filterImages);
});
