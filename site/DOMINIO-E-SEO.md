# Domínio e SEO

Como o site passa a responder em **https://aliancaiaconsciente.com.br** e como ele é preparado para aparecer bem no Google.

## 1. Conectar o domínio ao Firebase Hosting

### No Firebase

1. Abra https://console.firebase.google.com/project/alianca-ia-consciente/hosting e clique em **Adicionar domínio personalizado**.
2. Digite `aliancaiaconsciente.com.br` e avance. Não marque a opção de redirecionar.
3. O Firebase mostra os registros DNS a criar, em geral:
   - um registro **TXT** para provar que o domínio é seu;
   - um ou mais registros **A** com o endereço IP do Firebase Hosting.

   Deixe essa tela aberta. Os valores exatos são os que ela mostrar.
4. Repita para `www.aliancaiaconsciente.com.br` e, desta vez, marque **Redirecionar para** `aliancaiaconsciente.com.br`. Assim, quem digitar `www` cai no endereço principal.

### No Registro.br

1. Entre em https://registro.br, abra o domínio `aliancaiaconsciente.com.br` e vá em **DNS**.
2. Se aparecer a opção de usar os servidores DNS do Registro.br, mantenha essa opção e clique em **Configurar zona DNS** (ou **Editar zona**).
3. Crie cada registro que o Firebase mostrou, com **Nova entrada**:

   | Tipo | Nome | Valor |
   |---|---|---|
   | TXT | *(vazio, que é a raiz do domínio)* | o texto que o Firebase mostrou |
   | A | *(vazio)* | o IP que o Firebase mostrou |
   | *(o que o Firebase pedir para o www)* | `www` | o valor que o Firebase mostrou |

4. Salve.

### Esperar a ativação

- A propagação do DNS leva de alguns minutos a algumas horas.
- Depois que o Firebase confirma os registros, ele emite o certificado HTTPS sozinho. Isso pode levar até 24 horas.
- Quando o status do domínio no Firebase ficar **Conectado**, https://aliancaiaconsciente.com.br já abre o site.

## 2. Apontar os e-mails de aprovação para o domínio novo

Os botões **Aprovar** e **Recusar** dos e-mails usam o endereço do site. Depois que o domínio estiver conectado, rode:

```bash
cd ~/alianca-site && echo "SITE_URL=https://aliancaiaconsciente.com.br" >> functions/.env
```

```bash
npx firebase deploy --only functions --project alianca-ia-consciente
```

Os links de e-mails antigos, com o endereço `.web.app`, continuam funcionando.

## 3. Google Search Console

1. Abra https://search.google.com/search-console e clique em **Adicionar propriedade**.
2. Escolha **Domínio** e digite `aliancaiaconsciente.com.br`.
3. O Google mostra um registro TXT começando com `google-site-verification=`. Crie esse TXT no Registro.br, com o nome vazio, como no passo 1. Pode haver mais de um TXT na raiz do domínio.
4. Volte ao Search Console e clique em **Verificar**. Se falhar, espere uma hora e tente de novo.
5. Em **Sitemaps**, envie `sitemap.xml`.
6. Em **Inspeção de URL**, cole `https://aliancaiaconsciente.com.br/` e clique em **Solicitar indexação**.

## 4. O que o site já tem

| Item | Arquivo |
|---|---|
| Título e descrição com os termos que as pessoas buscam | `public/index.html` |
| URL canônica no domínio próprio | `public/index.html` |
| Imagem de compartilhamento 1200×630 e tags Open Graph e Twitter | `public/og-image.png` |
| Ícones (favicon, Android e iPhone) | `public/favicon.ico`, `public/icon-*.png`, `public/apple-touch-icon.png` |
| Dados estruturados: Organization, WebSite e CreativeWork (manifesto, CC BY 4.0) | `public/index.html` |
| `robots.txt` liberando o site e bloqueando `/moderar` | `public/robots.txt` |
| `sitemap.xml` | `public/sitemap.xml` |
| Título com efeito de impressão desenhado só por CSS, com o texto uma única vez no HTML | `public/index.html` |
| Quem chega pelo endereço `.web.app` é levado ao domínio próprio, só quando ele já responde | `public/index.html` |

Para conferir os dados estruturados, use https://search.google.com/test/rich-results. Para a prévia de compartilhamento, use https://www.linkedin.com/post-inspector/.

## 5. Plano de SEO

### Semana 1: fundamentos técnicos (feito neste repositório)

Os itens da seção 4, mais a configuração do domínio e do Search Console.

### Semana 2: conteúdo próprio no site (feito neste repositório)

Cada compromisso e cada guia tem uma página própria, gerada a partir dos `.md` por `build/gerar-paginas.js`, com título, descrição, URL canônica, dados estruturados (Article e BreadcrumbList), trilha de navegação, navegação entre compromissos e chamada para a inscrição.

| Página | Busca que atende |
|---|---|
| `/compromissos/uso-consciente` … `/compromissos/aprender-em-alianca` | Os oito compromissos |
| `/guias/modelo-politica-uso-ia` | "modelo de política de uso de IA" |
| `/guias/workslop` | "o que é workslop" |
| `/guias/antes-de-enviar` | "checklist uso de IA" |
| `/guias/indicadores-adocao-ia` | "como medir adoção de IA" |
| `/guias/piloto-90-dias` | "piloto de IA na empresa" |

A página inicial aponta para essas páginas, e o `sitemap.xml` lista os 14 endereços. Depois de publicar, envie o sitemap de novo no Search Console e peça a indexação de `/guias/modelo-politica-uso-ia` e `/guias/workslop`.

### Semanas 3 e 4: revisar e medir

- Acompanhar no Search Console quais páginas foram indexadas e para quais buscas aparecem.
- Ajustar títulos e descrições das páginas que aparecem, mas recebem poucos cliques.

### Contínuo: autoridade

1. Incentivo para quem assina divulgar: botões de compartilhar no LinkedIn e no WhatsApp logo depois da assinatura, e um selo "Apoio a Aliança IA Consciente" para perfis e sites pessoais.
2. Links nos canais da proponente: site da That Exotic Bug, LinkedIn e perfil do GitHub.
3. Artigos no LinkedIn, um por compromisso, com link para a página do compromisso.
4. Pauta para imprensa e associações de tecnologia e comunidades de dados.

### Mensal: medição no Search Console

- Páginas indexadas.
- Buscas que trazem visitas, posição média e taxa de cliques.

Meta dos primeiros 90 dias:
- todas as páginas indexadas;
- primeira posição para buscas pelo nome da aliança;
- primeira página para "modelo de política de uso de IA" e "workslop".
