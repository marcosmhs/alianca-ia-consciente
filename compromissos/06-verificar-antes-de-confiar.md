# 6. Verificar antes de confiar

> Fatos, números, fontes e código gerados por IA são conferidos antes de serem usados.

Compromisso de sustentação · [Voltar ao manifesto](../MANIFESTO.md)

## O princípio

A IA erra com confiança. Ela pode inventar um número, uma citação, uma função de biblioteca ou um artigo científico, e escrever tudo com a mesma segurança de uma resposta certa. Verificar não é desconfiar da ferramenta. É tratar a saída da IA como o trabalho de um colega muito rápido que ainda não conhece o contexto.

## Por que importa

- No experimento de Harvard com a BCG, os consultores que usaram IA numa tarefa fora da capacidade dela tenderam a suspender o próprio julgamento e erraram mais.
- O mesmo estudo observou que os resultados com IA ficaram mais parecidos entre si. Sem revisão crítica, todos chegam às mesmas respostas, inclusive às mesmas respostas erradas.

## Na prática

- **Números:** toda métrica gerada ou calculada com IA é conferida contra a fonte oficial de dados antes de ir para um relatório.
- **Código e SQL:** passam por teste e por revisão como qualquer outro código. "A IA escreveu" não é motivo para pular o code review.
- **Citações e referências:** o link é aberto e o trecho é lido. Nunca se cita um estudo só porque a IA disse que ele existe.
- **Fatos sobre a empresa:** a IA não conhece o contexto interno. Tudo que envolve regras, clientes ou números da empresa é conferido com quem sabe.

### Checklist rápido para times de dados

- [ ] A consulta roda e o resultado bate com um número conhecido (um total, um dia já fechado)?
- [ ] Os filtros e joins fazem sentido para a regra de negócio, não só para a sintaxe?
- [ ] Há teste automatizado para a transformação?
- [ ] Alguém além de quem pediu à IA revisou?

## O que evitamos

- Copiar e colar código gerado direto em produção.
- Relatórios com números que ninguém sabe de onde vieram.
- Referências bibliográficas não conferidas.

## Como saber se está funcionando

- Incidentes causados por código ou números gerados por IA são raros e, quando acontecem, viram aprendizado no encontro trimestral.
- Code reviews tratam código gerado por IA com o mesmo rigor.

## Para começar amanhã

1. Na próxima resposta da IA com um número ou uma referência, confira na fonte.
2. Adicione ao template de pull request do time a pergunta: "Parte deste código foi gerada por IA? Como foi validada?"

## Fontes

- Dell'Acqua e outros. *Navigating the Jagged Technological Frontier*. Harvard Business School, 2023. https://www.hbs.edu/faculty/Pages/item.aspx?num=64700
