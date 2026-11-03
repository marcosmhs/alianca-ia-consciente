# Indicadores comuns da aliança

Para que as empresas aprendam umas com as outras, elas precisam medir as mesmas coisas do mesmo jeito. Estes são os indicadores mínimos da aliança. Cada empresa pode medir mais, mas reporta pelo menos estes, por trimestre.

Princípio geral, do [compromisso 2](../compromissos/02-uso-frequente-e-medido.md): **medimos resultado, não volume de uso.** Indicadores de adoção servem como contexto, nunca como meta isolada.

## 1. Adoção ativa

**Definição:** % de colaboradores elegíveis que usaram uma ferramenta de IA aprovada em pelo menos 3 semanas distintas no trimestre.

**Fonte:** logs das ferramentas corporativas aprovadas.

**Por que 3 semanas:** separa quem experimentou de quem incorporou ao trabalho.

**Cuidado:** é contexto, não meta. Adoção alta com resultado ruim é um problema, não uma vitória.

## 2. Pessoas treinadas

**Definição:** % de colaboradores elegíveis que concluíram a trilha mínima da aliança.

**Fonte:** plataforma de treinamento da empresa.

## 3. Tempo de ciclo em processos-piloto

**Definição:** mediana do tempo entre o início e a conclusão de cada execução do processo, antes e depois da adoção de IA.

**Fonte:** ferramenta de gestão do trabalho (tickets, cards, pull requests).

**Como reportar:** variação percentual em relação à linha de base, com o número de execuções medidas.

## 4. Retrabalho em processos-piloto

**Definição:** % de entregas do processo que precisaram ser refeitas ou corrigidas depois de entregues.

**Fonte:** reabertura de tickets, correções pós-merge, devoluções.

**Por que importa:** pega o "workslop". Se o tempo cai e o retrabalho sobe, o ganho é ilusório.

## 5. Satisfação com a comunicação interna

**Definição:** média das respostas, numa escala de 1 a 5, a duas perguntas aplicadas por trimestre:

1. "As mensagens e documentos que recebo são claros e úteis."
2. "Sinto que posso dizer abertamente quando uso IA no meu trabalho."

**Fonte:** pesquisa interna curta e anônima.

**Por que importa:** mede os compromissos [4](../compromissos/04-a-ia-nao-fala-por-nos.md) e [8](../compromissos/08-aprender-em-alianca.md).

## Modelo de reporte trimestral

```csv
empresa,trimestre,adocao_ativa_pct,treinados_pct,processo,tempo_ciclo_base,tempo_ciclo_atual,retrabalho_base_pct,retrabalho_atual_pct,execucoes_medidas,satisfacao_clareza,satisfacao_abertura
Exemplo SA,2027T1,42,65,documentar_tabelas,5d,2d,20,15,48,3.8,4.1
```

Os números acima são ilustrativos.

## Regras de privacidade

- Indicadores são reportados **agregados por empresa**, nunca por pessoa.
- Nenhum indicador é usado para avaliar o desempenho individual.
- Pesquisas são anônimas.
