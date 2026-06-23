window.LATEST_LOG = { message: 'Adiciona Seletor UC x Evaporador', dateIso: '2026-06-23T19:36:47-03:00' };

(function organizarScrapersIndividuais() {
  var labs = [
    { nome: 'Scraper Dufrio', short: 'Busca direta na Dufrio.', arquivo: 'scraper-dufrio.html', color: '#38bdf8', loja: 'Dufrio' },
    { nome: 'Scraper Clima Rio', short: 'Busca direta na Clima Rio.', arquivo: 'scraper-climario.html', color: '#f59e0b', loja: 'Clima Rio' },
    { nome: 'Scraper Frigelar', short: 'Busca direta na Frigelar.', arquivo: 'scraper-frigelar.html', color: '#22c55e', loja: 'Frigelar' },
    { nome: 'Scraper Leveros', short: 'Busca direta na Leveros.', arquivo: 'scraper-leveros.html', color: '#fb923c', loja: 'Leveros' },
    { nome: 'Scraper Central Ar', short: 'Busca direta na Central Ar.', arquivo: 'scraper-centralar.html', color: '#ec4899', loja: 'Central Ar' },
    { nome: 'Scraper FrioPeças', short: 'Busca direta na FrioPeças.', arquivo: 'scraper-friopecas.html', color: '#60a5fa', loja: 'FrioPeças' },
    { nome: 'Scraper Polo Ar', short: 'Busca direta na Polo Ar.', arquivo: 'scraper-poloar.html', color: '#ef4444', loja: 'Polo Ar' },
    { nome: 'Scraper WebContinental', short: 'Busca direta na WebContinental.', arquivo: 'scraper-webcontinental.html', color: '#14b8a6', loja: 'WebContinental' }
  ];

  function svg() {
    return '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><polyline points="8 11 10 13 14 9"></polyline></svg>';
  }

  function card(item) {
    return '<a class="tool-card lab-card" href="' + item.arquivo + '" style="--card-color:' + item.color + '">' +
      '<div class="tool-top"><div class="icon-box">' + svg() + '</div><span class="tool-kind">' + item.loja + '</span></div>' +
      '<div class="tool-body"><div class="tool-name">' + item.nome + '</div><p class="tool-short">' + item.short + '</p><span class="tool-action">Abrir</span></div>' +
    '</a>';
  }

  function abrirPainel() {
    var panel = document.getElementById('scraperLabsOverlay');
    if (!panel) return;
    panel.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function fecharPainel() {
    var panel = document.getElementById('scraperLabsOverlay');
    if (!panel) return;
    panel.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function montar() {
    if (document.getElementById('scrapersIndividuaisSection')) return;

    var labsTitle = document.getElementById('labsTitle');
    var oldSection = labsTitle && labsTitle.closest ? labsTitle.closest('.section') : null;
    if (oldSection) oldSection.style.display = 'none';

    var camaraTitle = document.getElementById('camaraTitle');
    var camaraSection = camaraTitle && camaraTitle.closest ? camaraTitle.closest('.section') : null;
    var section = document.createElement('section');
    section.className = 'section';
    section.id = 'scrapersIndividuaisSection';
    section.innerHTML = '<div class="section-head"><h2 class="section-title">Scrapers individuais</h2><span class="section-count">8 lojas</span></div>' +
      '<div class="tool-grid scrapers-entry-grid"><button type="button" class="tool-card scrapers-entry-card" style="--card-color:#38bdf8">' +
      '<div class="tool-top"><div class="icon-box">' + svg() + '</div><span class="tool-kind">Laboratório</span></div>' +
      '<div class="tool-body"><div class="tool-name">Abrir scrapers individuais</div><p class="tool-short">Dufrio, Clima Rio, Frigelar, Leveros, Central Ar, FrioPeças, Polo Ar e WebContinental.</p><span class="tool-action">Ver todos</span></div>' +
      '</button></div>';

    if (oldSection && oldSection.parentNode) oldSection.parentNode.insertBefore(section, oldSection);
    else if (camaraSection && camaraSection.parentNode) camaraSection.parentNode.insertAdjacentElement('afterend', section);

    var overlay = document.createElement('div');
    overlay.id = 'scraperLabsOverlay';
    overlay.className = 'overlay';
    overlay.innerHTML = '<div class="panel-modal"><div class="modal-head"><div><div class="modal-title">Scrapers individuais</div><div class="modal-desc">Escolha uma loja para abrir o scraper individual.</div></div><button class="close-btn" type="button" data-close-scrapers>&times;</button></div><div class="hidden-grid scrapers-modal-grid">' + labs.map(card).join('') + '</div></div>';
    document.body.appendChild(overlay);

    var btn = section.querySelector('.scrapers-entry-card');
    if (btn) btn.addEventListener('click', abrirPainel);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay || event.target.closest('[data-close-scrapers]')) fecharPainel();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') fecharPainel();
    });
  }

  var style = document.createElement('style');
  style.textContent = '.scrapers-entry-grid{grid-template-columns:minmax(0,536px);grid-auto-rows:260px}.scrapers-entry-card{width:100%;text-align:left}.scrapers-modal-grid .tool-card{min-height:190px}@media(max-width:680px){.scrapers-entry-grid{grid-template-columns:1fr;grid-auto-rows:auto}.scrapers-entry-card{min-height:220px}.scrapers-modal-grid .tool-card{min-height:190px}}';
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
