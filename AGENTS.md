# AGENTS.md — Regras permanentes do Hub de Ferramentas Dufrio

Este arquivo é o **manual principal do projeto** para qualquer agente de IA (Claude, Codex, Cursor, etc.) ou sessão de desenvolvimento que trabalhe neste repositório. Leia este documento antes de qualquer alteração.

---

## 🚨 Regra principal obrigatória — Última atualização do Hub

**Toda alteração no projeto exige atualização da área "Última atualização" exibida no `index.html`.**

Essa regra vale para qualquer tipo de alteração, sem exceção:
HTML, CSS, JavaScript, ajustes visuais, responsividade, textos, scrapers, documentação, `AGENTS.md`, `mensagem_atualizacao.txt`, ou qualquer outro arquivo do projeto.

**Nenhum commit deve ser feito sem atualizar essa área.**

### Como atualizar

1. Localize o objeto `updatesData` dentro do `<script>` do `index.html`.
2. Adicione uma **nova entrada no topo** do array `updates`.
3. **Nunca** apague o histórico anterior. **Nunca** substitua a última entrada antiga.
4. Sempre adicione a nova entrada **acima** das demais.
5. Use a **data real** da alteração no formato `DD/MM/AAAA`.
6. Use o **horário real** do commit no formato `HH:MM`.
7. Crie um `title` curto e claro.
8. Crie uma `description` objetiva explicando o que foi alterado.
9. A informação exibida no Hub precisa representar o último commit feito.

### Exemplo de entrada

```js
{
  date: "11/05/2026",
  time: "14:35",
  title: "Responsividade mobile do Hub",
  description: "Ajustes no layout mobile do index, mantendo o visual do Hub e a navegação das ferramentas."
}
```

### ⏰ Fuso horário (obrigatório)

Os campos `time` (no `updatesData`) e `dateIso` (em `ultimo_log.js`) usam **horário de Brasília — UTC-3**.

Antes de gerar qualquer timestamp, rodar:

```bash
TZ='America/Sao_Paulo' date "+%H:%M  %d/%m/%Y  %Y-%m-%dT%H:%M:%S-03:00"
```

Nunca usar `new Date()`, `date` sem `TZ`, ou tentar adivinhar o horário — em sandboxes/CI o servidor costuma estar em UTC e gera timestamps 3 horas adiantados.

### 📱 Meta viewport obrigatória (mobile)

**Toda página HTML do projeto precisa ter no `<head>`**:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Sem essa tag, o navegador mobile renderiza em modo desktop (~980px de viewport) e **nenhuma `@media (max-width: ...)` é ativada**. Qualquer responsividade aplicada no CSS fica invisível no celular. Ao alterar uma ferramenta interna, sempre conferir se ela tem essa meta tag — várias páginas antigas podem não ter.

### Três arquivos precisam ser atualizados em TODO commit

A área "Última atualização" do Hub lê de `ultimo_log.js` (`LATEST_LOG`) como prioridade — só cai pro `updatesData` se `LATEST_LOG` não existir. Por isso:

1. **`ultimo_log.js`** — atualizar `LATEST_LOG` com `message` (a mesma do commit) e `dateIso` (timestamp ISO real do commit, ex.: `2026-05-11T21:30:00-03:00`). Sem isso, o Hub continua mostrando a atualização antiga mesmo que `updatesData` esteja correto.
2. **`mensagem_atualizacao.txt`** — uma linha curta resumindo a alteração.
3. **`updatesData` dentro do `index.html`** — nova entrada no topo do array `updates`.

> ⚠️ Em ambiente Windows, o `Enviar_GitHub.bat` regenera o `ultimo_log.js` automaticamente. **Fora desse fluxo (Linux, CI, sandbox de IA), o arquivo precisa ser atualizado à mão.**

### ✅ Checklist obrigatório antes de comitar

