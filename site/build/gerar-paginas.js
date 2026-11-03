#!/usr/bin/env node
// Gera as páginas do site a partir dos documentos .md do repositório.
//
//   compromissos/NN-slug.md  ->  public/compromissos/slug.html  (servido em /compromissos/slug)
//   guias/arquivo.md         ->  public/guias/slug.html         (servido em /guias/slug)
//
// Também gera public/assets/paginas.css (estilos reaproveitados do index.html)
// e public/sitemap.xml. Uso: node build/gerar-paginas.js
"use strict";
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const RAIZ = path.resolve(__dirname, "../..");
const PUBLIC = path.resolve(__dirname, "../public");
const DOMINIO = "https://aliancaiaconsciente.com.br";
const REPO = "https://github.com/marcosmhs/alianca-ia-consciente";
const HOJE = new Date().toISOString().slice(0, 10);
const PUBLICADO = "2026-11-02";

// ---------- Páginas ----------
const COMPROMISSOS = [
  { arq: "01-uso-consciente.md", slug: "uso-consciente", grupo: "base",
    titulo: "Uso consciente de IA: onde ela ajuda e onde atrapalha",
    descricao: "Como saber em quais tarefas a IA ajuda e em quais atrapalha, com o mapa de tarefas por área e a evidência do experimento de Harvard com a BCG." },
  { arq: "02-uso-frequente-e-medido.md", slug: "uso-frequente-e-medido", grupo: "base",
    titulo: "Uso frequente e medido de IA: como medir o ganho real",
    descricao: "Por que a sensação de produtividade com IA engana e como medir o ganho real com linha de base, tempo de ciclo e retrabalho." },
  { arq: "03-produtividade-com-metodo.md", slug: "produtividade-com-metodo", grupo: "base",
    titulo: "Produtividade com IA: de prompts soltos a práticas de time",
    descricao: "Como transformar bons usos individuais de IA em prática de time, com biblioteca de prompts e fluxos, champions por área e um modelo pronto." },
  { arq: "04-a-ia-nao-fala-por-nos.md", slug: "a-ia-nao-fala-por-nos", grupo: "base",
    titulo: "A IA não fala por nós: comunicação com IA sem workslop",
    descricao: "Seis práticas para usar IA na comunicação sem perder a responsabilidade pelo que se envia, com base na pesquisa sobre workslop." },
  { arq: "05-responsabilidade-humana.md", slug: "responsabilidade-humana", grupo: "sustentacao",
    titulo: "Responsabilidade humana em decisões apoiadas por IA",
    descricao: "A IA recomenda e uma pessoa decide. Níveis de revisão humana para decisões sobre pessoas e clientes, com responsável nomeado." },
  { arq: "06-verificar-antes-de-confiar.md", slug: "verificar-antes-de-confiar", grupo: "sustentacao",
    titulo: "Verificar antes de confiar: como revisar o que a IA gera",
    descricao: "Como conferir números, SQL, código e referências gerados por IA, com checklist para times de dados." },
  { arq: "07-dados-protegidos.md", slug: "dados-protegidos", grupo: "sustentacao",
    titulo: "Dados protegidos: classificação de dados e LGPD no uso de IA",
    descricao: "Ferramentas seguras em vez de proibição: uma tabela simples de classificação de dados para o uso de IA, alinhada à LGPD." },
  { arq: "08-aprender-em-alianca.md", slug: "aprender-em-alianca", grupo: "sustentacao",
    titulo: "Aprender em aliança: empresas compartilhando o uso de IA",
    descricao: "Como empresas compartilham acertos e erros no uso de IA: trilha comum, encontro trimestral, biblioteca e indicadores." },
];

const GUIAS = [
  { arq: "politica-de-uso-modelo.md", slug: "modelo-politica-uso-ia",
    titulo: "Modelo de política de uso de IA para empresas",
    descricao: "Modelo gratuito de política de uso de inteligência artificial para adaptar à sua empresa: ferramentas aprovadas, classificação de dados e LGPD." },
  { arq: "o-que-e-workslop.md", slug: "workslop",
    titulo: "O que é workslop e como evitar no trabalho",
    descricao: "Workslop é o conteúdo feito com IA que parece pronto, mas não faz a tarefa avançar. O que a pesquisa encontrou e como evitar." },
  { arq: "antes-de-enviar.md", slug: "antes-de-enviar",
    titulo: "Checklist: antes de enviar algo feito com IA",
    descricao: "Cinco perguntas para revisar e-mails, relatórios e mensagens escritos com IA antes de enviar, com versão para imprimir." },
  { arq: "piloto-90-dias.md", slug: "piloto-90-dias",
    titulo: "Piloto de IA em 90 dias: roteiro para empresas",
    descricao: "Roteiro de 90 dias para começar a usar IA com resultado medido: fundação, pilotos e medição, com exemplos para times de dados." },
  { arq: "indicadores.md", slug: "indicadores-adocao-ia",
    titulo: "Indicadores de adoção de IA: o que medir e como",
    descricao: "Cinco indicadores para medir a adoção de IA com foco em resultado: adoção ativa, treinamento, tempo de ciclo, retrabalho e comunicação." },
];

