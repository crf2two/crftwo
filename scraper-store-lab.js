(function () {
  const STORE = window.STORE_LAB_CONFIG || {};
  const SHEET_URL = "https://opensheet.elk.sh/1ml7XpwZfzM4ElRJb4G62b93VMqUw3jeprTtgxdigiD8/Sheet1";
  const CACHE_KEY = "scraper_sheet_data_v1";
  const WORKER_PROXY = "https://frigelar-proxy.crftwo.workers.dev/?url=";
  const CORS_PROXY = "https://corsproxy.io/?";

  let sheetData = [];
  let selection = { tipo: "", btu: "", ciclo: "" };
  let sheetLoadPromise = null;

  const norm = (s) => String(s || "").toLowerCase().replace(/[\s\-_.]/g, "");
  const normalizeText = (s) => String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const normalizeCiclo = (c) => normalizeText(c).trim().replace(/^so\s+/, "");
  const sortBTUs = (a, b) => {
    const getVal = (s) => parseInt(String(s).replace(/[.,]/g, "").match(/\d+/) || [0], 10);
    return getVal(a) - getVal(b);
  };
  const formatBTU = (btu) => String(btu).replace(/\b(\d+)\b/g, m => m.length >= 4 ? m.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : m);
  const formatCiclo = (ciclo) => normalizeCiclo(ciclo) === "frio" ? "Só Frio" : ciclo;
  const fmtBRL = (value) => "R$ " + Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const plainBRL = (value) => Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function installShell() {
    const accent = STORE.accent || "#4facfe";
    const accent2 = STORE.accent2 || accent;
    const accentRgb = STORE.accentRgb || "79, 172, 254";

    document.title = `Scraper ${STORE.label || "Loja"}`;
    document.head.insertAdjacentHTML("beforeend", `
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #050505;
          --card-bg: rgba(18, 18, 28, 0.9);
          --card-border: rgba(255, 255, 255, 0.08);
          --accent: ${accent};
          --accent-2: ${accent2};
          --accent-rgb: ${accentRgb};
          --green: #00e676;
          --text: #ffffff;
          --muted: #7a7a9a;
          --radius: 24px;
        }
        body { font-family: "Outfit", sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
        .aurora { position: fixed; border-radius: 50%; filter: blur(130px); z-index: 0; pointer-events: none; opacity: 0.15; animation: auroraAnim 20s infinite alternate ease-in-out; }
        .a1 { width: 800px; height: 800px; background: var(--accent); top: -20%; left: -10%; }
        .a2 { width: 700px; height: 700px; background: var(--accent-2); bottom: -20%; right: -10%; animation-duration: 30s; }
        @keyframes auroraAnim { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.3) translate(100px,-100px); } }
        .btn-back { position: fixed; top: 20px; left: 20px; z-index: 1000; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 40px; text-decoration: none; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
        .btn-back:hover { background: rgba(255,255,255,0.15); transform: translateX(-5px); }
        .container { position: relative; z-index: 1; max-width: 1300px; margin: 0 auto; padding: 100px 24px 120px; }
        .header-area { text-align: center; margin-bottom: 40px; }
        .header-area h1 { font-size: 48px; font-weight: 900; letter-spacing: 0; text-transform: uppercase; font-style: italic; background: linear-gradient(135deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; }
        .header-area p { font-size: 14px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
        .lab-tag { display: inline-block; background: rgba(var(--accent-rgb), 0.15); border: 1px solid rgba(var(--accent-rgb), 0.4); color: var(--accent); padding: 6px 14px; border-radius: 30px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; }
        .step-section { display: none; flex-direction: column; align-items: center; gap: 18px; animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; margin-bottom: 32px; }
        .step-section.active { display: flex; }
        .step-section h2 { font-size: 14px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 3px; }
        .options-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .option-btn { background: var(--card-bg); backdrop-filter: blur(12px); border: 1px solid var(--card-border); padding: 14px 28px; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: var(--text); font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: "Outfit", sans-serif; }
        .option-btn:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.08); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.1); }
        .option-btn.selected { background: rgba(var(--accent-rgb), 0.15); border-color: var(--accent); box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.25); color: #fff; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .search-box { background: var(--card-bg); border: 1px solid var(--card-border); padding: 40px; border-radius: var(--radius); backdrop-filter: blur(30px); margin-bottom: 50px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.4); opacity: 0.55; pointer-events: none; transition: opacity 0.4s ease; }
        .search-box.ready { opacity: 1; pointer-events: auto; }
        .input-label { font-size: 11px; color: var(--muted); font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; display: block; }
        .url-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid var(--card-border); padding: 20px 24px; border-radius: 16px; color: #fff; font-family: inherit; font-size: 14px; outline: none; transition: 0.3s; }
        .url-input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1); }
        .source-tag { font-size: 10px; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; display: block; }
        .link-actions { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .btn-link-action { flex: 1; min-width: 140px; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: #fff; padding: 12px 16px; border-radius: 12px; font-family: inherit; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; text-align: center; text-decoration: none; transition: 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-link-action:hover { background: rgba(255,255,255,0.1); border-color: var(--accent); color: var(--accent); }
        .btn-link-action.copied { background: rgba(0,230,118,0.15); border-color: rgba(0,230,118,0.5); color: var(--green); }
        .btn-link-action[disabled], .btn-link-action[aria-disabled="true"] { opacity: 0.35; pointer-events: none; }
        .btn-action { background: var(--accent); color: #fff; border: none; padding: 20px; border-radius: 16px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: 0.4s; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .btn-action:hover { filter: brightness(0.95); transform: translateY(-3px); box-shadow: 0 15px 30px rgba(var(--accent-rgb), 0.3); }
        .btn-action:disabled { background: #333; color: #666; cursor: not-allowed; transform: none; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); overflow: hidden; backdrop-filter: blur(20px); display: flex; flex-direction: column; transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .card:hover { transform: translateY(-8px) scale(1.02); border-color: rgba(var(--accent-rgb), 0.4); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .card-img { width: 100%; aspect-ratio: 1; background: #fff; display: flex; align-items: center; justify-content: center; padding: 30px; position: relative; border-bottom: 1px solid var(--card-border); }
        .card-img img { max-width: 100%; max-height: 100%; object-fit: contain; transition: 0.5s; }
        .card:hover .card-img img { transform: scale(1.1); }
        .card-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
        .card-title { font-size: 16px; font-weight: 700; line-height: 1.5; color: #fff; margin-bottom: 20px; min-height: 72px; }
        .price-box { margin-top: auto; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .price-cash { font-size: 24px; font-weight: 900; color: var(--green); letter-spacing: 0; line-height: 1.15; }
        .price-parc { font-size: 13px; color: var(--muted); font-weight: 600; margin-top: 8px; }
        .card-btn { display: block; width: 100%; padding: 14px; background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); border-radius: 12px; color: #fff; text-decoration: none; text-align: center; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 18px; transition: 0.3s; }
        .card-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
        .loading-area { display: none; text-align: center; padding: 60px; }
        .spin { width: 50px; height: 50px; border: 5px solid rgba(var(--accent-rgb), 0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 25px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .msg { text-align: center; padding: 40px 20px; color: var(--muted); font-size: 16px; font-weight: 600; }
        .sync-status { position: fixed; bottom: 20px; right: 20px; z-index: 1000; background: rgba(18,18,28,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); padding: 10px 18px; border-radius: 30px; display: flex; align-items: center; gap: 10px; font-size: 10px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: all 0.4s ease; }
        .sync-dot { width: 8px; height: 8px; border-radius: 50%; }
        .sync-status.loading .sync-dot { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; animation: pulse-dot 1s infinite alternate; }
        .sync-status.success .sync-dot { background: #00e676; box-shadow: 0 0 10px #00e676; }
        .sync-status.error .sync-dot { background: #ff5252; box-shadow: 0 0 10px #ff5252; }
        @keyframes pulse-dot { from { opacity: 0.4; transform: scale(0.8); } to { opacity: 1; transform: scale(1.2); } }
        @media (max-width: 720px) {
          .container { padding: 88px 14px 80px; }
          .header-area h1 { font-size: 34px; }
          .search-box { padding: 22px; }
          .results-grid { grid-template-columns: 1fr; gap: 18px; }
        }
      </style>
    `);

    document.body.innerHTML = `
      <div id="sync-status" class="sync-status loading"><div class="sync-dot"></div><span id="sync-text">Conectando</span></div>
      <div class="aurora a1"></div>
      <div class="aurora a2"></div>
      <a href="index.html" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Voltar ao Hub
      </a>
      <div class="container">
        <div class="header-area">
          <span class="lab-tag">Laboratório</span>
          <h1>Scraper ${STORE.label || "Loja"}</h1>
          <p>Teste individual do scraper da ${STORE.label || "loja"}.</p>
        </div>
        <div id="step-tipo" class="step-section active"><h2>Selecione o Tipo</h2><div class="options-grid" id="tipo-options"></div></div>
        <div id="step-btus" class="step-section"><h2>Selecione os BTUs</h2><div class="options-grid" id="btu-options"></div></div>
        <div id="step-ciclo" class="step-section"><h2>Selecione o Ciclo</h2><div class="options-grid" id="ciclo-options"></div></div>
        <div id="search-box" class="search-box">
          <div class="input-group">
            <span class="input-label">Link da ${STORE.label || "loja"} (vindo da planilha)</span>
            <input type="text" id="urlInput" class="url-input" placeholder="Selecione tipo, BTU e ciclo acima...">
            <span id="sourceTag" class="source-tag">Aguardando seleção...</span>
            <div class="link-actions">
              <button type="button" id="copyBtn" class="btn-link-action" disabled>Copiar link</button>
              <a id="openBtn" class="btn-link-action" target="_blank" rel="noopener" aria-disabled="true">Abrir no site</a>
            </div>
          </div>
          <button id="renderBtn" class="btn-action" disabled>Renderizar Ofertas</button>
        </div>
        <div id="loader" class="loading-area"><div class="spin"></div><p style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: var(--accent); font-weight: 800;">Consultando ${STORE.label || "loja"}...</p></div>
        <div id="results" class="results-grid"></div>
        <div id="status" class="msg"></div>
      </div>
    `;
  }

  function getStoreRows() {
    return sheetData.filter(i => i && i.Site && norm(i.Site).includes(STORE.sheetMatch));
  }

  function renderTipos() {
    const c = document.getElementById("tipo-options");
    c.innerHTML = "";
    const rows = getStoreRows();
    const tipos = [...new Set(rows.map(i => i.Tipo).filter(Boolean))];
    if (tipos.length === 0) {
      c.innerHTML = `<div class="msg">Nenhum tipo cadastrado para ${STORE.label} na planilha.</div>`;
      return;
    }
    tipos.forEach(t => {
      const b = document.createElement("button");
      b.className = "option-btn" + (selection.tipo === t ? " selected" : "");
      b.innerText = t;
      b.onclick = () => selectTipo(t);
      c.appendChild(b);
    });
  }

  function renderOptions(id, opts, cb, current, formatter) {
    const c = document.getElementById(id);
    c.innerHTML = "";
    opts.forEach(o => {
      const b = document.createElement("button");
      b.className = "option-btn" + (current === o ? " selected" : "");
      b.innerText = formatter ? formatter(o) : o;
      b.onclick = () => cb(o);
      c.appendChild(b);
    });
  }

  function selectTipo(t) {
    selection.tipo = t;
    selection.btu = "";
    selection.ciclo = "";
    renderTipos();
    const rows = getStoreRows().filter(i => i.Tipo === t);
    const btus = [...new Set(rows.map(i => i.BTUs))].sort(sortBTUs);
    renderOptions("btu-options", btus, selectBTU, selection.btu, formatBTU);
    document.getElementById("step-btus").classList.add("active");
    document.getElementById("step-ciclo").classList.remove("active");
    resetReady();
    setTimeout(() => document.getElementById("step-btus").scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  function selectBTU(b) {
    selection.btu = b;
    selection.ciclo = "";
    const rows = getStoreRows().filter(i => i.Tipo === selection.tipo);
    const btus = [...new Set(rows.map(i => i.BTUs))].sort(sortBTUs);
    renderOptions("btu-options", btus, selectBTU, selection.btu, formatBTU);
    const ciclos = [...new Set(getStoreRows().filter(i => i.Tipo === selection.tipo && i.BTUs === b).map(i => i.Ciclo))];
    renderOptions("ciclo-options", ciclos, selectCiclo, selection.ciclo, formatCiclo);
    document.getElementById("step-ciclo").classList.add("active");
    resetReady();
    setTimeout(() => document.getElementById("step-ciclo").scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  function selectCiclo(c) {
    selection.ciclo = c;
    const ciclos = [...new Set(getStoreRows().filter(i => i.Tipo === selection.tipo && i.BTUs === selection.btu).map(i => i.Ciclo))];
    renderOptions("ciclo-options", ciclos, selectCiclo, selection.ciclo, formatCiclo);
    findStoreLink();
  }

  function findStoreLink() {
    const cicloAlvo = normalizeCiclo(selection.ciclo);
    const row = getStoreRows().find(i =>
      i.Tipo === selection.tipo &&
      i.BTUs === selection.btu &&
      normalizeCiclo(i.Ciclo) === cicloAlvo
    );
    const tag = document.getElementById("sourceTag");
    const input = document.getElementById("urlInput");
    const btn = document.getElementById("renderBtn");
    const box = document.getElementById("search-box");

    if (row && row.Link) {
      input.value = row.Link;
      tag.innerText = `${row.Site} · ${row.Tipo} · ${formatBTU(row.BTUs)} · ${formatCiclo(row.Ciclo)}`;
      tag.style.color = "var(--green)";
      btn.disabled = false;
      box.classList.add("ready");
      enableLinkActions(row.Link);
    } else {
      input.value = "";
      tag.innerText = `Sem link cadastrado para ${STORE.label} · ${selection.tipo} · ${selection.btu} · ${selection.ciclo}`;
      tag.style.color = "#f59e0b";
      btn.disabled = true;
      box.classList.remove("ready");
      disableLinkActions();
    }
  }

  function resetReady() {
    document.getElementById("search-box").classList.remove("ready");
    document.getElementById("urlInput").value = "";
    document.getElementById("sourceTag").innerText = "Aguardando seleção...";
    document.getElementById("sourceTag").style.color = "var(--accent)";
    document.getElementById("renderBtn").disabled = true;
    document.getElementById("results").innerHTML = "";
    document.getElementById("status").innerText = "";
    disableLinkActions();
  }

  function enableLinkActions(url) {
    const copyBtn = document.getElementById("copyBtn");
    const openBtn = document.getElementById("openBtn");
    copyBtn.disabled = false;
    openBtn.href = url;
    openBtn.setAttribute("aria-disabled", "false");
  }

  function disableLinkActions() {
    const copyBtn = document.getElementById("copyBtn");
    const openBtn = document.getElementById("openBtn");
    copyBtn.disabled = true;
    openBtn.removeAttribute("href");
    openBtn.setAttribute("aria-disabled", "true");
  }

  function addCacheBuster(url) {
    try {
      const u = new URL(url);
      u.searchParams.set("_", Date.now());
      return u.toString();
    } catch (_) {
      return url + (url.includes("?") ? "&" : "?") + "_=" + Date.now();
    }
  }

  async function fetchWorkerText(url) {
    const resp = await fetch(WORKER_PROXY + encodeURIComponent(url), { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.text();
  }

  async function fetchCorsText(url) {
    const resp = await fetch(CORS_PROXY + encodeURIComponent(url), { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.text();
  }

  async function scrapeFrigelar(url) {
    try {
      let apiUrl = url;
      if (url.includes("/searchresults")) {
        apiUrl = url.replace("/searchresults", "/ccstoreui/v1/search");
        try {
          const urlObj = new URL(apiUrl);
          urlObj.searchParams.delete("");
          apiUrl = urlObj.toString();
        } catch (e) {
          apiUrl = apiUrl.replace(/[?&]+=*undefined/gi, "").replace(/&&+/g, "&").replace(/\?&/g, "?");
        }
      } else {
        return [];
      }

      const raw = await fetchWorkerText(addCacheBuster(apiUrl));
      if (!raw.includes("resultsList")) return [];
      const json = JSON.parse(raw);
      const items = json?.resultsList?.records || [];

      return items.map(agg => {
        if (!agg.records || agg.records.length === 0) return null;
        const attr = agg.records[0].attributes;
        if (!attr) return null;
        const availability = attr["sku.availabilityStatus"] ? attr["sku.availabilityStatus"][0] : "";
        if (availability !== "INSTOCK") return null;

        const title = attr["product.displayName"] ? attr["product.displayName"][0] : "";
        let image = "";
        if (attr["product.primaryMediumImageURL"]) image = "https://www.frigelar.com.br" + attr["product.primaryMediumImageURL"][0];

        const spotPriceNum = attr["sku.activePrice"] ? parseFloat(attr["sku.activePrice"][0]) : 0;
        const listPriceNum = attr["sku.listPrice"] ? parseFloat(attr["sku.listPrice"][0]) : 0;
        if (!spotPriceNum) return null;

        let spot = fmtBRL(spotPriceNum);
        if (listPriceNum > spotPriceNum) {
          const pct = Math.round((listPriceNum - spotPriceNum) / listPriceNum * 100);
          if (pct > 0) spot += ` Com ${pct}% OFF no PIX`;
        }

        let install = "";
        if (listPriceNum > spotPriceNum) {
          install = `ou ${fmtBRL(listPriceNum)} em 8x de ${fmtBRL(listPriceNum / 8)} sem juros`;
        }

        const linkSlug = attr["product.route"] ? attr["product.route"][0] : "";
        const link = linkSlug ? "https://www.frigelar.com.br" + linkSlug : "";
        return { title, image, spot, install, link };
      }).filter(Boolean);
    } catch (e) {
      console.error("Frigelar erro:", e);
      return [];
    }
  }

  async function scrapeLeveros(url) {
    try {
      const freshUrl = addCacheBuster(url);
      let html;
      try { html = await fetchCorsText(freshUrl); }
      catch (e) { html = await fetchWorkerText(freshUrl); }
      const doc = new DOMParser().parseFromString(html, "text/html");
      const items = Array.from(doc.querySelectorAll(".products__item.product-card"));
      return items.map(card => {
        const titleEl = card.querySelector(".product-card__bottom__name");
        if (!titleEl) return null;
        const title = titleEl.innerText.trim();

        const imgEl = card.querySelector(".product-card__img-container img");
        const image = imgEl ? (imgEl.getAttribute("data-src") || imgEl.getAttribute("src") || "") : "";

        const spotEl = card.querySelector(".prices__price");
        const spotSupportEl = card.querySelector(".prices__support-text");
        let spot = spotEl ? spotEl.innerText.trim() : "";
        if (spotSupportEl && spotSupportEl.innerText.includes("à vista")) spot += " à vista";

        const installEl = card.querySelector(".installment");
        let install = "";
        if (installEl) {
          const rawInstall = installEl.innerText.replace(/\s+/g, " ").trim();
          const match = rawInstall.match(/(\d+)x\s+de\s+R\$\s*([\d.,]+)/i);
          if (match) {
            const parcelas = parseInt(match[1], 10);
            const valorParcela = parseFloat(match[2].replace(".", "").replace(",", "."));
            const total = plainBRL(parcelas * valorParcela);
            install = `ou R$ ${total} em ${parcelas}x de R$ ${match[2]}`;
          } else {
            install = rawInstall;
          }
        }

        const linkEl = card.querySelector(".product-card__bottom a");
        let link = linkEl ? linkEl.getAttribute("href") : "";
        if (link && !link.startsWith("http")) link = "https://www.leveros.com.br" + link;
        if (!spot) return null;
        return { title, image, spot, install, link };
      }).filter(Boolean);
    } catch (e) {
      console.error("Leveros erro:", e);
      return [];
    }
  }

  async function scrapeCentralAr(url) {
    const selectors = [
      ".product-listing-item", ".product__item", ".product-grid-item", ".product-item",
      ".searchPageProductWrapper > *", ".tile-product", "li[class*='product-item']",
      "div[class*='ProductGridItem']", "article[class*='product']", "[class*='product-tile']",
      "[class*='ProductTile']", "[data-product-id]", "[data-product-code]", ".pdc_product-item", ".card-product"
    ];

    async function fetchHtml(target) {
      const fresh = addCacheBuster(target);
      try { return await fetchCorsText(fresh); }
      catch (e) { return await fetchWorkerText(fresh); }
    }

    try {
      const html = await fetchHtml(url);
      const doc = new DOMParser().parseFromString(html, "text/html");
      let cards = [];
      for (const sel of selectors) {
        const found = doc.querySelectorAll(sel);
        if (found.length > 0) { cards = Array.from(found); break; }
      }
      if (!cards.length) return [];

      const seen = new Set();
      return cards.map(card => {
        const titleEl = card.querySelector("a.name, .product-name, [class*='title'], h2, h3");
        if (!titleEl) return null;
        const title = titleEl.innerText.trim();
        if (!title || seen.has(title)) return null;

        let link = "";
        const linkCandidates = [
          card.querySelector("a.name"),
          card.querySelector("a.thumb"),
          card.querySelector("a[href*='/p/']"),
          card.querySelector("a[href*='/produto/']"),
          card.tagName === "A" ? card : null,
          card.closest("a[href]"),
          card.querySelector("a[href]:not([href='']):not([href='#'])")
        ];
        for (const el of linkCandidates) {
          if (!el) continue;
          const href = el.getAttribute("href") || "";
          if (href && href !== "#" && !href.startsWith("javascript:")) { link = href; break; }
        }
        if (link && !link.startsWith("http")) link = "https://www.centralar.com.br" + (link.startsWith("/") ? "" : "/") + link;

        let image = "";
        const thumbImg = card.querySelector("a.thumb img, .thumb img, picture img");
        const candidates = thumbImg ? [thumbImg] : Array.from(card.querySelectorAll("img"));
        imageLoop: for (const imgEl of candidates) {
          for (const attr of ["data-src", "data-original", "data-lazy-src", "srcset", "data-srcset", "src"]) {
            let src = imgEl.getAttribute(attr);
            if (!src || typeof src !== "string") continue;
            if (src.startsWith("data:image")) continue;
            if (attr.includes("srcset") || src.includes(" ")) src = src.split(",")[0].trim().split(" ")[0];
            if (!src || src.endsWith(".svg") || src.includes("/_ui/")) continue;
            if (src.startsWith("//")) src = "https:" + src;
            if (src.startsWith("/")) src = "https://www.centralar.com.br" + src;
            image = src;
            break imageLoop;
          }
        }

        const text = card.innerText.replace(/\s+/g, " ").trim();
        const prices = [...text.matchAll(/r\$\s*([\d.]+,\d{2})/gi)];
        if (prices.length === 0) return null;
        const priceCash = parseFloat(prices[0][1].replace(/\./g, "").replace(",", "."));
        if (!priceCash) return null;
        const spot = fmtBRL(priceCash) + " à vista";

        let install = "";
        const instMatch = text.match(/(?:ou\s+)?r\$\s*[\d.,]+\s*(?:em|até|ate)?\s*\d+\s*x\s*de\s*r\$\s*[\d.,]+/i);
        if (instMatch) {
          install = instMatch[0]
            .replace(/sem\s+juros/gi, "")
            .replace(/\s+/g, " ")
            .replace(/^(\s*ou\s+)?/i, "ou ")
            .replace(/\s+(em|até|ate)\s+/i, " até ")
            .trim();
        } else {
          const fb = text.match(/\d+\s*x\s*de\s*r\$\s*[\d.,]+/i);
          if (fb) install = fb[0].trim();
        }

        seen.add(title);
        return { title, image, spot, install, link };
      }).filter(Boolean);
    } catch (e) {
      console.error("Central Ar erro:", e);
      return [];
    }
  }

  async function scrapeDufrio(url) {
    try {
      const html = await fetchWorkerText(addCacheBuster(url));
      const doc = new DOMParser().parseFromString(html, "text/html");
      const cards = Array.from(doc.querySelectorAll(".product-item"));
      return cards.map(card => {
        const titleEl = card.querySelector("a.product-item-link");
        if (!titleEl) return null;
        const title = titleEl.innerText.trim();

        const imgEl = card.querySelector("img.product-image-photo, img.product-image");
        let image = "";
        if (imgEl) {
          image = imgEl.src || imgEl.getAttribute("data-src") || "";
          if (image.includes("workers.dev")) {
            const u = new URL(image);
            image = u.searchParams.get("url") || image;
          }
          if (image && !image.startsWith("http")) image = "https://www.dufrio.com.br" + (image.startsWith("/") ? "" : "/") + image;
        }

        let spot = "";
        const spotPriceEl = card.querySelector(".spot-price");
        if (spotPriceEl) {
          spot = spotPriceEl.innerText.replace(/\s+/g, " ").trim();
        } else {
          const cashDownEl = card.querySelector("#cash_down");
          if (cashDownEl) spot = cashDownEl.innerText.replace(/\s+/g, " ").trim();
        }

        let install = "";
        card.querySelectorAll("p").forEach(p => {
          const pText = p.innerText.toLowerCase();
          if (pText.includes("ou r$") && (pText.includes("em") || pText.includes("x"))) {
            install = p.innerText.replace(/\s+/g, " ").trim();
          }
        });

        let link = titleEl.getAttribute("href") || "";
        if (link && !link.startsWith("http")) link = "https://www.dufrio.com.br" + (link.startsWith("/") ? "" : "/") + link;
        if (!spot || !install) return null;
        return { title, image, spot, install, link };
      }).filter(Boolean);
    } catch (e) {
      console.error("Dufrio erro:", e);
      return [];
    }
  }

  const SCRAPERS = {
    frigelar: scrapeFrigelar,
    leveros: scrapeLeveros,
    centralar: scrapeCentralAr,
    dufrio: scrapeDufrio
  };

  async function runScraper() {
    const url = document.getElementById("urlInput").value.trim();
    const results = document.getElementById("results");
    const loader = document.getElementById("loader");
    const status = document.getElementById("status");
    const btn = document.getElementById("renderBtn");
    const scraper = SCRAPERS[STORE.scraperKey];

    if (!url || !scraper) return;
    btn.disabled = true;
    results.innerHTML = "";
    status.innerText = "";
    loader.style.display = "block";

    try {
      const products = await scraper(url);
      if (!products.length) {
        status.innerText = `Nenhum produto detectado em ${STORE.label}.`;
      } else {
        const unique = products.reduce((acc, current) => {
          if (!acc.find(item => item.title === current.title)) acc.push(current);
          return acc;
        }, []);
        unique.forEach(p => {
          const el = document.createElement("div");
          el.className = "card";
          el.innerHTML = `
            <div class="card-img"><img src="${p.image || ""}" onerror="this.src='https://placehold.co/300?text=${encodeURIComponent(STORE.label)}'"></div>
            <div class="card-body">
              <div class="card-title" title="${p.title || ""}">${p.title || ""}</div>
              <div class="price-box">
                <div class="price-cash">${p.spot || "Consulte o site"}</div>
                <div class="price-parc">${p.install || ""}</div>
              </div>
              <a href="${p.link || url}" target="_blank" class="card-btn">Ver na ${STORE.label}</a>
            </div>`;
          results.appendChild(el);
        });
      }
    } catch (e) {
      console.error(e);
      status.innerText = "Erro crítico ao acessar o site.";
    } finally {
      loader.style.display = "none";
      btn.disabled = false;
    }
  }

  async function loadData() {
    const syncStatus = document.getElementById("sync-status");
    const syncText = document.getElementById("sync-text");

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try { sheetData = JSON.parse(cached); } catch (e) {}
      if (sheetData.length) renderTipos();
    }

    sheetLoadPromise = (async () => {
      try {
        const r = await fetch(SHEET_URL);
        const fresh = await r.json();
        if (JSON.stringify(sheetData) !== JSON.stringify(fresh)) {
          sheetData = fresh;
          localStorage.setItem(CACHE_KEY, JSON.stringify(sheetData));
          renderTipos();
        }
        syncStatus.className = "sync-status success";
        syncText.innerText = "Conectado";
      } catch (e) {
        console.error("Erro ao carregar planilha", e);
        syncStatus.className = "sync-status error";
        syncText.innerText = "Falha na planilha";
      }
    })();

    if (!sheetData.length) await sheetLoadPromise;
    if (sheetData.length) renderTipos();
  }

  function bindEvents() {
    document.getElementById("copyBtn").addEventListener("click", async () => {
      const url = document.getElementById("urlInput").value;
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
      } catch (e) {
        const inp = document.getElementById("urlInput");
        inp.select();
        document.execCommand("copy");
      }
      const b = document.getElementById("copyBtn");
      const original = b.textContent;
      b.textContent = "Copiado";
      b.classList.add("copied");
      setTimeout(() => {
        b.textContent = original;
        b.classList.remove("copied");
      }, 1400);
    });

    document.getElementById("urlInput").addEventListener("input", () => {
      const url = document.getElementById("urlInput").value.trim();
      if (url) {
        document.getElementById("renderBtn").disabled = false;
        document.getElementById("search-box").classList.add("ready");
        enableLinkActions(url);
      } else {
        document.getElementById("renderBtn").disabled = true;
        document.getElementById("search-box").classList.remove("ready");
        disableLinkActions();
      }
    });

    document.getElementById("renderBtn").addEventListener("click", runScraper);
  }

  document.addEventListener("DOMContentLoaded", () => {
    installShell();
    bindEvents();
    loadData();
  });
})();
