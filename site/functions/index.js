// Aliança IA Consciente: avisos por e-mail, contador de assinaturas e aprovação dos apoiadores exibidos no site.
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

initializeApp();
const db = getFirestore();

// Configuração (valores em functions/.env, segredos no Secret Manager)
const EMAIL_REMETENTE = defineString("EMAIL_REMETENTE");
const EMAIL_DESTINOS = defineString("EMAIL_DESTINOS");
const SMTP_HOST = defineString("SMTP_HOST", { default: "smtp.gmail.com" });
const SMTP_PORT = defineString("SMTP_PORT", { default: "465" });
const SITE_URL = defineString("SITE_URL", { default: "" });
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const MODERACAO_SECRET = defineSecret("MODERACAO_SECRET");

const REGIAO = "southamerica-east1";

const ROTULOS = {
  setor: {
    tecnologia: "Tecnologia e software", marketplace: "Marketplace e e-commerce",
    fintech: "Fintech e serviços financeiros", mobilidade: "Mobilidade e turismo",
    servicos: "Consultoria e serviços de TI", outro: "Outro",
  },
  porte: {
    "ate-50": "Até 50", "51-200": "51 a 200", "201-1000": "201 a 1.000",
    "1001-5000": "1.001 a 5.000", "mais-5000": "Mais de 5.000",
  },
  participacao: {
    fundadora: "Empresa fundadora", signataria: "Empresa signatária", acompanhar: "Quer acompanhar",
  },
  pilotos: {
    dados: "Dados e analytics", engenharia: "Engenharia de software", produto: "Produto e design",
    atendimento: "Atendimento ao cliente", comercial: "Comercial e marketing", pessoas: "Pessoas e RH",
  },
  apoio: {
    incentivar: "Incentivar na empresa onde trabalha", divulgar: "Divulgar a aliança",
  },
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rot = (grupo, v) => ROTULOS[grupo][v] || v || "";
const siteBase = () => (SITE_URL.value() || `https://${process.env.GCLOUD_PROJECT}.web.app`).replace(/\/+$/, "");
const dataHora = (ts) => (ts?.toDate ? ts.toDate() : new Date()).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

// Links de moderação assinados: só quem recebe o e-mail consegue aprovar
const ACOES = ["aprovar", "recusar", "remover"];
const assinar = (tipo, id, acao) =>
  crypto.createHmac("sha256", MODERACAO_SECRET.value()).update(`${tipo}:${id}:${acao}`).digest("hex").slice(0, 40);
const tokenValido = (tipo, id, acao, t) => {
  const esperado = Buffer.from(assinar(tipo, id, acao));
  const recebido = Buffer.from(String(t || ""));
  return recebido.length === esperado.length && crypto.timingSafeEqual(recebido, esperado);
};
const linkModeracao = (tipo, id, acao) =>
  `${siteBase()}/moderar?tipo=${tipo}&id=${encodeURIComponent(id)}&acao=${acao}&t=${assinar(tipo, id, acao)}`;

// E-mail
const tabela = (linhas) => `<table style="border-collapse:collapse;width:100%;font-size:15px">
    ${linhas.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#7d7979;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;border-bottom:1px solid #eae7e7">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("\n    ")}
  </table>`;
const botao = (href, rotulo, cheio) =>
  `<a href="${esc(href)}" style="display:inline-block;padding:10px 18px;border-radius:2px;font-weight:600;text-decoration:none;${cheio ? "background:#0088b0;color:#ffffff;border:1px solid #0088b0" : "background:#ffffff;color:#201e1d;border:1px solid #bab6b6"}">${rotulo}</a>`;
const moldura = (titulo, corpo) => `<div style="font-family:Georgia,serif;color:#201e1d;max-width:560px">
  <p style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#7d7979;margin:0 0 4px">Aliança IA Consciente</p>
  <h2 style="font-weight:600;margin:0 0 16px">${titulo}</h2>
  ${corpo}
</div>`;

async function enviarEmail({ assunto, texto, html, replyTo }) {
  const transporte = nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port: Number(SMTP_PORT.value()),
    secure: Number(SMTP_PORT.value()) === 465,
    auth: { user: EMAIL_REMETENTE.value(), pass: GMAIL_APP_PASSWORD.value() },
  });
  await transporte.sendMail({
    from: `"Aliança IA Consciente" <${EMAIL_REMETENTE.value()}>`,
    to: EMAIL_DESTINOS.value(),
    replyTo,
    subject: assunto,
    text: texto,
    html,
  });
}
const responderPara = (nome, email) => (email ? `"${String(nome || "").replace(/"/g, "")}" <${email}>` : undefined);

