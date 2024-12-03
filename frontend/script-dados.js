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

const filterButton = document.querySelector('.filter-button');
const filterModal = document.querySelector('#filter-modal');
const filterOptions = filterModal.querySelectorAll('.filter-option');
const closeButton = document.querySelector('.close-button');
const totalPesoElement = document.querySelector(".summary-box:nth-child(1) p");
const maisColetadoElement = document.querySelector(".summary-box:nth-child(2) p");
const comparativoElement = document.querySelector(".summary-box:nth-child(3) p");
const tabelaDetalhes = document.querySelector(".details-section table tbody");
const graficoButton = document.querySelector('#grafico-button');
const graficoModal = document.querySelector('#grafico-anual-modal');
const graficoCloseButton = graficoModal.querySelector('.close-button');
const graficoImagem = document.getElementById('grafico-imagem');
const graficoTitulo = document.getElementById('grafico-titulo');

let filtroTipo = "";

graficoButton.addEventListener('click', (event) => {
    event.stopPropagation();
    graficoModal.style.display = 'flex';
});

graficoModal.querySelector('.close-button').addEventListener('click', () => {
    graficoModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === graficoModal) {
        graficoModal.style.display = 'none';
    }
});

filterButton.addEventListener('click', (event) => {
    event.stopPropagation();
    filterModal.style.display = 'flex';
});

filterModal.querySelector('.close-button').addEventListener('click', () => {
    filterModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === filterModal) {
        filterModal.style.display = 'none';
    }
});

filterOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});

function aplicarFiltros(tipo = filtroTipo) {
    let url = BASE_URL;

    if (tipo && tipo !== "Geral" && TIPOS_RESIDUOS.includes(tipo)) {
        url += `tipo/${encodeURIComponent(tipo)}`;
    }

    fetchDados(url, tipo);
    exibirGraficoNoModal(tipo);
}

function exibirGrafico(tipo) {
    const caminhoGrafico = `src/${tipo.toLowerCase()}.png`;

    graficoImagem.src = caminhoGrafico;
    graficoImagem.alt = `Gráfico de ${tipo}`;
    graficoTitulo.textContent = tipo;
    graficoModal.style.display = 'flex';
}

async function fetchDados(url, tipo) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na requisição. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            alert("Nenhum dado encontrado para este filtro.");
            return;
        }

        atualizarDashboard(data, tipo);
        atualizarTabela(data);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

async function fetchUltimoDiaMes(anoMes, tipo) {
    const url = `${BASE_URL}mes/${anoMes}`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na requisição. Status: ${response.status}`);
        }

        const data = await response.json();
        const filtrados = data.filter(item => item.residue_type === tipo);

        if (filtrados.length === 0) return 0;

        const ultimoRegistro = filtrados.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return parseFloat(ultimoRegistro.weight) || 0;
    } catch (error) {
        console.error("Erro ao buscar dados do último dia do mês:", error);
        return 0;
    }
}

async function atualizarDashboard(data, tipo) {
    const pesoTotal = data.reduce((total, item) => total + parseFloat(item.weight), 0);

    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const mesAnterior = hoje.getMonth() === 0
        ? `${hoje.getFullYear() - 1}-12`
        : `${hoje.getFullYear()}-${String(hoje.getMonth()).padStart(2, '0')}`;
    const mesDoisMesesAtras = hoje.getMonth() <= 1
        ? `${hoje.getFullYear() - 1}-${String(12 - (1 - hoje.getMonth())).padStart(2, '0')}`
        : `${hoje.getFullYear()}-${String(hoje.getMonth() - 1).padStart(2, '0')}`;

    let pesoUltimoDiaMesAtual = 0;
    let pesoUltimoDiaMesAnterior = 0;

    if (tipo && tipo !== "Geral") {
        pesoUltimoDiaMesAtual = await fetchUltimoDiaMes(mesAnterior, tipo);
        pesoUltimoDiaMesAnterior = await fetchUltimoDiaMes(mesDoisMesesAtras, tipo);
    }

    const diferencaPercentual = pesoUltimoDiaMesAnterior
        ? (((pesoUltimoDiaMesAtual - pesoUltimoDiaMesAnterior) / pesoUltimoDiaMesAnterior) * 100).toFixed(1)
        : 0;

    comparativoElement.textContent = pesoUltimoDiaMesAnterior
        ? `Diferença: ${diferencaPercentual > 0 ? "+" : ""}${diferencaPercentual}%`
        : "Sem dados para comparação";

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
}

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

document.querySelectorAll("#tipo-filtros li").forEach(item => {
    item.addEventListener("click", (event) => {
        const tipoSelecionado = event.target.getAttribute("data-type");

        if (TIPOS_RESIDUOS.includes(tipoSelecionado)) {
            filtroTipo = tipoSelecionado;
            exibirGrafico(tipoSelecionado);
        } else {
            filtroTipo = "Geral";
        }

        aplicarFiltros(filtroTipo);
        modal.style.display = 'none';
    });
});

document.addEventListener("DOMContentLoaded", () => aplicarFiltros("Geral"));