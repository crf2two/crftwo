/* ============================================================
   ATELIER DUFRIO · CINEMATIC WORKSPACE — Lógica
   ------------------------------------------------------------
   Vanilla JS (zero dependências). Optei por reescrever a
   arquitetura em módulos pequenos com responsabilidade única,
   facilitando manutenção sem quebrar nenhuma URL existente.
   ------------------------------------------------------------
   MÓDULOS:
   1) DATA            — fonte única dos dados de ferramentas
   2) Hub             — render do bento e ambiente do hub
   3) MagneticCards   — cursor spotlight nos cards
   4) Constellation   — interação especial dos LABS (orbital)
   5) MobileDock      — doca inferior responsiva
   6) Chrono          — relógio do topbar
   7) Changelog       — painel de última atualização
   8) Bootstrap       — orquestra a inicialização
   ============================================================ */


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 1) DATA                                                   ║
   ║ Mantenho os arquivos/IDs originais para preservar         ║
   ║ todas as URLs já em produção. Apenas reescrevi títulos    ║
   ║ e descrições com tom mais editorial/sofisticado, dentro   ║
   ║ da liberdade concedida.                                   ║
   ╚═══════════════════════════════════════════════════════════╝ */

const ICONS = {
  cube: `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  scissors: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 002 2h2a2 2 0 002-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="m9 14 2 2 4-4"/></svg>`,
  scope: `<svg viewBox="0 0 24 24"><path d="M21 21l-6-6"/><circle cx="10" cy="10" r="7"/></svg>`,
  bars: `<svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  pulse: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  tag: `<svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/><line x1="6" y1="18" x2="18" y2="6"/></svg>`,
  beaker: `<svg viewBox="0 0 24 24"><path d="M9 3v6l-5 9a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-9V3"/><line x1="9" y1="3" x2="15" y2="3"/><line x1="6" y1="14" x2="18" y2="14"/></svg>`,
  doc: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  funnel: `<svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  download: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
};

