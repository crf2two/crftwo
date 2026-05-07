/*
  Codex Modern JS
  Static, dependency-free orchestration for GitHub Pages. The page keeps the
  original hub links, adds search/filter ergonomics, and mounts the approved
  cinematic labs constellation only when requested.
*/

(() => {
  const DATA = {
    labs: [
      { name: "CLIMARIO", desc: "Extração direta via URL.", file: "scraper-climario.html", color: "#f59e0b" },
      { name: "FRIGELAR", desc: "Linhas isoladas da planilha.", file: "scraper-frigelar.html", color: "#00a859" },
      { name: "LEVEROS", desc: "Linhas isoladas da planilha.", file: "scraper-leveros.html", color: "#ff6b00" },
      { name: "CENTRAL AR", desc: "Linhas isoladas da planilha.", file: "scraper-centralar.html", color: "#ec4899" },
      { name: "DUFRIO", desc: "Linhas isoladas da planilha.", file: "scraper-dufrio.html", color: "#007bff" },
      { name: "FRIOPEÇAS", desc: "Produtos via link da planilha.", file: "scraper-friopecas.html", color: "#2563eb" },
      { name: "POLO AR", desc: "Produtos via link da planilha.", file: "scraper-poloar.html", color: "#ef4444" },
      { name: "WEBCONTINENTAL", desc: "Produtos via link da planilha.", file: "scraper-webcontinental.html", color: "#14b8a6" }
    ]
  };

  const ICONS = {
    beaker: `<svg viewBox="0 0 24 24"><path d="M9 3v6l-5 9a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-9V3"/><line x1="9" y1="3" x2="15" y2="3"/><line x1="6" y1="14" x2="18" y2="14"/></svg>`
  };

  const TOOL_ICONS = {
    box: `<svg viewBox="0 0 24 24"><path d="m21 8-9-5-9 5 9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path></svg>`,
    grid: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>`,
    sliders: `<svg viewBox="0 0 24 24"><path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M1 14h6"></path><path d="M9 8h6"></path><path d="M17 16h6"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l4 2"></path></svg>`,
    tag: `<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"></path><path d="M7 7h.01"></path></svg>`,
    file: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h5"></path></svg>`,
    filter: `<svg viewBox="0 0 24 24"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z"></path></svg>`,
    download: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path></svg>`
  };

  const GROUPS = [
    { id: "all", label: "Tudo", short: "Tudo", color: "#4facfe" },
    { id: "camara", label: "Câmara fria", short: "Câmara", title: "Câmara <em>Fria</em>", num: "01 · Seção", color: "#10b981" },
    { id: "ar", label: "Ar-condicionado", short: "Ar", title: "Ar <em>Condicionado</em>", num: "02 · Inteligência", color: "#f59e0b" },
    { id: "outros", label: "Outras rotinas", short: "Outros", title: "Outras <em>Rotinas</em>", num: "03 · Operação", color: "#8b5cf6" }
  ];

  const TOOLS = [
    {
      id: "gabinete",
      group: "camara",
      title: "Simulador de gabinete 3D",
      titleHtml: "Simulador de <em>Gabinete 3D</em>",
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
      titleHtml: "Plano de <em>Corte</em>",
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
      titleHtml: "Checklist <em>Câmaras Frias</em>",
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
      titleHtml: "Scraper <em>Oficial</em>",
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
      titleHtml: "Comparador de <em>Ar</em>",
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
      titleHtml: "Preços ao <em>Vivo</em>",
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
      titleHtml: "Precificação <em>SKU's</em>",
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
      titleHtml: "Laboratórios de <em>Scraper</em>",
      copy: "Bancada experimental — scrapers individuais por loja. Onde refinamos antes de promover ao Oficial.",
      href: "#laboratorios",
      color: "#22c55e",
      meta: "8 ambientes",
      badge: "LAB",
      icon: "beaker",
      action: "labs",
      size: "wide"
    },
    {
      id: "cotacao",
      group: "outros",
      title: "Cotação express",
      titleHtml: "Cotação <em>Express</em>",
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
      titleHtml: "Extração de <em>Códigos</em>",
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
      titleHtml: "Baixar <em>Projeto</em>",
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

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  function init() {
    renderNavigation();
    renderTools();
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
          <div>
            <div class="section-num">${group.num}</div>
            <h2 class="section-title">${group.title}</h2>
          </div>
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
    $("#labCount").textContent = DATA.labs.length;
  }

  function renderToolCard(tool) {
    const size = tool.size === "hero" ? " is-hero" : tool.size === "wide" ? " is-wide" : "";
    const iconMarkup = tool.icon === "beaker" ? ICONS.beaker : TOOL_ICONS[tool.icon];

    if (tool.action === "labs") {
      return `
        <a class="tool-card labs-portal${size}"
           data-id="${tool.id}"
           href="#"
           data-action="labs"
           style="--card-color:${tool.color}">
          <div class="labs-orbit">
            <div class="labs-orbit-ring"></div>
            <div class="labs-orbit-ring"></div>
            <div class="labs-orbit-ring"></div>
          </div>
          <div class="tool-head">
            <div class="tool-icon">${iconMarkup}</div>
            <span class="tool-badge">${tool.badge}</span>
          </div>
          <div>
            <h3 class="tool-title">${tool.titleHtml}</h3>
            <p class="tool-desc">${tool.copy}</p>
          </div>
          <span class="tool-meta">${tool.meta}</span>
        </a>
      `;
    }

    return `
      <a class="tool-card${size}" href="${tool.href}" data-id="${tool.id}" ${tool.download ? 'data-action="download"' : ""}
        style="--card-color: ${tool.color}">
        <span class="tool-top">
          <span class="tool-icon" aria-hidden="true">${iconMarkup}</span>
          ${tool.badge ? `<span class="tool-badge">${tool.badge}</span>` : ""}
        </span>
        <span class="tool-body">
          <span class="tool-title">${tool.titleHtml}</span>
          <span class="tool-copy">${tool.copy}</span>
        </span>
        <span class="tool-meta">${tool.meta}</span>
      </a>
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

  function bindEvents() {
    $("#toolSearch").addEventListener("input", (event) => {
      state.query = event.target.value;
      renderTools();
    });

    $("#toolsGrid").addEventListener("mousemove", (event) => {
      const card = event.target.closest(".tool-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    });

    document.addEventListener("click", onCardClick);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") Constellation.close();
    });

    window.addEventListener("scroll", updateDockVisibility, { passive: true });
    updateDockVisibility();
  }

  function onCardClick(event) {
    const filterButton = event.target.closest("[data-filter]");
    const labsButton = event.target.closest("[data-open-labs]");
    const card = event.target.closest(".tool-card");

    if (filterButton) {
      setFilter(filterButton.dataset.filter);
      return;
    }

    if (labsButton) {
      event.preventDefault();
      Constellation.open();
      return;
    }

    if (!card) return;

    if (card.dataset.action === "labs") {
      event.preventDefault();
      Constellation.open();
      return;
    }

    if (card.dataset.action === "download" && !window.confirm("Baixar o pacote completo do projeto?")) {
      event.preventDefault();
    }
  }

  function setFilter(filter) {
    state.filter = filter;
    renderNavigation();
    renderTools();
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

  const Constellation = (() => {
    let overlay = null;
    let dragging = false;
    let startX = 0;
    let baseRot = 0;
    let currentRot = 0;

    function buildSatellite(lab, i, total) {
      const angle = (360 / total) * i;
      return `
        <a class="satellite"
           href="${lab.file}"
           style="--angle:${angle}; --radius:300px; --lab-color:${lab.color}"
           data-name="${lab.name}">
          <div class="satellite-card">
            <div class="satellite-icon">${ICONS.beaker}</div>
            <div>
              <div class="satellite-name">${lab.name}</div>
              <div class="satellite-meta">${lab.desc}</div>
            </div>
          </div>
        </a>
      `;
    }

    function ensureOverlay() {
      if (overlay) return overlay;

      overlay = document.createElement("div");
      overlay.className = "constellation";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Constelação de Laboratórios");
      overlay.innerHTML = `
        <div class="constellation-stars"></div>

        <button class="constellation-close" type="button" aria-label="Fechar constelação">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="constellation-system">
          ${DATA.labs.map((lab, i) => buildSatellite(lab, i, DATA.labs.length)).join("")}
        </div>

        <div class="constellation-core" aria-hidden="true"></div>
        <div class="constellation-core-label">
          <div class="kicker">Atelier Lab</div>
          <div class="name">Câmara de <em>Experimentos</em></div>
        </div>

        <div class="constellation-help">
          Arraste para girar · ESC para fechar · Clique para entrar
        </div>
      `;

      overlay.querySelector(".constellation-close").addEventListener("click", close);

      overlay.querySelectorAll(".satellite").forEach((sat) => {
        sat.addEventListener("click", (event) => {
          event.preventDefault();
          warpTo(sat.getAttribute("href"));
        });
      });

      overlay.addEventListener("pointerdown", onDown);
      overlay.addEventListener("pointermove", onDrag);
      overlay.addEventListener("pointerup", onUp);
      overlay.addEventListener("pointercancel", onUp);

      document.body.appendChild(overlay);
      return overlay;
    }

    function open() {
      const o = ensureOverlay();
      document.body.style.overflow = "hidden";
      o.style.display = "block";
      requestAnimationFrame(() => o.classList.add("is-open"));
    }

    function close() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => { if (overlay) overlay.style.display = "none"; }, 1200);
    }

    function onDown(event) {
      if (event.target.closest("a, button")) return;
      dragging = true;
      startX = event.clientX;
      baseRot = currentRot;
      overlay.style.setProperty("--spin-state", "paused");
    }

    function onDrag(event) {
      if (!dragging) return;
      const dx = event.clientX - startX;
      currentRot = baseRot + dx * 0.4;
      const system = overlay.querySelector(".constellation-system");
      system.style.transform = `translate(-50%, -50%) rotateX(8deg) rotateY(${currentRot}deg)`;
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      overlay.style.setProperty("--spin-state", "running");
      setTimeout(() => {
        const system = overlay.querySelector(".constellation-system");
        system.style.transform = "";
      }, 600);
    }

    function warpTo(href) {
      const flash = document.createElement("div");
      flash.className = "warp-flash";
      document.body.appendChild(flash);
      requestAnimationFrame(() => flash.classList.add("is-firing"));
      setTimeout(() => { window.location.href = href; }, 280);
    }

    return { open, close };
  })();

  init();
})();
