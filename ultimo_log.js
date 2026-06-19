window.LATEST_LOG = { message: 'Ajusta card do Scraper Ar', dateIso: '2026-06-19T18:10:00-03:00' };

document.addEventListener('DOMContentLoaded', function () {
  var style = document.createElement('style');
  style.textContent = '.tool-card:hover .tool-short,.tool-card:focus-within .tool-short{opacity:0!important}.tool-card:hover .detail-pop,.tool-card:focus-within .detail-pop{background:transparent!important;box-shadow:none!important;border:0!important}';
  document.head.appendChild(style);

  document.querySelectorAll('.tool-name, .result-name span:first-child').forEach(function (el) {
    if (el.textContent.trim() === 'Scraper Oficial') el.textContent = 'Scraper Ar Condicionado';
  });

  var dropdown = document.getElementById('searchDropdown');
  if (dropdown) {
    new MutationObserver(function () {
      dropdown.querySelectorAll('.result-name span:first-child').forEach(function (el) {
        if (el.textContent.trim() === 'Scraper Oficial') el.textContent = 'Scraper Ar Condicionado';
      });
    }).observe(dropdown, { childList: true, subtree: true });
  }
});
