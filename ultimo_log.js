window.LATEST_LOG = { message: 'Perfil automatico e ambiente 35 no seletor', dateIso: '2026-06-24T20:24:00-03:00' };

(function iniciarWorkbench() {
  var tools = [
    { code:'01', name:'Scraper Ar Condicionado', desc:'Busca geral e comparação rápida de ar-condicionado.', cat:'Ar-condicionado', url:'scraper-ar.html', level:'primary-main', terms:'scraper oficial ar condicionado preços lojas mercado' },
    { code:'02', name:'Simulador 3D', desc:'Gabinete e apoio técnico para câmara fria.', cat:'Câmara fria', url:'simulador-gabinete.html', level:'primary', terms:'simulador 3d gabinete câmara fria painel' },
    { code:'03', name:'Plano de corte', desc:'Aproveitamento de painéis PIR/EPS.', cat:'Câmara fria', url:'plano-corte.html', level:'primary', terms:'plano corte painel pir eps câmara fria' },
    { code:'04', name:'Comparador de preços', desc:'Análise de ofertas entre lojas e referências de mercado.', cat:'Ar-condicionado', url:'comparador-ar.html', level:'support', terms:'comparador comparação preços ofertas ar condicionado' },
    { code:'05', name:'Checklist em PDF', desc:'Levantamento técnico padronizado.', cat:'Câmara fria', url:'CheckList.html', level:'support', terms:'checklist check list pdf orçamento câmara fria' },
    { code:'06', name:'Precificação', desc:'Cálculo Site x 365 por SKU.', cat:'Site x 365', url:'precificacao-ar.html', level:'support', terms:'precificação sku 365 site dynamics' },
    { code:'07', name:'Seletor UC x Evaporador', desc:'Dimensiona evaporador Trineva por UC, temperatura e perfil.', cat:'Câmara fria', url:'seletor-evaporador.html', level:'support', terms:'seletor uc evaporador danfoss trineva câmara fria trn ftbn perfil dimensionar' }
  ];

  var hidden = [
    { code:'I1', name:'Extrator de Códigos', desc:'Extrai códigos e quantidades em estoque.', url:'itens-quantidade.html' },
    { code:'I2', name:'Preços ao Vivo', desc:'Ofertas capturadas pela extensão.', url:'precos-ao-vivo.html' },
    { code:'I3', name:'Cotação Express', desc:'Orçamentos rápidos de infraestrutura.', url:'cotacoes.html' },
    { code:'I4', name:'Baixar Extensão', desc:'Pacote para Chrome ou Edge.', url:'baixar-extensao.html' }
  ];

  var scrapers = [
    ['Dufrio','scraper-dufrio.html'], ['Clima Rio','scraper-climario.html'], ['Frigelar','scraper-frigelar.html'], ['Leveros','scraper-leveros.html'], ['Central Ar','scraper-centralar.html'], ['FrioPeças','scraper-friopecas.html'], ['Polo Ar','scraper-poloar.html'], ['WebContinental','scraper-webcontinental.html']
  ];

  function norm(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function workCard(item, cls) { return '<a class="work-card ' + cls + '" href="' + item.url + '"><div class="card-top"><span class="mono">' + item.code + ' · ' + item.cat + '</span><small class="mono">uso alto</small></div><div class="card-body"><h3>' + item.name + '</h3><p>' + item.desc + '</p></div><div class="card-foot"><span>' + (item.level === 'primary-main' ? 'Principal da mesa' : 'Atalho prioritário') + '</span><strong>Abrir</strong></div></a>'; }
  function supportCard(item) { return '<a class="work-card support" href="' + item.url + '"><div class="card-top"><span class="mono">' + item.code + ' · ' + item.cat + '</span><small class="mono">apoio</small></div><div class="card-body"><h3>' + item.name + '</h3><p>' + item.desc + '</p></div><div class="card-foot"><span>Uso médio</span><strong>Abrir</strong></div></a>'; }
  function fixedLink(item) { return '<a class="fixed-link" href="' + item.url + '"><span class="code mono">' + item.code + '</span><strong>' + item.name + '</strong><span>' + item.desc + '</span></a>'; }
  function hiddenLink(item) { return '<a class="hidden-link" href="' + item.url + '"><span class="code mono">' + item.code + '</span><strong>' + item.name + '</strong><span>' + item.desc + '</span></a>'; }

  function renderTools() {
    var primaryMain = document.getElementById('primaryMain');
    if (!primaryMain) return;
    document.getElementById('primaryMain').innerHTML = tools.filter(function (t) { return t.level === 'primary-main'; }).map(function (i) { return workCard(i, 'major'); }).join('');
    document.getElementById('primaryStack').innerHTML = tools.filter(function (t) { return t.level === 'primary'; }).map(function (i) { return workCard(i, 'tall'); }).join('');
    document.getElementById('supportGrid').innerHTML = tools.filter(function (t) { return t.level === 'support'; }).map(supportCard).join('');
    document.getElementById('fixedList').innerHTML = tools.filter(function (t) { return ['primary-main','primary'].indexOf(t.level) >= 0; }).map(fixedLink).join('');
    document.getElementById('hiddenGrid').innerHTML = hidden.map(hiddenLink).join('');
    document.getElementById('scraperGrid').innerHTML = scrapers.map(function (item, index) { return '<a class="scraper-link" href="' + item[1] + '"><strong>Scraper ' + item[0] + '</strong><span class="mono">S' + String(index + 1).padStart(2, '0') + '</span></a>'; }).join('');
  }

  function renderLastUpdate() {
    var dateEl = document.getElementById('updateDatetime');
    var titleEl = document.getElementById('updateTitle');
    if (!dateEl || !titleEl) return;
    var latest = (window.updatesData && window.updatesData.updates && window.updatesData.updates[0]) || { date:'24/06/2026', time:'20:24', title:'Perfil automatico e ambiente 35 no seletor' };
    var title = latest.title;
    var datetime = latest.date + ' às ' + latest.time;
    if (window.LATEST_LOG && window.LATEST_LOG.message && window.LATEST_LOG.dateIso) {
      var parsed = new Date(window.LATEST_LOG.dateIso);
      if (!Number.isNaN(parsed.getTime())) {
        datetime = parsed.toLocaleDateString('pt-BR', { timeZone:'America/Sao_Paulo' }) + ' às ' + parsed.toLocaleTimeString('pt-BR', { timeZone:'America/Sao_Paulo', hour:'2-digit', minute:'2-digit' });
        title = window.LATEST_LOG.message;
      }
    }
    dateEl.textContent = datetime;
    titleEl.textContent = title;
  }

  function setupSearch() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('results');
    if (!input || !results) return;
    var all = tools.concat(scrapers.map(function (item, index) { return { code:'S' + String(index + 1).padStart(2, '0'), name:'Scraper ' + item[0], desc:'Scraper individual da loja.', cat:'Scraper', url:item[1], terms:item[0] }; })).map(function (item) { item.search = norm(item.code + ' ' + item.name + ' ' + item.desc + ' ' + item.cat + ' ' + item.terms); return item; });
    var matches = [];
    var active = -1;
    function close() { results.classList.remove('open'); active = -1; }
    function mark() { Array.prototype.forEach.call(results.querySelectorAll('.result'), function (el, i) { el.classList.toggle('active', i === active); }); }
    function go(item) { if (item && item.url) window.location.href = item.url; }
    function draw() {
      var q = norm(input.value.trim());
      results.innerHTML = '';
      if (!q) return close();
      matches = all.filter(function (item) { return item.search.indexOf(q) >= 0; }).slice(0, 8);
      results.classList.add('open');
      if (!matches.length) { results.innerHTML = '<div class="result"><strong>Nada encontrado</strong><span>Tente loja, ferramenta ou categoria.</span></div>'; return; }
      matches.forEach(function (item, index) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'result';
        btn.innerHTML = '<strong>' + item.name + '</strong><small>' + item.code + '</small><span>' + item.desc + '</span>';
        btn.addEventListener('mouseenter', function () { active = index; mark(); });
        btn.addEventListener('click', function () { go(item); });
        results.appendChild(btn);
      });
    }
    input.addEventListener('input', draw);
    input.addEventListener('focus', draw);
    input.addEventListener('keydown', function (e) {
      if (!results.classList.contains('open')) return;
      if (e.key === 'Escape') return close();
      if (!matches.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % matches.length; mark(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + matches.length) % matches.length; mark(); }
      if (e.key === 'Enter') { e.preventDefault(); go(matches[Math.max(active, 0)]); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) close(); });
  }

  function setupPanels() {
    var hiddenModal = document.getElementById('hiddenModal');
    var quickModal = document.getElementById('quickModal');
    if (!hiddenModal || !quickModal) return;
    function openHidden() { hiddenModal.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function openQuick() { document.getElementById('quickFrame').src = 'scraper-dufrio.html'; quickModal.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeModal() { hiddenModal.classList.remove('open'); quickModal.classList.remove('open'); document.body.style.overflow = ''; }
    document.getElementById('quickOpenA').addEventListener('click', openQuick);
    Array.prototype.forEach.call(document.querySelectorAll('[data-close]'), function (btn) { btn.addEventListener('click', closeModal); });
    Array.prototype.forEach.call(document.querySelectorAll('.modal'), function (modal) { modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    var clicks = [];
    document.getElementById('thiagoMark').addEventListener('click', function () {
      var now = Date.now();
      clicks = clicks.filter(function (t) { return now - t < 1800; });
      clicks.push(now);
      if (clicks.length >= 3) { clicks = []; openHidden(); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderTools();
    renderLastUpdate();
    setupSearch();
    setupPanels();
  });
})();
