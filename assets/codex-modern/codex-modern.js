/*
  Codex Modern JS
  Plain JavaScript by design: the page is static on GitHub Pages and should stay
  fast, cacheable, and easy to edit without a bundler.
*/

(() => {
  const GROUPS = [
    { id: "all", label: "Tudo", short: "Tudo", color: "#4facfe" },
    { id: "camara", label: "Câmara fria", short: "Câmara", color: "#10b981" },
    { id: "ar", label: "Ar-condicionado", short: "Ar", color: "#f59e0b" },
    { id: "outros", label: "Outras rotinas", short: "Outros", color: "#8b5cf6" }
  ];

  const LABS = [
    { name: "ClimaRio", desc: "Extração direta por URL.", href: "scraper-climario.html", color: "#f59e0b", logo: "img/logo_climario.svg" },
    { name: "Frigelar", desc: "Links Frigelar da planilha.", href: "scraper-frigelar.html", color: "#00a859", logo: "img/logo_frigelar.svg" },
    { name: "Leveros", desc: "Links Leveros da planilha.", href: "scraper-leveros.html", color: "#ff6b00", logo: "img/logo_leveros.svg" },
    { name: "Central Ar", desc: "Links Central Ar da planilha.", href: "scraper-centralar.html", color: "#ec4899", logo: "img/logo_centralar.png" },
    { name: "Dufrio", desc: "Links Dufrio da planilha.", href: "scraper-dufrio.html", color: "#007bff", logo: "img/logo_dufrio.jpg" },
    { name: "FrioPeças", desc: "Produtos por link da planilha.", href: "scraper-friopecas.html", color: "#2563eb", logo: "img/logo_friopecas.png" },
    { name: "Polo Ar", desc: "Produtos via fonte Polo Ar.", href: "scraper-poloar.html", color: "#ef4444", logo: "img/logo_poloar.png" },
    { name: "Webcontinental", desc: "Produtos por link da planilha.", href: "scraper-webcontinental.html", color: "#14b8a6", logo: "img/logo_webcontinental.png" }
  ];

  const TOOLS = [
    {
      id: "gabinete",
      group: "camara",
      title: "Simulador de gabinete 3D",
      copy: "Dimensione câmaras, visualize volumes e apoie a montagem do orçamento técnico.",
      href: "simulador-gabinete.html",
      color: "#4facfe",
      meta: "Projeto técnico",
      icon: "box",
      size: "hero"
    },
    {
      id: "corte",
      group: "camara",
      title: "Plano de corte",
      copy: "Organize painéis PIR/EPS e reduza perda de chapa na preparação do projeto.",
      href: "plano-corte.html",
      color: "#f97316",
      meta: "Painéis 12m",
      icon: "grid",
      size: "wide"
    },
    {
      id: "checklist",
      group: "camara",
      title: "Checklist câmaras frias",
      copy: "Colete dados do cliente e gere PDF com briefing completo para orçamento.",
      href: "CheckList.html",
      color: "#10b981",
      meta: "PDF técnico",
      icon: "check",
      size: "wide"
    },
    {
      id: "scraper",
      group: "ar",
      title: "Scraper oficial",
      copy: "Compare preços em tempo real entre Dufrio, Frigelar, Leveros, Central Ar e Polo Ar.",
      href: "scraper-ar.html",
      color: "#f59e0b",
      meta: "Concorrência",
      icon: "search",
      size: "hero"
    },
    {
      id: "comparador",
      group: "ar",
      title: "Comparador de ar",
      copy: "Avalie ofertas e discrepâncias de preço com leitura direta para tomada de decisão.",
      href: "comparador-ar.html",
      color: "#6366f1",
      meta: "Análise",
      icon: "sliders",
      size: "wide"
    },
    {
      id: "precos-vivo",
      group: "ar",
      title: "Preços ao vivo",
      copy: "Visualize produtos capturados pela extensão nas abas abertas das lojas.",
      href: "precos-ao-vivo.html",
      color: "#00e676",
      meta: "Extensão",
      badge: "Em produção",
      icon: "clock"
    },
    {
      id: "precificacao",
      group: "ar",
      title: "Precificação SKU's",
      copy: "Calcule valores de SKU no 365 usando a referência comercial do site.",
      href: "precificacao-ar.html",
      color: "#0ea5e9",
      meta: "Margem",
      icon: "tag"
    },
    {
      id: "scraper-labs",
      group: "ar",
      title: "Laboratórios de scraper",
      copy: "Teste cada loja isoladamente antes de levar ajustes ao fluxo oficial.",
      href: "#laboratorios",
      color: "#22c55e",
      meta: "8 ambientes",
      badge: "Gateway",
      icon: "radar",
      labs: true,
      size: "wide"
    },
    {
      id: "cotacao",
      group: "outros",
      title: "Cotação express",
      copy: "Monte orçamentos rápidos de infraestrutura de ar-condicionado.",
      href: "cotacoes.html",
      color: "#8b5cf6",
      meta: "Comercial",
      icon: "file"
    },
    {
      id: "extracao",
      group: "outros",
      title: "Extração de códigos",
      copy: "Extraia códigos com quantidade em estoque e acelere conferências internas.",
      href: "itens-quantidade.html",
      color: "#d946ef",
      meta: "Estoque",
      icon: "filter",
      size: "wide"
    },
    {
      id: "download",
      group: "outros",
      title: "Baixar projeto",
      copy: "Faça download do pacote completo do projeto e da extensão.",
      href: "https://github.com/crftwoo/thiago.luz.dufrio/archive/refs/heads/main.zip",
      color: "#94a3b8",
      meta: "ZIP",
      icon: "download",
      download: true
    }
  ];

  const state = {
    filter: "all",
    query: ""
  };

  const icon = {
    box: `<svg viewBox="0 0 24 24"><path d="m21 8-9-5-9 5 9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path></svg>`,
    grid: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>`,
    sliders: `<svg viewBox="0 0 24 24"><path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M1 14h6"></path><path d="M9 8h6"></path><path d="M17 16h6"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l4 2"></path></svg>`,
    tag: `<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"></path><path d="M7 7h.01"></path></svg>`,
    radar: `<svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 0-8-8"></path><path d="M12 16a4 4 0 1 0-4-4"></path><path d="m12 12 7-7"></path><path d="M3 21h18"></path></svg>`,
    file: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h5"></path></svg>`,
    filter: `<svg viewBox="0 0 24 24"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z"></path></svg>`,
    download: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path></svg>`
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  function init() {
    renderNavigation();
    renderTools();
    renderLabs();
    bindEvents();
    hydrateMeta();
  }

  function renderNavigation() {
    const segment = $("#segmentControl");
    const rail = $("#railNav");
    const dock = $("#mobileDock");

    const makeButton = (group, className) => `
      <button class="${className}${group.id === state.filter ? " is-active" : ""}" type="button"
        data-filter="${group.id}" style="--segment-color: ${group.color}; --tab-color: ${group.color}; --dock-color: ${group.color}">
        ${className === "rail-tab" ? group.short : group.label}
      </button>`;

    segment.innerHTML = GROUPS.map((group) => makeButton(group, "segment-button")).join("");
    rail.innerHTML = GROUPS.map((group) => makeButton(group, "rail-tab")).join("");
    dock.innerHTML = GROUPS.map((group) => makeButton(group, "dock-button")).join("") +
      `<button class="dock-button" type="button" data-open-labs style="--dock-color: #22c55e">Labs</button>`;
  }

  function renderTools() {
    const board = $("#toolsGrid");
    const filtered = getFilteredTools();
    const visibleGroups = GROUPS.filter((group) => group.id !== "all")
      .map((group) => ({ ...group, tools: filtered.filter((tool) => tool.group === group.id) }))
      .filter((group) => group.tools.length);

    board.innerHTML = visibleGroups.map((group) => `
      <section class="tool-section" data-section="${group.id}">
        <div class="section-head">
          <h2>${group.label}</h2>
          <span>${group.tools.length} ${group.tools.length === 1 ? "ferramenta" : "ferramentas"}</span>
        </div>
        <div class="tool-grid">
          ${group.tools.map(renderToolCard).join("")}
        </div>
      </section>
    `).join("");

    $("#emptyState").hidden = filtered.length > 0;
    $("#resultCount").textContent = `${filtered.length} de ${TOOLS.length} ferramentas visíveis`;
    $("#toolCount").textContent = TOOLS.length;
    $("#labCount").textContent = LABS.length;
  }

  function renderToolCard(tool) {
    const size = tool.size === "hero" ? " is-hero" : tool.size === "wide" ? " is-wide" : "";
    return `
      <button class="tool-card${size}" type="button" data-tool="${tool.id}" style="--card-color: ${tool.color}">
        <span class="tool-top">
          <span class="tool-icon" aria-hidden="true">${icon[tool.icon]}</span>
          ${tool.badge ? `<span class="tool-badge">${tool.badge}</span>` : ""}
        </span>
        <span class="tool-body">
          <span class="tool-title">${tool.title}</span>
          <span class="tool-copy">${tool.copy}</span>
        </span>
        <span class="tool-meta">${tool.meta}</span>
      </button>
    `;
  }

  function getFilteredTools() {
    const query = normalize(state.query);
    return TOOLS.filter((tool) => {
      const matchesGroup = state.filter === "all" || tool.group === state.filter;
      const haystack = normalize([tool.title, tool.copy, tool.meta, tool.group].join(" "));
      return matchesGroup && (!query || haystack.includes(query));
    });
  }

  function renderLabs() {
    const constellation = $("#labConstellation");
    const angleStep = 360 / LABS.length;

    constellation.innerHTML = LABS.map((lab, index) => `
      <button class="lab-node" type="button" data-lab="${index}"
        style="--lab-color: ${lab.color}; --angle: ${index * angleStep}deg">
        <img class="lab-logo" src="${lab.logo}" alt="" loading="lazy">
        <span>
          <strong>${lab.name}</strong>
          <span>${lab.desc}</span>
        </span>
      </button>
    `).join("");
  }

  function bindEvents() {
    $("#toolSearch").addEventListener("input", (event) => {
      state.query = event.target.value;
      renderTools();
    });

    document.addEventListener("click", (event) => {
      const filterButton = event.target.closest("[data-filter]");
      const toolButton = event.target.closest("[data-tool]");
      const openLabsButton = event.target.closest("[data-open-labs]");
      const closeLabsButton = event.target.closest("[data-close-labs]");
      const labButton = event.target.closest("[data-lab]");

      if (filterButton) setFilter(filterButton.dataset.filter);
      if (toolButton) openTool(toolButton.dataset.tool);
      if (openLabsButton) openLabsGateway();
      if (closeLabsButton) closeLabsGateway();
      if (labButton) launchLab(Number(labButton.dataset.lab));
    });

    $("#labGateway").addEventListener("click", (event) => {
      if (event.target.id === "labGateway") closeLabsGateway();
    });

    $("#labGateway").addEventListener("pointermove", (event) => {
      const surface = $(".gateway-surface");
      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      surface.style.setProperty("--mx", `${x}%`);
      surface.style.setProperty("--my", `${y}%`);
    });

    $("#labConstellation").addEventListener("focusin", updateLabPreview);
    $("#labConstellation").addEventListener("pointerover", updateLabPreview);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLabsGateway();
    });

    window.addEventListener("scroll", updateDockVisibility, { passive: true });
    updateDockVisibility();
  }

  function setFilter(filter) {
    state.filter = filter;
    renderNavigation();
    renderTools();
  }

  function openTool(id) {
    const tool = TOOLS.find((item) => item.id === id);
    if (!tool) return;
    if (tool.labs) {
      openLabsGateway();
      return;
    }
    if (tool.download && !window.confirm("Baixar o pacote completo do projeto?")) return;
    window.location.href = tool.href;
  }

  function openLabsGateway() {
    const gateway = $("#labGateway");
    gateway.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      $(".lab-node", gateway)?.focus({ preventScroll: true });
    });
  }

  function closeLabsGateway() {
    const gateway = $("#labGateway");
    if (gateway.hidden) return;
    gateway.hidden = true;
    gateway.classList.remove("is-launching");
    document.body.style.overflow = "";
    $("#gatewayStatus").textContent = "Pronto para iniciar";
  }

  function updateLabPreview(event) {
    const node = event.target.closest("[data-lab]");
    if (!node) return;
    const lab = LABS[Number(node.dataset.lab)];
    $$(".lab-node").forEach((item) => item.classList.toggle("is-focused", item === node));
    $("#gatewayTitle").textContent = `Abrir laboratório ${lab.name}.`;
    $("#gatewayDesc").textContent = lab.desc;
    $("#gatewayStatus").textContent = "Origem selecionada";
    $(".gateway-surface").style.setProperty("--mx", "68%");
    $(".gateway-surface").style.setProperty("--my", "42%");
  }

  function launchLab(index) {
    const lab = LABS[index];
    const gateway = $("#labGateway");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#gatewayStatus").textContent = `Iniciando ${lab.name}...`;
    gateway.classList.add("is-launching");
    window.setTimeout(() => {
      window.location.href = lab.href;
    }, reducedMotion ? 0 : 430);
  }

  function hydrateMeta() {
    const target = $("#lastUpdate");
    try {
      if (typeof LATEST_LOG !== "undefined" && LATEST_LOG?.dateIso) {
        const date = new Date(LATEST_LOG.dateIso);
        const formatted = date.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        target.textContent = `Última sincronização: ${formatted} - ${LATEST_LOG.message}`;
      }
    } catch (error) {
      target.textContent = "Hub sincronizado com o projeto.";
    }
  }

  function updateDockVisibility() {
    $("#mobileDock").classList.toggle("is-visible", window.scrollY > 460);
  }

  init();
})();
