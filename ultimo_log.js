window.LATEST_LOG = { message: 'Ajusta card do Scraper Ar', dateIso: '2026-06-19T18:10:00-03:00' };

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.tool-name, .result-name span:first-child').forEach(function (el) {
    if (el.textContent.trim() === 'Scraper Oficial') el.textContent = 'Scraper Ar Condicionado';
  });
});
