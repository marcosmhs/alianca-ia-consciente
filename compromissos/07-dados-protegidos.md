# 7. Dados protegidos

> Oferecemos ferramentas seguras em vez de proibir, e cada pessoa sabe o que pode compartilhar com cada ferramenta.

Compromisso de sustentação · [Voltar ao manifesto](../MANIFESTO.md)

## O princípio

Proibir IA não funciona: as pessoas usam mesmo assim, só que em ferramentas pessoais e sem nenhum controle. O caminho é oferecer ferramentas corporativas seguras e regras claras e simples sobre quais dados podem ir para onde.

## Por que importa

- Na pesquisa da Microsoft com o LinkedIn de 2024, **78% dos usuários de IA no trabalho levavam ferramentas próprias**, o chamado BYOAI.
- No Brasil, os estudos estimam a adoção de IA generativa entre 48% (FGV) e 95% (Bain e Microsoft) das empresas, conforme a metodologia, e a **governança de dados aparece como o maior desafio**.
- A LGPD vale para dados pessoais de clientes e colaboradores, inclusive quando eles são colados num chat de IA.

## Na prática

- **Lista de ferramentas aprovadas**, pública internamente, dizendo para que serve cada uma e quais dados ela pode receber.
- **Classificação simples de dados**, com uma regra clara para cada nível:

| Nível | Exemplos | Pode ir para IA? |
|---|---|---|
| Público | Site, posts, documentação aberta | Sim, em qualquer ferramenta aprovada |
| Interno | Processos, código sem segredos, métricas agregadas | Sim, só em ferramentas corporativas aprovadas |
| Confidencial | Estratégia, contratos, resultados não divulgados | Só em ferramentas aprovadas para esse nível, com autorização da área |
| Pessoal | Nome, CPF, e-mail, telefone, dados de clientes e colaboradores | Só em ambientes aderentes à LGPD aprovados pelo DPO. Prefira anonimizar |

- **Segredos nunca:** senhas, tokens, chaves de API e credenciais não vão para nenhuma ferramenta de IA.
- **Anonimizar por padrão:** para pedir ajuda com uma consulta ou um dataset, use dados de exemplo ou mascarados.

Veja o [modelo de política de uso](../guias/politica-de-uso-modelo.md) para adaptar à sua empresa.

## O que evitamos

- Proibir sem oferecer alternativa.
- Colar a base de clientes num chat para "ver o que a IA acha".
- Regras tão complexas que ninguém lembra.

## Como saber se está funcionando

- As pessoas sabem dizer, sem consultar, em qual ferramenta podem colar cada tipo de dado.
- O uso de ferramentas pessoais para trabalho diminui ao longo do tempo.
- Não há incidentes de vazamento envolvendo ferramentas de IA.

## Para começar amanhã

1. Descubra quais ferramentas de IA a sua empresa já aprovou.
2. Revise seus últimos prompts: algum tinha dado pessoal ou segredo?
3. Proponha a tabela de classificação acima para a área de segurança ou para o DPO.

## Fontes

- Microsoft e LinkedIn, *2024 Work Trend Index*: https://fortune.com/2024/05/10/employees-secretly-bringing-ai-tools-work-microsoft-report
- Bain e Microsoft, adoção de IA no Brasil: https://neuralnet.com.br/95-empresas-brasileiras-adotam-ia-governanca-dados-bain-2026/