const DATA = {
  /* Categorias com cabeçalho narrativo + número editorial */
  sections: [
    {
      id: 'camara',
      num: '01',
      title: 'Câmara <em>Fria</em>',
      sub: 'Engenharia de frio: simulação 3D, otimização de cortes e checklist técnico para orçamentos de câmara frigorífica.',
      mount: 'gridCamara'
    },
    {
      id: 'ar',
      num: '02',
      title: 'Inteligência <em>de Mercado</em>',
      sub: 'Vigilância de preços e precificação dinâmica em ar-condicionado. Comparadores, scrapers e a câmara de laboratórios.',
      mount: 'gridAr'
    },
    {
      id: 'outros',
      num: '03',
      title: 'Estúdio <em>Operacional</em>',
      sub: 'Ferramentas de apoio: orçamento expresso, extração de códigos e download do projeto completo.',
      mount: 'gridOutros'
    }
  ],

  /* Ferramentas: campos `arquivo` e `slug` permanecem fiéis ao
     original — assim qualquer link externo/bookmark continua
     funcionando. Apenas refinei o copy. */
  tools: [
    /* CÂMARA FRIA */
    {
      slug: 'gabinete', category: 'camara',
      title: 'Gabinete 3D',
      desc: 'Direção volumétrica para painéis PIR e EPS. Visualize o gabinete em três dimensões antes de cravar a primeira cota.',
      meta: 'Simulação · 3D',
      arquivo: 'simulador-gabinete.html',
      icon: ICONS.cube,
      color: '#4facfe'
    },
    {
      slug: 'corte', category: 'camara',
      title: 'Plano de Corte',
      desc: 'Otimização precisa de painéis EPS/PIR em chapas de 12m. Cada milímetro economizado importa.',
      meta: 'Otimização · Chapas',
      arquivo: 'plano-corte.html',
      icon: ICONS.scissors,
      color: '#f97316'
    },
    {
      slug: 'checklist', category: 'camara',
      title: 'Checklist · PDF',
      desc: 'Roteiro guiado, passo a passo, que materializa o orçamento em PDF pronto para o cliente.',
      meta: 'Documento · Vendas',
      arquivo: 'CheckList.html',
      icon: ICONS.check,
      color: '#10b981'
    },

    /* AR CONDICIONADO */
    {
      slug: 'scraper', category: 'ar',
      title: 'Scraper Oficial',
      desc: 'Comparativo unificado em tempo real entre Dufrio, Frigelar, Leveros e Central Ar. A fotografia mais nítida do mercado.',
      meta: 'Live · 4 lojas',
      arquivo: 'scraper-ar.html',
      icon: ICONS.scope,
      color: '#f59e0b'
    },
    {
      slug: 'comparador', category: 'ar',
      title: 'Comparador',
      desc: 'Análise lateral da concorrência em ar-condicionado. Tempo real, sem ruído.',
      meta: 'Análise · Concorrência',
      arquivo: 'comparador-ar.html',
      icon: ICONS.bars,
      color: '#6366f1'
    },
    {
      slug: 'precos-vivo', category: 'ar',
      title: 'Preços ao Vivo',
      desc: 'O que sua extensão coleta agora, em cards. Câmera ligada, mercado em movimento.',
      meta: 'Em produção',
      badge: 'BETA',
      arquivo: 'precos-ao-vivo.html',
      icon: ICONS.pulse,
      color: '#00e676'
    },
    {
      slug: 'precificacao', category: 'ar',
      title: 'Precificação SKU',
      desc: 'Calculadora que pega o preço do site e o devolve formatado para o 365. Direto ao ponto.',
      meta: 'Calculadora · 365',
      arquivo: 'precificacao-ar.html',
      icon: ICONS.tag,
      color: '#0ea5e9'
    },
    {
      slug: 'scraper-labs', category: 'ar',
      title: 'Laboratórios de Scraper',
      desc: 'Bancada experimental — scrapers individuais por loja. Onde refinamos antes de promover ao Oficial.',
      meta: 'Câmara experimental',
      badge: 'LAB',
      isLabGroup: true,
      icon: ICONS.beaker,
      color: '#22c55e'
    },

    /* OUTROS */
    {
      slug: 'cotacao', category: 'outros',
      title: 'Cotação Express',
      desc: 'Orçamento rápido para infra-estrutura de ar-condicionado. Velocidade onde antes havia atrito.',
      meta: 'Orçamento · Rápido',
      arquivo: 'cotacoes.html',
      icon: ICONS.doc,
      color: '#8b5cf6'
    },
    {
      slug: 'extracao', category: 'outros',
      title: 'Extração de Códigos',
      desc: 'Filtra e extrai apenas os SKUs com saldo em estoque. Sem ruído, sem retrabalho.',
      meta: 'Filtro · Estoque',
      arquivo: 'itens-quantidade.html',
      icon: ICONS.funnel,
      color: '#d946ef'
    },
    {
      slug: 'download', category: 'outros',
      title: 'Baixar Projeto',
      desc: 'Pacote completo do projeto e da extensão. Para arquivar, distribuir ou bifurcar.',
      meta: 'ZIP · GitHub',
      arquivo: 'https://github.com/crftwoo/thiago.luz.dufrio/archive/refs/heads/main.zip',
      icon: ICONS.download,
      color: '#94a3b8',
      isDownload: true
    }
  ],

  /* Sub-laboratórios (mesmos arquivos do original) */
  labs: [
    { name: 'CLIMARIO',       desc: 'Extração direta via URL.',           file: 'scraper-climario.html',     color: '#f59e0b' },
    { name: 'FRIGELAR',       desc: 'Linhas isoladas da planilha.',       file: 'scraper-frigelar.html',     color: '#00a859' },
    { name: 'LEVEROS',        desc: 'Linhas isoladas da planilha.',       file: 'scraper-leveros.html',      color: '#ff6b00' },
    { name: 'CENTRAL AR',     desc: 'Linhas isoladas da planilha.',       file: 'scraper-centralar.html',    color: '#ec4899' },
    { name: 'DUFRIO',         desc: 'Linhas isoladas da planilha.',       file: 'scraper-dufrio.html',       color: '#007bff' },
    { name: 'FRIOPEÇAS',      desc: 'Produtos via link da planilha.',     file: 'scraper-friopecas.html',    color: '#2563eb' },
    { name: 'POLO AR',        desc: 'Produtos via link da planilha.',     file: 'scraper-poloar.html',       color: '#ef4444' },
    { name: 'WEBCONTINENTAL', desc: 'Produtos via link da planilha.',     file: 'scraper-webcontinental.html', color: '#14b8a6' }
  ]
};


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 2) Hub — render do bento + cabeçalhos editoriais          ║
   ╚═══════════════════════════════════════════════════════════╝ */

