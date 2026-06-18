// =============================================================================
// Cloudflare Worker — frigelar-proxy (versão atualizada)
// =============================================================================
// COMO USAR:
// 1. Acesse https://dash.cloudflare.com → Workers & Pages → frigelar-proxy
// 2. Clique em "Edit Code"
// 3. APAGUE todo o código antigo e COLE este aqui
// 4. Clique em "Save and Deploy" no topo direito
// 5. Pronto. Demora ~10 segundos pra propagar.
//
// O QUE MUDOU:
// - Continua aceitando ?url=... como antes (Frigelar segue funcionando igual).
// - AGORA também falsifica os headers Origin e Referer pro host do target.
//   Isso destrava a API GraphQL "dataProduct" da WebContinental que devolve
//   o preço PIX (spotPrice). Sem isso a VTEX bloqueia com:
//   "Requests from another host cannot perform this action".
// - Suporta GET, POST e OPTIONS (preflight CORS) corretamente.
// - Headers identificadores do Cloudflare são removidos pra parecer request
//   legítimo do navegador.
// =============================================================================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// CORS aberto pra qualquer origem, incluindo crf-two.github.io e file://

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

async function handleRequest(request) {
  // Preflight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const incomingUrl = new URL(request.url);
  const target = incomingUrl.searchParams.get('url');

  if (!target) {
    return new Response(
      'Missing ?url= parameter.\n\nExample: https://frigelar-proxy.crftwo.workers.dev/?url=https%3A%2F%2Fwww.frigelar.com.br%2F...',
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' } }
    );
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch (e) {
    return new Response('Invalid url parameter: ' + e.message, {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' }
    });
  }

  // Monta headers do request, falsificando Origin e Referer pro host do target.
  // Isso é o que destrava chamadas a APIs internas da VTEX (dataProduct, etc).
  const fwdHeaders = new Headers();

  // Copia só os headers do client que fazem sentido repassar
  for (const [k, v] of request.headers.entries()) {
    const lk = k.toLowerCase();
    if (
      lk === 'host' ||
      lk === 'origin' ||
      lk === 'referer' ||
      lk.startsWith('cf-') ||
      lk === 'x-forwarded-for' ||
      lk === 'x-forwarded-proto' ||
      lk === 'x-real-ip'
    ) continue;
    fwdHeaders.set(k, v);
  }

  // Spoof Origin/Referer = host do target
  fwdHeaders.set('Origin', targetUrl.origin);
  fwdHeaders.set('Referer', targetUrl.origin + '/');

  // User-Agent padrão de navegador (algumas APIs rejeitam UAs desconhecidos)
  if (!fwdHeaders.has('User-Agent')) {
    fwdHeaders.set(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
  }

  // Monta init do fetch
  const init = {
    method: request.method,
    headers: fwdHeaders,
    redirect: 'follow'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl.toString(), init);
  } catch (e) {
    return new Response('Upstream fetch failed: ' + e.message, {
      status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' }
    });
  }

  // Monta resposta com CORS aberto
  const respHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    const lk = k.toLowerCase();
    // remove headers que confundem o browser ou que o Worker já decodificou
    if (
      lk === 'content-encoding' ||
      lk === 'content-length' ||
      lk === 'transfer-encoding' ||
      lk === 'connection' ||
      lk.startsWith('access-control-')
    ) continue;
    respHeaders.set(k, v);
  }
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    respHeaders.set(k, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders
  });
}