- [ ] **`ultimo_log.js`** foi atualizado com `message` e `dateIso` reais do commit?
- [ ] O `index.html` foi atualizado no objeto `updatesData`?
- [ ] A nova entrada está no topo do array `updates`?
- [ ] A `date` está no formato `DD/MM/AAAA`?
- [ ] O `time` está no formato `HH:MM`?
- [ ] O `title` resume bem a alteração?
- [ ] A `description` explica objetivamente o que foi feito?
- [ ] O `mensagem_atualizacao.txt` foi atualizado?
- [ ] O commit corresponde ao que aparece na "Última atualização" do Hub?

**Se qualquer um dos três (`ultimo_log.js`, `updatesData`, `mensagem_atualizacao.txt`) não foi atualizado, a tarefa está incompleta.**

---

## 🚨 Regra principal obrigatória — Sincronizar com o GitHub antes de alterar

**Antes de qualquer edição, todo agente precisa reler o estado real do GitHub.**

Este projeto pode ser alterado por outra IA, outro computador ou outro navegador poucas horas antes. Por isso, nenhum agente deve trabalhar confiando apenas na cópia local antiga.

### Passos obrigatórios antes de editar

1. Rodar `git status -sb` para ver se há alterações locais.
2. Rodar `git fetch origin --prune` para buscar o estado mais recente do GitHub.
3. Conferir `git log --oneline --decorate --max-count=10 origin/main` para entender os últimos commits publicados.
4. Conferir se o branch local está atrás do `origin/main`.
5. Se estiver atrás, atualizar a base local antes de editar, usando `git pull --ff-only` quando possível ou rebase cuidadoso quando houver trabalho local.
6. Se houver alterações locais não commitadas, preservar essas alterações e entender se são do usuário antes de qualquer merge, rebase, stash ou commit.
7. Nunca sobrescrever, apagar ou reverter trabalho recente de outra IA ou do usuário sem pedido explícito.
8. Só começar a alteração depois de confirmar que a base local representa o estado mais recente do GitHub.

### Regra de segurança

Se aparecer commit remoto novo, branch nova relevante ou conflito entre trabalho local e remoto, pare e entenda antes de editar. O objetivo é sempre somar a nova mudança por cima do que já foi publicado, sem perder o que foi feito em outro PC ou por outra IA.

**Nenhum commit deve ser feito a partir de uma base local desatualizada.**

---

## 🚨 Regra principal obrigatória — Ler e manter o AGENTS.md com critério

**Toda IA precisa ler este `AGENTS.md` no início de cada acesso, sessão ou nova tarefa antes de mexer no projeto.**

O `AGENTS.md` é a memória operacional do repositório. Ele deve refletir apenas regras do Thiago, cuidados técnicos e aprendizados permanentes que evitem retrabalho ou perda de alterações.

### Passos obrigatórios em toda sessão

1. Ler o `AGENTS.md` antes de planejar ou editar.
2. Sincronizar com o GitHub seguindo a regra anterior.
3. Se a sincronização trouxer uma versão nova do `AGENTS.md`, reler o arquivo atualizado antes de continuar.
4. Usar este arquivo como fonte principal de regras do projeto.

### Quando atualizar este arquivo

Toda IA que trabalhar neste repositório deve atualizar o `AGENTS.md` **somente** quando descobrir algo pertinente, permanente e útil para futuras alterações, por exemplo:

- preferência clara do usuário;
- regra nova de operação;
- cuidado recorrente para não quebrar ferramenta;
- arquivo que não pode ser removido;
- fluxo correto de commit, deploy ou conferência;
- dependência entre arquivos;
- comportamento importante de scraper, extensão, Hub ou GitHub Pages;
- decisão técnica que futuras IAs precisam respeitar.

### O que não colocar aqui

Não atualizar o `AGENTS.md` por qualquer tarefa comum. Não transformar este arquivo em diário de execução. Não registrar detalhes temporários, hipóteses descartadas, logs longos, prints, testes pontuais ou observações que não ajudam futuras alterações.

