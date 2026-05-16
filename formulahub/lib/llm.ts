import { GoogleGenAI } from '@google/genai';

// Instância do cliente com API key explícita
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Modelo com maior quota no tier gratuito e rapidez
const MODEL = 'gemini-2.5-flash';

export async function generateDynamicFormula(searchQuery: string) {
  const prompt = `Você é um assistente especializado em linguagens de dados e programação.
O usuário buscou a seguinte fórmula/operação que NÃO existe no catálogo: "${searchQuery}".
Gere uma estrutura completa, contendo nome da operação, categoria, as 5 equivalências obrigatórias e os passos de visualização.

Regras Inflexíveis:
1. "category" deve ser uma dessas: "Busca e Referência", "Lógica", "Matemática e Estatística", "Texto", "Data e Hora", "Outros".
2. "equivalents" OBRIGATORIAMENTE deve ser um array com exatos 5 objetos, um para CADA linguagem: "Excel", "DAX", "Power Fx", "SQL", "Python". Nenhuma a mais, nenhuma a menos.
3. Em "visualization", crie uma tabela em formato de "headers" (array de nomes de coluna) e "rows" (array de matrizes com os valores das linhas). E elabore até 4 "steps" (passos explicativos de como a função opera nos dados simulados).`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Nome curto (ex: Divisão Certa, Contagem Única)" },
            category: { type: "STRING" },
            description: { type: "STRING", description: "Explicação em até 2 frases" },
            equivalents: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  language: { type: "STRING", description: "Excel, DAX, Power Fx, SQL, ou Python" },
                  syntax: { type: "STRING" },
                  description: { type: "STRING" },
                  example: { type: "STRING" }
                },
                required: ["language", "syntax", "description", "example"]
              }
            },
            visualization: {
              type: "OBJECT",
              properties: {
                headers: { type: "ARRAY", items: { type: "STRING" } },
                rows: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } },
                steps: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      label: { type: "STRING" },
                      description: { type: "STRING" },
                      highlightRows: { type: "ARRAY", items: { type: "INTEGER" } },
                      highlightCols: { type: "ARRAY", items: { type: "INTEGER" } },
                      highlightCells: { type: "ARRAY", items: { type: "ARRAY", items: { type: "INTEGER" } } },
                      dimRows: { type: "ARRAY", items: { type: "INTEGER" } },
                      resultValue: { type: "STRING" }
                    },
                    required: ["label", "description"]
                  }
                }
              },
              required: ["headers", "rows", "steps"]
            }
          },
          required: ["name", "category", "description", "equivalents", "visualization"]
        }
      }
    });

    const text = response.text || '';
    const generatedData = JSON.parse(text);
    return generatedData;
  } catch (error) {
    console.error('Erro ao gerar via Gemini:', error);
    throw error;
  }
}
