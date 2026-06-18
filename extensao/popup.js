const HUB_BASE_URL = "https://crf-two.github.io/crftwo/";

const SHEET_URL = "https://opensheet.elk.sh/1ml7XpwZfzM4ElRJb4G62b93VMqUw3jeprTtgxdigiD8/Sheet1";
const TIPO_ORDER = ["Hiwall", "Piso Teto", "Cassete"];
const BTUS_BY_TIPO = {
    "Hiwall": ["9000", "12000", "18000", "22000 a 24000", "27000 a 34000", "36000"],
    "Piso Teto": ["24000 a 30000", "34000 a 36000", "42000 a 48000", "52000 a 60000", "70000 a 80000"],
    "Cassete": ["9000", "12000", "18000", "22000 a 24000", "28000 a 34000", "36000", "42000 a 52000", "55000 a 60000"]
};
const CICLO_ORDER = ["Só Frio", "Quente/Frio"];

const ICONS = {
    grid: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    chart: `<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-8"/></svg>`,
    cube: `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/></svg>`,
    cut: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M9 11l2 2 4-4"/><path d="M20 6 9 17l-5-5"/></svg>`,
    price: `<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"/><path d="M7 7h.01"/><path d="M6 18 18 6"/></svg>`
};

const HUB_TOOLS = [
    {
        section: "Ar-Condicionado",
        tools: [
            { title: "Scraper Oficial", url: HUB_BASE_URL + "scraper-ar.html", icon: ICONS.search, accent: "#f59e0b" },
            { title: "Comparador de Preços de Ar-Condicionado", url: HUB_BASE_URL + "comparador-ar.html", icon: ICONS.chart, accent: "#6366f1" },
            { title: "Precificação de SKU’s — Site x 365", url: HUB_BASE_URL + "precificacao-ar.html", icon: ICONS.price, accent: "#0ea5e9" }
        ]
    },
    {
        section: "Câmara Fria",
        tools: [
            { title: "Simulador 3D de Câmara Fria", url: HUB_BASE_URL + "simulador-gabinete.html", icon: ICONS.cube, accent: "#4facfe" },
            { title: "Otimizador de Corte de Painéis PIR/EPS", url: HUB_BASE_URL + "plano-corte.html", icon: ICONS.cut, accent: "#f97316" },
            { title: "Checklist Câmaras Frias - Gerar PDF", url: HUB_BASE_URL + "CheckList.html", icon: ICONS.check, accent: "#10b981" }
        ]
    }
];

function openUrlInBackground(url) {
    if (!url) return;
    try {
        if (typeof chrome !== "undefined" && chrome.tabs && typeof chrome.tabs.create === "function") {
            chrome.tabs.create({ url, active: false }, () => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    console.error("Erro ao abrir em segundo plano:", chrome.runtime.lastError);
                }
            });
            return;
        }
    } catch (error) {
        console.error("Fallback ao abrir link:", error);
    }
    window.open(url, "_blank", "noopener");
}

function setApp(html) {
    document.getElementById("app").innerHTML = html;
}

function viewHeader(title, kicker = "", withBack = false) {
    return `
        <div class="view-head">
            <div>
                <h1 class="view-title">${title}</h1>
                ${kicker ? `<p class="view-kicker">${kicker}</p>` : ""}
            </div>
            ${withBack ? `<button class="back-btn" type="button" data-action="home">Voltar</button>` : ""}
        </div>
    `;
}

function renderHome() {
    setApp(`
        ${viewHeader("Hub Dufrio", "Ferramentas internas")}
        <div class="home-grid">
            <button class="home-card" type="button" data-action="mini-hub" style="--accent:#4facfe">
                <span class="card-icon">${ICONS.grid}</span>
                <span class="home-card-title">Mini Hub</span>
            </button>
            <button class="home-card" type="button" data-action="busca-ar" style="--accent:#10b981">
                <span class="card-icon">${ICONS.search}</span>
                <span class="home-card-title">Busca Ar</span>
            </button>
        </div>
    `);
}