const urlCompromisso = (c) => `/compromissos/${c.slug}`;
const urlGuia = (g) => `/guias/${g.slug}`;

// Links entre .md viram links entre páginas do site
function reescreverLink(href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [arquivo, ancora] = href.split("#");
  const base = path.basename(arquivo);
  const extra = ancora ? `#${ancora}` : "";
  const c = COMPROMISSOS.find((x) => x.arq === base);
  if (c) return urlCompromisso(c) + extra;
  const g = GUIAS.find((x) => x.arq === base);
  if (g) return urlGuia(g) + extra;
  if (base === "MANIFESTO.md") return "/#compromissos";
  if (base === "CONTRIBUTING.md") return `${REPO}/blob/main/CONTRIBUTING.md`;
  if (base === "LICENSE") return `${REPO}/blob/main/LICENSE`;
  return href;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const semTags = (s) => s.replace(/<[^>]+>/g, "");

marked.use({
  gfm: true,
  renderer: {
    link(href, title, text) {
      const destino = reescreverLink(href);
      const externo = /^https?:/.test(destino) && !destino.startsWith(DOMINIO);
      return `<a href="${esc(destino)}"${title ? ` title="${esc(title)}"` : ""}${externo ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
    },
    table(header, body) {
      return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
    },
  },
});

// URLs soltas (nas listas de fontes) viram links
function linkarUrlsSoltas(md) {
  return md.replace(/(^|[\s(])(https?:\/\/[^\s)<]+[^\s)<.,;:])/g, "$1<$2>");
}

// ---------- Estilos e trechos reaproveitados do index.html ----------
const INDEX = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8");
const trecho = (de, ate) => {
  const i = INDEX.indexOf(de);
  const j = INDEX.indexOf(ate, i);
  if (i < 0 || j < 0) throw new Error(`Trecho não encontrado no index.html: ${de}`);
  return INDEX.slice(i, j);
};
const CSS_BASE = trecho(":root{", "/* Hero */");
const CSS_RODAPE = trecho("/* Rodapé */", "</style>");
const JS_REDIRECIONA = trecho("<script>\n  // Quem chega pelo endereço antigo", "<script>\n  // Aplica o tema salvo");
const JS_TEMA_CEDO = trecho("<script>\n  // Aplica o tema salvo", '<link rel="preconnect"');
const JS_TEMA = trecho("  // Tema\n", "  // Formulário");

const CSS_PAGINAS = `/* Gerado por build/gerar-paginas.js a partir do index.html. Não edite à mão. */
${CSS_BASE}
/* Páginas de conteúdo */
main.pagina{padding-block:40px 72px}
.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0 0 36px;font-size:.82rem;color:var(--muted)}
.crumbs li+li::before{content:"/";margin-right:6px;color:var(--rule)}
.crumbs a{color:var(--muted)}
.cabeca{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 32px;align-items:start;margin-bottom:40px;max-width:980px}
.cabeca.sem-numero{grid-template-columns:minmax(0,1fr)}
.cabeca .n{font-weight:600;font-size:clamp(4.2rem,10vw,7.5rem);line-height:.82}
.cabeca h1{font-weight:600;font-size:clamp(2.1rem,5vw,3.5rem);line-height:1.06;letter-spacing:-.02em;margin:10px 0 14px;text-wrap:balance}
.cabeca .stmt{font-size:1.25rem;line-height:1.5;max-width:56ch;margin:0}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:64px;align-items:start}
.prose{max-width:68ch;min-width:0}
.prose h2{font-weight:600;font-size:1.6rem;line-height:1.15;letter-spacing:-.01em;margin:48px 0 12px;text-wrap:balance}
.prose h2:first-child{margin-top:0}
.prose h3{font-weight:600;font-size:1.25rem;margin:32px 0 10px}
.prose p,.prose ul,.prose ol{margin:0 0 1em}
.prose li{margin:.35em 0}
.prose li>p{margin:0}
.prose a{overflow-wrap:anywhere}
.prose p,.prose li,.prose td{overflow-wrap:break-word}
.prose blockquote{margin:1.2em 0;padding:2px 0 2px 18px;border-left:3px solid var(--cyan);color:var(--muted)}
.prose blockquote p{margin:0}
.prose code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em;background:var(--surface);padding:1px 5px;border-radius:2px}
.prose pre{background:var(--surface);padding:14px 16px;overflow-x:auto;border-radius:2px;font-size:.84rem;line-height:1.55;margin:1.2em 0}
.prose pre code{background:none;padding:0;font-size:inherit}
.table-wrap{overflow-x:auto;margin:1.2em 0 1.6em}
.prose table{border-collapse:collapse;width:100%;font-size:.94rem}
.prose th,.prose td{text-align:left;vertical-align:top;padding:9px 14px 9px 0;border-bottom:1px solid var(--rule)}
.prose th{font-weight:600;border-bottom:2px solid var(--ink)}
.prose hr{border:0;border-top:1px solid var(--rule);margin:36px 0}
.prose li:has(>input[type=checkbox]){list-style:none;margin-left:-1.2em}
.prose input[type=checkbox]{margin:0 8px 0 0;accent-color:var(--cyan);vertical-align:-2px}
.lateral{position:sticky;top:96px;display:grid;gap:28px;font-size:.9rem}
.lateral section{border-top:2px solid var(--ink);padding-top:12px}
.lateral h2{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:400;margin:0 0 10px}
.lateral ol,.lateral ul{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.lateral a{color:var(--ink);text-decoration:none}
.lateral a:hover{text-decoration:underline}
.lateral a[aria-current="page"]{color:var(--cyan-text);font-weight:600}
.lateral .num{display:inline-block;width:1.4em;color:var(--muted);font-variant-numeric:tabular-nums}
.paginador{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:56px;border-top:2px solid var(--ink);padding-top:16px}
.paginador a{text-decoration:none;color:var(--ink)}
.paginador a:hover b{text-decoration:underline}
.paginador small{display:block;color:var(--muted);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
.paginador b{font-weight:600}
.paginador .prox{text-align:right;grid-column:2}
.chamada{margin-top:56px;background:var(--surface);padding:24px 28px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px}
.chamada p{margin:0;font-size:1.15rem;font-weight:600;max-width:40ch}
.fonte-md{margin-top:28px;font-size:.84rem;color:var(--muted)}
@media (max-width:900px){ .layout{grid-template-columns:minmax(0,1fr);gap:40px} .lateral{position:static} }
@media (max-width:560px){ .cabeca{grid-template-columns:minmax(0,1fr)} .cabeca .n{font-size:4.2rem} .paginador{grid-template-columns:minmax(0,1fr)} .paginador .prox{grid-column:1;text-align:left} }
${CSS_RODAPE}`;

// ---------- Montagem de uma página ----------
function lateral(atual) {
  const itens = COMPROMISSOS.map((c, i) => {
    const cur = atual === urlCompromisso(c) ? ' aria-current="page"' : "";
    const nome = c.nomeCurto;
    return `<li><a href="${urlCompromisso(c)}"${cur}><span class="num">${i + 1}</span>${esc(nome)}</a></li>`;
  }).join("\n          ");
  const guias = GUIAS.map((g) => {
    const cur = atual === urlGuia(g) ? ' aria-current="page"' : "";
    return `<li><a href="${urlGuia(g)}"${cur}>${esc(g.nomeCurto)}</a></li>`;
  }).join("\n          ");
  return `<aside class="lateral" aria-label="Navegação do manifesto">
      <section>
        <h2>Os oito compromissos</h2>
        <ol>
          ${itens}
        </ol>
      </section>
      <section>
        <h2>Guias</h2>
        <ul>
          ${guias}
        </ul>
      </section>
    </aside>`;
}

function pagina({ url, titulo, descricao, h1, numero, eyebrow, stmt, corpoHtml, migalhas, paginador, fonteMd }) {
  const tituloTag = (titulo + " · Aliança IA Consciente").length <= 68 ? `${titulo} · Aliança IA Consciente` : titulo;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${DOMINIO}${url}#artigo`,
        headline: h1,
        description: descricao,
        inLanguage: "pt-BR",
        url: `${DOMINIO}${url}`,
        mainEntityOfPage: `${DOMINIO}${url}`,
        image: `${DOMINIO}/og-image.png`,
        datePublished: PUBLICADO,
        dateModified: HOJE,
        license: "https://creativecommons.org/licenses/by/4.0/",
        author: { "@id": `${DOMINIO}/#organizacao` },
        publisher: { "@type": "Organization", "@id": `${DOMINIO}/#organizacao`, name: "Aliança IA Consciente", logo: { "@type": "ImageObject", url: `${DOMINIO}/icon-512.png` } },
        isPartOf: { "@id": `${DOMINIO}/#site` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: migalhas.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nome, ...(m.url ? { item: `${DOMINIO}${m.url}` } : {}) })),
      },
    ],
  };
  const migalhasHtml = migalhas.map((m) => (m.url && m.url !== url ? `<li><a href="${m.url}">${esc(m.nome)}</a></li>` : `<li aria-current="page">${esc(m.nome)}</li>`)).join("");
  const numeroHtml = numero ? `<div class="n plates num" data-text="${numero}" aria-hidden="true">${numero}</div>` : "";
  const pagHtml = paginador
    ? `<nav class="paginador" aria-label="Compromissos">
        ${paginador.ant ? `<a class="ant" href="${paginador.ant.url}"><small>← Anterior</small><b>${esc(paginador.ant.nome)}</b></a>` : ""}
        ${paginador.prox ? `<a class="prox" href="${paginador.prox.url}"><small>Próximo →</small><b>${esc(paginador.prox.nome)}</b></a>` : ""}
      </nav>`
    : "";

  return `<!doctype html>
<!-- Gerado por site/build/gerar-paginas.js a partir de ${fonteMd}. Edite o .md, não este arquivo. -->
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(tituloTag)}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${DOMINIO}${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Aliança IA Consciente">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${DOMINIO}${url}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:image" content="${DOMINIO}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titulo)}">
<meta name="twitter:description" content="${esc(descricao)}">
<meta name="twitter:image" content="${DOMINIO}/og-image.png">
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
${JS_REDIRECIONA}${JS_TEMA_CEDO}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400;1,8..60,600&display=swap">
<link rel="stylesheet" href="/assets/paginas.css">
</head>
<body>

<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="/">Aliança IA Consciente</a>
    <nav class="nav" aria-label="Principal">
      <a class="link" href="/#compromissos">Compromissos</a>
      <a class="link" href="/#guias">Guias</a>
      <a class="link" href="${REPO}" target="_blank" rel="noopener">GitHub</a>
      <div class="theme" role="group" aria-label="Tema">
        <button type="button" data-t="light">Claro</button><button type="button" data-t="dark">Escuro</button><button type="button" data-t="system">Sistema</button>
      </div>
      <a class="btn" href="/#participar">Quero participar</a>
    </nav>
  </div>
  <div class="wrap"><hr class="double"></div>
</header>

<main class="pagina">
  <div class="wrap">
    <nav class="crumbs" aria-label="Você está em"><ol>${migalhasHtml}</ol></nav>
    <div class="cabeca${numero ? "" : " sem-numero"}">
      ${numeroHtml}
      <div>
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1>${esc(h1)}</h1>
        ${stmt ? `<p class="stmt">${stmt}</p>` : ""}
      </div>
    </div>
    <div class="layout">
      <article class="prose">
${corpoHtml}
        ${pagHtml}
        <div class="chamada">
          <p>Sua empresa quer usar IA assim? Seja uma das fundadoras da aliança.</p>
          <a class="btn" href="/#participar">Inscrever minha empresa</a>
        </div>
        <p class="fonte-md">Texto aberto sob <a href="${REPO}/blob/main/LICENSE" target="_blank" rel="noopener">CC BY 4.0</a>. <a href="${REPO}/blob/main/${fonteMd}" target="_blank" rel="noopener">Ver ou sugerir mudanças no GitHub</a>.</p>
      </article>
      ${lateral(url)}
    </div>
  </div>
</main>

<footer>
  <div class="wrap"><hr class="double" style="flex-basis:100%"><span>Aliança IA Consciente · Manifesto, rascunho v0.1 · <a href="${REPO}" target="_blank" rel="noopener">Material aberto no GitHub</a></span><span>Proposta: <a href="https://www.marcosmhs.com.br/" target="_blank" rel="noopener">That Exotic Bug</a></span></div>
</footer>

<script>
(function(){
${JS_TEMA}})();
</script>
</body>
</html>
`;
}