const Hub = (() => {

  function buildSectionHead(section) {
    return `
      <div class="section-head lift-in" data-stagger="0">
        <div>
          <div class="section-num">${section.num} · Seção</div>
          <h2 class="section-title">${section.title}</h2>
        </div>
        <p class="section-sub">${section.sub}</p>
      </div>
    `;
  }

  function buildToolCard(tool, idx) {
    const isPortal = tool.isLabGroup;
    /* O card do grupo de labs ganha um modificador `.labs-portal`
       que adiciona os anéis orbitais — uma "pista" visual
       sobre a interação 3D que abrirá ao clicar. */
    const portalRings = isPortal ? `
      <div class="labs-orbit">
        <div class="labs-orbit-ring"></div>
        <div class="labs-orbit-ring"></div>
        <div class="labs-orbit-ring"></div>
      </div>
    ` : '';

    const badge = tool.badge ? `<span class="tool-badge">${tool.badge}</span>` : '';

    return `
      <a class="tool-card lift-in ${isPortal ? 'labs-portal' : ''}"
         data-id="${tool.slug}"
         data-stagger="${Math.min(idx, 5)}"
         href="${tool.isDownload ? '#' : tool.arquivo}"
         data-action="${tool.isDownload ? 'download' : tool.isLabGroup ? 'labs' : 'open'}"
         data-arquivo="${tool.arquivo}"
         style="--card-color:${tool.color}">
        ${portalRings}
        <div class="tool-head">
          <div class="tool-icon">${tool.icon}</div>
          ${badge}
        </div>
        <div>
          <h3 class="tool-title">${tool.title}</h3>
          <p class="tool-desc">${tool.desc}</p>
          <div class="tool-foot">
            <span class="tool-meta">${tool.meta}</span>
            <span class="tool-arrow">${ICONS.arrow}</span>
          </div>
        </div>
      </a>
    `;
  }

  function render() {
    const root = document.getElementById('sections');
    if (!root) return;

    const html = DATA.sections.map(section => {
      const tools = DATA.tools.filter(t => t.category === section.id);
      const cards = tools.map((t, i) => buildToolCard(t, i)).join('');
      return `
        <section class="section" id="section-${section.id}">
          ${buildSectionHead(section)}
          <div class="bento-grid">${cards}</div>
        </section>
      `;
    }).join('');

    root.innerHTML = html;

    /* Delegação de evento: um único listener no root cuida de
       cliques em qualquer card. Evita N listeners. */
    root.addEventListener('click', onCardClick);
  }

  function onCardClick(event) {
    const card = event.target.closest('.tool-card');
    if (!card) return;

    const action = card.dataset.action;
    const arquivo = card.dataset.arquivo;

    if (action === 'labs') {
      event.preventDefault();
      Constellation.open();
      return;
    }

    if (action === 'download') {
      event.preventDefault();
      if (confirm('Baixar o pacote completo do projeto e da extensão?')) {
        const a = document.createElement('a');
        a.href = arquivo;
        a.download = 'atelier-dufrio.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      return;
    }

    /* Caso default: o próprio <a> com href cuida da navegação,
       mas adicionamos uma transição "click ripple" sutil */
    Hub.flashTransition(card);
  }

  /* Pequena transição de saída — evita o "salto seco" do
     navegador entre páginas, dando a sensação de fluxo. */
  function flashTransition(card) {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: ${card.style.getPropertyValue('--card-color') || '#fff'};
      opacity: 0; pointer-events: none;
      transition: opacity 220ms ease-out;
      mix-blend-mode: overlay;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '0.18'; });
    setTimeout(() => flash.remove(), 320);
  }

  return { render, flashTransition };
})();


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 3) MagneticCards — cursor spotlight                       ║
   ║ Atualiza --mx/--my de cada card para a posição do        ║
   ║ cursor relativa ao próprio card. CSS faz o resto via      ║
   ║ radial-gradient. Custo: 1 listener por hover.             ║
   ╚═══════════════════════════════════════════════════════════╝ */

