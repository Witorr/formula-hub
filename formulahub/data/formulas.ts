export type Language = 'Excel' | 'DAX' | 'Power Fx' | 'SQL' | 'Python';

export interface FormulaExample {
  language: Language;
  syntax: string;
  description: string;
  example: string;
}

import { OperationViz } from '@/data/visualizations';

export interface Operation {
  id: string;
  name: string;
  category: string;
  description: string;
  equivalents: Record<Language, FormulaExample>;
  visualization?: OperationViz;
}

export const categories = [
  'Busca e Referência',
  'Lógica',
  'Matemática e Estatística',
  'Texto',
  'Data e Hora',
];

export const operations: Operation[] = [
  {
    id: 'lookup',
    name: 'Busca Vertical (PROCV)',
    category: 'Busca e Referência',
    description: 'Busca um valor em uma coluna e retorna um valor correspondente na mesma linha de outra coluna.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'PROCV(valor_procurado, matriz_tabela, num_indice_coluna, [procurar_intervalo])',
        description: 'Procura um valor na primeira coluna à esquerda de uma tabela e retorna um valor na mesma linha de uma coluna especificada.',
        example: '=PROCV("A123", Clientes!A:D, 2, FALSO)',
      },
      DAX: {
        language: 'DAX',
        syntax: 'LOOKUPVALUE(Result_ColumnName, Search_ColumnName, Search_Value, [...])',
        description: 'Retorna o valor em Result_ColumnName para a linha que atende a todos os critérios especificados por Search_ColumnName e Search_Value.',
        example: 'LOOKUPVALUE(Clientes[Nome], Clientes[ID], "A123")',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'LookUp(Table, Formula, [ReductionFormula])',
        description: 'Encontra o primeiro registro em uma tabela que satisfaz uma fórmula.',
        example: 'LookUp(Clientes, ID = "A123", Nome)',
      },
      SQL: {
        language: 'SQL',
        syntax: 'SELECT coluna_resultado FROM tabela WHERE coluna_busca = valor LIMIT 1',
        description: 'Seleciona uma coluna específica de uma tabela onde a condição é atendida.',
        example: 'SELECT Nome FROM Clientes WHERE ID = \'A123\' LIMIT 1;',
      },
      Python: {
        language: 'Python',
        syntax: 'df.loc[df[\'coluna_busca\'] == valor, \'coluna_resultado\'].values[0]',
        description: 'Usa a biblioteca Pandas para filtrar o DataFrame e acessar o valor da coluna desejada.',
        example: 'clientes.loc[clientes[\'ID\'] == \'A123\', \'Nome\'].values[0]',
      },
    },
  },
  {
    id: 'sumif',
    name: 'Soma Condicional (SOMASE)',
    category: 'Matemática e Estatística',
    description: 'Soma os valores em um intervalo que atendem a um critério especificado.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'SOMASE(intervalo, critérios, [intervalo_soma])',
        description: 'Adiciona as células especificadas por um determinado critério ou condição.',
        example: '=SOMASE(A2:A10, ">100", B2:B10)',
      },
      DAX: {
        language: 'DAX',
        syntax: 'CALCULATE(SUM(Table[Column]), Filter)',
        description: 'Avalia uma expressão em um contexto de filtro modificado.',
        example: 'CALCULATE(SUM(Vendas[Valor]), Vendas[Status] = "Pago")',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'Sum(Filter(Table, Condition), Column)',
        description: 'Filtra a tabela primeiro e depois soma a coluna especificada.',
        example: 'Sum(Filter(Vendas, Status = "Pago"), Valor)',
      },
      SQL: {
        language: 'SQL',
        syntax: 'SELECT SUM(coluna_soma) FROM tabela WHERE condicao',
        description: 'Usa a função de agregação SUM com uma cláusula WHERE.',
        example: 'SELECT SUM(Valor) FROM Vendas WHERE Status = \'Pago\';',
      },
      Python: {
        language: 'Python',
        syntax: 'df[df[\'coluna_condicao\'] == valor][\'coluna_soma\'].sum()',
        description: 'Filtra o DataFrame do Pandas e aplica o método sum() na coluna desejada.',
        example: 'vendas[vendas[\'Status\'] == \'Pago\'][\'Valor\'].sum()',
      },
    },
  },
  {
    id: 'if',
    name: 'Condicional (SE)',
    category: 'Lógica',
    description: 'Verifica se uma condição é satisfeita e retorna um valor se for VERDADEIRO e outro valor se for FALSO.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'SE(teste_logico, valor_se_verdadeiro, valor_se_falso)',
        description: 'Verifica uma condição e retorna um valor correspondente.',
        example: '=SE(A1>10, "Maior", "Menor")',
      },
      DAX: {
        language: 'DAX',
        syntax: 'IF(logical_test, value_if_true, value_if_false)',
        description: 'Verifica uma condição e retorna um valor correspondente.',
        example: 'IF([Vendas] > 1000, "Meta Atingida", "Abaixo da Meta")',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'If(Condition, ThenResult, [DefaultResult])',
        description: 'Avalia uma ou mais condições e retorna um resultado.',
        example: 'If(Valor > 10, "Maior", "Menor")',
      },
      SQL: {
        language: 'SQL',
        syntax: 'CASE WHEN condicao THEN resultado ELSE resultado_padrao END',
        description: 'A expressão CASE passa por condições e retorna um valor quando a primeira condição é atendida.',
        example: 'CASE WHEN Valor > 10 THEN \'Maior\' ELSE \'Menor\' END',
      },
      Python: {
        language: 'Python',
        syntax: 'np.where(condicao, valor_verdadeiro, valor_falso)',
        description: 'Usando numpy.where para operações vetorizadas em DataFrames, ou if/else padrão para variáveis simples.',
        example: 'np.where(df[\'Valor\'] > 10, \'Maior\', \'Menor\')',
      },
    },
  },
  {
    id: 'concat',
    name: 'Concatenação',
    category: 'Texto',
    description: 'Junta várias cadeias de texto em uma única cadeia de texto.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'CONCATENAR(texto1, [texto2], ...) ou texto1 & texto2',
        description: 'Junta dois ou mais itens de texto em um.',
        example: '=A1 & " " & B1',
      },
      DAX: {
        language: 'DAX',
        syntax: 'CONCATENATE(text1, text2) ou text1 & text2',
        description: 'Junta duas cadeias de texto em uma cadeia de texto.',
        example: '[Nome] & " " & [Sobrenome]',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'Concatenate(String1, String2, ...) ou String1 & String2',
        description: 'Concatena strings.',
        example: 'Nome & " " & Sobrenome',
      },
      SQL: {
        language: 'SQL',
        syntax: 'CONCAT(string1, string2, ...) ou string1 || string2',
        description: 'Adiciona duas ou mais strings juntas.',
        example: 'CONCAT(Nome, \' \', Sobrenome)',
      },
      Python: {
        language: 'Python',
        syntax: 'string1 + string2 ou f"{string1}{string2}"',
        description: 'Usa o operador + ou f-strings para formatação.',
        example: 'f"{nome} {sobrenome}"',
      },
    },
  },
  {
    id: 'today',
    name: 'Data Atual (HOJE)',
    category: 'Data e Hora',
    description: 'Retorna a data atual.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'HOJE()',
        description: 'Retorna o número de série da data atual.',
        example: '=HOJE()',
      },
      DAX: {
        language: 'DAX',
        syntax: 'TODAY()',
        description: 'Retorna a data atual.',
        example: 'TODAY()',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'Today()',
        description: 'Retorna a data atual (sem a hora).',
        example: 'Today()',
      },
      SQL: {
        language: 'SQL',
        syntax: 'CURRENT_DATE ou GETDATE()',
        description: 'Retorna a data atual do sistema.',
        example: 'SELECT CURRENT_DATE;',
      },
      Python: {
        language: 'Python',
        syntax: 'datetime.date.today()',
        description: 'Usa o módulo datetime para obter a data atual.',
        example: 'from datetime import date\\nhoje = date.today()',
      },
    },
  },
  {
    id: 'countif',
    name: 'Contagem Condicional (CONT.SE)',
    category: 'Matemática e Estatística',
    description: 'Conta o número de células dentro de um intervalo que atendem a um único critério.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'CONT.SE(intervalo, criterios)',
        description: 'Conta o número de células que atendem a um critério.',
        example: '=CONT.SE(A1:A10, "Aprovado")',
      },
      DAX: {
        language: 'DAX',
        syntax: 'CALCULATE(COUNTROWS(Table), Filter)',
        description: 'Conta o número de linhas em uma tabela filtrada.',
        example: 'CALCULATE(COUNTROWS(Alunos), Alunos[Status] = "Aprovado")',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'CountIf(Table, Condition)',
        description: 'Conta o número de registros em uma tabela que satisfazem uma fórmula.',
        example: 'CountIf(Alunos, Status = "Aprovado")',
      },
      SQL: {
        language: 'SQL',
        syntax: 'SELECT COUNT(*) FROM tabela WHERE condicao',
        description: 'Conta o número de linhas que correspondem a uma condição especificada.',
        example: 'SELECT COUNT(*) FROM Alunos WHERE Status = \'Aprovado\';',
      },
      Python: {
        language: 'Python',
        syntax: 'len(df[df[\'coluna\'] == valor])',
        description: 'Filtra o DataFrame e conta o número de linhas resultantes.',
        example: 'len(alunos[alunos[\'Status\'] == \'Aprovado\'])',
      },
    },
  },
  {
    id: 'left',
    name: 'Extrair à Esquerda (ESQUERDA)',
    category: 'Texto',
    description: 'Retorna o primeiro caractere ou caracteres de uma cadeia de texto, com base no número de caracteres especificado.',
    equivalents: {
      Excel: {
        language: 'Excel',
        syntax: 'ESQUERDA(texto, [num_caract])',
        description: 'Retorna os caracteres mais à esquerda de um valor de texto.',
        example: '=ESQUERDA("Brasil", 3) // Retorna "Bra"',
      },
      DAX: {
        language: 'DAX',
        syntax: 'LEFT(text, num_chars)',
        description: 'Retorna o número especificado de caracteres do início de uma cadeia de texto.',
        example: 'LEFT([Pais], 3)',
      },
      'Power Fx': {
        language: 'Power Fx',
        syntax: 'Left(String, NumberOfCharacters)',
        description: 'Retorna os caracteres iniciais de uma string.',
        example: 'Left("Brasil", 3)',
      },
      SQL: {
        language: 'SQL',
        syntax: 'LEFT(string, number_of_chars)',
        description: 'Extrai um número de caracteres de uma string (começando da esquerda).',
        example: 'SELECT LEFT(Pais, 3) FROM Tabela;',
      },
      Python: {
        language: 'Python',
        syntax: 'string[:num_chars]',
        description: 'Usa fatiamento (slicing) de strings.',
        example: '"Brasil"[:3]',
      },
    },
  }
];
