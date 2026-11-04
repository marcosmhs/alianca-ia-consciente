// Testa as assinaturas de pessoas: regras, contador, e-mail de aprovação, moderação e exibição no site.
// Roda dentro de: firebase emulators:exec --only firestore,functions,hosting
const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
const { chromium } = require("playwright");
const crypto = require("crypto");

const emails = [];
const srv = new SMTPServer({
  authOptional: true, disabledCommands: ["STARTTLS"],
  onAuth(a, s, cb) { cb(null, { user: a.username }); },
  onData(st, s, cb) { simpleParser(st).then((m) => { emails.push(m); cb(); }); },
});
srv.listen(2525, "127.0.0.1");

const DB = "projects/demo-alianca/databases/(default)/documents";
const FS = "http://127.0.0.1:8080/v1/";
const SITE = "http://127.0.0.1:5000";
const s = (v) => ({ stringValue: v });
const hash = (e) => crypto.createHash("sha256").update(e).digest("hex");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let falhas = 0;
const check = (ok, msg) => { console.log((ok ? "OK  " : "FAIL") + " " + msg); if (!ok) falhas++; };
const aguardar = async (f, n = 60) => { for (let i = 0; i < n; i++) { const v = await f(); if (v) return v; await espera(500); } return null; };

const admin = { Authorization: "Bearer owner" };
const contador = async () => {
  const r = await fetch(FS + DB + "/contadores/assinaturas", { headers: admin });
  if (!r.ok) return { total: 0 };
  const f = (await r.json()).fields || {};
  return { total: Number(f.total?.integerValue || 0), incentivar: Number(f.incentivar?.integerValue || 0), divulgar: Number(f.divulgar?.integerValue || 0) };
};
const apoiadores = async () => (await (await fetch(FS + DB + "/apoiadores", { headers: admin })).json()).documents || [];

async function assinar(email, extra = {}, id = hash(email)) {
  const fields = { nome: s("Pessoa Teste"), email: s(email), apoio: { arrayValue: { values: [s("divulgar")] } }, publico: { booleanValue: false }, consentimento: { booleanValue: true }, ...extra };
  const r = await fetch(FS + DB + ":commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ writes: [{
    update: { name: `${DB}/assinaturas/${id}`, fields },
    updateTransforms: [{ fieldPath: "criadoEm", setToServerValue: "REQUEST_TIME" }],
    currentDocument: { exists: false },
  }] }) });
  return r.status;
}

