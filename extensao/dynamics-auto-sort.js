// ============================================================================
// Auto Filtro Dynamics 365 - Ordenacao automatica de Pedido de Venda v1.5.0
// Integrado a partir da extensao crftwoo/extensao-365 (release v1.5.0).
// Roda em world: MAIN apenas em https://dufrio.operations.dynamics.com/*
// e somente quando a URL contem mi=DF_ListPageQuickSale.
// Nao interage com outras paginas (dufrio.com.br, Hub etc).
// ============================================================================
// Diagnostico da v1.4.0 mostrou que essa instancia do Dynamics usa a
// biblioteca FixedDataTable (do Facebook) para a grade. O scroll horizontal
// nao usa scrollLeft - usa CSS transform: translateX(...) em divs com classe
// fixedDataTableCellGroupLayout_cellGroup. A v1.5.0 dispara WheelEvent com
// deltaX bem negativo no container do FixedDataTable para que a biblioteca
// faça o scroll programaticamente, e como rede de proteção zera o transform
// direto nos cellGroups.
// ============================================================================
// Este script roda no "MAIN world" da pagina (graças ao manifest), o que
// permite acessar diretamente o window.ko (Knockout) do Dynamics e disparar
// o sort sem precisar clicar no cabecalho da coluna - assim a tela nao
// rola para a direita e fica exatamente como o usuario quer.
//
// Estrategia:
//   1. Tenta acionar SortAscending via Knockout no contexto da coluna.
//      Se der certo: nenhum clique, nenhum movimento visual.
//   2. Se Knockout falhar: cai para o fluxo antigo (clica no header,
//      clica em "Classificar do mais antigo para o mais novo") e depois
//      faz reset agressivo do scroll horizontal.
// ============================================================================