const MagneticCards = (() => {
  function bind() {
    document.addEventListener('mousemove', onMove);
  }
  function onMove(e) {
    /* querySelector recria a cada move — viável porque o set
       de cards é pequeno (≈11). Em libs maiores valeria
       cachear, mas aqui prefiro simplicidade. */
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach(card => {
      const r = card.getBoundingClientRect();
      /* só atualiza se o cursor está perto, otimizando paint */
      if (e.clientX < r.left - 200 || e.clientX > r.right + 200) return;
      if (e.clientY < r.top - 200 || e.clientY > r.bottom + 200) return;
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  }
  return { bind };
})();


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 4) Constellation — interação ÚNICA dos LABS               ║
   ║ Quando o card "Laboratórios de Scraper" é clicado:        ║
   ║ - overlay full-screen com fade-in + blur (cinematográfico)║
   ║ - cada lab vira um satélite orbitando o "núcleo Dufrio"  ║
   ║ - usuário pode arrastar para girar a constelação 3D      ║
   ║ - ao escolher um satélite: warp-jump (flash) e navega    ║
   ╚═══════════════════════════════════════════════════════════╝ */

const Constellation = (() => {
  let overlay = null;
  let dragging = false;
  let startX = 0;
  let baseRot = 0;
  let currentRot = 0;

  function buildSatellite(lab, i, total) {
    /* Distribui os labs uniformemente em círculo: 360/N
       Cada satélite ganha --angle e --radius via inline style.
       O CSS faz o resto via transform 3D em coordenadas polares. */
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

    overlay = document.createElement('div');
    overlay.className = 'constellation';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Constelação de Laboratórios');
    overlay.innerHTML = `
      <div class="constellation-stars"></div>

      <button class="constellation-close" type="button" aria-label="Fechar constelação">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="constellation-system">
        ${DATA.labs.map((lab, i) => buildSatellite(lab, i, DATA.labs.length)).join('')}
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

    /* Listener: fechar ao clicar no botão */
    overlay.querySelector('.constellation-close').addEventListener('click', close);

    /* Listener: warp jump ao clicar num satélite */
    overlay.querySelectorAll('.satellite').forEach(sat => {
      sat.addEventListener('click', (e) => {
        e.preventDefault();
        warpTo(sat.getAttribute('href'));
      });
    });

    /* Listeners de drag — controlam rotação Y do sistema.
       A escolha por unificar mouse/touch num só pipeline
       evita branches duplicados. Pointer Events resolvem isso. */
    overlay.addEventListener('pointerdown', onDown);
    overlay.addEventListener('pointermove', onDrag);
    overlay.addEventListener('pointerup', onUp);
    overlay.addEventListener('pointercancel', onUp);

    document.body.appendChild(overlay);
    return overlay;
  }

  function open() {
    const o = ensureOverlay();
    /* Pausa o spin automático apenas durante drag.
       Aqui mantém ligado para cinematic feel. */
    document.body.style.overflow = 'hidden';
    /* Pequeno delay para garantir que o display:block
       seja aplicado antes da transição opacity. */
    o.style.display = 'block';
    requestAnimationFrame(() => o.classList.add('is-open'));
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    /* Aguarda o fade-out antes de tirar do fluxo */
    setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 1200);
  }

  function onDown(e) {
    /* Só inicia drag se o pointer não for um link clicável */
    if (e.target.closest('a, button')) return;
    dragging = true;
    startX = e.clientX;
    baseRot = currentRot;
    overlay.style.setProperty('--spin-state', 'paused');
  }

  function onDrag(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    /* Sensibilidade: 0.4° por px é confortável em desktop e
       ainda funcional em touch. */
    currentRot = baseRot + dx * 0.4;
    const system = overlay.querySelector('.constellation-system');
    /* Manipulamos o transform diretamente para responsividade
       sem reflow — operação puramente compositada. */
    system.style.transform = `translate(-50%, -50%) rotateX(8deg) rotateY(${currentRot}deg)`;
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    /* Retoma spin a partir do ângulo atual: criamos uma keyframe
       inline para que a animação continue de onde parou. */
    overlay.style.setProperty('--spin-state', 'running');
    /* Para simplicidade: apenas remove o style inline e o CSS
       retoma o spin de 0°. Em uma versão pro, sincronizaríamos
       o keyframe com o ângulo atual. */
    setTimeout(() => {
      const system = overlay.querySelector('.constellation-system');
      system.style.transform = '';
    }, 600);
  }

  /* Warp jump: flash branco (overlay novo) + scale e then
     navega. A página de destino aparece após o "raio". */
  function warpTo(href) {
    const flash = document.createElement('div');
    flash.className = 'warp-flash';
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add('is-firing'));

    /* Sons cinematográficos seriam ideais aqui, mas mantenho
       silencioso para não interromper o usuário. */

    setTimeout(() => { window.location.href = href; }, 280);
  }

  /* Fechamento por ESC — global porque o overlay pode estar
     aberto sem foco em nada específico. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close };
})();


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 5) MobileDock — doca inferior com 3 atalhos de seção      ║
   ║ Comportamento: fica visível em scroll-up, oculta em       ║
   ║ scroll-down (padrão Apple/iOS Safari).                    ║
   ╚═══════════════════════════════════════════════════════════╝ */

const MobileDock = (() => {
  let lastY = 0;
  let dock;

  function bind() {
    dock = document.querySelector('.dock');
    if (!dock) return;

    window.addEventListener('scroll', onScroll, { passive: true });

    dock.addEventListener('click', (e) => {
      const btn = e.target.closest('.dock-btn');
      if (!btn) return;
      const target = btn.dataset.target;
      const el = document.getElementById(target);
      if (el) {
        /* scrollIntoView com behavior:smooth dá o efeito
           cinematográfico de pan. Block:start alinha no topo
           respeitando o sticky topbar. */
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        /* Pulse de feedback */
        btn.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
          { duration: 380, easing: 'cubic-bezier(0.22, 1.55, 0.36, 1)' }
        );
        setActive(btn);
      }
    });
  }

  function setActive(btn) {
    dock.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
  }

  function onScroll() {
    const y = window.scrollY;
    /* Se subindo (ou no topo), mostra. Se descendo, oculta.
       A diferença de 8px evita "tremor" em scroll fino. */
    if (y < 80) {
      dock.classList.remove('is-hidden');
    } else if (y > lastY + 8) {
      dock.classList.add('is-hidden');
    } else if (y < lastY - 8) {
      dock.classList.remove('is-hidden');
    }
    lastY = y;
  }

  return { bind };
})();


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 6) Chrono — relógio do topbar (opcional, decorativo)      ║
   ║ Atualiza HH:MM com tabular-nums. Não tem timezone fancy   ║
   ║ — usa local do user, que é o esperado num hub interno.    ║
   ╚═══════════════════════════════════════════════════════════╝ */

const Chrono = (() => {
  function bind() {
    const el = document.querySelector('.topbar-clock');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      el.textContent = `${hh}:${mm}:${ss}`;
    };
    tick();
    setInterval(tick, 1000);
  }
  return { bind };
})();


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 7) Changelog — última atualização                         ║
   ║ Mantém a lógica do original (fallback estático + tentativa║
   ║ de carregar ultimo_log.js dinâmico via Git).             ║
   ╚═══════════════════════════════════════════════════════════╝ */

const Changelog = (() => {

  /* Mantenho a entrada mais recente conhecida do projeto como
     fallback. Se ultimo_log.js for carregado, ele sobrescreve. */
  const LATEST_FALLBACK = {
    title: 'Atelier cinematográfico apresentado',
    description: 'Lançada versão modernizada do hub com hero cinematográfico, bento evoluído, dock mobile magnético e câmara de constelação para os Laboratórios.',
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };

  function render() {
    const titleEl = document.getElementById('chTitle');
    const descEl = document.getElementById('chDesc');
    const dateEl = document.getElementById('chDate');
    const timeEl = document.getElementById('chTime');
    if (!titleEl) return;

    /* Tenta consumir LATEST_LOG do log dinâmico do Git.
       Se não existir, usa o fallback. */
    let entry = LATEST_FALLBACK;

    if (typeof window.LATEST_LOG !== 'undefined' && window.LATEST_LOG) {
      const l = window.LATEST_LOG;
      const d = new Date(l.dateIso);
      entry = {
        title: 'Sincronização Git mais recente',
        description: l.message,
        date: d.toLocaleDateString('pt-BR'),
        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    }

    titleEl.textContent = entry.title;
    descEl.textContent = entry.description;
    dateEl.textContent = entry.date;
    timeEl.textContent = entry.time;
  }

  function bind() {
    /* Tenta carregar ultimo_log.js (não bloqueante).
       Cache buster preserva o comportamento original. */
    const s = document.createElement('script');
    s.src = `ultimo_log.js?v=${Date.now()}`;
    s.onload = render;
    s.onerror = render;
    document.head.appendChild(s);

    /* Render imediato com fallback enquanto o script carrega */
    render();
  }

  return { bind };
})();


/* ╔═══════════════════════════════════════════════════════════╗
   ║ 8) Bootstrap                                              ║
   ╚═══════════════════════════════════════════════════════════╝ */

document.addEventListener('DOMContentLoaded', () => {
  Hub.render();
  MagneticCards.bind();
  MobileDock.bind();
  Chrono.bind();
  Changelog.bind();
  /* A constelação só é instanciada quando o usuário clica nos
     LABS — economiza memória até o momento de uso. */
});