// 1. Cada inscrição de empresa: soma no contador e avisa por e-mail
exports.avisarNovaInscricao = onDocumentCreated(
  { document: "interesse/{id}", region: REGIAO, secrets: [GMAIL_APP_PASSWORD], maxInstances: 2, memory: "256MiB" },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const id = event.params.id;
    await db.collection("contadores").doc("assinaturas").set({ empresas: FieldValue.increment(1), atualizadoEm: FieldValue.serverTimestamp() }, { merge: true });
    const linkConsole = `https://console.firebase.google.com/project/${process.env.GCLOUD_PROJECT}/firestore/data/~2Finteresse~2F${id}`;
    const pilotos = (d.pilotos || []).map((p) => rot("pilotos", p)).join(", ") || "Nenhuma";
    const linhas = [
      ["Empresa", d.empresa], ["Site", d.site], ["Setor", rot("setor", d.setor)],
      ["Colaboradores", rot("porte", d.porte)], ["Participação", rot("participacao", d.participacao)],
      ["Áreas de piloto", pilotos], ["Contato", d.nome], ["Cargo", d.cargo],
      ["E-mail", d.email], ["Telefone", d.telefone], ["Mensagem", d.mensagem],
      ["Recebida em", dataHora(d.criadoEm)],
    ].filter(([, v]) => v);

    await enviarEmail({
      assunto: `Nova inscrição de empresa: ${d.empresa} (${rot("participacao", d.participacao)})`,
      replyTo: responderPara(d.nome, d.email),
      texto: [`Nova inscrição de empresa na Aliança IA Consciente`, "", ...linhas.map(([k, v]) => `${k}: ${v}`), "", `Ver no Firebase: ${linkConsole}`].join("\n"),
      html: moldura(`Nova inscrição de empresa: ${esc(d.empresa)}`, `${tabela(linhas)}
  <p style="margin:20px 0 0"><a href="${esc(linkConsole)}" style="color:#0088b0">Ver a inscrição no Firebase</a></p>
  <p style="font-size:12px;color:#7d7979;margin:16px 0 0">Responda este e-mail para falar direto com ${esc(d.nome)}.</p>`),
    });
    logger.info("Aviso de empresa enviado", { id, empresa: d.empresa });
  }
);

// 2. Cada assinatura de pessoa: soma no contador e, se a pessoa quis aparecer no site, pede aprovação
exports.registrarAssinatura = onDocumentCreated(
  { document: "assinaturas/{id}", region: REGIAO, secrets: [GMAIL_APP_PASSWORD, MODERACAO_SECRET], maxInstances: 5, memory: "256MiB" },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const id = event.params.id;

    const incrementos = { total: FieldValue.increment(1), atualizadoEm: FieldValue.serverTimestamp() };
    for (const a of d.apoio || []) if (a === "incentivar" || a === "divulgar") incrementos[a] = FieldValue.increment(1);
    await db.collection("contadores").doc("assinaturas").set(incrementos, { merge: true });

    if (!d.publico) {
      logger.info("Assinatura registrada (sem nome público)", { id });
      return;
    }

    const linhas = [
      ["Nome", d.nome], ["Cargo ou área", d.cargo], ["E-mail", d.email],
      ["Como quer apoiar", (d.apoio || []).map((a) => rot("apoio", a)).join(" e ")],
      ["Assinou em", dataHora(d.criadoEm)],
    ].filter(([, v]) => v);
    const aprovar = linkModeracao("pessoa", id, "aprovar");
    const recusar = linkModeracao("pessoa", id, "recusar");

    await enviarEmail({
      assunto: `Nova assinatura para aprovar: ${d.nome}`,
      replyTo: responderPara(d.nome, d.email),
      texto: [
        `Nova assinatura do manifesto, com pedido para aparecer no site`, "",
        ...linhas.map(([k, v]) => `${k}: ${v}`), "",
        `No site aparecem só o nome e o cargo ou área.`,
        `Aprovar e mostrar no site: ${aprovar}`,
        `Recusar: ${recusar}`,
      ].join("\n"),
      html: moldura(`Nova assinatura: ${esc(d.nome)}`, `${tabela(linhas)}
  <p style="margin:24px 0 10px;font-size:14px">No site aparecem só o nome e o cargo ou área.</p>
  <p style="margin:0">${botao(aprovar, "Aprovar e mostrar no site", true)}&nbsp;&nbsp;${botao(recusar, "Recusar", false)}</p>`),
    });
    logger.info("Assinatura pública aguardando aprovação", { id });
  }
);

