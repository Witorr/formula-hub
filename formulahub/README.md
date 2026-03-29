<div align="center">

# FormulaHub

## Hub comparativo de fórmulas entre Excel, DAX, Power Fx, SQL e Python

Encontre a equivalência de qualquer fórmula entre as principais linguagens de análise de dados — com exemplos práticos e visualização animada de cada operação.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

</div>

---

## O que é

O FormulaHub é uma referência e uma documentação interativa para analistas e desenvolvedores que transitam entre diferentes plataformas de dados. Em vez de decorar sintaxes diferentes, você pode busca a operação (ex: "uma busca vertical") e vê como ela é escrita em cada linguagem, lado a lado.

**Linguagens cobertas:** Excel · DAX (Power BI) · Power Fx (Power Apps) · SQL · Python (Pandas)

**Categorias de fórmulas:** Busca e Referência · Lógica · Matemática e Estatística · Texto · Data e Hora

---

## Funcionalidades

- **Busca** por nome, sintaxe ou exemplo em todas as linguagens simultaneamente
- **Filtro por categoria** para navegar por tipo de operação
- **Visualizador animado** — clique em "Ver em ação" para ver uma simulação passo a passo de como a fórmula processa os dados, com contexto visual específico por linguagem (planilha, dashboard, query, etc.)
- **Modo comparativo** — exibe todas as linguagens empilhadas no mesmo card para comparação direta
- **Copiar exemplo** com um clique

---

## Rodando localmente

**Pré-requisito:** Node.js 18+

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura do projeto

```text
formulahub/
├── app/                  # Páginas e layout (Next.js App Router)
├── components/
│   ├── FormulaCard.tsx   # Card com tabs por linguagem
│   └── FormulaVisualizer.tsx  # Modal de visualização animada
└── data/
    ├── formulas.ts       # Fórmulas e equivalências por linguagem
    └── visualizations.ts # Dados de animação por operação
```

---

## Adicionando fórmulas

Edite [data/formulas.ts](data/formulas.ts) para adicionar novas operações — cada entrada precisa de sintaxe, descrição e exemplo para as 5 linguagens.

Para adicionar visualização animada à nova fórmula, edite [data/visualizations.ts](data/visualizations.ts) com os dados da tabela e os passos da animação.