function renderMiniHub() {
    setApp(`
        ${viewHeader("Mini Hub", "", true)}
        ${HUB_TOOLS.map(section => `
            <section class="section-block">
                <h2 class="section-title">${section.section}</h2>
                <div class="tool-list">
                    ${section.tools.map(tool => `
                        <button class="tool-card" type="button" data-url="${tool.url}" style="--accent:${tool.accent}">
                            <span class="card-icon">${tool.icon}</span>
                            <span class="tool-title">${tool.title}</span>
                        </button>
                    `).join("")}
                </div>
            </section>
        `).join("")}
    `);
}

function renderBuscaAr() {
    setApp(`
        ${viewHeader("Busca Ar", "", true)}
        <div id="results"></div>
    `);
    initBuscaAr();
}

function createChip(label, value, currentValue, onSelect) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";

    if (["Hiwall", "Piso Teto", "Cassete"].includes(label)) {
        let imgSrc = "";
        if (label === "Hiwall") imgSrc = "img/hi_wall.png";
        if (label === "Piso Teto") imgSrc = "img/piso_teto.png";
        if (label === "Cassete") imgSrc = "img/cassete.png";

        chip.classList.add("chip-type");
        chip.innerHTML = `<img src="${imgSrc}" alt=""><span>${label}</span>`;
    } else {
        chip.textContent = label;
    }

    if (value === currentValue) chip.classList.add("selected");
    chip.addEventListener("click", () => onSelect(value));
    return chip;
}

function formatBtusLabel(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";

    const nums = (s.match(/\d[\d.]*/g) || [])
        .map(n => parseInt(n.replace(/\./g, ""), 10))
        .filter(n => Number.isFinite(n) && n > 0);

    if (nums.length === 0) return `${s} Btus`;

    const formatInt = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    if (s.toLowerCase().includes(" a ") && nums.length >= 2) {
        return `${formatInt(nums[0])} a ${formatInt(nums[1])} Btus`;
    }
    if (nums.length === 1) return `${formatInt(nums[0])} Btus`;
    return `${nums.map(formatInt).join(" / ")} Btus`;
}

