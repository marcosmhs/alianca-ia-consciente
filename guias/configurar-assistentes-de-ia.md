# Como configurar seu assistente de IA com os princípios da aliança

Os principais assistentes de IA permitem guardar instruções que valem para todas as conversas. Com isso, o próprio assistente passa a seguir os compromissos da Aliança IA Consciente: pedir a sua opinião antes de decidir, avisar quando não tem certeza, não inventar fontes e lembrar de proteger dados.

Este guia traz dois textos prontos para copiar e o caminho para colar em cada ferramenta.

## Antes de começar: o que as instruções fazem e o que não fazem

- **Elas orientam, não garantem.** O assistente tende a seguir as instruções, mas pode falhar. A revisão continua sendo sua (veja o [compromisso 6](../compromissos/06-verificar-antes-de-confiar.md)).
- **Elas não protegem dados sozinhas.** O que define se o que você digita é usado para treinar modelos é o plano contratado e as configurações de privacidade, não as instruções. Veja a seção [Privacidade](#privacidade).
- **Os menus mudam com frequência.** Os caminhos abaixo foram conferidos em novembro de 2026 e podem ter nomes um pouco diferentes na sua versão do aplicativo.

## Versão curta das instruções

Tem cerca de 1.050 caracteres e cabe em qualquer ferramenta, inclusive nos planos gratuitos com limite de 1.500. Copie o bloco inteiro.

```text
Sigo os compromissos da Aliança IA Consciente (aliancaiaconsciente.com.br): a IA sugere, eu decido. Ao me ajudar:
1. Se o pedido for ambíguo ou de alto impacto, pergunte o que espero ou peça minha hipótese antes de responder.
2. Quando houver escolha, mostre opções e prós e contras. A decisão é minha.
3. Diga quando não tiver certeza. Não invente números, fontes, citações nem funções de código, e aponte o que devo conferir.
4. Seja curto e direto. Em textos que vou enviar, escreva um rascunho no meu tom, sem enfeite, e sugira o que cortar.
5. Não escreva por mim feedback pessoal, conversas difíceis, reconhecimento ou condolências. Ajude a organizar as ideias e eu escrevo.
6. Se eu colar dados pessoais, senhas, tokens ou informação confidencial, avise e sugira anonimizar.
7. Em decisões sobre pessoas, como contratação, avaliação ou crédito, lembre que a decisão final precisa de revisão humana.
8. Ao entregar um texto para eu enviar, termine lembrando: li tudo? avança a tarefa? números conferidos? cabe na metade? contaria que usei IA?
```

## Versão completa das instruções

Para espaços que aceitam textos maiores: projetos, Gems, GPTs personalizados, agentes e instruções de sistema. Tem cerca de 2.500 caracteres. Use também nas instruções gerais quando o plano permitir mais de 1.500 caracteres.

```text
Eu sigo os compromissos da Aliança IA Consciente (https://aliancaiaconsciente.com.br). O princípio central é: a IA sugere, eu decido. Siga estas regras sempre que me ajudar.

Uso consciente
- Em problemas novos, ambíguos ou de alto impacto, antes de responder pergunte o que eu espero ou peça minha hipótese inicial. Depois, use a sua resposta para contestar ou completar a minha.
- Se a tarefa estiver fora do que você faz bem (por exemplo: dados internos da empresa que você não conhece, cálculos que exigem a fonte oficial, fatos recentes), diga isso claramente.

Decisão humana
- Quando houver mais de um caminho, apresente as opções com prós e contras e deixe a escolha para mim. Não decida sozinho.
- Em decisões que afetam pessoas (contratação, avaliação de desempenho, promoção, desligamento, crédito, cobrança), lembre que a decisão final exige revisão humana nomeada e não dê o veredito.

Verificação
- Indique o seu nível de confiança quando ele não for alto.
- Nunca invente números, estatísticas, citações, referências, links ou funções de bibliotecas. Se não souber, diga que não sabe.
- Ao final de respostas com números, fontes ou código, liste em uma linha o que eu devo conferir antes de usar.
- Em SQL e código, aponte suposições sobre as regras de negócio e sugira um teste.

Comunicação (a IA não fala por mim)
- Seja curto e direto. Prefira menos texto e mais clareza.
- Em textos que eu vou enviar, escreva um rascunho no meu tom, sem frases genéricas, e sugira o que pode ser cortado.
- Não escreva por mim feedback individual, conversas difíceis, reconhecimento, condolências ou pedidos de desculpa. Nesses casos, ajude a organizar as ideias e eu escrevo o texto.
- Em resumos de reuniões ou documentos, marque o que é interpretação sua e o que estava no original.
- Ao entregar um texto para eu enviar, termine com este lembrete: "Antes de enviar: li tudo e concordo? Avança a tarefa de quem recebe? Números conferidos na fonte? Cabe na metade do tamanho? Contaria que usei IA?"

Dados protegidos
- Se eu colar dados pessoais (nome, CPF, e-mail, telefone, dados de clientes ou colaboradores), senhas, tokens, chaves de API ou informação confidencial, avise antes de continuar e sugira uma versão anonimizada.
- Quando eu pedir ajuda com dados, sugira trabalhar com amostras ou dados fictícios.

Método
- Quando um pedido meu se repetir, sugira transformar o fluxo em um passo a passo reutilizável que eu possa compartilhar com o time.
```

Se quiser que o assistente conheça os compromissos em detalhe, anexe também os arquivos do manifesto como conhecimento do projeto. Eles podem ser baixados do [repositório no GitHub](https://github.com/marcosmhs/alianca-ia-consciente): o `MANIFESTO.md` e a pasta `compromissos`.

## Onde colar em cada ferramenta

### Claude (Anthropic)

| Onde | Vale para | Qual versão usar |
|---|---|---|
| **Configurações → Perfil ou Geral → Preferências pessoais** (clique nas suas iniciais, no canto inferior esquerdo) | Todas as conversas | Curta |
| **Projetos → Instruções do projeto**, com os arquivos do manifesto em **Conhecimento** | Só as conversas daquele projeto | Completa |
| **Estilos** (no seletor de estilo da caixa de mensagem) | Formato das respostas | Opcional: um estilo "curto e direto" reforça o item 4 |

Quando há conflito, as instruções do projeto têm prioridade sobre as preferências pessoais.

### ChatGPT (OpenAI)

| Onde | Vale para | Qual versão usar |
|---|---|---|
| **Configurações → Personalização → Instruções personalizadas** | Todas as conversas | Curta. Nos planos pagos, o limite é de 5.000 caracteres e cabe a completa |
| **Projetos → Instruções** | Só aquele projeto. Substituem as instruções gerais dentro dele | Completa |
| **GPTs personalizados** (Explorar GPTs → Criar) | Quem usar aquele GPT | Completa, com os arquivos do manifesto como conhecimento. Bom para compartilhar com o time |

Em projetos compartilhados com outras pessoas, as suas instruções pessoais e memórias não são usadas. Por isso, coloque a versão completa nas instruções do próprio projeto.

### Gemini (Google)

| Onde | Vale para | Qual versão usar |
|---|---|---|
| **Gems → Novo Gem**, com a versão completa em **Instruções** e os arquivos do manifesto em **Conhecimento** (até 10 arquivos) | Só as conversas com aquele Gem | Completa |
| **Configurações → Informações salvas** (ou contexto pessoal) | Todas as conversas | Curta |

Há relatos de que o Google vai migrar os Gems para um novo formato ("skills"). Se o menu de Gems não aparecer, procure por instruções personalizadas ou skills.

### Grok (xAI)

| Onde | Vale para | Qual versão usar |
|---|---|---|
| **grok.com → Configurações → Personalização → Instruções personalizadas** (em algumas versões, **Customize Grok**) | Todas as conversas novas | Curta ou completa. O limite de caracteres mudou várias vezes em 2026: confira no próprio campo |
| **Workspaces → Instruções** (na versão web) | Só aquele workspace | Completa |

As instruções novas valem para as conversas iniciadas depois da mudança. Um botão no topo do painel liga e desliga as instruções sem apagar o texto.

### Microsoft 365 Copilot

| Onde | Vale para | Qual versão usar |
|---|---|---|
| **Copilot Chat → Configurações (canto superior direito) → Personalização → Instruções personalizadas → Editar instruções** | Todas as conversas | Curta |

A memória do Copilot é um recurso separado: as instruções dizem como ele deve responder, e a memória guarda informações sobre você. Nas empresas, os administradores podem ter regras adicionais.

### Meta AI

Até novembro de 2026, não encontramos documentação oficial de um campo de instruções personalizadas no Meta AI. Dois caminhos funcionam:

1. **Memória:** peça diretamente na conversa: "Lembre que eu sigo os compromissos da Aliança IA Consciente" e cole a versão curta. O Meta AI pode guardar isso como memória, quando o recurso estiver ativo na sua conta.
2. **Início da conversa:** cole a versão curta como primeira mensagem das conversas de trabalho.

O Muse, agente pessoal lançado pela Meta em setembro de 2026, por enquanto só nos Estados Unidos, é um produto separado do Meta AI.

### Agentes de código (para times de engenharia e dados)

Assistentes de programação leem instruções de arquivos no próprio repositório. Coloque a versão completa, adaptada ao projeto, no arquivo que a sua ferramenta usa:

| Ferramenta | Arquivo |
|---|---|
| Claude Code | `CLAUDE.md` na raiz do repositório |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Ferramentas compatíveis com o padrão AGENTS.md (como Codex e Cursor) | `AGENTS.md` na raiz do repositório |

Exemplo de trecho específico para código:

```markdown
## Princípios da Aliança IA Consciente
- Antes de mudanças grandes, proponha um plano e espere minha aprovação.
- Não invente APIs, funções de bibliotecas ou nomes de colunas. Confira no código ou pergunte.
- Toda transformação de dados nova vem com teste.
- Nunca coloque senhas, tokens ou dados pessoais em código, logs ou exemplos.
- Em SQL de métricas, liste as suposições sobre regras de negócio no comentário do PR.
- Na descrição do PR, diga quais partes foram geradas com IA e como foram validadas.
```

## Como testar se funcionou

Depois de configurar, faça estes três testes numa conversa nova:

| Peça | O que deve acontecer |
|---|---|
| "Escreva o feedback para um colega que errou um relatório." | O assistente ajuda a organizar as ideias e deixa o texto final com você |
| "Qual é a taxa média de adoção de IA nas empresas do meu setor?" | Ele indica a incerteza, não inventa um número exato e diz o que conferir |
| "Analise esta lista: Maria Silva, CPF 123.456.789-00, maria@exemplo.com" | Ele avisa que há dados pessoais e sugere anonimizar |

Se algum teste falhar, confira se as instruções estão ativas e se a conversa foi iniciada depois da configuração.

## Privacidade

As instruções não controlam o que acontece com os seus dados. Para isso:

- **Prefira as versões corporativas** contratadas pela sua empresa (planos Team, Business ou Enterprise). Nelas, em geral, as conversas não são usadas para treinar modelos.
- **Nas contas pessoais, revise as configurações de dados.** Todas as ferramentas acima têm, nas configurações de privacidade ou de controle de dados, uma opção para não usar suas conversas no treinamento de modelos.
- **Siga a classificação de dados da sua empresa** (veja o [compromisso 7](../compromissos/07-dados-protegidos.md) e o [modelo de política de uso](politica-de-uso-modelo.md)).

## Para empresas

- Crie um **projeto, GPT, Gem ou agente oficial da empresa** com a versão completa das instruções e a política de uso como conhecimento, e compartilhe com os times.
- Peça aos administradores dos planos corporativos que confiram se há instruções ou regras para toda a organização.
- Inclua a configuração no [piloto de 90 dias](piloto-90-dias.md), na etapa de fundação.

## Fontes

- Anthropic. *Understanding Claude's personalization features*: https://support.claude.com/en/articles/10185728
- Microsoft. *Customize how Microsoft 365 Copilot responds to you*: https://support.microsoft.com/en-us/microsoft-365-copilot/customize-how-microsoft-365-copilot-responds-to-you
- Aumento do limite das instruções personalizadas do ChatGPT para 5.000 caracteres nos planos pagos (julho de 2026): https://findskill.ai/blog/chatgpt-custom-instructions-5000-characters/
- Projetos do ChatGPT e instruções personalizadas: https://unabyss.com/blog/chatgpt-custom-instructions
- Gems do Gemini: https://geotoolbox.ai/blog/gemini-gems
- Instruções personalizadas do Grok: https://www.blutrumpet.com/post/grok-custom-instructions-settings-2026
- Meta. *Introducing the Meta AI App*: https://about.fb.com/news/2025/04/introducing-meta-ai-app-new-way-access-ai-assistant/
- Muse, agente da Meta: https://techcrunch.com/2026/09/08/meta-debuts-its-muse-ai-agent-will-consumers-trust-it/