**Regra prática:** se a informação ajuda outra IA a trabalhar do jeito que o Thiago quer daqui a semanas ou meses, ela deve entrar aqui. Se só explica o que foi feito agora, não entra.

---

## Projeto

- **Repositório:** https://github.com/crftwoo/thiago.luz.dufrio
- **Ferramenta publicada:** https://crftwoo.github.io/thiago.luz.dufrio/index.html

Este projeto é o **Hub de Ferramentas Dufrio**, uma aplicação web estática publicada via GitHub Pages, com recursos para vendas, orçamentos, análise de mercado, scrapers, precificação, câmara fria e apoio operacional.

---

## Mapa do projeto para agentes de IA

O `index.html` é a página principal e funciona como **porta de entrada** para todas as ferramentas.

### Estrutura geral

| Arquivo | Descrição |
|---|---|
| `AGENTS.md` | Manual principal com regras permanentes do projeto para qualquer agente de IA. |
| `.gitignore` | Lista sobras locais e metadados que não devem ser versionados. |
| `index.html` | Página principal do Hub: cards das ferramentas, seções principais, área de última atualização, telas centrais (Ferramentas Ocultas e Laboratório de Scrapers). |
| `simulador-gabinete.html` | Simulador 3D de Câmara Fria. |
| `plano-corte.html` | Otimizador de Corte de Painéis PIR/EPS. |
| `CheckList.html` | Checklist Câmaras Frias — Gerar PDF. |
| `scraper-ar.html` | Scraper Oficial. |
| `comparador-ar.html` | Comparador de Preços de Ar-Condicionado. |
| `precificacao-ar.html` | Precificação de SKUs — Site x 365. |
| `cotacoes.html` | Cotação Express — Infraestrutura. |
| `precos-ao-vivo.html` | Preços ao Vivo (usado com a extensão). |
| `itens-quantidade.html` | Extrator de Códigos. |
| `scraper-store-lab.js` | Script compartilhado dos laboratórios/scrapers por loja. |
| `scraper-*.html` | Páginas individuais dos scrapers/laboratórios por loja. |
| `img/` | Imagens, logos e recursos visuais. |
| `extensao/` | Arquivos da extensão usada junto com algumas ferramentas. |
| `mensagem_atualizacao.txt` | Resumo curto da última alteração (usado no fluxo de commit). |
| `ultimo_log.js` | Log lido pelo Hub para exibir a última atualização publicada. |
| `Enviar_GitHub.bat` | Script para enviar alterações ao GitHub. |
| `Atualizar_do_GitHub.bat` | Script para atualizar o projeto local a partir do GitHub. |
| `worker-novo.js` | Infraestrutura/proxy — **não remover**. |

### Telas centrais do index

- **Ferramentas Ocultas:** acessada por **clique triplo na logo da Dufrio**.
- **Laboratório de Scrapers:** abre como tela central dentro do `index.html` e lista os scrapers individuais.

Algumas ferramentas ficam visíveis no Hub e outras só dentro de Ferramentas Ocultas.

---

## Regra geral de alteração

1. Analise antes de alterar.
2. Entenda exatamente o escopo pedido.
3. Não altere nada fora do escopo.
4. Preserve funcionalidades existentes.
5. Preserve links, rotas, cálculos, scrapers, integrações e comportamento das ferramentas.
6. Preserve o estilo visual base do Hub, salvo pedido explícito.
7. Evite refatorações desnecessárias.
8. Não remova cards, telas, links ou ferramentas sem pedido explícito.
9. Faça mudanças pequenas, objetivas e seguras.

---

## Fluxo obrigatório antes de alterar

