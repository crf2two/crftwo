/**
 * Dufrio Hub Analytics & Tracking
 * Envia estatísticas de acesso em tempo real diretamente para o Telegram do administrador
 */

(function() {
  const TELEGRAM_TOKEN = "8983137347:AAFPrxMfykEtpCX8BnMSRxZYkvwHCKLnMXU";
  const TELEGRAM_CHAT_ID = "8950784542";
  
  const visitorId = getVisitorId();
  const pageTitle = document.title || "Sem Título";
  const pagePath = window.location.pathname.split('/').pop() || "index.html";
  const entryTime = new Date();
  
  let telegramMessageId = null;
  let updateInterval = null;
  let isFinalized = false;
  let geoData = { ip: "Carregando...", city: "Carregando...", region: "", country: "", org: "" };

  // Inicializa o rastreamento
  init();

  async function init() {
    try {
      // Captura dados geográficos
      geoData = await getGeoIP();
      
      // Envia a notificação inicial de entrada
      await sendTelegramNotification("entrada");
      
      // Atualiza a cada 30 segundos o tempo de permanência editando a mensagem anterior
      updateInterval = setInterval(async () => {
        if (!isFinalized) {
          await sendTelegramNotification("atualizacao");
        }
      }, 30000);

      // Registra os eventos de saída
      window.addEventListener("beforeunload", finalizeSession);
      window.addEventListener("pagehide", finalizeSession);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          finalizeSession();
        }
      });
    } catch (e) {
      console.error("Erro no rastreamento de analytics:", e);
    }
  }

  // Gera ou recupera o ID de visitante único persistente
  function getVisitorId() {
    let id = localStorage.getItem("dufrio_visitor_id");
    if (!id) {
      id = "Visitante #" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("dufrio_visitor_id", id);
    }
    return id;
  }

  // Detecta o sistema operacional e navegador do visitante
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = "Outro";
    let browser = "Outro";

    if (ua.indexOf("Windows") !== -1) os = "Windows";
    else if (ua.indexOf("Macintosh") !== -1) os = "macOS";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) os = "iOS";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";

    if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Chromium") === -1 && ua.indexOf("Edg") === -1) browser = "Chrome";
    else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edg") !== -1) browser = "Edge";
    
    return `${os} / ${browser}`;
  }

  // Busca o IP e geolocalização do usuário de forma redundante
  async function getGeoIP() {
    const apis = [
      "https://ipapi.co/json/",
      "https://ip-api.com/json/",
      "https://api.ipify.org?format=json"
    ];
    
    for (let api of apis) {
      try {
        const response = await fetch(api);
        if (response.ok) {
          const data = await response.json();
          // ipapi.co
          if (data.country_name) {
            return {
              ip: data.ip || "Desconhecido",
              city: data.city || "Desconhecido",
              region: data.region || "",
              country: data.country_name || "",
              org: data.org || ""
            };
          }
          // ip-api.com
          if (data.status === "success") {
            return {
              ip: data.query || "Desconhecido",
              city: data.city || "Desconhecido",
              region: data.regionName || "",
              country: data.country || "",
              org: data.isp || ""
            };
          }
          // ipify (apenas IP)
          if (data.ip) {
            return { ip: data.ip, city: "Desconhecida", region: "", country: "", org: "" };
          }
        }
      } catch (e) {
        console.warn(`Falha ao obter IP da API ${api}:`, e);
      }
    }
    return { ip: "Desconhecido", city: "Desconhecida", region: "", country: "", org: "" };
  }

  // Calcula a duração formatada
  function getDurationString() {
    const diffMs = new Date() - entryTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    
    if (mins === 0) {
      return `${secs} seg`;
    }
    return `${mins} min e ${secs} seg`;
  }

  // Monta a mensagem e envia para o Telegram
  async function sendTelegramNotification(type) {
    const duration = getDurationString();
    let statusText = "";
    
    if (type === "entrada") {
      statusText = "🟢 *Ativo* (acabou de entrar)";
    } else if (type === "atualizacao") {
      statusText = `🟢 *Ativo* (há ${duration})`;
    } else if (type === "saida") {
      statusText = `🔴 *Saiu* (tempo total: ${duration})`;
    }

    const localTimeStr = entryTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const localDateStr = entryTime.toLocaleDateString("pt-BR");

    let locationStr = `${geoData.city}`;
    if (geoData.region) locationStr += `, ${geoData.region}`;
    if (geoData.country) locationStr += ` - ${geoData.country}`;
    if (geoData.org) locationStr += ` (${geoData.org})`;

    const text = `🚪 *Acesso ao Hub Dufrio*\n\n` +
                 `👤 *Visitante:* \`${visitorId}\`\n` +
                 `📍 *De onde:* ${locationStr}\n` +
                 `🌐 *IP:* \`${geoData.ip}\`\n` +
                 `🛠️ *Ferramenta:* ${pageTitle} (\`${pagePath}\`)\n` +
                 `📱 *Aparelho:* ${getDeviceInfo()}\n` +
                 `📅 *Data/Hora:* ${localDateStr} às ${localTimeStr}\n\n` +
                 `⏱️ *Status:* ${statusText}`;

    const url = telegramMessageId 
      ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`
      : `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    const body = {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: "Markdown"
    };

    if (telegramMessageId) {
      body.message_id = telegramMessageId;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: type === "saida" // Garante o envio mesmo se a página fechar
      });

      if (response.ok) {
        const result = await response.json();
        if (!telegramMessageId && result.result && result.result.message_id) {
          telegramMessageId = result.result.message_id;
        }
      }
    } catch (e) {
      console.error("Erro ao enviar mensagem para o Telegram:", e);
    }
  }

  // Finaliza a sessão limpando loops e enviando o status de saída
  function finalizeSession() {
    if (isFinalized) return;
    isFinalized = true;
    
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    sendTelegramNotification("saida");
  }
})();