async function initBuscaAr() {
    const resultsDiv = document.getElementById("results");
    if (!resultsDiv) return;

    let mapByTipo = {};
    let tipos = [...TIPO_ORDER];
    let selectedTipo = null;
    let selectedBtus = null;
    let selectedCiclo = null;
    let isLoading = true;

    resultsDiv.innerHTML = "";
    const container = document.createElement("div");
    container.className = "filters-container";

    const loadingP = document.createElement("p");
    loadingP.className = "loading-note";
    loadingP.textContent = "Sincronizando planilha...";

    const errorsP = document.createElement("p");
    errorsP.className = "error-msg";
    errorsP.style.display = "none";

    const tipoGroup = document.createElement("div");
    tipoGroup.className = "filter-group";
    const tipoLabel = document.createElement("div");
    tipoLabel.className = "filter-label";
    const labelText = document.createElement("span");
    labelText.textContent = "Tipo";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.textContent = "Limpar filtros";
    resetBtn.className = "reset-link hidden";
    const tipoRow = document.createElement("div");
    tipoRow.className = "chip-row chip-row-type";

    const btusGroup = document.createElement("div");
    btusGroup.className = "filter-group hidden";
    const btusLabel = document.createElement("div");
    btusLabel.className = "filter-label";
    btusLabel.textContent = "BTUs";
    const btusRow = document.createElement("div");
    btusRow.className = "chip-row";

    const cicloGroup = document.createElement("div");
    cicloGroup.className = "filter-group hidden";
    const cicloLabel = document.createElement("div");
    cicloLabel.className = "filter-label";
    cicloLabel.textContent = "Ciclo";
    const cicloRow = document.createElement("div");
    cicloRow.className = "chip-row";

    const summaryDiv = document.createElement("div");
    summaryDiv.className = "summary-text hidden";
    const storesGroup = document.createElement("div");
    storesGroup.className = "stores-group hidden";

    function unique(items) {
        return [...new Set(items.filter(Boolean))];
    }

    function normalizeCycle(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/^so\s+/, "")
            .trim();
    }

    function sortBtus(a, b) {
        const getVal = (value) => parseInt(String(value).replace(/[.,]/g, "").match(/\d+/) || [0], 10);
        return getVal(a) - getVal(b);
    }

    function fallbackBtus(tipo = selectedTipo) {
        if (tipo && BTUS_BY_TIPO[tipo]) return BTUS_BY_TIPO[tipo];
        return unique(TIPO_ORDER.flatMap(t => BTUS_BY_TIPO[t] || [])).sort(sortBtus);
    }

    function renderInlineNote(row, text) {
        row.innerHTML = `<div class="inline-loading">${text}</div>`;
    }

    function renderSummary() {
        if (!selectedTipo || !selectedBtus || !selectedCiclo) {
            summaryDiv.classList.add("hidden");
            summaryDiv.textContent = "";
            return;
        }
        const btusLabelText = formatBtusLabel(selectedBtus);
        const cicloLower = selectedCiclo.toLowerCase();
        const emojiCycle = (
            cicloLower.includes("quente/frio") ||
            cicloLower.includes("quente e frio") ||
            cicloLower.includes("quente frio") ||
            cicloLower.includes("q/f")
        ) ? "🔥❄️" : "❄️";
        summaryDiv.textContent = `${emojiCycle} ${selectedTipo} · ${btusLabelText} · ${selectedCiclo}`;
        summaryDiv.classList.remove("hidden");
    }

    function renderTipoChips() {
        tipoRow.innerHTML = "";
        tipoRow.classList.toggle("is-single", Boolean(selectedTipo));
        resetBtn.classList.toggle("hidden", !selectedTipo && !selectedBtus && !selectedCiclo);

        if (selectedTipo) {
            const chip = createChip(selectedTipo, selectedTipo, selectedTipo, () => {});
            chip.disabled = true;
            tipoRow.appendChild(chip);
            return;
        }

        tipos.forEach(tipo => {
            tipoRow.appendChild(createChip(tipo, tipo, selectedTipo, (newTipo) => {
                if (selectedTipo === newTipo) return;
                selectedTipo = newTipo;
                clearUnavailableSelections();
                errorsP.style.display = "none";
                renderAll();
                btusGroup.scrollIntoView({ behavior: "smooth", block: "center" });
            }));
        });
    }

    function getBtusOptions() {
        if (isLoading || !sheetDataReady()) return fallbackBtus();
        if (!selectedTipo) {
            return unique(Object.values(mapByTipo).flatMap(mapBtus => Object.keys(mapBtus))).sort(sortBtus);
        }
        const mapBtus = mapByTipo[selectedTipo] || {};
        const btus = Object.keys(mapBtus).sort(sortBtus);
        return btus.length ? btus : fallbackBtus(selectedTipo);
    }

    function sheetDataReady() {
        return !isLoading && Object.keys(mapByTipo).length > 0;
    }

    function renderBtusChips() {
        btusRow.innerHTML = "";
        if (!selectedTipo) {
            btusGroup.classList.add("hidden");
            return;
        }
        btusGroup.classList.remove("hidden");
        const btusOptions = getBtusOptions();
        if (btusOptions.length === 0) {
            renderInlineNote(btusRow, "Nenhum BTU encontrado para esse tipo.");
            return;
        }
        if (!btusOptions.includes(selectedBtus)) selectedBtus = null;
        if (selectedBtus) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "chip selected";
            chip.textContent = formatBtusLabel(selectedBtus);
            chip.disabled = true;
            btusRow.appendChild(chip);
            return;
        }

        btusOptions.forEach(btus => {
            btusRow.appendChild(createChip(formatBtusLabel(btus), btus, selectedBtus, (newBtus) => {
                if (selectedBtus === newBtus) return;
                selectedBtus = newBtus;
                clearUnavailableSelections();
                errorsP.style.display = "none";
                renderAll();
                cicloGroup.scrollIntoView({ behavior: "smooth", block: "center" });
            }));
        });
    }

    function getCicloOptions() {
        if (isLoading || !sheetDataReady() || !selectedTipo || !selectedBtus) return CICLO_ORDER;
        const mapBtus = mapByTipo[selectedTipo] || {};
        const mapCiclo = mapBtus[selectedBtus] || {};
        const ciclos = Object.keys(mapCiclo).sort();
        return ciclos.length ? ciclos : CICLO_ORDER;
    }

    function renderCicloChips() {
        cicloRow.innerHTML = "";
        if (!selectedTipo || !selectedBtus) {
            cicloGroup.classList.add("hidden");
            return;
        }
        cicloGroup.classList.remove("hidden");
        const ciclos = getCicloOptions();
        if (ciclos.length === 0) {
            renderInlineNote(cicloRow, "Nenhum ciclo encontrado para esse BTU.");
            return;
        }
        if (selectedCiclo && !ciclos.some(ciclo => normalizeCycle(ciclo) === normalizeCycle(selectedCiclo))) selectedCiclo = null;
        if (selectedCiclo) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "chip selected";
            chip.textContent = selectedCiclo;
            chip.disabled = true;
            cicloRow.appendChild(chip);
            renderSummary();
            return;
        }

        ciclos.forEach(ciclo => {
            cicloRow.appendChild(createChip(ciclo, ciclo, selectedCiclo, (newCiclo) => {
                selectedCiclo = newCiclo;
                errorsP.style.display = "none";
                renderAll();
                storesGroup.scrollIntoView({ behavior: "smooth", block: "center" });
            }));
        });
    }

    function renderStoreButtons() {
        storesGroup.innerHTML = "";
        if (!selectedTipo || !selectedBtus || !selectedCiclo) {
            storesGroup.classList.add("hidden");
            return;
        }

        storesGroup.classList.remove("hidden");
        if (isLoading) {
            renderInlineNote(storesGroup, "Aguardando a planilha para liberar as lojas...");
            return;
        }

        const mapBtus = mapByTipo[selectedTipo] || {};
        const mapCiclo = mapBtus[selectedBtus] || {};
        const cicloKey = Object.keys(mapCiclo).find(ciclo => normalizeCycle(ciclo) === normalizeCycle(selectedCiclo)) || selectedCiclo;
        const storeLinks = mapCiclo[cicloKey] || {};
        const availableStores = Object.keys(storeLinks);

        if (availableStores.length === 0) {
            errorsP.textContent = "Nenhum site configurado para essa combinação.";
            errorsP.style.display = "block";
            return;
        }

        availableStores.forEach(siteName => {
            const searchBtn = document.createElement("button");
            searchBtn.type = "button";
            searchBtn.className = "primary-btn";
            searchBtn.textContent = "Abrir no " + siteName.toUpperCase();

            searchBtn.addEventListener("click", () => {
                errorsP.style.display = "none";
                const link = storeLinks[siteName];
                if (!link) {
                    errorsP.textContent = `Link ausente para ${siteName}.`;
                    errorsP.style.display = "block";
                    return;
                }
                openUrlInBackground(link);
            });

            storesGroup.appendChild(searchBtn);
        });
    }

    function renderAll() {
        renderTipoChips();
        renderBtusChips();
        renderCicloChips();
        renderSummary();
        renderStoreButtons();
    }

    function clearUnavailableSelections() {
        if (selectedTipo && !tipos.includes(selectedTipo)) {
            selectedTipo = null;
            selectedBtus = null;
            selectedCiclo = null;
            return;
        }

        const btusOptions = getBtusOptions();
        if (selectedBtus && !btusOptions.includes(selectedBtus)) {
            selectedBtus = null;
            selectedCiclo = null;
            return;
        }

        const ciclos = getCicloOptions();
        if (selectedCiclo && !ciclos.some(ciclo => normalizeCycle(ciclo) === normalizeCycle(selectedCiclo))) {
            selectedCiclo = null;
        }
    }

    resetBtn.onclick = () => {
        selectedTipo = null;
        selectedBtus = null;
        selectedCiclo = null;
        resetBtn.classList.add("hidden");
        storesGroup.classList.add("hidden");
        errorsP.style.display = "none";
        renderAll();
    };

    tipoLabel.appendChild(labelText);
    tipoLabel.appendChild(resetBtn);
    tipoGroup.appendChild(tipoLabel);
    tipoGroup.appendChild(tipoRow);
    btusGroup.appendChild(btusLabel);
    btusGroup.appendChild(btusRow);
    cicloGroup.appendChild(cicloLabel);
    cicloGroup.appendChild(cicloRow);

    container.appendChild(tipoGroup);
    container.appendChild(loadingP);
    container.appendChild(btusGroup);
    container.appendChild(cicloGroup);
    container.appendChild(summaryDiv);
    container.appendChild(errorsP);
    container.appendChild(storesGroup);
    resultsDiv.appendChild(container);

    renderAll();

    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error("Não foi possível carregar a planilha.");

        const rows = await response.json();
        const validRows = rows.filter(row =>
            row &&
            typeof row.Site === "string" &&
            row.Site.toLowerCase().includes("dufrio") &&
            row.Link
        );

        if (validRows.length === 0) {
            throw new Error("Nenhum link configurado na planilha.");
        }

        const nextMapByTipo = {};
        validRows.forEach(row => {
            const tipo = (row.Tipo || "").trim();
            const btus = (row.BTUs || "").trim();
            const ciclo = (row.Ciclo || "").trim();
            const site = row.Site.trim();
            const link = row.Link.trim();
            if (!tipo || !btus || !ciclo || !site || !link) return;

            if (!nextMapByTipo[tipo]) nextMapByTipo[tipo] = {};
            if (!nextMapByTipo[tipo][btus]) nextMapByTipo[tipo][btus] = {};
            if (!nextMapByTipo[tipo][btus][ciclo]) nextMapByTipo[tipo][btus][ciclo] = {};
            if (!nextMapByTipo[tipo][btus][ciclo][site]) nextMapByTipo[tipo][btus][ciclo][site] = link;
        });

        mapByTipo = nextMapByTipo;
        tipos = TIPO_ORDER.filter(t => mapByTipo[t]).concat(
            Object.keys(mapByTipo).filter(t => !TIPO_ORDER.includes(t)).sort()
        );

        if (tipos.length === 0) {
            throw new Error("Não foi possível organizar os dados de busca.");
        }

        isLoading = false;
        loadingP.classList.add("hidden");
        clearUnavailableSelections();
        renderAll();
    } catch (error) {
        console.error("Erro ao carregar planilha da Dufrio:", error);
        const message = error && error.message ? error.message : "Erro desconhecido.";
        isLoading = false;
        loadingP.className = "error-msg";
        loadingP.textContent = `Erro ao carregar os dados da planilha. ${message}`;
        renderAll();
    }
}

document.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === "home") renderHome();
        if (action === "mini-hub") renderMiniHub();
        if (action === "busca-ar") renderBuscaAr();
        return;
    }

    const toolEl = event.target.closest("[data-url]");
    if (toolEl) {
        openUrlInBackground(toolEl.dataset.url);
    }
});

document.getElementById("open-hub-btn").addEventListener("click", () => {
    openUrlInBackground(HUB_BASE_URL + "index.html");
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHome);
} else {
    renderHome();
}
