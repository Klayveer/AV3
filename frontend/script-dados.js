// URL base do backend
const BASE_URL = "http://127.0.0.1:8000/residuos/"; // Certifique-se de que o backend está rodando nesse endereço

// Seleciona os elementos necessários
const filterButton = document.querySelector('.filter-button');
const modal = document.querySelector('#filter-modal');
const closeButton = document.querySelector('.close-button');

// Abre o modal ao clicar no botão de filtrar
filterButton.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Fecha o modal ao clicar no botão de fechar
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fecha o modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Função para buscar resíduos do backend (mês atual e mês anterior)
async function fetchResiduos() {
    try {
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const previousMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth()).padStart(2, '0')}`;

        const [currentResponse, previousResponse] = await Promise.all([
            fetch(`${BASE_URL}mes/${currentMonth}`),
            fetch(`${BASE_URL}mes/${previousMonth}`) 
        ]);

        if (!currentResponse.ok || !previousResponse.ok) {
            throw new Error("Erro ao buscar dados dos meses");
        }

        const currentData = await currentResponse.json();
        const previousData = await previousResponse.json();

        updateSummary(currentData, previousData);
        updateTable(currentData);
    } catch (error) {
        console.error("Erro ao buscar os resíduos:", error);
    }
}

// Função para calcular e atualizar o resumo
function updateSummary(currentData, previousData) {
    const totalPesoElement = document.querySelector(".summary-box:nth-child(1) p");
    const maisColetadoElement = document.querySelector(".summary-box:nth-child(2) p");
    const comparativoElement = document.querySelector(".summary-box:nth-child(3) p");

    // Calcula o peso total reciclado (em toneladas)
    const pesoTotalAtual = currentData.reduce((total, item) => total + parseFloat(item.weight), 0);

    // Encontra o resíduo mais coletado no mês atual
    const tipoResiduosAtual = currentData.reduce((acc, item) => {
        acc[item.residue_type] = (acc[item.residue_type] || 0) + parseFloat(item.weight);
        return acc;
    }, {});

    const [maisColetadoTipo, maisColetadoPesoAtual] = Object.entries(tipoResiduosAtual).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ["", 0]
    );

    // Calcula o peso do tipo mais coletado no mês anterior
    const tipoResiduosAnterior = previousData.reduce((acc, item) => {
        acc[item.residue_type] = (acc[item.residue_type] || 0) + parseFloat(item.weight);
        return acc;
    }, {});

    const maisColetadoPesoAnterior = tipoResiduosAnterior[maisColetadoTipo] || 0;

    // Calcula o comparativo (variação percentual)
    const comparativoPercentual = maisColetadoPesoAnterior
        ? ((maisColetadoPesoAtual - maisColetadoPesoAnterior) / maisColetadoPesoAnterior) * 100
        : 100; // 100% se não houver dados do mês anterior

    // Atualiza os valores no HTML
    totalPesoElement.textContent = `${(pesoTotalAtual / 1000).toFixed(1)} TONELADAS`;
    maisColetadoElement.textContent = `${maisColetadoTipo} ${(maisColetadoPesoAtual / pesoTotalAtual * 100).toFixed(1)}%`;
    comparativoElement.textContent = `${comparativoPercentual.toFixed(1)}% em relação ao mês anterior`;
}

// Função para atualizar a tabela de resíduos
function updateTable(residuos) {
    const tbody = document.querySelector(".details-section table tbody");
    tbody.innerHTML = ""; // Limpa os dados existentes na tabela

    residuos.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.residue_type}</td>
            <td>${item.weight}</td>
        `;
        tbody.appendChild(row);
    });
}

// Chama a função fetchResiduos ao carregar a página
document.addEventListener("DOMContentLoaded", fetchResiduos);
