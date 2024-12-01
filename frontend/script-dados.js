// URL base do backend
const BASE_URL = "http://127.0.0.1:8000/residuos/";

const TIPOS_RESIDUOS = [
    "Vidro",
    "Eletronicos e mobilias",
    "Restos Comida",
    "Residuos de vegetação",
    "Papel",
    "Plastico",
    "Residuos Limpeza",
    "Não identificado",
];

// Seleciona os elementos necessários
const filterButton = document.querySelector('.filter-button');
const modal = document.querySelector('#filter-modal');
const closeButton = document.querySelector('.close-button');
const totalPesoElement = document.querySelector(".summary-box:nth-child(1) p");
const maisColetadoElement = document.querySelector(".summary-box:nth-child(2) p");
const comparativoElement = document.querySelector(".summary-box:nth-child(3) p");
const tabelaDetalhes = document.querySelector(".details-section table tbody");

// Variáveis para filtros
let filtroTipo = "";

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

// Atualiza o filtro e busca os dados filtrados
function aplicarFiltros(tipo = filtroTipo) {
    let url = BASE_URL;

    // Se um tipo específico for selecionado (diferente de "Geral"), adiciona ao endpoint
    if (tipo && tipo !== "Geral" && TIPOS_RESIDUOS.includes(tipo)) {
        url += `tipo/${encodeURIComponent(tipo)}`;
    }

    console.log("URL chamada: ", url); // Verifica a URL gerada

    fetchDados(url);
}

// Função para buscar dados do backend
async function fetchDados(url) {
    try {
        console.log(`Buscando dados na URL: ${url}`); // Verifica a URL chamada
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados retornados:", data); // Verifica os dados retornados

        if (data.length === 0) {
            alert("Nenhum dado encontrado para este filtro.");
            return; // Se não houver dados, sai da função
        }

        atualizarDashboard(data);
        atualizarTabela(data);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

// Função para atualizar o dashboard
function atualizarDashboard(data) {
    const pesoTotal = data.reduce((total, item) => total + parseFloat(item.weight), 0);
    const tipoResiduos = data.reduce((acc, item) => {
        acc[item.residue_type] = (acc[item.residue_type] || 0) + parseFloat(item.weight);
        return acc;
    }, {});

    const [maisColetadoTipo, maisColetadoPeso] = Object.entries(tipoResiduos).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ["", 0]
    );

    totalPesoElement.textContent = `${(pesoTotal / 1000).toFixed(1)} TONELADAS`;
    maisColetadoElement.textContent = `${maisColetadoTipo} ${(maisColetadoPeso / pesoTotal * 100).toFixed(1)}%`;
    comparativoElement.textContent = "Comparativo atualizado";
}

// Função para atualizar a tabela
function atualizarTabela(data) {
    tabelaDetalhes.innerHTML = "";
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.residue_type}</td>
            <td>${item.weight}</td>
        `;
        tabelaDetalhes.appendChild(row);
    });
}

// Eventos para interação nos filtros
document.querySelectorAll("#tipo-filtros li").forEach(item => {
    item.addEventListener("click", (event) => {
        const tipoSelecionado = event.target.getAttribute("data-type");
        
        if (TIPOS_RESIDUOS.includes(tipoSelecionado)) {
            filtroTipo = tipoSelecionado;
        } else {
            filtroTipo = "Geral";
        }

        // Aplica os filtros e fecha o modal
        aplicarFiltros(filtroTipo);
        modal.style.display = 'none';
    });
});

// Carrega dados gerais ao iniciar
document.addEventListener("DOMContentLoaded", () => aplicarFiltros("Geral"));
