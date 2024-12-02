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
const graficoButton = document.getElementById('grafico-button');
const graficoModal = document.getElementById('grafico-anual-modal');
const graficoCloseButton = graficoModal.querySelector('.close-button');
const graficoImagem = document.getElementById('grafico-imagem');
const graficoTitulo = document.getElementById('grafico-titulo');

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

// Abre o modal do gráfico
graficoButton.addEventListener('click', () => {
    graficoModal.style.display = 'flex';
});

// Fecha o modal ao clicar no botão de fechar
graficoCloseButton.addEventListener('click', () => {
    graficoModal.style.display = 'none';
});

// Fecha o modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
    if (event.target === graficoModal) {
        graficoModal.style.display = 'none';
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

    fetchDados(url, tipo);

    // Exibe o gráfico correspondente ao tipo (gráficos individuais, se necessário)
    exibirGraficoNoModal(tipo);
}

// Função para exibir o gráfico no modal
function exibirGrafico(tipo) {
    // Define o caminho do gráfico correspondente
    const caminhoGrafico = `src/${tipo.toLowerCase()}.png`;

    graficoImagem.src = caminhoGrafico;
    graficoImagem.alt = `Gráfico de ${tipo}`;
    graficoTitulo.textContent = tipo;

    // Exibe o modal do gráfico
    graficoModal.style.display = 'flex';
}

// Função para buscar dados do backend
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

// Função para buscar o peso do último dia do mês
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

        // Ordena por data e pega o peso do último dia
        const ultimoRegistro = filtrados.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return parseFloat(ultimoRegistro.weight) || 0;
    } catch (error) {
        console.error("Erro ao buscar dados do último dia do mês:", error);
        return 0;
    }
}

// Função para atualizar o dashboard
async function atualizarDashboard(data, tipo) {
    const pesoTotal = data.reduce((total, item) => total + parseFloat(item.weight), 0);

    // Define os meses para comparação
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

    // Calcula a diferença percentual
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
            exibirGrafico(tipoSelecionado);
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