(function () {
  'use strict';

  // Evita carregar duas vezes na mesma pagina
  if (window.__autoFiltroDynamicsLoaded__) return;
  window.__autoFiltroDynamicsLoaded__ = true;

  // -------------------------------------------------------------------------
  // CONFIGURACOES - edite aqui se algum texto mudar
  // -------------------------------------------------------------------------
  const URL_DEVE_CONTER = ["mi=DF_ListPageQuickSale"];
  const TEXTO_COLUNA = "Data e hora da modificação";
  const TEXTO_OPCAO = "Classificar do mais antigo para o mais novo";

  const TEMPO_MAXIMO_ESPERA_MS = 60000;
  const INTERVALO_VERIFICACAO_MS = 400;
  const DELAY_ENTRE_CLIQUES_MS = 250;

  const USAR_KNOCKOUT_PRIMEIRO = true;          // tenta sort silencioso antes do fallback
  const VOLTAR_SCROLL_AO_TERMINAR = true;       // so usado no fallback (Knockout nao precisa)
  const DELAY_ANTES_DE_VOLTAR_SCROLL_MS = 1200; // espera antes de comecar o reset
  const DURACAO_RESET_SCROLL_MS = 4000;         // por quanto tempo continua resetando
  const INTERVALO_RESET_SCROLL_MS = 100;        // de quanto em quanto tempo reseta

  const PREFIXO_LOG = "[AutoFiltroDynamics]";

  // -------------------------------------------------------------------------
  // ESTADO
  // -------------------------------------------------------------------------
  let automacaoEmAndamento = false;
  let automacaoConcluidaParaURL = null;
  let ultimaURLObservada = location.href;

  // -------------------------------------------------------------------------
  // LOG
  // -------------------------------------------------------------------------
  function log() {
    const args = Array.prototype.slice.call(arguments);
    console.log.apply(console, [PREFIXO_LOG].concat(args));
  }
  function warn() {
    const args = Array.prototype.slice.call(arguments);
    console.warn.apply(console, [PREFIXO_LOG].concat(args));
  }

  // -------------------------------------------------------------------------
  // HELPERS BASICOS
  // -------------------------------------------------------------------------
  function urlEhAlvo() {
    const href = window.location.href;
    return URL_DEVE_CONTER.every(function (t) { return href.indexOf(t) !== -1; });
  }

  function textoDe(el) {
    if (!el) return "";
    const t = el.textContent || el.innerText || "";
    return t.replace(/\s+/g, " ").trim();
  }

  function dormir(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function aguardar(cond, tempoMaximoMs) {
    return new Promise(function (resolve, reject) {
      const inicio = Date.now();
      function tic() {
        let r = null;
        try { r = cond(); } catch (e) {}
        if (r) return resolve(r);
        if (Date.now() - inicio > tempoMaximoMs) return reject(new Error("timeout"));
        setTimeout(tic, INTERVALO_VERIFICACAO_MS);
      }
      tic();
    });
  }

  function clicar(el) {
    if (!el) return;
    try { el.focus && el.focus(); } catch (e) {}
    try { el.click(); } catch (e) {}
    try {
      const opt = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent('mousedown', opt));
      el.dispatchEvent(new MouseEvent('mouseup', opt));
      el.dispatchEvent(new MouseEvent('click', opt));
    } catch (e) {}
  }

  // -------------------------------------------------------------------------
  // ENCONTRAR ELEMENTOS PELO TEXTO VISIVEL
  // -------------------------------------------------------------------------
  function encontrarCabecalhoColuna(textoAlvo) {
    const labels = document.querySelectorAll(
      '.dyn-headerCellLabel, [class*="headerCellLabel"]'
    );
    for (let i = 0; i < labels.length; i++) {
      if (textoDe(labels[i]) === textoAlvo) return labels[i];
    }
    const candidatos = document.querySelectorAll('div, span');
    for (let i = 0; i < candidatos.length; i++) {
      const el = candidatos[i];
      if (textoDe(el) === textoAlvo) {
        if (el.closest('[class*="headerCell"], [class*="header-cell"], [role="columnheader"]')) {
          return el;
        }
      }
    }
    return null;
  }

  function encontrarBotaoOpcao(textoAlvo) {
    const labels = document.querySelectorAll(
      '.button-label, [class*="button-label"]'
    );
    for (let i = 0; i < labels.length; i++) {
      if (textoDe(labels[i]) === textoAlvo) {
        const btn = labels[i].closest('button, [role="button"], [data-dyn-role="Button"]');
        return btn || labels[i];
      }
    }
    const botoes = document.querySelectorAll(
      'button, [role="button"], [data-dyn-role="Button"]'
    );
    for (let i = 0; i < botoes.length; i++) {
      if (textoDe(botoes[i]) === textoAlvo) return botoes[i];
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // KNOCKOUT - tenta disparar o sort sem mexer na interface
  // -------------------------------------------------------------------------
  function obterChavesSeguras(obj) {
    try {
      return Object.keys(obj).slice(0, 30);
    } catch (e) {
      return [];
    }
  }

  function chamarSeFuncao(fn, thisArg) {
    if (typeof fn !== 'function') return false;
    try {
      fn.call(thisArg);
      return true;
    } catch (e) {
      log("Chamada Knockout falhou:", e && e.message);
      return false;
    }
  }

  function tentarSortNoData(data) {
    if (!data) return false;
    // Lista de caminhos onde SortAscending pode estar
    const tentativas = [
      ['SortAscending', data],
      ['sortAscending', data],
      ['column.SortAscending', data.column],
      ['column.sortAscending', data.column],
      ['headerCell.SortAscending', data.headerCell],
      ['filter.SortAscending', data.filter],
      ['sortControl.SortAscending', data.sortControl]
    ];
    for (let i = 0; i < tentativas.length; i++) {
      const par = tentativas[i];
      const dono = par[1];
      if (!dono) continue;
      const nomeMetodo = par[0].split('.').pop();
      if (chamarSeFuncao(dono[nomeMetodo], dono)) {
        log("Sort via Knockout aplicado em '" + par[0] + "'.");
        return true;
      }
    }
    return false;
  }

  function tentarSortViaKnockout() {
    if (!USAR_KNOCKOUT_PRIMEIRO) return false;

    const ko = window.ko;
    if (!ko || typeof ko.contextFor !== 'function') {
      log("Knockout (window.ko) nao disponivel - usando fallback.");
      return false;
    }

    const label = encontrarCabecalhoColuna(TEXTO_COLUNA);
    if (!label) {
      log("Cabecalho '" + TEXTO_COLUNA + "' ainda nao encontrado para Knockout.");
      return false;
    }
    const headerCell = label.closest(
      '.dyn-headerCell, [class*="headerCell"], [role="columnheader"]'
    ) || label;

    // Tenta no proprio headerCell e em pais ate uns 5 niveis acima
    let elemento = headerCell;
    for (let nivel = 0; nivel < 6 && elemento; nivel++) {
      let ctx = null;
      try { ctx = ko.contextFor(elemento); } catch (e) {}

      if (ctx) {
        const candidatosData = [
          ctx.$data,
          ctx.$rawData && (typeof ko.unwrap === 'function' ? ko.unwrap(ctx.$rawData) : ctx.$rawData),
          ctx.$parent,
          ctx.$parents && ctx.$parents[0],
          ctx.$parents && ctx.$parents[1],
          ctx.$root
        ];
        for (let i = 0; i < candidatosData.length; i++) {
          if (tentarSortNoData(candidatosData[i])) return true;
        }

        // Se nenhuma das chamadas funcionou, loga as chaves disponiveis
        // (so na primeira iteracao, para nao poluir o console)
        if (nivel === 0 && ctx.$data) {
          log("Knockout $data no header - chaves disponiveis:",
              obterChavesSeguras(ctx.$data));
        }
      }
      elemento = elemento.parentElement;
    }

    log("Nenhum caminho Knockout funcionou - usando fallback.");
    return false;
  }

  // -------------------------------------------------------------------------
  // FALLBACK: rolar de volta para a esquerda apos a ordenacao
  // -------------------------------------------------------------------------

  // Estrategia A: reset de scrollLeft nativo (caso a grade use scroll do navegador)
  function resetarScrollLeftEmTodos() {
    let n = 0;
    const todos = document.querySelectorAll('*');
    for (let i = 0; i < todos.length; i++) {
      const el = todos[i];
      try {
        if (typeof el.scrollLeft === 'number' && el.scrollLeft > 0) {
          el.scrollLeft = 0;
          try { el.dispatchEvent(new Event('scroll', { bubbles: true })); } catch (e) {}
          n++;
        }
      } catch (e) {}
    }
    try { document.documentElement.scrollLeft = 0; } catch (e) {}
    try { document.body.scrollLeft = 0; } catch (e) {}
    try {
      if (window.scrollX > 0) window.scrollTo(0, window.scrollY);
    } catch (e) {}
    return n;
  }

  // Estrategia B: clica na primeira celula da primeira linha de dados.
  // Em grades virtualizadas, o foco/click leva a grade a rolar para
  // a esquerda automaticamente para mostrar a celula clicada.
  function clicarPrimeiraCelulaDeDados() {
    const seletoresLinha = [
      '[role="row"]:not([class*="header"])',
      '[class*="dyn-list-row"]:not([class*="header"])',
      '[class*="grid-row"]:not([class*="header"])',
      '[data-dyn-role="Row"]'
    ];

    for (let s = 0; s < seletoresLinha.length; s++) {
      const linhas = document.querySelectorAll(seletoresLinha[s]);
      for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        // Pula linhas que sao header
        if (linha.querySelector('[role="columnheader"], [class*="headerCell"]')) continue;
        // Pega a primeira celula nessa linha (mais a esquerda em DOM order)
        const celulas = linha.querySelectorAll(
          '[role="gridcell"], [data-dyn-role="Cell"], [class*="dyn-list-cell"], [class*="dataCell"]'
        );
        if (celulas.length > 0) {
          try {
            celulas[0].click();
            log("Clique aplicado na primeira celula da primeira linha de dados (seletor:", seletoresLinha[s], ").");
            return true;
          } catch (e) {}
        }
      }
    }

    // Fallback: qualquer [role="gridcell"] em DOM order
    const grids = document.querySelectorAll('[role="gridcell"]');
    if (grids.length > 0) {
      try {
        grids[0].click();
        log("Clique aplicado em [role=gridcell][0].");
        return true;
      } catch (e) {}
    }

    log("Nao consegui clicar em uma celula de dados.");
    return false;
  }

  // Estrategia D: dispara WheelEvent com deltaX bem negativo no container
  // do FixedDataTable. Em grades baseadas nessa biblioteca, esse e o jeito
  // "oficial" de pedir um scroll horizontal, e ela atualiza seu estado
  // interno (que controla os transforms dos cellGroups).
  function dispararWheelParaEsquerda() {
    const seletores = [
      '.public_fixedDataTable_main',
      '.fixedDataTableLayout_main',
      '[class*="public_fixedDataTable"]',
      '[class*="fixedDataTableLayout"]',
      '[class*="fixedDataTable"]'
    ];

    let totalDespachado = 0;
    for (let s = 0; s < seletores.length; s++) {
      const alvos = document.querySelectorAll(seletores[s]);
      for (let i = 0; i < alvos.length; i++) {
        try {
          const evt = new WheelEvent('wheel', {
            deltaX: -99999,
            deltaY: 0,
            deltaMode: 0,
            bubbles: true,
            cancelable: true,
            view: window
          });
          alvos[i].dispatchEvent(evt);
          totalDespachado++;
        } catch (e) {}
      }
      if (totalDespachado > 0) {
        log("WheelEvent deltaX=-99999 despachado em", totalDespachado,
            "elemento(s) com seletor", seletores[s]);
        return true;
      }
    }
    log("Nenhum container de FixedDataTable encontrado para WheelEvent.");
    return false;
  }

  // Estrategia E: ultimo recurso - zera o transform translateX direto nos
  // cellGroups. Pode dessincronizar do estado interno do FixedDataTable, mas
  // visualmente leva a grade para o inicio.
  function zerarTransformsCellGroups() {
    const grupos = document.querySelectorAll(
      '[class*="fixedDataTableCellGroupLayout_cellGroup"]'
    );
    let n = 0;
    for (let i = 0; i < grupos.length; i++) {
      try {
        const cg = grupos[i];
        const cs = getComputedStyle(cg);
        if (cs.transform && cs.transform !== 'none' && cs.transform.indexOf('matrix') === 0) {
          const m = cs.transform.match(/matrix\(([^)]+)\)/);
          const parts = m ? m[1].split(',').map(function (p) { return parseFloat(p.trim()); }) : null;
          if (parts && parts.length >= 6 && Math.abs(parts[4]) > 2) {
            cg.style.transform = 'translate3d(0px, 0px, 0px)';
            n++;
          }
        }
      } catch (e) {}
    }
    if (n > 0) log("Estrategia E: transform zerado em", n, "cellGroup(s).");
    return n;
  }

  // Estrategia C: scrollIntoView no PRIMEIRO header em DOM order
  // (que e geralmente a coluna mais a esquerda).
  function scrollIntoViewPrimeiroHeader() {
    const headers = document.querySelectorAll(
      '.dyn-headerCell, [class*="headerCell"], [role="columnheader"]'
    );
    if (!headers.length) {
      log("Nenhum header encontrado para scrollIntoView.");
      return false;
    }
    try {
      headers[0].scrollIntoView({ block: 'nearest', inline: 'start' });
      log("scrollIntoView aplicado no primeiro header em DOM order:", textoDe(headers[0]));
      return true;
    } catch (e) {
      log("scrollIntoView falhou:", e && e.message);
      return false;
    }
  }

  // Diagnostico: informa o que existe na pagina, para entender o mecanismo de rolagem
  function diagnosticarMecanismoDeScroll() {
    log("=== DIAGNOSTICO DE SCROLL ===");
    const todos = document.querySelectorAll('*');

    // Containers rolaveis (overflow-x scroll/auto e scrollWidth > clientWidth)
    const rolaveis = [];
    for (let i = 0; i < todos.length; i++) {
      const el = todos[i];
      try {
        const cs = getComputedStyle(el);
        if ((cs.overflowX === 'scroll' || cs.overflowX === 'auto') && el.scrollWidth > el.clientWidth + 2) {
          rolaveis.push({
            tag: el.tagName,
            cls: (el.className || '').toString().substring(0, 100),
            scrollLeft: el.scrollLeft,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth
          });
        }
      } catch (e) {}
    }
    log("Containers com overflow-x rolavel:", rolaveis.length);
    for (let i = 0; i < Math.min(rolaveis.length, 10); i++) {
      const r = rolaveis[i];
      log(" - <" + r.tag + "> class='" + r.cls + "' scrollLeft=" + r.scrollLeft +
          " scrollWidth=" + r.scrollWidth + " clientWidth=" + r.clientWidth);
    }

    // Elementos com transform translateX significativo
    const transformados = [];
    for (let i = 0; i < todos.length; i++) {
      const el = todos[i];
      try {
        const cs = getComputedStyle(el);
        const t = cs.transform;
        if (t && t !== 'none' && t.indexOf('matrix') === 0) {
          const m = t.match(/matrix\(([^)]+)\)/);
          if (m) {
            const parts = m[1].split(',').map(function (p) { return parseFloat(p.trim()); });
            if (parts.length >= 6 && Math.abs(parts[4]) > 15) {
              transformados.push({
                tag: el.tagName,
                cls: (el.className || '').toString().substring(0, 100),
                translateX: parts[4]
              });
            }
          }
        }
      } catch (e) {}
    }
    log("Elementos com transform translateX != 0:", transformados.length);
    for (let i = 0; i < Math.min(transformados.length, 10); i++) {
      const t = transformados[i];
      log(" - <" + t.tag + "> class='" + t.cls + "' translateX=" + t.translateX);
    }

    log("=== FIM DO DIAGNOSTICO ===");

    // Tenta tambem resetar os transforms para 0 - HACK que pode quebrar coisas,
    // mas vale tentar pra ver se a tela rola.
    for (let i = 0; i < transformados.length; i++) {
      try {
        // Nao vou mexer aqui pra nao quebrar, so loga.
      } catch (e) {}
    }
  }

  async function voltarScrollParaInicio() {
    if (!VOLTAR_SCROLL_AO_TERMINAR) return;

    // Espera o grid terminar de renderizar a ordem nova
    await dormir(DELAY_ANTES_DE_VOLTAR_SCROLL_MS);

    // Diagnostico: registra o que existe agora
    diagnosticarMecanismoDeScroll();

    // Estrategia D (PRINCIPAL): WheelEvent no container do FixedDataTable.
    // Repete algumas vezes para garantir que chegou ao maximo a esquerda.
    for (let i = 0; i < 5; i++) {
      dispararWheelParaEsquerda();
      await dormir(120);
    }

    // Estrategia A: reset de scrollLeft nativo (uma rodada, garantia)
    const nA = resetarScrollLeftEmTodos();
    log("Estrategia A (scrollLeft=0): resetou", nA, "elemento(s).");

    // Estrategia C: scrollIntoView no primeiro header (em DOM order)
    const okC = scrollIntoViewPrimeiroHeader();
    log("Estrategia C (scrollIntoView 1o header):", okC ? "OK" : "FALHOU");

    // Aguarda um pouco e verifica: se ainda tem cellGroups com translateX != 0,
    // aplica a Estrategia E (zerar transform direto) como ultimo recurso.
    await dormir(400);

    let aindaDeslocados = 0;
    const grupos = document.querySelectorAll(
      '[class*="fixedDataTableCellGroupLayout_cellGroup"]'
    );
    for (let i = 0; i < grupos.length; i++) {
      try {
        const cs = getComputedStyle(grupos[i]);
        const m = cs.transform && cs.transform.match(/matrix\(([^)]+)\)/);
        const parts = m ? m[1].split(',').map(function (p) { return parseFloat(p.trim()); }) : null;
        if (parts && parts.length >= 6 && Math.abs(parts[4]) > 2) aindaDeslocados++;
      } catch (e) {}
    }
    log("Apos Estrategia D, cellGroups ainda com translateX !=0:", aindaDeslocados);

    if (aindaDeslocados > 0) {
      // Tenta mais umas rodadas de wheel, depois cai na E
      for (let i = 0; i < 3; i++) {
        dispararWheelParaEsquerda();
        await dormir(150);
      }
      await dormir(300);
      const grupos2 = document.querySelectorAll(
        '[class*="fixedDataTableCellGroupLayout_cellGroup"]'
      );
      let aindaDeslocados2 = 0;
      for (let i = 0; i < grupos2.length; i++) {
        try {
          const cs = getComputedStyle(grupos2[i]);
          const m = cs.transform && cs.transform.match(/matrix\(([^)]+)\)/);
          const parts = m ? m[1].split(',').map(function (p) { return parseFloat(p.trim()); }) : null;
          if (parts && parts.length >= 6 && Math.abs(parts[4]) > 2) aindaDeslocados2++;
        } catch (e) {}
      }
      log("Apos mais rodadas de Wheel, ainda deslocados:", aindaDeslocados2);

      if (aindaDeslocados2 > 0) {
        zerarTransformsCellGroups();
      }
    }

    log("voltarScrollParaInicio concluido.");
  }

  // -------------------------------------------------------------------------
  // FLUXO PRINCIPAL
  // -------------------------------------------------------------------------
  async function executarAutomacao() {
    if (!urlEhAlvo()) return;
    if (automacaoEmAndamento) return;
    if (automacaoConcluidaParaURL === window.location.href) return;

    automacaoEmAndamento = true;
    log("Iniciando automacao. URL:", window.location.href);

    try {
      // Aguarda o cabecalho aparecer na pagina (mesmo que esteja fora da tela)
      log("Aguardando cabecalho da coluna:", TEXTO_COLUNA);
      await aguardar(
        function () { return encontrarCabecalhoColuna(TEXTO_COLUNA); },
        TEMPO_MAXIMO_ESPERA_MS
      );
      log("Cabecalho encontrado no DOM.");

      // === Estrategia 1: KNOCKOUT (sem mover a UI) ===
      if (tentarSortViaKnockout()) {
        log("Pronto. Sort silencioso aplicado - a tela nao precisou rolar.");
        automacaoConcluidaParaURL = window.location.href;
        return;
      }

      // === Estrategia 2: CLIQUES NA UI + scroll-back ===
      log("Aplicando sort via cliques na UI (modo fallback).");

      const label = encontrarCabecalhoColuna(TEXTO_COLUNA);
      const headerCell = label && (label.closest('[class*="headerCell"], [role="columnheader"]') || label);
      clicar(headerCell);
      log("Clique no cabecalho.");

      await dormir(DELAY_ENTRE_CLIQUES_MS);

      log("Aguardando opcao:", TEXTO_OPCAO);
      const botao = await aguardar(
        function () { return encontrarBotaoOpcao(TEXTO_OPCAO); },
        TEMPO_MAXIMO_ESPERA_MS
      );
      clicar(botao);
      log("Clique na opcao de sort.");

      await voltarScrollParaInicio();

      automacaoConcluidaParaURL = window.location.href;
    } catch (erro) {
      warn("Falha na automacao:", erro && erro.message ? erro.message : erro);
    } finally {
      automacaoEmAndamento = false;
    }
  }

  // -------------------------------------------------------------------------
  // OBSERVADORES
  // -------------------------------------------------------------------------
  function instalarObservadorURL() {
    setInterval(function () {
      if (location.href !== ultimaURLObservada) {
        log("URL mudou:", ultimaURLObservada, "->", location.href);
        ultimaURLObservada = location.href;
        automacaoConcluidaParaURL = null;
        if (urlEhAlvo()) executarAutomacao();
      }
    }, 1000);
  }

  function instalarObservadorDOM() {
    const obs = new MutationObserver(function () {
      if (!urlEhAlvo()) return;
      if (automacaoConcluidaParaURL === window.location.href) return;
      if (automacaoEmAndamento) return;
      if (encontrarCabecalhoColuna(TEXTO_COLUNA)) {
        executarAutomacao();
      }
    });
    obs.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
    log("Observador DOM instalado.");
  }

  // -------------------------------------------------------------------------
  // INICIALIZACAO
  // -------------------------------------------------------------------------
  function inicializar() {
    log("Extensao v1.5.0 carregada (world: MAIN). URL atual:", window.location.href);
    instalarObservadorURL();
    instalarObservadorDOM();
    if (urlEhAlvo()) {
      executarAutomacao();
    } else {
      log("URL atual nao corresponde a DF_ListPageQuickSale. Aguardando navegacao.");
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();
