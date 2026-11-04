# Site da Aliança IA Consciente

Domínio, Search Console e plano de SEO: veja [DOMINIO-E-SEO.md](DOMINIO-E-SEO.md).

Página inicial com o manifesto, a assinatura de pessoas (com contador e lista de apoiadores) e a inscrição de empresas, mais as páginas dos compromissos e dos guias. Publicado em https://aliancaiaconsciente.com.br.

## Como funciona

| Parte | Arquivo | O que faz |
|---|---|---|
| Página | `public/index.html` | HTML, CSS e JS sem build. Tema claro, escuro ou do sistema |
| Assinaturas de pessoas | `firestore.rules` | Qualquer visitante pode **criar** uma assinatura na coleção `assinaturas`. O id é o SHA-256 do e-mail, então cada e-mail assina uma única vez. Ninguém lê pelo site |
| Contador e apoiadores | `firestore.rules` | `contadores/assinaturas` e `apoiadores` têm leitura pública e só são escritos pelas funções |
| Contador e aviso | `functions/index.js` → `registrarAssinatura` | Soma cada assinatura no contador. Se a pessoa pediu para aparecer no site, envia um e-mail com Aprovar e Recusar |
| Exibição do contador | `public/index.html` → `MINIMO_PARA_MOSTRAR` | O site só mostra o contador quando pessoas + empresas somam pelo menos 500. Antes disso, aparece o convite para assinar. As inscrições de empresas também entram no contador (campo `empresas`) |
| Aprovação | `functions/index.js` → `moderarInscricao` | Página em `/moderar` que mostra ou retira o nome da lista de apoiadores. Os links são assinados (HMAC) e a ação só acontece no clique de confirmação (POST) |
| Inscrições de empresas | `firestore.rules` e `functions/index.js` → `avisarNovaInscricao` | Coleção privada `interesse`. Cada inscrição gera um e-mail de aviso. As empresas não são listadas no site |
| Páginas de conteúdo | `build/gerar-paginas.js` | Gera `public/compromissos/*.html`, `public/guias/*.html`, `public/assets/paginas.css` e `public/sitemap.xml` a partir dos `.md` do repositório |

## Configuração

1. Copie `functions/.env.example` para `functions/.env` e preencha o remetente e os destinatários dos avisos.
2. Cadastre os segredos no Secret Manager:

```bash
npx firebase functions:secrets:set GMAIL_APP_PASSWORD --project SEU-PROJETO
```

```bash
openssl rand -hex 32 > /tmp/moderacao && npx firebase functions:secrets:set MODERACAO_SECRET --data-file /tmp/moderacao --project SEU-PROJETO && rm /tmp/moderacao
```

`GMAIL_APP_PASSWORD` é uma **senha de app** do Gmail (https://myaccount.google.com/apppasswords), não a senha normal da conta.

## Atualizar as páginas de conteúdo

O texto dos compromissos e guias vive nos arquivos `.md` (pastas `compromissos/` e `guias/` na raiz do repositório). Depois de editar um `.md`, gere as páginas de novo e faça o commit dos arquivos gerados junto:

```bash
npm install && npm run build
```

O gerador reaproveita as cores, a tipografia, o menu e o rodapé do `public/index.html`. Para adicionar um compromisso ou guia novo, inclua-o nas listas `COMPROMISSOS` ou `GUIAS` no início de `build/gerar-paginas.js`, com título e descrição para o Google.

## Publicar

Requer o plano Blaze (Cloud Functions) e o runtime Node.js 22.

```bash
npm install && (cd functions && npm install)
```

```bash
npx firebase deploy --only firestore:rules,functions,hosting --project SEU-PROJETO
```

## Testar localmente

Os testes rodam nos emuladores do Firebase, com um servidor SMTP falso.

1. Crie `functions/.env.local`:

```
EMAIL_REMETENTE=remetente@exemplo.com
EMAIL_DESTINOS=destino@exemplo.com
SMTP_HOST=127.0.0.1
SMTP_PORT=2525
SITE_URL=http://127.0.0.1:5000
```

2. Crie `functions/.secret.local`:

```
GMAIL_APP_PASSWORD=teste
MODERACAO_SECRET=teste
```

3. Rode:

```bash
npm test
```

Os testes cobrem as regras do Firestore, o formulário no navegador, o e-mail de aviso e o fluxo de aprovação, incluindo links adulterados.

## Licença

[MIT](LICENSE). Os documentos da aliança, fora desta pasta, estão sob [CC BY 4.0](../LICENSE).