- Sincronize com o GitHub seguindo a regra principal acima.
- Leia os arquivos necessários.
- Identifique exatamente onde a mudança deve ser feita.
- Não mexa em arquivos não relacionados.
- Não refatore código sem necessidade.
- Não mude lógica se o pedido for apenas visual, textual ou responsivo.

## Fluxo obrigatório durante a alteração

- Faça mudanças pontuais.
- Mantenha mobile e desktop funcionando.
- Evite rolagem horizontal no mobile.
- Não quebre layout existente.
- Não remova funcionalidades existentes.
- Não altere links, rotas ou nomes de arquivos sem pedido explícito.
- Preserve scripts e integrações existentes.

## Fluxo obrigatório depois de alterar

- Revise os arquivos modificados.
- Confira se os links continuam funcionando.
- Confira se botões e navegação continuam funcionando.
- Confira se o layout mobile não quebrou.
- Confira se o desktop não piorou.
- Verifique se somente os arquivos necessários foram alterados.

---

## Como agentes de IA devem editar este projeto

1. Primeiro, ler o `AGENTS.md`.
2. Depois, identificar quais arquivos estão relacionados ao pedido do usuário.
3. Abrir e analisar os arquivos antes de editar.
4. Fazer somente a alteração solicitada.
5. Evitar refatorações amplas.
6. Não alterar nomes de arquivos, links ou rotas sem pedido explícito.
7. Não remover funcionalidades existentes.
8. Não quebrar compatibilidade mobile.
9. Manter o layout o mais próximo possível do `index.html`.
10. Quando a mudança for visual, ajustar preferencialmente por CSS e media queries.
11. Quando a mudança for textual, não mexer em lógica.
12. Quando a mudança envolver scrapers, ter cuidado para não quebrar seletores, links, filtros, proxies ou integrações.

---

## Como comitar e publicar alterações

1. Após alterar os arquivos, revisar o diff.
2. Confirmar que só arquivos necessários foram modificados.
3. Atualizar o `index.html` no objeto `updatesData` (regra principal acima).
4. Atualizar `mensagem_atualizacao.txt` com uma frase curta resumindo a alteração.
5. Fazer commit com mensagem clara.
6. Usar preferencialmente o script `Enviar_GitHub.bat` para seguir o fluxo do projeto.
7. Depois do push, conferir a ferramenta publicada no GitHub Pages.
8. Sempre enviar ao usuário o link clicável da ferramenta publicada.

### Branch protection / push direto no main

O push direto no `main` retorna **HTTP 403** por causa de branch protection. Fluxo correto:

1. Criar branch separada (`codex/<descrição>`).
2. Fazer as alterações.
3. Commitar e push na branch.
4. Abrir Pull Request com base `main`.
5. Mergear o PR via API com `merge_method=squash`.

Em ferramentas MCP/GitHub:
- Criar PR com `mcp__github__create_pull_request`.
- Fazer merge com `mcp__github__merge_pull_request` e `merge_method=squash`.

### Fluxo prático que funcionou no Codex

Quando o agente não conseguir publicar direto no `main`, usar este fluxo exatamente:

1. Garantir base atualizada:
   ```bash
   git fetch origin --prune
   git switch main
   git pull --ff-only
   git status -sb
   ```
2. Criar branch de trabalho:
   ```bash
   git switch -c codex/nome-curto-da-tarefa
   ```
3. Stagear somente os arquivos do escopo:
   ```bash
   git add caminho/do/arquivo outro/arquivo
   ```
4. Commitar:
   ```bash
   git commit -m "Mensagem clara da alteração"
   ```
5. Enviar a branch:
   ```bash
   git push -u origin codex/nome-curto-da-tarefa
   ```
6. Abrir Pull Request para `main` usando a ferramenta GitHub disponível.
7. Fazer merge do PR com `merge_method=squash`.
8. Voltar o local para `main` e atualizar:
   ```bash
   git fetch origin --prune
   git switch main
   git pull --ff-only
   git status -sb
   ```

