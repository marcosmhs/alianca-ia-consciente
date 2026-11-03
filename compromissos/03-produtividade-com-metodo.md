# 3. Produtividade com método

> Transformamos bons usos individuais em práticas de time e de aliança.

Compromisso da base · [Voltar ao manifesto](../MANIFESTO.md)

## O princípio

Em quase toda empresa existe alguém que descobriu um jeito ótimo de usar IA numa tarefa. Esse conhecimento costuma ficar com a pessoa, no histórico de conversas dela. Produtividade com método é tirar o bom uso do individual e torná-lo prática compartilhada: documentado, testado e fácil de repetir.

## Por que importa

- **O conhecimento está isolado.** Na pesquisa Work Trend Index de 2024, da Microsoft e do LinkedIn, 78% dos usuários de IA no trabalho levavam ferramentas próprias, e só 39% tinham recebido treinamento da empresa. As pessoas aprendem sozinhas e não compartilham.
- **O ganho depende da tarefa.** Como mostram os estudos dos compromissos [1](01-uso-consciente.md) e [2](02-uso-frequente-e-medido.md), a IA ajuda muito em algumas tarefas e pouco em outras. Um fluxo documentado registra *onde* e *como* ela ajuda.

## Na prática

- **Biblioteca de prompts e fluxos** por função (dados, engenharia, produto, atendimento, comercial, pessoas), compartilhada entre as empresas da aliança. Cada entrada traz:
  - o problema que resolve;
  - o prompt ou o passo a passo;
  - um exemplo de entrada e de saída;
  - onde costuma errar e como revisar;
  - quem mantém.
- **Um champion por área**, com tempo reservado na agenda (sugestão: 10% da semana) para manter a biblioteca e ajudar colegas.
- **Começar pelo que a IA faz bem:** rascunhos, resumos, código repetitivo, testes, documentação, análise exploratória, tradução.
- **Revisão trimestral da biblioteca:** fluxos que pararam de funcionar saem, fluxos novos entram.

### Modelo de entrada da biblioteca

```markdown
## Documentar uma tabela a partir do DDL

**Área:** Dados · **Mantido por:** (nome) · **Última revisão:** (data)

**Problema:** tabelas novas entram no data warehouse sem descrição.

**Fluxo:**
1. Cole o DDL e 20 linhas de exemplo (sem dados pessoais).
2. Use o prompt abaixo.
3. Revise as descrições de colunas com quem conhece a origem dos dados.

**Prompt:**
> Você é um engenheiro de dados. A partir do DDL e das linhas de exemplo,
> escreva uma descrição da tabela em 2 frases e uma descrição curta para
> cada coluna. Quando não tiver certeza do significado, escreva "A CONFIRMAR".

**Onde erra:** inventa significado para siglas internas. Por isso o "A CONFIRMAR".
```

## O que evitamos

- Prompts "mágicos" guardados só com uma pessoa.
- Bibliotecas enormes que ninguém mantém.
- Copiar fluxos de outra empresa sem testar no próprio contexto.

## Como saber se está funcionando

- A biblioteca tem fluxos com responsável e data de revisão.
- Pessoas novas no time usam a biblioteca nas primeiras semanas.
- Os fluxos mais usados têm medição de resultado (veja o [compromisso 2](02-uso-frequente-e-medido.md)).

## Para começar amanhã

1. Pense no melhor uso de IA que você fez no último mês e escreva-o no modelo acima.
2. Pergunte a três colegas qual é o melhor uso deles.
3. Proponha um champion para a sua área.

## Fontes

- Microsoft e LinkedIn. *2024 Work Trend Index Annual Report*. Resumo: https://fortune.com/2024/05/10/employees-secretly-bringing-ai-tools-work-microsoft-report