(async () => {
  // Regras
  check(await assinar("ana@exemplo.com") === 200, "assinatura válida, sem nome público");
  check(await aguardar(async () => (await contador()).total === 1), "contador soma 1");
  await espera(1500);
  check(emails.length === 0, "assinatura sem nome público não gera e-mail");
  const dup = await assinar("ana@exemplo.com");
  check(dup !== 200, `mesmo e-mail de novo é recusado (${dup})`);
  check(await assinar("bia@exemplo.com", {}, "abc123") === 403, "id que não é o hash do e-mail é recusado");
  check(await assinar("Caio@Exemplo.com", {}, hash("Caio@Exemplo.com")) === 403, "e-mail com maiúsculas é recusado");
  check(await assinar("dani@exemplo.com", { apoio: { arrayValue: { values: [s("hackear")] } } }) === 403, "forma de apoio fora da lista é recusada");
  check(await assinar("edu@exemplo.com", { consentimento: { booleanValue: false } }) === 403, "sem consentimento é recusado");
  check(await assinar("fabi@exemplo.com", { admin: { booleanValue: true } }) === 403, "campo extra é recusado");
  check((await fetch(FS + DB + "/contadores/assinaturas")).status === 200, "contador tem leitura pública");
  check((await fetch(FS + DB + "/apoiadores")).status === 200, "apoiadores têm leitura pública");
  check((await fetch(FS + DB + "/assinaturas")).status === 403, "assinaturas não têm leitura pública");
  const w = await fetch(FS + DB + ":commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ writes: [{ update: { name: DB + "/apoiadores/x", fields: { nome: s("Falso") } } }] }) });
  check(w.status === 403, "ninguém escreve em apoiadores pelo site");
  await espera(1000);
  check((await contador()).total === 1, "tentativas recusadas não mexem no contador");

  // Navegador: assinatura com nome público
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.goto(SITE + "/");
  check(!(await p.textContent("#apoiadores")).includes("That Exotic Bug"), "seção de apoio sem nomes de empresas");
  check(await p.$("#lista-signatarias") === null, "lista de empresas removida do site");
  await espera(1500);
  check(await p.isHidden("#contador") && await p.isVisible("#apoio-vazio"), "contador escondido com menos de 500 apoios");

  await p.click("#p-enviar");
  check((await p.$$eval("#form-pessoa .error", (e) => e.length)) === 3, "formulário vazio aponta nome, e-mail e consentimento");
  await p.fill("#p-nome", "<b>Gabi</b> Souza");
  await p.fill("#p-email", "Gabi@Exemplo.com");
  await p.fill("#p-cargo", "Engenheira de dados");
  await p.check("#p-publico");
  await p.check("#p-consentimento");
  await p.click("#p-enviar");
  await p.waitForSelector("#p-done:not([hidden])", { timeout: 8000 }).catch(() => {});
  check((await p.textContent("#p-done-titulo")).includes("Obrigado por assinar"), "assinatura pelo navegador");
  check((await p.getAttribute("#share-linkedin", "href")).startsWith("https://www.linkedin.com/sharing/share-offsite/?url="), "botão de compartilhar no LinkedIn");
  check((await p.getAttribute("#share-whatsapp", "href")).startsWith("https://wa.me/?text="), "botão de enviar no WhatsApp");
  await p.locator("#participar").screenshot({ path: "test/assinou.png" });

  const c2 = await aguardar(async () => { const c = await contador(); return c.total === 2 ? c : null; });
  check(!!c2 && c2.incentivar === 1 && c2.divulgar === 2, "contador soma 2, com 1 incentivar e 2 divulgar");
  const mail = await aguardar(() => emails[0]);
  check(!!mail && mail.subject.includes("Gabi"), "assinatura com nome público gera e-mail de aprovação");
  const aprovar = (mail.text.match(/Aprovar e mostrar no site: (\S+)/) || [])[1];
  const recusar = (mail.text.match(/Recusar: (\S+)/) || [])[1];
  check(!!aprovar && !!recusar, "e-mail traz links de aprovar e recusar");
  check(mail.html.includes("&lt;b&gt;Gabi"), "nome escapado no e-mail");

  // Moderação
  const g = await fetch(aprovar);
  check(g.status === 200 && (await g.text()).includes("Mostrar esta pessoa no site?"), "abrir o link só mostra a confirmação");
  check((await apoiadores()).length === 0, "GET não aprova sozinho");
  check((await fetch(aprovar.replace(/t=([0-9a-f])/, (m, c) => "t=" + (c === "0" ? "1" : "0")))).status === 403, "token adulterado é recusado");
  check((await fetch(aprovar.replace("acao=aprovar", "acao=remover"))).status === 403, "trocar a ação no link é recusado");
  check((await fetch(aprovar.replace("tipo=pessoa", "tipo=empresa"))).status === 403, "trocar o tipo no link é recusado");
  check((await fetch(SITE + "/moderar?id=abc&acao=aprovar&t=x")).status === 410, "link antigo de empresa mostra aviso");

  await p.goto(aprovar);
  await p.click("button[type=submit]");
  await p.waitForLoadState();
  check((await p.textContent("h1")).includes("Apoiador aprovado"), "clicar em Aprovar mostra a pessoa no site");
  const ap = await apoiadores();
  const f = ap[0] && ap[0].fields;
  check(ap.length === 1 && f.nome.stringValue === "<b>Gabi</b> Souza" && f.cargo.stringValue === "Engenheira de dados" && !f.email, "apoiador público tem só nome e cargo");

  for (const sc of ["light", "dark"]) {
    const q = await b.newPage({ viewport: { width: 1200, height: 900 }, colorScheme: sc });
    await q.goto(SITE + "/#apoiadores");
    await q.waitForSelector("#lista-apoiadores:not([hidden])", { timeout: 8000 }).catch(() => {});
    if (sc === "light") {
      const nomes = await q.$$eval("#lista-apoiadores li", (e) => e.map((x) => x.firstChild.textContent));
      check(JSON.stringify(nomes) === JSON.stringify(["<b>Gabi</b> Souza"]), "site lista o apoiador aprovado, como texto: " + JSON.stringify(nomes));
      check(await q.isHidden("#contador"), "contador continua escondido com 2 apoios");
    }
    await q.locator("#apoiadores").screenshot({ path: `test/apoiadores-${sc}.png` });
    await q.locator("#participar").screenshot({ path: `test/assinatura-${sc}.png` });
    await q.close();
  }

  // Mesmo e-mail pelo navegador
  const d = await b.newPage();
  await d.goto(SITE + "/#participar");
  await d.fill("#p-nome", "Gabi de novo");
  await d.fill("#p-email", "gabi@exemplo.com");
  await d.check("#p-consentimento");
  await d.click("#p-enviar");
  await d.waitForSelector("#p-done:not([hidden])", { timeout: 8000 }).catch(() => {});
  check((await d.textContent("#p-done-titulo")).includes("já assinou"), "mesmo e-mail pelo navegador avisa que já assinou");
  await espera(1500);
  check((await contador()).total === 2, "assinatura repetida não muda o contador");

  // Remover
  const tR = new URL(recusar).searchParams;
  const pr = await fetch(SITE + "/moderar", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ tipo: "pessoa", id: tR.get("id"), acao: "recusar", t: tR.get("t") }) });
  check(pr.status === 200 && (await pr.text()).includes("Assinatura recusada"), "recusar via POST");
  check((await apoiadores()).length === 0, "depois de recusar, o nome sai do site");
  check((await contador()).total === 2, "recusar não muda o contador");

  // Empresa: e-mail sem botões de publicar
  const lerEmpresas = async () => { const r = await fetch(FS + DB + "/contadores/assinaturas", { headers: admin }); const f = (await r.json()).fields || {}; return Number(f.empresas?.integerValue || 0); };
  const empresasAntes = await lerEmpresas();
  emails.length = 0;
  await fetch(FS + DB + ":commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ writes: [{
    update: { name: DB + "/interesse/emp1", fields: { empresa: s("Empresa X"), setor: s("tecnologia"), porte: s("51-200"), nome: s("Hugo"), cargo: s("CTO"), email: s("hugo@x.com"), participacao: s("signataria"), pilotos: { arrayValue: { values: [] } }, consentimento: { booleanValue: true } } },
    updateTransforms: [{ fieldPath: "criadoEm", setToServerValue: "REQUEST_TIME" }], currentDocument: { exists: false } }] }) });
  const me = await aguardar(() => emails[0]);
  check(!!me && me.subject.includes("Empresa X") && !me.text.includes("/moderar"), "inscrição de empresa avisa por e-mail, sem botões de publicar");
  const ok1 = await aguardar(async () => (await lerEmpresas()) === empresasAntes + 1);
  check(!!ok1 && (await contador()).total === 2, "inscrição de empresa soma 1 em empresas, sem mexer nas pessoas");

  // Limite de 500: com 499 o contador fica escondido, com 500 aparece
  const fixar = (pessoas, empresas) => fetch(FS + DB + "/contadores/assinaturas?updateMask.fieldPaths=total&updateMask.fieldPaths=empresas", { method: "PATCH", headers: { ...admin, "Content-Type": "application/json" }, body: JSON.stringify({ fields: { total: { integerValue: String(pessoas) }, empresas: { integerValue: String(empresas) } } }) });
  const b2 = await chromium.launch();
  await fixar(489, 10);
  let z = await b2.newPage(); await z.goto(SITE + "/#apoiadores"); await espera(1500);
  check(await z.isHidden("#contador"), "com 499 apoios o contador fica escondido");
  await fixar(490, 10);
  z = await b2.newPage(); await z.goto(SITE + "/#apoiadores");
  await z.waitForSelector("#contador:not([hidden])", { timeout: 8000 }).catch(() => {});
  check((await z.textContent("#total")).trim() === "500" && (await z.textContent("#total-rotulo")).includes("490 pessoas e 10 empresas"), "com 500 apoios o contador aparece: " + (await z.textContent("#contador")).replace(/\s+/g, " ").trim());
  check(await z.isHidden("#apoio-vazio"), "o convite some quando o contador aparece");
  await z.locator("#apoiadores").screenshot({ path: "test/contador-500.png" });
  await b2.close();

  await b.close();
  srv.close();
  process.exit(falhas ? 1 : 0);
})();