No Codex, o caminho que funcionou foi:

- criar branch local `codex/mini-hub-extensao`;
- `git add` apenas dos arquivos alterados;
- `git commit -m "Integra extensão ao Hub com Mini Hub e Busca Ar"`;
- `git push -u origin codex/mini-hub-extensao`;
- criar PR com a ferramenta GitHub `create_pull_request`;
- mergear com a ferramenta GitHub `merge_pull_request`, usando `merge_method: "squash"`;
- depois rodar `git switch main` e `git pull --ff-only`.

Se o GitHub CLI (`gh`) não estiver instalado, não insistir nele. Usar o conector/ferramenta GitHub disponível para criar e mergear o PR. Nunca tentar resolver branch protection com `--force`, token improvisado, reset, checkout destrutivo ou push direto no `main`.

### Exemplos de mensagens de commit

- Ajusta responsividade mobile do Hub principal
- Melhora layout mobile do Scraper Oficial
- Corrige textos e organização dos cards do Hub
- Ajusta visual mobile da Cotação Express
- Atualiza regras permanentes do projeto

---

## Conferência da ferramenta publicada

Depois do commit/merge, conferir se a alteração refletiu no GitHub Pages.

**Link principal (sempre enviar):**
https://crftwoo.github.io/thiago.luz.dufrio/index.html

Se a alteração foi em página interna, **enviar também** o link direto. Páginas comuns:

- https://crftwoo.github.io/thiago.luz.dufrio/scraper-ar.html
- https://crftwoo.github.io/thiago.luz.dufrio/comparador-ar.html
- https://crftwoo.github.io/thiago.luz.dufrio/precificacao-ar.html
- https://crftwoo.github.io/thiago.luz.dufrio/cotacoes.html
- https://crftwoo.github.io/thiago.luz.dufrio/simulador-gabinete.html
- https://crftwoo.github.io/thiago.luz.dufrio/plano-corte.html
- https://crftwoo.github.io/thiago.luz.dufrio/CheckList.html
- https://crftwoo.github.io/thiago.luz.dufrio/itens-quantidade.html
- https://crftwoo.github.io/thiago.luz.dufrio/precos-ao-vivo.html

---

## Modelo obrigatório de resposta final ao usuário

Ao terminar qualquer tarefa, responder neste formato:

**Resumo:**
- descrever brevemente o que foi alterado.

**Arquivos modificados:**
- listar os arquivos alterados.

**Commit:**
- informar a mensagem do commit.
- confirmar se o commit foi feito.

**Publicação:**
- confirmar se a ferramenta publicada foi conferida.
- enviar o link principal: https://crftwoo.github.io/thiago.luz.dufrio/index.html

**Link direto:**
- se a alteração foi em página interna, enviar o link direto da página alterada.

**Observações:**
- informar qualquer coisa que não pôde ser conferida ou qualquer cuidado importante.

---

## Regra de autonomia para agentes de IA

Quando o usuário pedir uma alteração clara, **executar a tarefa sem ficar pedindo confirmações desnecessárias**.

Só fazer pergunta se:
- o pedido estiver ambíguo;
- houver risco de apagar ou quebrar algo importante;
- existirem duas decisões de produto claramente diferentes;
- a alteração puder afetar funcionamento, dados, links, scrapers ou rotas.

Para ajustes simples de layout, responsividade, texto ou padronização visual:
seguir o `AGENTS.md`, aplicar a melhor solução e entregar com commit.

---

## Cuidados específicos deste projeto