// ---------- Leitura dos .md ----------
function lerMd(rel) {
  let md = fs.readFileSync(path.join(RAIZ, rel), "utf8");
  const h1 = (md.match(/^# (.+)$/m) || [])[1];
  md = md.replace(/^# .+\n+/m, "");
  return { md, h1 };
}

// Nomes curtos para a navegação lateral
for (const c of COMPROMISSOS) {
  const { h1 } = lerMd(`compromissos/${c.arq}`);
  c.numero = Number(h1.match(/^(\d+)\./)[1]);
  c.nomeCurto = h1.replace(/^\d+\.\s*/, "");
}
for (const g of GUIAS) {
  g.nomeCurto = lerMd(`guias/${g.arq}`).h1.replace(/^Modelo de política de uso de IA$/, "Modelo de política de uso");
}

fs.mkdirSync(path.join(PUBLIC, "compromissos"), { recursive: true });
fs.mkdirSync(path.join(PUBLIC, "guias"), { recursive: true });
fs.mkdirSync(path.join(PUBLIC, "assets"), { recursive: true });
fs.writeFileSync(path.join(PUBLIC, "assets/paginas.css"), CSS_PAGINAS);

const geradas = [];

COMPROMISSOS.forEach((c, i) => {
  let { md } = lerMd(`compromissos/${c.arq}`);
  // A frase do compromisso (primeira citação) vira o subtítulo
  const stmtMd = (md.match(/^> (.+)$/m) || [])[1] || "";
  md = md.replace(/^> .+\n+/m, "");
  // Remove a linha "Compromisso da base · [Voltar ao manifesto]"
  md = md.replace(/^Compromisso (da base|de sustentação) · .+\n+/m, "");
  const corpo = marked.parse(linkarUrlsSoltas(md));
  const ant = COMPROMISSOS[i - 1];
  const prox = COMPROMISSOS[i + 1];
  const url = urlCompromisso(c);
  const html = pagina({
    url,
    titulo: c.titulo,
    descricao: c.descricao,
    h1: c.nomeCurto,
    numero: c.numero,
    eyebrow: `Compromisso ${c.numero} de 8 · ${c.grupo === "base" ? "A base" : "A sustentação"}`,
    stmt: marked.parseInline(stmtMd),
    corpoHtml: corpo,
    migalhas: [{ nome: "Início", url: "/" }, { nome: "Compromissos", url: "/#compromissos" }, { nome: c.nomeCurto, url }],
    paginador: {
      ant: ant && { url: urlCompromisso(ant), nome: `${ant.numero}. ${ant.nomeCurto}` },
      prox: prox && { url: urlCompromisso(prox), nome: `${prox.numero}. ${prox.nomeCurto}` },
    },
    fonteMd: `compromissos/${c.arq}`,
  });
  fs.writeFileSync(path.join(PUBLIC, `compromissos/${c.slug}.html`), html);
  geradas.push(url);
});

GUIAS.forEach((g) => {
  const { md, h1 } = lerMd(`guias/${g.arq}`);
  // Primeiro parágrafo vira o subtítulo
  const partes = md.split(/\n{2,}/);
  const primeiro = partes[0].startsWith("#") || partes[0].startsWith("|") || partes[0].startsWith("-") ? "" : partes.shift();
  const corpo = marked.parse(linkarUrlsSoltas(partes.join("\n\n")));
  const url = urlGuia(g);
  const html = pagina({
    url,
    titulo: g.titulo,
    descricao: g.descricao,
    h1,
    eyebrow: "Guia da Aliança IA Consciente",
    stmt: primeiro ? marked.parseInline(primeiro) : "",
    corpoHtml: corpo,
    migalhas: [{ nome: "Início", url: "/" }, { nome: "Guias", url: "/#guias" }, { nome: g.nomeCurto, url }],
    fonteMd: `guias/${g.arq}`,
  });
  fs.writeFileSync(path.join(PUBLIC, `guias/${g.slug}.html`), html);
  geradas.push(url);
});

// ---------- Sitemap ----------
const urls = ["/", ...geradas];
fs.writeFileSync(
  path.join(PUBLIC, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${DOMINIO}${u}</loc>\n    <lastmod>${HOJE}</lastmod>\n  </url>`).join("\n")}
</urlset>
`
);

console.log(`${geradas.length} páginas geradas, sitemap com ${urls.length} endereços.`);