// 3. Página de moderação: GET mostra a confirmação, POST executa a ação
function pagina(res, status, titulo, corpo) {
  res.status(status)
    .set("Cache-Control", "private, no-store")
    .set("X-Robots-Tag", "noindex, nofollow")
    .set("Content-Type", "text/html; charset=utf-8")
    .send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(titulo)} · Aliança IA Consciente</title>
<style>
:root{--paper:#f3f2f2;--ink:#201e1d;--muted:#7d7979;--rule:#d7d3d3;--cyan:#0088b0;--err:#b0003a;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--paper:#191817;--ink:#f1efee;--muted:#a9a5a4;--rule:#3a3735;--cyan:#62c5ee;--err:#ff7a9c;color-scheme:dark}}
body{margin:0;background:var(--paper);color:var(--ink);font-family:"Source Serif 4",Georgia,serif;font-size:17px;line-height:1.55}
main{max-width:620px;margin:0 auto;padding:48px 20px}
.eyebrow{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0}
h1{font-weight:600;font-size:2rem;line-height:1.15;margin:8px 0 16px}
hr{border:0;height:4px;border-top:2px solid var(--ink);border-bottom:1px solid var(--ink);margin:0 0 24px}
dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;margin:0 0 24px}
dt{color:var(--muted)}dd{margin:0;overflow-wrap:anywhere}
.acoes{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
button,.btn{font:inherit;font-weight:600;font-size:.95rem;padding:10px 18px;border-radius:2px;cursor:pointer;text-decoration:none;display:inline-block}
.primary{background:#0088b0;color:#fff;border:1px solid #0088b0}
.ghost{background:transparent;color:var(--ink);border:1px solid var(--rule)}
.err{color:var(--err)}a{color:var(--cyan)}
</style></head><body><main><p class="eyebrow">Aliança IA Consciente · Moderação</p><h1>${esc(titulo)}</h1><hr>${corpo}</main></body></html>`);
}

const formAcao = (tipo, id, acao, rotulo, cheio) =>
  `<form method="post" action="/moderar"><input type="hidden" name="tipo" value="${tipo}"><input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="acao" value="${acao}"><input type="hidden" name="t" value="${assinar(tipo, id, acao)}"><button class="${cheio ? "primary" : "ghost"}" type="submit">${rotulo}</button></form>`;

exports.moderarInscricao = onRequest(
  { region: REGIAO, secrets: [MODERACAO_SECRET], invoker: "public", maxInstances: 2, memory: "256MiB" },
  async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") return pagina(res, 405, "Método não permitido", "");
    const p = req.method === "POST" ? req.body || {} : req.query;
    const tipo = String(p.tipo || "");
    const id = String(p.id || "");
    const acao = String(p.acao || "");

    // Links antigos, de quando as empresas aprovadas apareciam no site
    if (!tipo) {
      return pagina(res, 410, "Link antigo", `<p>As empresas não são mais listadas no site, então não há nada a aprovar por este link. A inscrição continua guardada no Firebase.</p><p><a href="/">Ir para o site</a></p>`);
    }

    if (tipo !== "pessoa" || !/^[a-f0-9]{64}$/.test(id) || !ACOES.includes(acao) || !tokenValido(tipo, id, acao, p.t)) {
      return pagina(res, 403, "Link inválido", `<p class="err">Este link de moderação não é válido. Use o link do e-mail de aviso da assinatura.</p>`);
    }

    const refAssinatura = db.collection("assinaturas").doc(id);
    const refPublica = db.collection("apoiadores").doc(id);
    const snap = await refAssinatura.get();
    if (!snap.exists) return pagina(res, 404, "Assinatura não encontrada", `<p>Esta assinatura não existe mais no banco.</p>`);
    const d = snap.data();
    const publicada = (await refPublica.get()).exists;
    const situacao = publicada ? "Aparece no site" : d.status === "recusada" ? "Recusada" : d.status === "removida" ? "Removida do site" : "Aguardando aprovação";

    const resumo = `<dl>
<dt>Nome</dt><dd>${esc(d.nome)}</dd>
${d.cargo ? `<dt>Cargo ou área</dt><dd>${esc(d.cargo)}</dd>` : ""}
<dt>E-mail</dt><dd>${esc(d.email)}</dd>
<dt>Como quer apoiar</dt><dd>${esc((d.apoio || []).map((a) => rot("apoio", a)).join(" e "))}</dd>
<dt>Situação</dt><dd>${esc(situacao)}</dd>
</dl>`;

    if (req.method === "GET") {
      if (acao === "aprovar" && publicada) {
        return pagina(res, 200, "Esta pessoa já aparece no site", resumo + `<div class="acoes"><a class="btn ghost" href="/#apoiadores">Ver no site</a>${formAcao(tipo, id, "remover", "Remover do site", false)}</div>`);
      }
      if (acao === "aprovar" && !d.publico) {
        return pagina(res, 200, "Esta pessoa não pediu para aparecer no site", resumo + `<p>A assinatura conta no total, mas o nome não é exibido.</p>`);
      }
      const textos = {
        aprovar: ["Mostrar esta pessoa no site?", "O nome e o cargo ou área aparecerão na lista de apoiadores. O e-mail nunca é exibido.", "Aprovar e mostrar"],
        recusar: ["Recusar esta assinatura?", "O nome não aparecerá no site. A assinatura continua contando no total.", "Recusar"],
        remover: ["Remover esta pessoa do site?", "O nome deixará de aparecer na lista de apoiadores. A assinatura continua contando no total.", "Remover do site"],
      }[acao];
      return pagina(res, 200, textos[0], resumo + `<p>${textos[1]}</p><div class="acoes">${formAcao(tipo, id, acao, textos[2], acao === "aprovar")}</div>`);
    }

    // POST: executa a ação
    const agora = FieldValue.serverTimestamp();
    if (acao === "aprovar") {
      if (!d.publico) return pagina(res, 409, "Não é possível mostrar", `<p>Esta pessoa não autorizou mostrar o nome no site.</p>`);
      const publico = { nome: d.nome, aprovadoEm: agora };
      if (d.cargo) publico.cargo = d.cargo;
      await refPublica.set(publico);
      await refAssinatura.update({ status: "aprovada", moderadaEm: agora });
      logger.info("Apoiador aprovado", { id });
      return pagina(res, 200, "Apoiador aprovado", `<p>${esc(d.nome)} agora aparece no site.</p><div class="acoes"><a class="btn primary" href="/#apoiadores">Ver no site</a>${formAcao(tipo, id, "remover", "Desfazer e remover", false)}</div>`);
    }
    await refPublica.delete();
    await refAssinatura.update({ status: acao === "recusar" ? "recusada" : "removida", moderadaEm: agora });
    logger.info(acao === "recusar" ? "Assinatura recusada" : "Apoiador removido", { id });
    return pagina(res, 200, acao === "recusar" ? "Assinatura recusada" : "Apoiador removido do site",
      `<p>${esc(d.nome)} não aparece no site. A assinatura continua contando no total.</p>${d.publico ? `<div class="acoes">${formAcao(tipo, id, "aprovar", "Aprovar mesmo assim", false)}</div>` : ""}`);
  }
);