- O `index.html` é a porta de entrada do Hub.
- O Hub usa layout escuro, cards glass/bento, efeito aurora e visual moderno.
- Preservar o estilo visual existente.
- Preservar as telas centrais do `index.html` (Ferramentas Ocultas e Laboratório de Scrapers).
- Preservar o **clique triplo na logo da Dufrio** para abrir Ferramentas Ocultas.
- Preservar links dos cards.
- Preservar os scrapers.
- Preservar os cálculos das ferramentas.
- Preservar o botão "Voltar ao Hub" nas páginas internas.
- Preservar a área de "Última atualização" e o rodapé, salvo pedido explícito.
- Na Busca Ar da extensão e no Scraper Oficial, os seletores de Tipo, BTUs e Ciclo devem aparecer imediatamente com opções padrão enquanto a planilha sincroniza em segundo plano. Não voltar para tela vazia de carregamento antes desses botões.

---

## Cuidados específicos da extensão

- A extensão fica em `extensao/` e deve continuar integrada ao Hub sem expor ferramentas ocultas.
- O popup da extensão tem duas entradas principais: **Mini Hub** e **Busca Ar**.
- A **Busca Ar** precisa continuar preservada: carregamento da planilha, seleção de Tipo, BTUs, Ciclo, botões das lojas, filtros, erros e limpeza de filtros.
- Links abertos pelo popup da extensão devem usar `chrome.tabs.create({ url, active: false })` para abrir em nova aba em segundo plano, sem substituir a aba atual.
- O **Mini Hub** da extensão deve mostrar somente ferramentas principais permitidas. Não incluir Ferramentas Ocultas, Laboratório de Scrapers, scrapers individuais, Preços ao Vivo, Extrator de Códigos, Cotação Express ou download da extensão.
- O painel lateral injetado no site da Dufrio depende de `extensao/content.js`. Para ajustes visuais, preferir alterar apenas `extensao/content.css` e preservar captura de produtos, Copiar Lista, clique no texto, clique na imagem, storage e comunicação com o Hub.
- O download da extensão no menu oculto do Hub deve baixar apenas o pacote da pasta `extensao/`, com `manifest.json` diretamente na raiz ao descompactar.

---

## Prioridade visual do projeto

Sempre que fizer ajustes visuais, responsivos ou de layout, **priorizar que todas as páginas fiquem o mais parecidas possível com o `index.html`**.

O `index.html` é a referência visual principal do projeto. Ao alterar qualquer ferramenta interna, manter coerência com o index em:

- fundo escuro (`#050505`);
- efeito aurora (3 manchas animadas: azul `#3b82f6`, roxa `#8b5cf6`, verde-esmeralda `#10b981`);
- cards em estilo glass/bento;
- bordas arredondadas;
- tipografia (`Outfit` / `Inter`);
- espaçamentos;
- botões;
- títulos e subtítulos;
- botão "Voltar ao Hub";
- comportamento mobile;
- hierarquia visual;
- sensação geral de produto único.

Evitar que cada página pareça um sistema diferente. Quando houver dúvida de layout, usar o `index.html` como padrão visual.

---

## Arquivos que NÃO devem ser excluídos

Nunca excluir sem autorização explícita:

- `worker-novo.js`
- `mensagem_atualizacao.txt`
- `Enviar_GitHub.bat`
- `Atualizar_do_GitHub.bat`

---

## Responsividade

### Mobile

- Evitar rolagem horizontal.
- Manter cards legíveis.
- Garantir boa área de toque.
- Manter botão X visível em telas centrais.
- Garantir rolagem interna em modais/painéis.
- Evitar textos cortados.
- Evitar elementos estourando a largura da tela.
- Preservar a experiência de toque (evitar hovers exagerados).

### Desktop

- Não piorar o layout existente.
- Manter grid, espaçamentos e hierarquia visual.
- Preservar hover e estética atual, salvo pedido explícito.

---

## Regra final

Se houver dúvida entre fazer uma alteração grande ou preservar o comportamento atual, **preserve o comportamento atual**.

Faça somente o que foi pedido.

---

*Documento consolidado a partir do `.antigravity_skills.md` original (criado em 28/04/2026). Regras expandidas e centralizadas neste AGENTS.md para reconhecimento por agentes de IA modernos.*
