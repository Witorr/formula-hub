export interface VizStep {
  label: string;
  description: string;
  highlightRows?: number[];       // índices de linha (0-based, sem o header)
  highlightCols?: number[];       // índices de coluna (0-based)
  highlightCells?: [number, number][]; // pares [row, col]
  dimRows?: number[];             // linhas a escurecer
  resultValue?: string | number;  // valor final a exibir
}

export interface OperationViz {
  headers: string[];
  rows: (string | number)[][];
  steps: VizStep[];
}

export const visualizations: Record<string, OperationViz> = {
  lookup: {
    headers: ['ID', 'Nome', 'Departamento'],
    rows: [
      ['A123', 'João', 'Vendas'],
      ['B456', 'Maria', 'TI'],
      ['C789', 'Pedro', 'RH'],
      ['D012', 'Ana', 'Financeiro'],
    ],
    steps: [
      {
        label: 'Valor buscado',
        description: 'Vamos buscar o ID "B456" na tabela. A fórmula percorrerá a coluna de chave (ID) do início ao fim.',
        highlightCols: [0],
      },
      {
        label: 'Varrendo linhas...',
        description: 'Comparando "B456" com cada célula da coluna ID. Linha 1 (A123) → não bate. Pulando...',
        highlightRows: [0],
        dimRows: [1, 2, 3],
      },
      {
        label: 'Match encontrado!',
        description: 'Linha 2: ID = "B456" ✓ Correspondência encontrada! Agora buscamos o valor na coluna de retorno (Nome).',
        highlightRows: [1],
        dimRows: [0, 2, 3],
      },
      {
        label: 'Resultado',
        description: 'O valor da coluna Nome na linha 2 é "Maria". Esse é o retorno da fórmula.',
        highlightCells: [[1, 1]],
        dimRows: [0, 2, 3],
        resultValue: '"Maria"',
      },
    ],
  },

  sumif: {
    headers: ['Produto', 'Status', 'Valor (R$)'],
    rows: [
      ['Notebook', 'Pago', 3500],
      ['Monitor', 'Pendente', 800],
      ['Teclado', 'Pago', 150],
      ['Mouse', 'Pendente', 90],
      ['Headset', 'Pago', 250],
    ],
    steps: [
      {
        label: 'Critério definido',
        description: 'O critério é Status = "Pago". A fórmula vai varrer a coluna Status e somar apenas as linhas que atendam.',
        highlightCols: [1],
      },
      {
        label: 'Filtrando linhas',
        description: 'Linhas com Status = "Pago": Notebook (R$3.500), Teclado (R$150) e Headset (R$250) são selecionadas.',
        highlightRows: [0, 2, 4],
        dimRows: [1, 3],
      },
      {
        label: 'Somando valores',
        description: 'Acumulando: 3.500 + 150 + 250 = R$ 3.900. Linhas não selecionadas são ignoradas.',
        highlightCells: [[0, 2], [2, 2], [4, 2]],
        dimRows: [1, 3],
      },
      {
        label: 'Resultado',
        description: 'A soma condicional retorna R$ 3.900 — apenas os pedidos com status "Pago".',
        highlightCells: [[0, 2], [2, 2], [4, 2]],
        dimRows: [1, 3],
        resultValue: 'R$ 3.900',
      },
    ],
  },

  if: {
    headers: ['Vendedor', 'Vendas', 'Status'],
    rows: [
      ['João', 1250, 'Meta Atingida'],
      ['Maria', 980, 'Abaixo da Meta'],
      ['Pedro', 1100, 'Meta Atingida'],
      ['Ana', 750, 'Abaixo da Meta'],
    ],
    steps: [
      {
        label: 'Condição',
        description: 'Para cada linha, a fórmula testa: Vendas > 1.000? Dependendo do resultado, retorna um valor diferente.',
        highlightCols: [1],
      },
      {
        label: 'João: VERDADEIRO',
        description: '1.250 > 1.000 → condição VERDADEIRA → retorna "Meta Atingida".',
        highlightRows: [0],
        dimRows: [1, 2, 3],
      },
      {
        label: 'Maria: FALSO',
        description: '980 > 1.000 → condição FALSA → retorna "Abaixo da Meta".',
        highlightRows: [1],
        dimRows: [0, 2, 3],
      },
      {
        label: 'Resultado',
        description: 'Cada linha recebe seu valor conforme a condição avaliada. A coluna Status é preenchida automaticamente.',
        highlightCols: [2],
        resultValue: 'Meta Atingida / Abaixo da Meta',
      },
    ],
  },

  concat: {
    headers: ['Nome', 'Sobrenome', 'Nome Completo'],
    rows: [
      ['João', 'Silva', 'João Silva'],
      ['Maria', 'Santos', 'Maria Santos'],
      ['Pedro', 'Oliveira', 'Pedro Oliveira'],
    ],
    steps: [
      {
        label: 'Texto 1',
        description: 'O primeiro fragmento a unir é o valor da coluna Nome.',
        highlightCols: [0],
      },
      {
        label: 'Separador',
        description: 'Um espaço " " é inserido entre os dois textos para separá-los adequadamente.',
        highlightCols: [0, 1],
      },
      {
        label: 'Texto 2',
        description: 'O segundo fragmento é o valor da coluna Sobrenome.',
        highlightCols: [1],
      },
      {
        label: 'Resultado',
        description: 'Os fragmentos são unidos: "João" + " " + "Silva" = "João Silva".',
        highlightCols: [2],
        resultValue: '"João Silva"',
      },
    ],
  },

  today: {
    headers: ['Pedido', 'Data Criação', 'Data Hoje', 'Dias em Aberto'],
    rows: [
      ['#001', '2024-01-10', 'hoje()', '?'],
      ['#002', '2024-01-22', 'hoje()', '?'],
      ['#003', '2024-02-05', 'hoje()', '?'],
    ],
    steps: [
      {
        label: 'Capturando hoje',
        description: 'A função HOJE() / TODAY() consulta o sistema operacional e captura a data atual no momento do cálculo.',
        highlightCols: [2],
      },
      {
        label: 'Calculando diferença',
        description: 'Subtraindo a Data de Criação da data de hoje obtemos os dias em aberto de cada pedido.',
        highlightCols: [1, 2],
      },
      {
        label: 'Resultado',
        description: 'Os dias em aberto são preenchidos automaticamente — e se atualizam a cada dia sem alterar a fórmula.',
        highlightCols: [3],
        resultValue: 'Dinâmico (atualiza todo dia)',
      },
    ],
  },

  countif: {
    headers: ['Aluno', 'Nota', 'Status'],
    rows: [
      ['Alice', 8.5, 'Aprovado'],
      ['Bruno', 4.2, 'Reprovado'],
      ['Carla', 7.0, 'Aprovado'],
      ['Diego', 3.8, 'Reprovado'],
      ['Eva', 9.1, 'Aprovado'],
      ['Fábio', 5.5, 'Reprovado'],
    ],
    steps: [
      {
        label: 'Critério',
        description: 'Contando linhas onde Status = "Aprovado". A fórmula vai percorrer a coluna Status inteira.',
        highlightCols: [2],
      },
      {
        label: 'Identificando matches',
        description: 'Alice, Carla e Eva têm Status = "Aprovado". As demais são descartadas.',
        highlightRows: [0, 2, 4],
        dimRows: [1, 3, 5],
      },
      {
        label: 'Contando',
        description: 'Cada linha que satisfaz o critério contribui +1 ao contador. 3 linhas qualificadas.',
        highlightRows: [0, 2, 4],
        dimRows: [1, 3, 5],
      },
      {
        label: 'Resultado',
        description: '3 alunos foram aprovados. A fórmula retorna o número inteiro 3.',
        highlightRows: [0, 2, 4],
        dimRows: [1, 3, 5],
        resultValue: 3,
      },
    ],
  },

  left: {
    headers: ['Código Completo', 'Prefixo (3 chars)'],
    rows: [
      ['BRA-001', 'BRA'],
      ['USA-042', 'USA'],
      ['ARG-017', 'ARG'],
      ['CHI-099', 'CHI'],
    ],
    steps: [
      {
        label: 'Texto de entrada',
        description: 'A fórmula recebe a string completa da coluna Código. Vamos extrair os 3 primeiros caracteres.',
        highlightCols: [0],
      },
      {
        label: 'Contando da esquerda',
        description: 'Posicionando o cursor no início da string: B-R-A são os 3 primeiros caracteres de "BRA-001".',
        highlightCells: [[0, 0]],
      },
      {
        label: 'Resultado',
        description: 'Os primeiros 3 chars são extraídos de cada linha: "BRA-001"→"BRA", "USA-042"→"USA", etc.',
        highlightCols: [1],
        resultValue: '"BRA"',
      },
    ],
  },
};
