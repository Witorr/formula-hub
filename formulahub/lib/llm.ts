import { GoogleGenAI } from '@google/genai';

// Instância do cliente com API key explícita
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Modelo com maior quota no tier gratuito
const MODEL = 'gemini-2.5-flash';

export async function translateFormula(
  sourceLanguage: string,
  targetLanguage: string,
  sourceCode: string
) {
  const prompt = `
Você é um assistente especializado em linguagens de dados e programação.
Traduza a seguinte fórmula/código de ${sourceLanguage} para ${targetLanguage}.

Código original:
\`\`\`
${sourceCode}
\`\`\`

Regras:
1. Retorne APENAS o código traduzido e uma breve explicação separada por "|||". 
Exemplo de formato esperado: SELECT * FROM table ||| O comando SELECT busca tudo.
Se não houver explicação, retorne apenas o código.
2. Seja preciso e otimizado.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text || '';

    // Processa a saída para separar código da explicação
    const parts = text.split('|||').map(s => s.trim());
    const translatedCode = parts[0] ? parts[0].replace(/```\w*\n/g, '').replace(/```/g, '').trim() : '';
    const explanation = parts[1] || null;

    return {
      translatedCode,
      explanation
    };
  } catch (error) {
    console.error('Erro ao chamar o Gemini:', error);
    throw error; // repassa o erro original para o route.ts analisar
  }
}
